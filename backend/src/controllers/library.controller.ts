// src/controllers/library.controller.ts
// handles all library-related request logic

import { Request, Response } from 'express';
import fs from 'fs';
import { LibraryItem } from '../models/library.model';
import { UTApi, UTFile } from 'uploadthing/server';
import { env } from '../config/env';
import { log, logError } from '../utils/logger';

// GET /api/library — list all items
export async function listItems(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const items = await LibraryItem.find({ userId }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (error) {
    logError('Failed to list library items', error);
    return res.status(500).json({ error: 'Failed to fetch library items' });
  }
}

// POST /api/library — upload a new reference material file (PDF/DOC)
export async function uploadItem(req: Request, res: Response) {
  try {
    const { category } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, path: filePath, size } = req.file;

    // determine type ('pdf' | 'doc') based on extension
    const ext = originalname.split('.').pop()?.toLowerCase();
    const type = ext === 'pdf' ? 'pdf' : 'doc';

    // format size
    let formattedSize = '0 KB';
    if (size >= 1024 * 1024) {
      formattedSize = `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      formattedSize = `${(size / 1024).toFixed(0)} KB`;
    }

    let url: string | undefined;

    // Upload to UploadThing if token is provided
    if (env.UPLOADTHING_TOKEN) {
      try {
        log(`Uploading library file ${originalname} to UploadThing...`);
        const fileBuffer = fs.readFileSync(filePath);
        const file = new UTFile([fileBuffer], originalname, { type: req.file.mimetype } as any);
        const utapi = new UTApi({ token: env.UPLOADTHING_TOKEN });
        const uploadRes = await utapi.uploadFiles([file]);
        const resData = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;

        if (resData && resData.data && resData.data.url) {
          url = resData.data.url;
        } else if (resData && (resData as any).url) {
          url = (resData as any).url;
        } else if (resData && resData.error) {
          logError('UploadThing library upload returned error', resData.error);
        }
      } catch (err) {
        logError('Failed to upload library file to UploadThing', err);
      } finally {
        // clean up local file
        try {
          fs.unlinkSync(filePath);
        } catch {}
      }
    } else {
      log('No UPLOADTHING_TOKEN found, saving library item with local filepath reference.');
      url = `/uploads/${req.file.filename}`;
    }

    const userId = (req as any).auth?.userId;
    const item = await LibraryItem.create({
      name: originalname,
      type,
      size: formattedSize,
      category: category || 'Reference Materials',
      url,
      userId,
    });

    log(`Library item uploaded and saved: ${item._id} for user ${userId}`);
    return res.status(201).json(item);
  } catch (error) {
    logError('Failed to upload library item', error);
    return res.status(500).json({ error: 'Failed to upload library item' });
  }
}

// POST /api/library/folder — create a new folder
export async function createFolder(req: Request, res: Response) {
  try {
    const { name, category } = req.body;
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const userId = (req as any).auth?.userId;
    const item = await LibraryItem.create({
      name,
      type: 'folder',
      category,
      userId,
    });

    log(`Library folder created: ${item._id} for user ${userId}`);
    return res.status(201).json(item);
  } catch (error) {
    logError('Failed to create library folder', error);
    return res.status(500).json({ error: 'Failed to create library folder' });
  }
}

// DELETE /api/library/:id — delete a library item
export async function deleteItem(req: Request, res: Response) {
  try {
    const userId = (req as any).auth?.userId;
    const item = await LibraryItem.findOneAndDelete({ _id: req.params.id, userId });
    if (!item) {
      return res.status(404).json({ error: 'Library item not found' });
    }
    log(`Library item deleted: ${req.params.id} for user ${userId}`);
    return res.json({ message: 'Deleted successfully' });
  } catch (error) {
    logError('Failed to delete library item', error);
    return res.status(500).json({ error: 'Failed to delete library item' });
  }
}
