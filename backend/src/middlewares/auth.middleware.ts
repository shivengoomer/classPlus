import { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { User } from '../models/user.model';
import { Assignment } from '../models/assignment.model';
import { LibraryItem } from '../models/library.model';
import { Notification } from '../models/notification.model';
import { env } from '../config/env';

// API-friendly auth middleware — returns 401 JSON instead of 302 redirect.
// Uses getAuth() to extract userId from JWT Bearer token in Authorization header.
export function requireAuth() {
  if (!env.CLERK_SECRET_KEY || !env.CLERK_PUBLISHABLE_KEY) {
    return (req: Request, res: Response, next: NextFunction) => {
      // Inject mock user auth details when Clerk keys are not configured
      (req as any).auth = { userId: 'user_tester' };
      next();
    };
  }
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      if (!auth?.userId) {
        res.status(401).json({ error: 'Unauthorized. Please sign in.' });
        return;
      }
      (req as any).auth = auth;
      next();
    } catch (err) {
      console.error('Auth error:', err);
      res.status(401).json({ error: 'Unauthorized. Invalid or expired session.' });
    }
  };
}

export async function syncUserMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = (req as any).auth;
    if (auth && auth.userId) {
      const clerkId = auth.userId;
      
      // Check if user already exists in DB
      let user = await User.findOne({ clerkId });
      if (!user) {
        let email = 'tester@shiven.com';
        let firstName = 'Shiven';
        let lastName = 'Tester';
        let imageUrl = '';
        
        // Fetch details from Clerk if secret key is present
        if (env.CLERK_SECRET_KEY && env.CLERK_PUBLISHABLE_KEY && clerkId !== 'user_tester') {
          try {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            email = clerkUser.emailAddresses[0]?.emailAddress || email;
            firstName = clerkUser.firstName || firstName;
            lastName = clerkUser.lastName || lastName;
            imageUrl = clerkUser.imageUrl || imageUrl;
          } catch (clerkErr) {
            console.error('Failed to fetch user from Clerk:', clerkErr);
          }
        }
        
        // Create user in DB
        try {
          user = await User.create({
            clerkId,
            email,
            firstName,
            lastName,
            imageUrl,
          });
          console.log(`👤 Synced new user to DB: ${user.email} (${user.clerkId})`);
          
          // Claim seeded/unowned records for this user (First login claim)
          console.log(`🔑 Claiming unowned seeded records for ${user.email}...`);
          const assignRes = await Assignment.updateMany(
            { $or: [{ userId: { $exists: false } }, { userId: 'user_tester' }, { userId: '' }] },
            { userId: clerkId }
          );
          const libRes = await LibraryItem.updateMany(
            { $or: [{ userId: { $exists: false } }, { userId: 'user_tester' }, { userId: '' }] },
            { userId: clerkId }
          );
          const notifRes = await Notification.updateMany(
            { $or: [{ userId: { $exists: false } }, { userId: 'user_tester' }, { userId: '' }] },
            { userId: clerkId }
          );
          
          console.log(`✅ Claimed ${assignRes.modifiedCount} assignments, ${libRes.modifiedCount} library items, and ${notifRes.modifiedCount} notifications.`);
        } catch (createErr: any) {
          if (createErr.code === 11000) {
            console.log(`👤 User with clerkId ${clerkId} was created concurrently. Fetching existing user.`);
            user = await User.findOne({ clerkId });
          } else {
            throw createErr;
          }
        }
      } else {
        // User already exists, check and sync any changes from Clerk
        if (env.CLERK_SECRET_KEY && env.CLERK_PUBLISHABLE_KEY && clerkId !== 'user_tester') {
          try {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            const email = clerkUser.emailAddresses[0]?.emailAddress || '';
            const firstName = clerkUser.firstName || '';
            const lastName = clerkUser.lastName || '';
            const imageUrl = clerkUser.imageUrl || '';

            let changed = false;
            if (email && user.email !== email) { user.email = email; changed = true; }
            if (firstName && user.firstName !== firstName) { user.firstName = firstName; changed = true; }
            if (lastName && user.lastName !== lastName) { user.lastName = lastName; changed = true; }
            if (imageUrl && user.imageUrl !== imageUrl) { user.imageUrl = imageUrl; changed = true; }

            if (changed) {
              await user.save();
              console.log(`👤 Automatically synced updated Clerk details in DB for ${user.email}`);
            }
          } catch (clerkErr) {
            console.error('Failed to sync updated user details from Clerk:', clerkErr);
          }
        }
      }
      
      (req as any).user = user;
    }
    next();
  } catch (error) {
    console.error('Error inside syncUserMiddleware:', error);
    next();
  }
}
