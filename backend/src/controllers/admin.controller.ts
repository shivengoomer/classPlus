import { Request, Response } from 'express';
import { Institution } from '../models/institution.model';
import { User } from '../models/user.model';
import { Group } from '../models/group.model';
import { StudentCredential } from '../models/studentCredential.model';
import { AuditLog } from '../models/auditLog.model';
import { logError } from '../utils/logger';
import { env } from '../config/env';
import crypto from 'crypto';
import { signAdminToken } from '../utils/jwt';

// Helper to ensure user is bound to a default institution for development ease
async function getOrCreateInstitution(user: any) {
  if (user.institutionId) {
    const inst = await Institution.findById(user.institutionId);
    if (inst) return inst;
  }
  
  // Find or create default
  let inst = await Institution.findOne({ adminIds: user.clerkId });
  if (!inst) {
    const baseName = user.schoolName || 'Delhi Public School ERP Tenant';
    const baseBranch = user.schoolBranch || 'Bokaro Steel City';
    
    let targetBranch = baseBranch;
    const existing = await Institution.findOne({
      name: { $regex: new RegExp(`^${baseName.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      branch: { $regex: new RegExp(`^${baseBranch.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });
    if (existing) {
      targetBranch = `${baseBranch} (${user.email})`;
    }

    inst = await Institution.create({
      name: baseName.trim(),
      branch: targetBranch.trim(),
      schoolCode: user.schoolCode || 'CBSE-3430015',
      adminIds: [user.clerkId],
      creditsLimit: 5000,
      creditsUsed: 0,
      planStatus: 'active',
    });
  }
  user.institutionId = inst._id;
  await user.save();
  return inst;
}

// POST /api/admin/claim
// Claims Admin role using secure setup token
export async function claimAdminRole(req: Request, res: Response) {
  try {
    const { setupToken, email, password, firstName, lastName } = req.body;
    if (!setupToken) {
      return res.status(400).json({ error: 'setupToken is required.' });
    }

    if (setupToken !== env.ADMIN_SETUP_TOKEN) {
      return res.status(401).json({ error: 'Invalid admin setup token.' });
    }

    // Try to find if there is an active session/mock user to elevate
    const mockClerkId = req.headers['x-mock-user-id'] || (req as any).auth?.userId;
    let adminUser: any = null;

    if (mockClerkId) {
      adminUser = await User.findOne({ clerkId: mockClerkId });
    }

    if (adminUser) {
      // Elevate existing user to Admin
      adminUser.role = 'Admin';
      await adminUser.save();
    } else {
      // Fallback to creating a new user
      if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      // Verify user doesn't already exist
      adminUser = await User.findOne({ email: normalizedEmail });
      if (adminUser) {
        return res.status(400).json({ error: 'Account with this email already exists.' });
      }

      // Hash local password
      const salt = normalizedEmail;
      const hashed = crypto.createHash('sha256').update(password + salt).digest('hex');

      // Create Admin User record
      adminUser = await User.create({
        clerkId: `admin_${Date.now()}`,
        email: normalizedEmail,
        firstName: firstName || 'School',
        lastName: lastName || 'Admin',
        role: 'Admin',
        adminPassword: hashed,
        creditsLimit: 5000,
      });
    }

    const inst = await getOrCreateInstitution(adminUser);

    // Create Audit Log
    await AuditLog.create({
      actorId: adminUser.clerkId,
      actorModel: 'User',
      actorName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.email,
      action: 'CLAIM_ADMIN',
      details: { schoolName: inst.name, schoolCode: inst.schoolCode },
    });

    // Sign Admin Token
    const token = signAdminToken({
      adminId: adminUser._id.toString(),
      email: adminUser.email,
      role: 'Admin',
      institutionId: inst._id.toString()
    });

    return res.status(201).json({
      message: 'Successfully claimed Administrator role!',
      token,
      role: adminUser.role,
      institutionId: inst._id,
      user: {
        _id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        institutionId: inst._id
      }
    });
  } catch (err) {
    logError('Admin claimAdminRole failed', err);
    return res.status(500).json({ error: 'Failed to claim admin role.' });
  }
}

// GET /api/admin/stats
export async function getStats(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const inst = await getOrCreateInstitution(user);

    // Fetch teachers in this institution
    const teachersCount = await User.countDocuments({ institutionId: inst._id, role: 'Teacher' });

    // Fetch all classes (groups) created by teachers or admins of this institution
    const groupsCount = await Group.countDocuments({ institutionId: inst._id });

    // Fetch all unique students enrolled in this institution
    const studentsCount = await StudentCredential.countDocuments({ institutionId: inst._id });

    return res.json({
      schoolName: inst.name,
      branch: inst.branch,
      schoolCode: inst.schoolCode,
      board: inst.board,
      planStatus: inst.planStatus,
      creditsLimit: inst.creditsLimit,
      creditsUsed: inst.creditsUsed,
      teachersCount,
      groupsCount,
      studentsCount,
    });
  } catch (err) {
    logError('Admin getStats failed', err);
    return res.status(500).json({ error: 'Failed to retrieve admin statistics.' });
  }
}

// GET /api/admin/teachers
export async function listTeachers(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const inst = await getOrCreateInstitution(user);

    const teachers = await User.find({ institutionId: inst._id, role: 'Teacher' }).sort({ createdAt: -1 });
    return res.json(teachers);
  } catch (err) {
    logError('Admin listTeachers failed', err);
    return res.status(500).json({ error: 'Failed to fetch teachers.' });
  }
}

// POST /api/admin/teachers
// Add a teacher to the institution
export async function addTeacher(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const inst = await getOrCreateInstitution(user);

    const { email, firstName, lastName } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // Check if teacher already exists in system
    let teacher = await User.findOne({ email: email.toLowerCase().trim() });
    if (teacher) {
      teacher.institutionId = inst._id as any;
      teacher.role = 'Teacher';
      await teacher.save();
    } else {
      // Mock account setup (clerkId is mock until they sync on login)
      teacher = await User.create({
        clerkId: `mock_clerk_${Date.now()}`,
        email: email.toLowerCase().trim(),
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'Teacher',
        institutionId: inst._id,
        creditsLimit: 100,
      });
    }

    // Create Audit Log
    await AuditLog.create({
      actorId: user.clerkId,
      actorModel: 'User',
      actorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      action: 'ADD_TEACHER',
      details: { teacherEmail: email, teacherId: teacher._id },
    });

    return res.status(201).json(teacher);
  } catch (err) {
    logError('Admin addTeacher failed', err);
    return res.status(500).json({ error: 'Failed to add teacher.' });
  }
}

