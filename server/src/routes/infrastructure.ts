// CivicPulse AI - Infrastructure Asset Registry Routes
// GET /, POST /, PATCH /:id, GET /:id

import { Router, Request, Response } from 'express';
import { InfrastructureAsset } from '../types.js';

export const infrastructureRouter = Router();

// ─── In-memory infrastructure asset store ───────────────────────────────────
// Pre-populated with three representative Visakhapatnam (GVMC) assets.
const assets: InfrastructureAsset[] = [
  {
    id: 'INF-VZ-RD-042',
    name: 'MVP Colony Sector 2 Main Arterial Road',
    category: 'roads',
    location: { latitude: 17.7424, longitude: 83.3377, locality: 'MVP Colony', ward: 'Ward 21' },
    ward: 'Ward 21',
    condition: 'Fair',
    installedYear: 2021,
    lastInspectionDate: '2024-08-15',
    complaintHistoryCount: 7,
    notes: 'Heavy monsoon runoff causes asphalt stripping.'
  },
  {
    id: 'INF-VZ-DR-019',
    name: 'Pandurangapuram Beach Outfall Stormwater Culvert',
    category: 'drainage',
    location: { latitude: 17.7126, longitude: 83.3182, locality: 'Beach Road', ward: 'Ward 18' },
    ward: 'Ward 18',
    condition: 'Critical',
    installedYear: 2018,
    lastInspectionDate: '2024-10-02',
    complaintHistoryCount: 12,
    notes: 'Requires automated desilting before monsoon peak.'
  },
  {
    id: 'INF-VZ-EL-105',
    name: 'Madhurawada IT Corridor High-Mast Lighting',
    category: 'streetlights',
    location: { latitude: 17.8184, longitude: 83.3512, locality: 'Madhurawada', ward: 'Ward 5' },
    ward: 'Ward 5',
    condition: 'Fair',
    installedYear: 2022,
    lastInspectionDate: '2024-09-20',
    complaintHistoryCount: 4,
    notes: 'Junction box needs waterproofing.'
  }
];

// ─── GET /api/assets ────────────────────────────────────────────────────────
// Returns all infrastructure assets.
infrastructureRouter.get('/', (_req: Request, res: Response) => {
  res.json(assets);
});

// ─── GET /api/assets/:id ────────────────────────────────────────────────────
// Returns a single asset by id.
infrastructureRouter.get('/:id', (req: Request, res: Response) => {
  const asset = assets.find((a) => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Infrastructure asset not found' });
  }
  res.json(asset);
});

// ─── POST /api/assets ───────────────────────────────────────────────────────
// Creates a new infrastructure asset.
infrastructureRouter.post('/', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newAsset: InfrastructureAsset = {
      id: data.id || `INF-VZ-${Date.now().toString(36).toUpperCase()}`,
      name: data.name || 'Unnamed Asset',
      category: data.category || 'public_facilities',
      location: data.location || { latitude: 0, longitude: 0 },
      ward: data.ward || data.location?.ward || 'Unknown',
      condition: data.condition || 'Fair',
      installedYear: data.installedYear,
      lastInspectionDate: data.lastInspectionDate || new Date().toISOString().slice(0, 10),
      complaintHistoryCount: data.complaintHistoryCount ?? 0,
      notes: data.notes
    };

    assets.push(newAsset);
    res.status(201).json(newAsset);
  } catch (err: unknown) {
    console.error('Error creating infrastructure asset:', err);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// ─── PATCH /api/assets/:id ──────────────────────────────────────────────────
// Updates select fields on an existing asset.
infrastructureRouter.patch('/:id', (req: Request, res: Response) => {
  const asset = assets.find((a) => a.id === req.params.id);
  if (!asset) {
    return res.status(404).json({ error: 'Infrastructure asset not found' });
  }

  const { condition, notes, lastInspectionDate, complaintHistoryCount } = req.body;
  if (condition) asset.condition = condition;
  if (notes !== undefined) asset.notes = notes;
  if (lastInspectionDate) asset.lastInspectionDate = lastInspectionDate;
  if (complaintHistoryCount !== undefined) asset.complaintHistoryCount = complaintHistoryCount;

  res.json(asset);
});
