import { Request, Response, NextFunction } from 'express';
import { getAuth, clerkClient } from '@clerk/express';
import { User } from '../models/user.model';
import { Assignment } from '../models/assignment.model';
import { LibraryItem } from '../models/library.model';
import { Notification } from '../models/notification.model';
import { Institution } from '../models/institution.model';
import { env } from '../config/env';
import { verifyStudentToken, verifyAdminToken } from '../utils/jwt';

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
    // Support mock user ID headers in non-production for automated API verification
    if (process.env.NODE_ENV !== 'production' && req.headers['x-mock-user-id']) {
      (req as any).auth = { userId: req.headers['x-mock-user-id'] };
      return next();
    }
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
}export async function syncUserMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = (req as any).auth;
    if (auth && auth.userId) {
      const clerkId = auth.userId;
      
      // Fetch details from Clerk first to get the verified email address
      let email = 'tester@shiven.com';
      let firstName = 'Shiven';
      let lastName = 'Tester';
      let imageUrl = '';
      let roleVal = 'Teacher';
      
      const isTestUser = clerkId === 'user_tester' || clerkId.startsWith('user_tester_teacher');
      if (env.CLERK_SECRET_KEY && env.CLERK_PUBLISHABLE_KEY && !isTestUser) {
        try {
          const clerkUser = await clerkClient.users.getUser(clerkId);
          email = clerkUser.emailAddresses[0]?.emailAddress || email;
          firstName = clerkUser.firstName || firstName;
          lastName = clerkUser.lastName || lastName;
          imageUrl = clerkUser.imageUrl || imageUrl;
          roleVal = (clerkUser.publicMetadata?.role as string) || roleVal;
        } catch (clerkErr) {
          console.error('Failed to fetch user from Clerk:', clerkErr);
        }
      }

      // If it is an automated integration test user, mock a matching email
      if (clerkId.startsWith('user_tester_teacher_')) {
        email = `${clerkId}@school.com`;
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Find user by clerkId OR by pre-registered email
      let user = await User.findOne({
        $or: [
          { clerkId },
          { email: normalizedEmail }
        ]
      });

      if (!user) {
        // Create user in DB
        try {
          user = await User.create({
            clerkId,
            email: normalizedEmail,
            firstName,
            lastName,
            imageUrl,
            role: roleVal,
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
            console.log(`👤 User with clerkId ${clerkId} or email ${normalizedEmail} was created concurrently. Fetching existing user.`);
            user = await User.findOne({
              $or: [
                { clerkId },
                { email: normalizedEmail }
              ]
            });
          } else {
            throw createErr;
          }
        }
      } else {
        // Claim placeholder teacher account if it has a mock Clerk ID
        if (user.clerkId.startsWith('mock_clerk_')) {
          console.log(`🔗 Claiming placeholder teacher account: updating clerkId from ${user.clerkId} to ${clerkId}`);
          user.clerkId = clerkId;
        }

        // User already exists, check and sync any changes from Clerk
        if (env.CLERK_SECRET_KEY && env.CLERK_PUBLISHABLE_KEY && !isTestUser) {
          try {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            const emailVal = clerkUser.emailAddresses[0]?.emailAddress || '';
            const firstVal = clerkUser.firstName || '';
            const lastVal = clerkUser.lastName || '';
            const imgVal = clerkUser.imageUrl || '';
            const metadataRole = (clerkUser.publicMetadata?.role as string) || '';

            let changed = false;
            if (emailVal && user.email !== emailVal) { user.email = emailVal; changed = true; }
            if (firstVal && user.firstName !== firstVal) { user.firstName = firstVal; changed = true; }
            if (lastVal && user.lastName !== lastVal) { user.lastName = lastVal; changed = true; }
            if (imgVal && user.imageUrl !== imgVal) { user.imageUrl = imgVal; changed = true; }
            if (metadataRole && user.role !== metadataRole) { user.role = metadataRole; changed = true; }

            if (changed || user.isModified('clerkId')) {
              await user.save();
              console.log(`👤 Automatically synced updated Clerk details in DB for ${user.email}`);
            }
          } catch (clerkErr) {
            console.error('Failed to sync updated user details from Clerk:', clerkErr);
          }
        } else if (user.isModified('clerkId')) {
          await user.save();
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

/**
 * Express middleware to verify student JWT session tokens.
 */
export function requireStudentAuth() {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized. Student session token required.' });
        return;
      }
      const token = authHeader.substring(7);
      const decoded = verifyStudentToken(token);
      if (!decoded) {
        res.status(401).json({ error: 'Unauthorized. Student session has expired or is invalid.' });
        return;
      }
      (req as any).student = decoded;
      next();
    } catch (err) {
      console.error('Student auth middleware error:', err);
      res.status(401).json({ error: 'Unauthorized.' });
    }
  };
}

/**
 * Express middleware to verify structural permissions based on ERP Roles.
 */
export function checkRole(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    const student = (req as any).student;

    const currentRole = user?.role || student?.role;

    if (!currentRole || !allowedRoles.includes(currentRole)) {
      res.status(403).json({ error: 'Forbidden. You do not have permission to access this resource.' });
      return;
    }
    next();
  };
}

/**
 * Express middleware to support routing accessed by both Teachers (Clerk) and Students (JWT).
 */
export function requireEitherAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const student = verifyStudentToken(token);
    if (student) {
      (req as any).student = student;
      return next();
    }
  }

  // Fallback to Clerk Auth
  return requireAuth()(req, res, () => {
    return syncUserMiddleware(req, res, next);
  });
}

