// src/controllers/superadmin.controller.ts
import { Request, Response } from 'express';
import { Institution } from '../models/institution.model';
import { User } from '../models/user.model';
import { Assignment } from '../models/assignment.model';
import { Group } from '../models/group.model';
import { StudentCredential } from '../models/studentCredential.model';
import { AuditLog } from '../models/auditLog.model';
import { log, logError } from '../utils/logger';
import crypto from 'crypto';

// GET /api/superadmin/institutions
export async function listInstitutions(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    const search = (req.query.search as string || '').trim();

    const query: any = {};
    if (search) {
      const searchRegex = new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { branch: searchRegex },
        { schoolCode: searchRegex }
      ];
    }

    const totalDocs = await Institution.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);
    const skip = (page - 1) * limit;

    const institutions = await Institution.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate global stats for KPIs
    const globalCount = await Institution.countDocuments({});
    const statsAgg = await Institution.aggregate([
      {
        $group: {
          _id: null,
          totalLimit: { $sum: '$creditsLimit' },
          totalUsed: { $sum: '$creditsUsed' }
        }
      }
    ]);
    const totalCreditsLimit = statsAgg[0]?.totalLimit || 0;
    const totalCreditsUsed = statsAgg[0]?.totalUsed || 0;

    // Enrich with dynamic usage stats
    const enriched = await Promise.all(
      institutions.map(async (inst) => {
        // Fetch active teachers
        const teachers = await User.find({ institutionId: inst._id, role: 'Teacher' }).select('email firstName lastName clerkId');
        // Fetch active admins
        const admins = await User.find({ institutionId: inst._id, role: 'Admin' }).select('email firstName lastName clerkId');

        // Fetch dynamic credit count from database
        const staff = await User.find({ institutionId: inst._id }).select('clerkId');
        const staffIds = staff.map(s => s.clerkId);
        const dynamicCreditsUsed = await Assignment.countDocuments({ userId: { $in: staffIds } });

        // Update if count differs
        if (inst.creditsUsed !== dynamicCreditsUsed) {
          inst.creditsUsed = dynamicCreditsUsed;
          await inst.save();
        }

        return {
          _id: inst._id,
          name: inst.name,
          address: inst.address,
          board: inst.board,
          branch: inst.branch,
          schoolCode: inst.schoolCode,
          creditsLimit: inst.creditsLimit,
          creditsUsed: dynamicCreditsUsed,
          planStatus: inst.planStatus,
          teachersCount: teachers.length,
          adminsCount: admins.length,
          admins: admins.map(a => a.email),
          createdAt: inst.createdAt,
        };
      })
    );

    return res.json({
      docs: enriched,
      totalDocs,
      limit,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      stats: {
        globalCount,
        totalCreditsLimit,
        totalCreditsUsed
      }
    });
  } catch (err) {
    logError('SuperAdmin listInstitutions failed', err);
    return res.status(500).json({ error: 'Failed to retrieve institutions' });
  }
}

