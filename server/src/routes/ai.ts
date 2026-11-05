import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeComplaintContent, verifyResolutionWithGemini } from '../services/geminiService.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export const aiRouter = Router();

// POST /api/ai/analyse-complaint
aiRouter.post(
  '/analyse-complaint',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const photoFile = files?.['photo']?.[0];
      const audioFile = files?.['audio']?.[0];
      const textDescription = req.body.text || '';

      const result = await analyzeComplaintContent(
        textDescription,
        photoFile?.buffer,
        photoFile?.mimetype,
        audioFile?.buffer
      );

      res.json(result);
    } catch (err: unknown) {
      console.error('Error analyzing complaint:', err);
      const message = err instanceof Error ? err.message : 'Analysis failed';
      res.status(500).json({ error: message });
    }
  }
);

// POST /api/ai/verify-resolution
aiRouter.post(
  '/verify-resolution',
  upload.fields([
    { name: 'beforePhoto', maxCount: 1 },
    { name: 'completionPhoto', maxCount: 1 }
  ]),
  async (req: Request, res: Response) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const beforeFile = files?.['beforePhoto']?.[0];
      const afterFile = files?.['completionPhoto']?.[0];
      const notes = req.body.notes || '';

      const verification = await verifyResolutionWithGemini(
        beforeFile?.buffer,
        beforeFile?.mimetype,
        afterFile?.buffer,
        afterFile?.mimetype,
        notes
      );

      res.json(verification);
    } catch (err: unknown) {
      console.error('Error verifying resolution:', err);
      const message = err instanceof Error ? err.message : 'Verification failed';
      res.status(500).json({ error: message });
    }
  }
);