/**
 * Express middleware to enforce individual and institution AI generation credits limits.
 */
export async function checkCredits(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. User profile required for credit validation.' });
    }

    // 1. Check individual user limits
    const userCreditsLimit = user.creditsLimit ?? 10;
    const userCreditsUsed = await Assignment.countDocuments({ userId: user.clerkId });
    if (userCreditsUsed >= userCreditsLimit) {
      return res.status(402).json({
        error: 'Payment Required',
        message: `You have reached your individual AI generation credit limit (${userCreditsUsed}/${userCreditsLimit}). Please upgrade your plan to generate more assignments.`
      });
    }

    // 2. Check school-wide limits if user is linked to an institution
    if (user.institutionId) {
      const inst = await Institution.findById(user.institutionId);
      if (inst) {
        // Fetch all staff members linked to this institution
        const staff = await User.find({ institutionId: inst._id }).select('clerkId');
        const staffIds = staff.map(s => s.clerkId);
        const instCreditsUsed = await Assignment.countDocuments({ userId: { $in: staffIds } });
        
        // Dynamically update institution creditsUsed
        if (inst.creditsUsed !== instCreditsUsed) {
          inst.creditsUsed = instCreditsUsed;
          await inst.save();
        }

        if (instCreditsUsed >= inst.creditsLimit) {
          return res.status(402).json({
            error: 'Payment Required',
            message: `Your institution has reached its school-wide AI generation credit limit (${instCreditsUsed}/${inst.creditsLimit}). Please contact your administrator.`
          });
        }
      }
    }

    next();
  } catch (error) {
    console.error('Error inside checkCredits middleware:', error);
    next();
  }
}

/**
 * Express middleware to verify Admin custom JWT session tokens.
 */
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Support mock user ID headers in non-production for automated API verification
    if (process.env.NODE_ENV !== 'production' && req.headers['x-mock-user-id']) {
      const mockUserId = req.headers['x-mock-user-id'] as string;
      const mockEmail = `${mockUserId}@school.com`;
      
      const user = await User.findOne({
        $or: [
          { clerkId: mockUserId },
          { email: mockEmail }
        ]
      });
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized. Mock user not found.' });
      }
      
      // Claim placeholder teacher account if it has a mock Clerk ID
      if (user.clerkId.startsWith('mock_clerk_')) {
        console.log(`🔗 Claiming placeholder teacher account in requireAdminAuth: updating clerkId from ${user.clerkId} to ${mockUserId}`);
        user.clerkId = mockUserId;
        await user.save();
      }
      
      if (user.role !== 'Admin') {
        return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
      }
      (req as any).user = user;
      (req as any).auth = { userId: user.clerkId };
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Admin session token required.' });
    }
    const token = authHeader.substring(7);
    const decoded = verifyAdminToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Unauthorized. Admin session has expired or is invalid.' });
    }

    const user = await User.findById(decoded.adminId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    }

    (req as any).user = user;
    (req as any).auth = { userId: user.clerkId }; // Sync custom mock clerk ID for assignments count & logs
    next();
  } catch (err) {
    console.error('Admin auth middleware error:', err);
    res.status(401).json({ error: 'Unauthorized.' });
  }
}

/**
 * Express middleware to prevent parent users from making mutation requests (non-GET requests).
 * Allows parent child-linking POST requests to pass.
 */
export async function blockParentMutations(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET') {
    return next();
  }
  // Allow parent linking route specifically
  if (req.path === '/api/parent/link' || req.originalUrl === '/api/parent/link') {
    return next();
  }

  try {
    const auth = getAuth(req);
    if (auth?.userId) {
      const user = await User.findOne({ clerkId: auth.userId });
      if (user && user.role === 'parent') {
        return res.status(403).json({ error: 'Forbidden. Parent accounts are read-only.' });
      }
    }
  } catch (err) {
    // If not authenticated or Clerk key is missing, allow check to pass
  }
  next();
}
