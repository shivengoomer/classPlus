import mongoose from 'mongoose';
import { env } from './env';
import { User } from '../models/user.model';
import { Assignment } from '../models/assignment.model';
import { LibraryItem } from '../models/library.model';
import { Notification } from '../models/notification.model';

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
          creditsLimit: 50
        });
        console.log(`👤 Created user ${targetEmail} with clerkId ${targetClerkId}`);
      }
    }

    // 2. Map all old/seeded/mock records to targetClerkId
    const query = { $or: [{ userId: 'user_tester' }, { userId: '' }, { userId: { $exists: false } }] };

    const assignRes = await Assignment.updateMany(query, { userId: targetClerkId });
    const libRes = await LibraryItem.updateMany(query, { userId: targetClerkId });
    const notifRes = await Notification.updateMany(query, { userId: targetClerkId });

    if (assignRes.modifiedCount > 0 || libRes.modifiedCount > 0 || notifRes.modifiedCount > 0) {
      console.log(`✨ Migration: Mapped ${assignRes.modifiedCount} assignments, ${libRes.modifiedCount} library items, and ${notifRes.modifiedCount} notifications to ${targetClerkId}`);
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