// POST /api/superadmin/institutions
export async function createInstitution(req: Request, res: Response) {
  try {
    const {
      name,
      address,
      board,
      branch,
      schoolCode,
      creditsLimit,
      planStatus,
      adminEmail,
      adminPassword,
      adminFirstName,
      adminLastName
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Institution name is required' });
    }

    const normalizedName = name.trim();
    const normalizedBranch = (branch || 'Main Branch').trim();

    // Check case-insensitive duplicate name + branch combination
    const existing = await Institution.findOne({
      name: { $regex: new RegExp(`^${normalizedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      branch: { $regex: new RegExp(`^${normalizedBranch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });
    if (existing) {
      return res.status(400).json({ error: `An institution with the name "${normalizedName}" and branch "${normalizedBranch}" already exists.` });
    }

    // Check admin email duplicate if provided
    let normalizedAdminEmail = '';
    if (adminEmail && adminEmail.trim()) {
      normalizedAdminEmail = adminEmail.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedAdminEmail });
      if (existingUser) {
        return res.status(400).json({ error: `An account with the email "${adminEmail}" already exists.` });
      }
      if (!adminPassword || !adminPassword.trim()) {
        return res.status(400).json({ error: 'Admin password is required if admin email is provided.' });
      }
    }

    const targetSchoolCode = schoolCode || `SCH-${Date.now().toString().slice(-6)}`;
    const targetCreditsLimit = typeof creditsLimit === 'number' ? creditsLimit : 5000;

    const inst = await Institution.create({
      name: normalizedName,
      address,
      board: board || 'CBSE',
      branch: normalizedBranch,
      schoolCode: targetSchoolCode,
      creditsLimit: targetCreditsLimit,
      creditsUsed: 0,
      planStatus: planStatus || 'active',
      adminIds: []
    });

    if (normalizedAdminEmail) {
      // Hash admin password
      const salt = normalizedAdminEmail;
      const hashed = crypto.createHash('sha256').update(adminPassword + salt).digest('hex');

      // Create Admin User
      const adminUser = await User.create({
        clerkId: `admin_${Date.now()}`,
        email: normalizedAdminEmail,
        firstName: adminFirstName || 'School',
        lastName: adminLastName || 'Admin',
        role: 'Admin',
        adminPassword: hashed,
        creditsLimit: targetCreditsLimit,
        institutionId: inst._id,
        schoolName: inst.name,
        schoolBranch: inst.branch,
        schoolCode: inst.schoolCode,
        planStatus: inst.planStatus
      });

      // Bind admin to institution
      inst.adminIds.push(adminUser.clerkId);
      await inst.save();

      // Create audit log
      await AuditLog.create({
        actorId: adminUser.clerkId,
        actorModel: 'User',
        actorName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.email,
        action: 'CLAIM_ADMIN',
        details: { schoolName: inst.name, schoolCode: inst.schoolCode, createdBy: 'SuperAdmin' },
      });

      log(`SuperAdmin created institution: ${inst.name} and registered primary admin: ${adminUser.email}`);
    } else {
      log(`SuperAdmin created institution: ${inst.name} (${inst._id})`);
    }

    return res.status(201).json(inst);
  } catch (err) {
    logError('SuperAdmin createInstitution failed', err);
    return res.status(500).json({ error: 'Failed to onboard institution' });
  }
}

// PUT /api/superadmin/institutions/:id
export async function updateInstitution(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const inst = await Institution.findById(id);
    if (!inst) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const { name, address, board, branch, schoolCode, creditsLimit, planStatus } = req.body;

    if (name !== undefined) inst.name = name;
    if (address !== undefined) inst.address = address;
    if (board !== undefined) inst.board = board;
    if (branch !== undefined) inst.branch = branch;
    if (schoolCode !== undefined) inst.schoolCode = schoolCode;
    if (creditsLimit !== undefined) inst.creditsLimit = creditsLimit;
    if (planStatus !== undefined) inst.planStatus = planStatus;

    await inst.save();
    log(`SuperAdmin updated institution details for: ${inst.name}`);
    return res.json(inst);
  } catch (err) {
    logError('SuperAdmin updateInstitution failed', err);
    return res.status(500).json({ error: 'Failed to update institution settings' });
  }
}

// DELETE /api/superadmin/institutions/:id
export async function deleteInstitution(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const inst = await Institution.findByIdAndDelete(id);
    if (!inst) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    // Detach institutionId from all users belonging to this institution
    await User.updateMany({ institutionId: inst._id }, { $unset: { institutionId: 1 } });

    log(`SuperAdmin deleted institution: ${inst.name}`);
    return res.json({ message: 'Institution deleted successfully' });
  } catch (err) {
    logError('SuperAdmin deleteInstitution failed', err);
    return res.status(500).json({ error: 'Failed to delete institution' });
  }
}

