const assert = require('assert');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:4000/api';

async function test() {
  console.log('🏁 Starting Integration API Verification Tests (Admin Separation)...');
  
  const testUserId = 'user_tester_teacher_' + Date.now();
  console.log(`ℹ️ Mocking Clerk User ID: ${testUserId}`);

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is missing');
  }
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // Clean stale test student and ensure class code 1D20A5 exists
  await db.collection('studentcredentials').deleteOne({ email: 'aarav.sharma@school.com' });
  await db.collection('groups').deleteOne({ classCode: '1D20A5' });
  await db.collection('groups').insertOne({
    name: 'Test Class 8',
    grade: 'Class 8',
    subject: 'Science',
    students: ['Aarav Sharma'],
    classCode: '1D20A5',
    userId: testUserId,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Pre-create the test user so they exist in the DB with a default role of Teacher
  await db.collection('users').deleteOne({ clerkId: testUserId });
  await db.collection('users').insertOne({
    clerkId: testUserId,
    email: `${testUserId}@school.com`,
    role: 'Teacher',
    schoolName: 'Personal Workspace',
    schoolBranch: 'Independent',
    schoolCode: 'IND-WORKSPACE',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log('✅ Stale test student/user cleaned, class group 1D20A5 created, and test teacher pre-created.');

  // 1. Register a student
  console.log('\nStep 1: Testing Student Registration (/api/student/register)...');
  const regRes = await fetch(`${BASE_URL}/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      classCode: '1D20A5',
      studentName: 'Aarav Sharma',
      email: 'aarav.sharma@school.com',
      passcode: '1234'
    })
  });
  
  let regData = await regRes.json();
  if (!regRes.ok) {
    if (regData.error && regData.error.includes('already registered')) {
      console.log('ℹ️ Aarav is already registered. Proceeding to login.');
    } else {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
  } else {
    console.log('✅ Registration successful!');
  }

  // 2. Login the student
  console.log('\nStep 2: Testing Student Login (/api/student/login)...');
  const loginRes = await fetch(`${BASE_URL}/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav.sharma@school.com',
      passcode: '1234'
    })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  }
  console.log('✅ Login successful!');
  assert.ok(loginData.token, 'Login JWT token must be generated');

  // 3. Test that direct access to /api/admin/stats returns 403 Forbidden for a normal Teacher/User
  console.log('\nStep 3: Verifying default User gets rejected from /api/admin/stats...');
  const unauthorizedRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: {
      'x-mock-user-id': testUserId // User role defaults to Teacher
    }
  });
  console.log(`ℹ️ Admin Access HTTP Status: ${unauthorizedRes.status} (Expected 403)`);
  assert.strictEqual(unauthorizedRes.status, 403, 'A normal teacher must be forbidden from accessing admin endpoints');
  console.log('✅ Default teacher forbidden correctly.');

  // 4. Test claiming Admin role with incorrect setup token (should return 401)
  console.log('\nStep 4: Claiming Admin role with incorrect token...');
  const badClaimRes = await fetch(`${BASE_URL}/admin/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mock-user-id': testUserId
    },
    body: JSON.stringify({ setupToken: 'wrong_secret_token_1234' })
  });
  console.log(`ℹ️ Claim Attempt HTTP Status: ${badClaimRes.status} (Expected 401)`);
  assert.strictEqual(badClaimRes.status, 401, 'Claiming with incorrect token must be rejected');
  console.log('✅ Incorrect token claim rejected.');

  // 5. Test claiming Admin role with correct setup token (should return 200)
  console.log('\nStep 5: Claiming Admin role with correct setup token...');
  const goodClaimRes = await fetch(`${BASE_URL}/admin/claim`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mock-user-id': testUserId
    },
    body: JSON.stringify({ setupToken: process.env.ADMIN_SETUP_TOKEN || 'classplus_erp_admin_secret_9988' })
  });
  const claimData = await goodClaimRes.json();
  if (!goodClaimRes.ok) {
    throw new Error(`Claim failed: ${JSON.stringify(claimData)}`);
  }
  console.log('✅ Successfully claimed Admin role!');
  assert.strictEqual(claimData.role, 'Admin', 'User role should now be elevated to Admin');

  // 6. Test that stats succeeds after claiming Admin role (should return 200)
  console.log('\nStep 6: Requesting /api/admin/stats after claiming Admin...');
  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: {
      'x-mock-user-id': testUserId
    }
  });
  const statsData = await statsRes.json();
  if (!statsRes.ok) {
    throw new Error(`Stats failed after claiming role: ${JSON.stringify(statsData)}`);
  }
  console.log('✅ Admin stats retrieved successfully!');
  console.log(`🏫 School Name: ${statsData.schoolName}`);
  console.log(`👨‍🏫 Teachers Count: ${statsData.teachersCount}`);
  console.log(`📚 Class Groups: ${statsData.groupsCount}`);
  console.log(`🧑‍🎓 Students Count: ${statsData.studentsCount}`);

  // 7. Test Invited Teacher Tenancy Linking (Orphan Sync Bug)
  console.log('\nStep 7: Testing Invited Teacher Tenancy Linking (Orphan Sync Bug)...');
  
  const usersCollection = db.collection('users');

  const uniqueSuffix = Date.now();
  const testEmail = `user_tester_teacher_invite_${uniqueSuffix}@school.com`;
  const testMockClerkId = `mock_clerk_invite_${uniqueSuffix}`;
  const mockInstitutionId = new mongoose.Types.ObjectId();

  // Insert a placeholder user
  await usersCollection.insertOne({
    clerkId: testMockClerkId,
    email: testEmail,
    role: 'Teacher',
    institutionId: mockInstitutionId,
    schoolName: 'Test Invited School',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  console.log(`✅ Inserted placeholder user in DB: email = ${testEmail}, clerkId = ${testMockClerkId}`);

  // Request endpoint simulating clerk login for this new user
  const realClerkId = `user_tester_teacher_invite_${uniqueSuffix}`;
  console.log(`ℹ️ Simulating new Clerk registration with clerkId = ${realClerkId} and email = ${testEmail}`);
  
  // Make call to endpoint to trigger syncUserMiddleware
  const syncRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: {
      'x-mock-user-id': realClerkId
    }
  });

  // Since this user is a regular teacher (not admin), we expect 403 Forbidden
  console.log(`ℹ️ Registration Sync Response Status: ${syncRes.status} (Expected 403)`);
  assert.strictEqual(syncRes.status, 403, 'A normal teacher must be forbidden from admin stats, but middleware sync should still have run');

  // Verify DB state
  const matchedUsers = await usersCollection.find({ email: testEmail }).toArray();
  console.log(`ℹ️ Found ${matchedUsers.length} users with email ${testEmail} in MongoDB`);
  assert.strictEqual(matchedUsers.length, 1, 'There should be exactly one user with this email (no duplicates created)');

  const syncedUser = matchedUsers[0];
  console.log(`ℹ️ Synced User clerkId in DB: ${syncedUser.clerkId} (Expected: ${realClerkId})`);
  assert.strictEqual(syncedUser.clerkId, realClerkId, 'The clerkId must have been updated to the real Clerk ID');

  console.log(`ℹ️ Synced User institutionId in DB: ${syncedUser.institutionId.toString()} (Expected: ${mockInstitutionId.toString()})`);
  assert.strictEqual(syncedUser.institutionId.toString(), mockInstitutionId.toString(), 'The institutionId must have been preserved');

  console.log(`ℹ️ Synced User schoolName in DB: ${syncedUser.schoolName} (Expected: Test Invited School)`);
  assert.strictEqual(syncedUser.schoolName, 'Test Invited School', 'The schoolName must have been preserved');

  // 8. Test Enforce AI Credit Quota Limit
  console.log('\nStep 8: Testing AI Credit Quota Limit Middleware...');
  // Set the test user's creditsLimit to 0
  await usersCollection.updateOne({ clerkId: testUserId }, { $set: { creditsLimit: 0 } });
  console.log(`ℹ️ Temporary set creditsLimit to 0 for user ${testUserId}`);

  // Now attempt to generate an assignment
  const quotaFailRes = await fetch(`${BASE_URL}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mock-user-id': testUserId
    },
    body: JSON.stringify({
      title: 'Quota Test Paper',
      subject: 'Science',
      grade: 'Class 10',
      dueDate: '2026-06-30',
      questionRows: [{ type: 'mcq', count: 5, marks: 1 }]
    })
  });

  console.log(`ℹ️ Quota Rejection Response Status: ${quotaFailRes.status} (Expected 402)`);
  assert.strictEqual(quotaFailRes.status, 402, 'Should reject with 402 Payment Required when credits are exhausted');
  const quotaFailData = await quotaFailRes.json();
  console.log(`✅ Quota rejected message: ${quotaFailData.message}`);

  // Restore the limit
  await usersCollection.updateOne({ clerkId: testUserId }, { $set: { creditsLimit: 100 } });
  console.log(`ℹ️ Restored creditsLimit for user ${testUserId}`);

  // 9. Test Asynchronous Grading Queue (BullMQ)
  console.log('\nStep 9: Testing Asynchronous AI Grading Queue...');
  // Create an assignment containing descriptive questions
  const createPaperRes = await fetch(`${BASE_URL}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-mock-user-id': testUserId
    },
    body: JSON.stringify({
      title: 'Descriptive Test Paper',
      subject: 'Science',
      grade: 'Class 10',
      dueDate: '2026-06-30',
      questionRows: [
        { type: 'short', count: 1, marks: 3 },
        { type: 'mcq', count: 1, marks: 1 }
      ]
    })
  });
  const paperData = await createPaperRes.json();
  assert.ok(paperData.assignmentId, 'Assignment should be created successfully');
  const testAssignmentId = paperData.assignmentId;

  // Wait for the background worker to grade/generate the assignment
  console.log('⏳ Waiting for assignment generation worker to complete...');
  let assignmentStatus = 'pending';
  const assignmentsColl = db.collection('assignments');
  for (let i = 0; i < 20; i++) {
    const paperDoc = await assignmentsColl.findOne({ _id: new mongoose.Types.ObjectId(testAssignmentId) });
    if (paperDoc && paperDoc.status === 'done') {
      assignmentStatus = 'done';
      break;
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  assert.strictEqual(assignmentStatus, 'done', 'Assignment generation should complete successfully');
  console.log('✅ Assignment generated successfully by BullMQ worker!');

  // Now, let's assign it to a group
  const groupsColl = db.collection('groups');
  const testGroupId = new mongoose.Types.ObjectId();
  const testGroupCode = 'GR' + Date.now().toString().slice(-4);
  await groupsColl.insertOne({
    _id: testGroupId,
    name: 'Test Class 10',
    grade: 'Class 10',
    subject: 'Science',
    students: ['Aarav Sharma'],
    classCode: testGroupCode,
    userId: testUserId,
    institutionId: mockInstitutionId
  });

  const assignedColl = db.collection('assignedassignments');
  const testAssignedId = new mongoose.Types.ObjectId();
  await assignedColl.insertOne({
    _id: testAssignedId,
    assignmentId: new mongoose.Types.ObjectId(testAssignmentId),
    groupId: testGroupId,
    dueDate: '2026-06-30',
    hintsEnabled: false,
    durationMinutes: null,
    userId: testUserId
  });

  // Update Aarav's StudentCredential in MongoDB to include the new group
  const studentCredentialsColl = db.collection('studentcredentials');
  await studentCredentialsColl.updateOne(
    { email: 'aarav.sharma@school.com' },
    { $addToSet: { groupIds: testGroupId } }
  );
  console.log('ℹ️ Added test group to Aarav Sharma student credential record');

  // Get student credential JWT token by logging in Aarav Sharma
  const aaravLoginRes = await fetch(`${BASE_URL}/student/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aarav.sharma@school.com',
      passcode: '1234'
    })
  });
  const aaravLoginData = await aaravLoginRes.json();
  const studentToken = aaravLoginData.token;
  assert.ok(studentToken, 'Student login should return JWT token');

  // Submit descriptive answers
  console.log('📤 Submitting student answers with descriptive questions...');
  const generatedAssignment = await assignmentsColl.findOne({ _id: new mongoose.Types.ObjectId(testAssignmentId) });
  const questionsList = generatedAssignment.result.sections.flatMap(s => s.questions);
  const shortQuestion = questionsList.find(q => q.type === 'short');
  const mcqQuestion = questionsList.find(q => q.type === 'mcq');

  const answersToSubmit = [];
  if (shortQuestion) {
    answersToSubmit.push({ questionId: shortQuestion.id, answer: 'Force is defined as push or pull acting on an object.' });
  }
  if (mcqQuestion) {
    answersToSubmit.push({ questionId: mcqQuestion.id, answer: mcqQuestion.options[0] || 'A' });
  }

  const submitRes = await fetch(`${BASE_URL}/student/submit/${testAssignedId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    },
    body: JSON.stringify({ answers: answersToSubmit })
  });

  console.log(`ℹ️ Submission Response Status: ${submitRes.status} (Expected 202)`);
  assert.strictEqual(submitRes.status, 202, 'Submission with descriptive questions must return 202 enqueued for grading');
  const submitData = await submitRes.json();
  assert.strictEqual(submitData.status, 'grading', 'Response status should be grading');
  console.log('✅ Submission enqueued in student-grading queue!');

  // Poll results endpoint until status becomes 'graded'
  console.log('⏳ Waiting for background AI grading worker to complete...');
  let gradingStatus = 'grading';
  let finalResults = null;
  const submissionsColl = db.collection('studentsubmissions');

  for (let i = 0; i < 20; i++) {
    const resultsRes = await fetch(`${BASE_URL}/student/results/${testAssignedId}?studentName=Aarav%20Sharma`, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    const resultsData = await resultsRes.json();
    if (resultsData.status === 'graded') {
      gradingStatus = 'graded';
      finalResults = resultsData;
      break;
    }
    await new Promise(r => setTimeout(r, 2000));
  }

  assert.strictEqual(gradingStatus, 'graded', 'AI grading should complete successfully and set status to graded');
  console.log('✅ AI Grading complete! Student score retrieved:');
  console.log(`📊 Total Marks: ${finalResults.totalMarks}`);
  console.log(`📊 Score Awarded: ${finalResults.totalScore}`);
  console.log(`📊 Percentage: ${finalResults.percentage}%`);

  // Clean up
  await studentCredentialsColl.updateOne(
    { email: 'aarav.sharma@school.com' },
    { $pull: { groupIds: testGroupId } }
  );
  await assignmentsColl.deleteOne({ _id: new mongoose.Types.ObjectId(testAssignmentId) });
  await groupsColl.deleteOne({ _id: testGroupId });
  await assignedColl.deleteOne({ _id: testAssignedId });
  await submissionsColl.deleteOne({ assignedAssignmentId: testAssignedId });
  await usersCollection.deleteOne({ email: testEmail });
  console.log('🧹 Cleaned up descriptive test assets & verification user from DB');

  // Disconnect
  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');

  console.log('\n🎉 ALL SEPARATION, TENANCY LINKING & SCALING INTEGRATION TESTS PASSED SUCCESSFULLY!');
}

test().catch(err => {
  console.error('❌ Integration Test Failed:', err);
  process.exit(1);
});
