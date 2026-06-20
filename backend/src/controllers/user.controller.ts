import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Assignment } from '../models/assignment.model';

export async function getProfile(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(404).json({ error: 'User not found in session' });
    }
    
    // Count active assignments created by user to update creditsUsed dynamically
    const count = await Assignment.countDocuments({ userId: user.clerkId });
    user.creditsUsed = count;
    await user.save();

    res.json(user);
  } catch (err: any) {
    console.error('Error in getProfile:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(404).json({ error: 'User not found in session' });
    }

    const {
      role,
      schoolName,
      schoolBranch,
      schoolCode,
      aiModel,
      aiStrictNCERT,
      aiIgnoreHandwriting,
      aiStrictSpelling,
      aiPartialFormulas,
      aiLatePenalty,
      aiCustomDirectives,
      aiCreativity,
      firstName,
      lastName
    } = req.body;

    if (role !== undefined) user.role = role;
    if (schoolName !== undefined) user.schoolName = schoolName;
    if (schoolBranch !== undefined) user.schoolBranch = schoolBranch;
    if (schoolCode !== undefined) user.schoolCode = schoolCode;
    if (aiModel !== undefined) user.aiModel = aiModel;
    if (aiStrictNCERT !== undefined) user.aiStrictNCERT = aiStrictNCERT;
    if (aiIgnoreHandwriting !== undefined) user.aiIgnoreHandwriting = aiIgnoreHandwriting;
    if (aiStrictSpelling !== undefined) user.aiStrictSpelling = aiStrictSpelling;
    if (aiPartialFormulas !== undefined) user.aiPartialFormulas = aiPartialFormulas;
    if (aiLatePenalty !== undefined) user.aiLatePenalty = aiLatePenalty;
    if (aiCustomDirectives !== undefined) user.aiCustomDirectives = aiCustomDirectives;
    if (aiCreativity !== undefined) user.aiCreativity = aiCreativity;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    await user.save();

    // Re-count assignments to keep response fresh
    const count = await Assignment.countDocuments({ userId: user.clerkId });
    user.creditsUsed = count;

    res.json(user);
  } catch (err: any) {
    console.error('Error in updateProfile:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

export async function upgradePlan(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(404).json({ error: 'User not found in session' });
    }

    const { plan } = req.body;
    if (!plan) {
      return res.status(400).json({ error: 'Subscription plan tier is required' });
    }

    user.plan = plan;
    if (plan === 'Pro Teacher') {
      user.creditsLimit = 500;
    } else if (plan === 'School Enterprise') {
      user.creditsLimit = 9999;
    } else {
      user.creditsLimit = 10;
    }

    await user.save();

    // Re-count assignments
    const count = await Assignment.countDocuments({ userId: user.clerkId });
    user.creditsUsed = count;

    res.json(user);
  } catch (err: any) {
    console.error('Error in upgradePlan:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
