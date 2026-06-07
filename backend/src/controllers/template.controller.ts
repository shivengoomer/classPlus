import { Request, Response } from 'express';
import { Template } from '../models/template.model';
import { log, logError } from '../utils/logger';

// GET /api/templates — List all templates (default + custom)
export async function listTemplates(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    // Fetch all default templates, plus custom templates created by this user
    const templates = await Template.find({
      $or: [
        { isDefault: true },
        { createdBy: userId }
      ]
    }).sort({ isDefault: -1, createdAt: -1 });
    
    return res.json(templates);
  } catch (error) {
    logError('Failed to list templates', error);
    return res.status(500).json({ error: 'Failed to fetch templates' });
  }
}

// POST /api/templates — Create a new custom template
export async function createTemplate(req: Request, res: Response) {
  try {
    const { name, description, subject, grade, additionalInstructions, blueprint } = req.body;
    const userId = (req as any).auth?.userId;

    if (!name || !description || !blueprint?.sections) {
      return res.status(400).json({ error: 'Missing required template fields' });
    }

    const template = await Template.create({
      name,
      description,
      isDefault: false,
      createdBy: userId,
      subject: subject || '',
      grade: grade || '',
      additionalInstructions: additionalInstructions || '',
      blueprint: {
        sections: blueprint.sections
      }
    });

    log(`Template created: ${template._id} by user ${userId}`);
    return res.status(201).json(template);
  } catch (error) {
    logError('Failed to create template', error);
    return res.status(500).json({ error: 'Failed to create template' });
  }
}

// DELETE /api/templates/:id — Delete a custom template
export async function deleteTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).auth?.userId;

    const template = await Template.findOne({ _id: id, createdBy: userId, isDefault: false });
    if (!template) {
      return res.status(404).json({ error: 'Custom template not found' });
    }

    await template.deleteOne();
    log(`Template deleted: ${id} by user ${userId}`);
    return res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    logError('Failed to delete template', error);
    return res.status(500).json({ error: 'Failed to delete template' });
  }
}
