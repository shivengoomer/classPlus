import mongoose from 'mongoose';
import { env } from './env';
import { User } from '../models/user.model';
import { Assignment } from '../models/assignment.model';
import { LibraryItem } from '../models/library.model';
import { Notification } from '../models/notification.model';
import { Group } from '../models/group.model';
import { StudentCredential } from '../models/studentCredential.model';

async function runMigration() {
  try {
    const targetClerkId = 'user_3EHCgsxbuP5bjna4KDzJVPvGZfG';
    const targetEmail = 'tester@shiven.com';

    // 1. Ensure user tester@shiven.com exists with targetClerkId
    let user = await User.findOne({ clerkId: targetClerkId });
    if (!user) {
      user = await User.findOne({ email: targetEmail });
      if (user) {
        user.clerkId = targetClerkId;
        await user.save();
        console.log(`👤 Updated existing user's clerkId to ${targetClerkId}`);
      } else {
        user = await User.create({
          clerkId: targetClerkId,
          email: targetEmail,
          firstName: 'Shiven',
          lastName: 'Tester',
          role: 'Senior Science Teacher',
          schoolName: 'Delhi Public School',
          schoolBranch: 'Bokaro Steel City, Sector-4',
          schoolCode: 'CBSE-3430015',
          aiModel: 'gemini-1.5-flash',
          aiStrictNCERT: true,
          aiCreativity: 0.2,
          plan: 'Free Trial',
          planStatus: 'active',
          creditsUsed: 0,
          creditsLimit: 10
        });
        console.log(`👤 Created user ${targetEmail} with clerkId ${targetClerkId}`);
      }
    }

    // 2. Map all old/seeded/mock records to targetClerkId
    const query = { $or: [{ userId: 'user_tester' }, { userId: 'test_clerk_id_999' }, { userId: '' }, { userId: { $exists: false } }] };

    const assignRes = await Assignment.updateMany(query, { userId: targetClerkId });
    const libRes = await LibraryItem.updateMany(query, { userId: targetClerkId });
    const notifRes = await Notification.updateMany(query, { userId: targetClerkId });

    if (assignRes.modifiedCount > 0 || libRes.modifiedCount > 0 || notifRes.modifiedCount > 0) {
      console.log(`✨ Migration: Mapped ${assignRes.modifiedCount} assignments, ${libRes.modifiedCount} library items, and ${notifRes.modifiedCount} notifications to ${targetClerkId}`);
    }

    // 3. Backfill institutionId for Group
    const groupsToBackfill = await Group.find({ institutionId: { $exists: false } });
    if (groupsToBackfill.length > 0) {
      let backfilledGroupsCount = 0;
      for (const group of groupsToBackfill) {
        if (group.userId) {
          const userObj = await User.findOne({ clerkId: group.userId });
          if (userObj && userObj.institutionId) {
            group.institutionId = userObj.institutionId;
            await group.save();
            backfilledGroupsCount++;
          }
        }
      }
      if (backfilledGroupsCount > 0) {
        console.log(`✨ Migration: Backfilled institutionId for ${backfilledGroupsCount} groups`);
      }
    }

    // 4. Backfill institutionId for Assignment
    const assignmentsToBackfill = await Assignment.find({ institutionId: { $exists: false } });
    if (assignmentsToBackfill.length > 0) {
      let backfilledAssignmentsCount = 0;
      for (const assignment of assignmentsToBackfill) {
        if (assignment.userId) {
          const userObj = await User.findOne({ clerkId: assignment.userId });
          if (userObj && userObj.institutionId) {
            assignment.institutionId = userObj.institutionId;
            await assignment.save();
            backfilledAssignmentsCount++;
          }
        }
      }
      if (backfilledAssignmentsCount > 0) {
        console.log(`✨ Migration: Backfilled institutionId for ${backfilledAssignmentsCount} assignments`);
      }
    }

    // 5. Backfill institutionId for StudentCredential
    const studentsToBackfill = await StudentCredential.find({ institutionId: { $exists: false } });
    if (studentsToBackfill.length > 0) {
      let backfilledStudentsCount = 0;
      for (const student of studentsToBackfill) {
        if (student.groupIds && student.groupIds.length > 0) {
          const firstGroup = await Group.findById(student.groupIds[0]);
          if (firstGroup && firstGroup.institutionId) {
            student.institutionId = firstGroup.institutionId;
            await student.save();
            backfilledStudentsCount++;
          }
        }
      }
      if (backfilledStudentsCount > 0) {
        console.log(`✨ Migration: Backfilled institutionId for ${backfilledStudentsCount} student credentials`);
      }
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

export async function connectDB() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    // Run the migration after database connection succeeds
    await runMigration();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}