// GET /api/superadmin/institutions/:id/detail
export async function getInstitutionDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const inst = await Institution.findById(id);
    if (!inst) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    // Fetch teachers in this institution
    const teachers = await User.find({ institutionId: inst._id, role: 'Teacher' }).sort({ createdAt: -1 });

    // Fetch admins in this institution
    const admins = await User.find({ institutionId: inst._id, role: 'Admin' }).sort({ createdAt: -1 });

    // Fetch class groups in this institution
    const groups = await Group.find({ institutionId: inst._id }).sort({ createdAt: -1 });

    // Fetch student credentials in this institution
    const students = await StudentCredential.find({ institutionId: inst._id }).sort({ createdAt: -1 });

    // Fetch staff clerkIds to find their audit logs
    const staff = await User.find({ institutionId: inst._id }).select('clerkId');
    const staffIds = staff.map(s => s.clerkId);
    const auditLogs = await AuditLog.find({ actorId: { $in: staffIds } }).sort({ createdAt: -1 }).limit(100);

    return res.json({
      institution: inst,
      teachers,
      admins,
      groups,
      students,
      auditLogs
    });
  } catch (err) {
    logError('SuperAdmin getInstitutionDetail failed', err);
    return res.status(500).json({ error: 'Failed to retrieve institution details' });
  }
}

// POST /api/superadmin/institutions/:id/admins
export async function createInstitutionAdmin(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const inst = await Institution.findById(id);
    if (!inst) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: `An account with the email "${email}" already exists.` });
    }

    // Hash admin password
    const salt = normalizedEmail;
    const hashed = crypto.createHash('sha256').update(password + salt).digest('hex');

    // Create Admin User
    const adminUser = await User.create({
      clerkId: `admin_${Date.now()}`,
      email: normalizedEmail,
      firstName: firstName || 'School',
      lastName: lastName || 'Admin',
      role: 'Admin',
      adminPassword: hashed,
      creditsLimit: inst.creditsLimit,
      institutionId: inst._id,
      schoolName: inst.name,
      schoolBranch: inst.branch,
      schoolCode: inst.schoolCode,
      planStatus: inst.planStatus
    });

    // Bind admin to institution
    inst.adminIds.push(adminUser.clerkId);
    await inst.save();

    // Create audit log
    await AuditLog.create({
      actorId: `admin_super_${Date.now()}`,
      actorModel: 'User',
      actorName: 'Super Admin',
      action: 'CREATE_ADMIN',
      details: { schoolName: inst.name, schoolCode: inst.schoolCode, adminEmail: normalizedEmail },
    });

    log(`SuperAdmin created admin: ${adminUser.email} for institution: ${inst.name}`);
    return res.status(201).json(adminUser);
  } catch (err) {
    logError('SuperAdmin createInstitutionAdmin failed', err);
    return res.status(500).json({ error: 'Failed to create institution admin' });
  }
}

// DELETE /api/superadmin/institutions/:id/admins/:adminId
export async function deleteInstitutionAdmin(req: Request, res: Response) {
  try {
    const { id, adminId } = req.params;
    const inst = await Institution.findById(id);
    if (!inst) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    const adminUser = await User.findById(adminId);
    if (!adminUser || adminUser.role !== 'Admin' || adminUser.institutionId?.toString() !== id) {
      return res.status(404).json({ error: 'Admin not found for this institution' });
    }

    // Remove admin's clerkId from institution adminIds
    inst.adminIds = inst.adminIds.filter(cid => cid !== adminUser.clerkId);
    await inst.save();

    // Delete the admin user
    await User.findByIdAndDelete(adminId);

    // Create audit log
    await AuditLog.create({
      actorId: `admin_super_${Date.now()}`,
      actorModel: 'User',
      actorName: 'Super Admin',
      action: 'DELETE_ADMIN',
      details: { schoolName: inst.name, schoolCode: inst.schoolCode, adminEmail: adminUser.email },
    });

    log(`SuperAdmin deleted admin: ${adminUser.email} from institution: ${inst.name}`);
    return res.json({ message: 'Admin deleted successfully' });
  } catch (err) {
    logError('SuperAdmin deleteInstitutionAdmin failed', err);
    return res.status(500).json({ error: 'Failed to delete institution admin' });
  }
}
