// CivicPulse AI - Contractor Work-Order Routes
// GET /work-orders, PATCH /work-orders/:id/status, POST /work-orders/:id/evidence

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { ComplaintStatus } from '../types.js';
import { inMemoryComplaints } from './complaints.js';
import { verifyResolutionWithGemini } from '../services/geminiService.js';

const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB
export const contractorRouter = Router();

// Status values that indicate an active work-order for a contractor
const ACTIVE_STATUSES: ComplaintStatus[] = ['Assigned', 'In Progress', 'Verification Pending'];

// ─── GET /api/contractor/work-orders ────────────────────────────────────────
// Returns complaints assigned to a specific contractor that are still active.
contractorRouter.get('/work-orders', (req: Request, res: Response) => {
  const { contractorId } = req.query;

  if (!contractorId) {
    return res.status(400).json({ error: 'contractorId query parameter is required' });
  }

  const results = inMemoryComplaints.filter(
    (c) => c.contractorId === contractorId && ACTIVE_STATUSES.includes(c.status)
  );

  res.json(results);
});

// ─── PATCH /api/contractor/work-orders/:id/status ───────────────────────────
// Contractor updates work-order status (e.g. 'In Progress', 'Evidence Submitted')
contractorRouter.patch('/work-orders/:id/status', (req: Request, res: Response) => {
  const complaint = inMemoryComplaints.find((c) => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: 'Work order (complaint) not found' });
  }

  const { status } = req.body as { status?: string };
  const allowed: string[] = ['In Progress', 'Evidence Submitted'];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${allowed.join(', ')}` });
  }

  complaint.status = status as ComplaintStatus;
  complaint.updatedAt = new Date().toISOString();

  res.json(complaint);
});

// ─── POST /api/contractor/work-orders/:id/evidence ──────────────────────────
// Accepts multipart form with completionPhoto + notes. Runs AI verification.
contractorRouter.post(
  '/work-orders/:id/evidence',
  upload.single('completionPhoto'),
  async (req: Request, res: Response) => {
    try {
      const complaint = inMemoryComplaints.find((c) => c.id === req.params.id);
      if (!complaint) {
        return res.status(404).json({ error: 'Work order (complaint) not found' });
      }

      const notes = req.body.notes || '';
      const file = req.file;

      // Store completion evidence
      complaint.completionPhotoUrl = file
        ? `data:${file.mimetype};base64,${file.buffer.toString('base64').slice(0, 40)}...`
        : 'placeholder://completion-photo';
      complaint.completionNotes = notes;

      // Attempt AI verification if we have images
      if (file) {
        // Use complaint's original photo as the "before" if available (fetch as buffer would
        // require network; we pass undefined and let verifyResolutionWithGemini use its fallback).
        const verification = await verifyResolutionWithGemini(
          undefined,      // beforeImageBuffer — original photo is a URL, not available as buffer
          undefined,      // beforeMimeType
          file.buffer,    // afterImageBuffer
          file.mimetype,  // afterMimeType
          notes
        );
        complaint.aiVerification = verification;
      }

      complaint.status = 'Verification Pending';
      complaint.updatedAt = new Date().toISOString();

      res.json(complaint);
    } catch (err: unknown) {
      console.error('Error submitting work-order evidence:', err);
      const message = err instanceof Error ? err.message : 'Evidence submission failed';
      res.status(500).json({ error: message });
    }
  }
);