// GET /api/admin/groups
export async function listAllGroups(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const inst = await getOrCreateInstitution(user);

    const groups = await Group.find({ institutionId: inst._id }).sort({ createdAt: -1 });
    return res.json(groups);
  } catch (err) {
    logError('Admin listAllGroups failed', err);
    return res.status(500).json({ error: 'Failed to fetch school classes.' });
  }
}

// GET /api/admin/audit-logs
export async function getAuditLogs(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    const inst = await getOrCreateInstitution(user);

    const staff = await User.find({ institutionId: inst._id }).select('clerkId');
    const staffIds = staff.map(s => s.clerkId);

    // Fetch audit logs created by institution staff
    const logs = await AuditLog.find({ actorId: { $in: staffIds } })
      .sort({ createdAt: -1 })
      .limit(100);

    return res.json(logs);
  } catch (err) {
    logError('Admin getAuditLogs failed', err);
    return res.status(500).json({ error: 'Failed to fetch audit logs.' });
  }
}

// POST /api/admin/register-school
export async function registerSchool(req: Request, res: Response) {
  try {
    const { name, branch, board, address, schoolCode, email, password, firstName, lastName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'School Name, Admin Email, and Admin Password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedName = name.trim();
    const normalizedBranch = (branch || 'Main Branch').trim();

    // Check case-insensitive duplicate name + branch combination
    const existingInst = await Institution.findOne({
      name: { $regex: new RegExp(`^${normalizedName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') },
      branch: { $regex: new RegExp(`^${normalizedBranch.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    });
    if (existingInst) {
      return res.status(400).json({ error: `A school with the name "${normalizedName}" and branch "${normalizedBranch}" is already registered.` });
    }

    // Verify user doesn't already exist
    let adminUser = await User.findOne({ email: normalizedEmail });
    if (adminUser) {
      return res.status(400).json({ error: 'Account with this email already exists.' });
    }

    // Hash local password
    const salt = normalizedEmail;
    const hashed = crypto.createHash('sha256').update(password + salt).digest('hex');

    // Create the new institution admin user
    adminUser = await User.create({
      clerkId: `admin_${Date.now()}`,
      email: normalizedEmail,
      firstName: firstName || 'School',
      lastName: lastName || 'Admin',
      role: 'Admin',
      adminPassword: hashed,
      creditsLimit: 5000,
    });

    // Create the new institution
    const inst = await Institution.create({
      name: normalizedName,
      branch: normalizedBranch,
      board: board || 'CBSE',
      address: address || '',
      schoolCode: schoolCode || `CBSE-${Date.now().toString().slice(-6)}`,
      adminIds: [adminUser.clerkId],
      creditsLimit: 5000,
      creditsUsed: 0,
      planStatus: 'active',
    });

    // Assign institution details to the admin
    adminUser.institutionId = inst._id;
    adminUser.schoolName = inst.name;
    adminUser.schoolBranch = inst.branch;
    adminUser.schoolCode = inst.schoolCode;
    await adminUser.save();

    // Create Audit Log
    await AuditLog.create({
      actorId: adminUser.clerkId,
      actorModel: 'User',
      actorName: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || adminUser.email,
      action: 'REGISTER_SCHOOL',
      details: { schoolName: inst.name, schoolCode: inst.schoolCode },
    });

    // Sign Admin Token
    const token = signAdminToken({
      adminId: adminUser._id.toString(),
      email: adminUser.email,
      role: 'Admin',
      institutionId: inst._id.toString()
    });

    return res.status(201).json({
      message: 'Successfully registered school and claimed Administrator role!',
      token,
      role: adminUser.role,
      institutionId: inst._id,
      user: {
        _id: adminUser._id,
        email: adminUser.email,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        role: adminUser.role,
        institutionId: inst._id
      }
    });
  } catch (err) {
    logError('Admin registerSchool failed', err);
    return res.status(500).json({ error: 'Failed to register school.' });
  }
}

// POST /api/admin/login
export async function loginAdmin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail, role: 'Admin' });
    if (!user) {
      return res.status(401).json({ error: 'Invalid admin email or password.' });
    }

    // Verify password
    const salt = normalizedEmail;
    const hashed = crypto.createHash('sha256').update(password + salt).digest('hex');
    if (user.adminPassword !== hashed) {
      return res.status(401).json({ error: 'Invalid admin email or password.' });
    }

    // Sign Admin Token
    const token = signAdminToken({
      adminId: user._id.toString(),
      email: user.email,
      role: 'Admin',
      institutionId: user.institutionId?.toString() || ''
    });

    return res.json({
      message: 'Admin login successful!',
      token,
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        institutionId: user.institutionId
      }
    });
  } catch (err) {
    logError('Admin loginAdmin failed', err);
    return res.status(500).json({ error: 'Failed to authenticate admin.' });
  }
}
