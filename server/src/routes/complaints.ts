import { Router, Request, Response } from 'express';
import { Complaint, LocationCoordinates } from '../types.js';

export const complaintsRouter = Router();

// In-memory backing store for instant development / testing (persists during server runtime)
// Exported so admin/contractor routes can read/mutate the same dataset
export const inMemoryComplaints: Complaint[] = [
  {
    id: 'CP-VZ-1001',
    citizenId: 'citizen-praveen',
    citizenName: 'Praveen Varma',
    citizenPhone: '+91 98480 98765',
    title: 'Deep Hazardous Pothole near MVP Sector 2 Circle',
    description: 'Major asphalt depression approx 1.5 ft wide near the vegetable market roundabout. Causes severe bike skidding, especially after evening showers.',
    category: 'Potholes and road damage',
    severity: 4,
    priorityScore: 78,
    status: 'In Progress',
    location: {
      latitude: 17.7424,
      longitude: 83.3377,
      locality: 'MVP Colony Sector 2',
      ward: 'Ward 21',
      address: 'Near Sector 2 Rythu Bazar, MVP Colony, Visakhapatnam'
    },
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80',
    detectedLanguage: 'en',
    safetyRiskAlert: true,
    safetyRiskNotes: 'Risk of two-wheeler tipping during peak market hours.',
    departmentId: 'dept-roads',
    departmentName: 'Roads & Engineering Department',
    contractorId: 'cont-1',
    contractorName: 'Rao Infrastructure Works',
    slaDeadline: new Date(Date.now() + 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 'CP-VZ-1002',
    citizenId: 'citizen-praveen',
    citizenName: 'Praveen Varma',
    citizenPhone: '+91 98480 98765',
    title: 'Garbage Dump Overflow on Siripuram Crossroad',
    description: 'Open municipal bin overflowing for over 3 days. Stray cattle and dogs scattering waste onto the pedestrian walkway.',
    category: 'Garbage accumulation',
    severity: 3,
    priorityScore: 62,
    status: 'Resolved',
    location: {
      latitude: 17.7214,
      longitude: 83.3155,
      locality: 'Siripuram Junction',
      ward: 'Ward 16',
      address: 'Opposite All India Radio Station, Siripuram'
    },
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
    detectedLanguage: 'en',
    departmentId: 'dept-sanitation',
    departmentName: 'Public Health & Sanitation',
    contractorId: 'cont-2',
    contractorName: 'Vizag Cleantech Services',
    slaDeadline: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    completionPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80',
    completionNotes: 'Area cleared with mechanical sweeper and sanitized with bleaching powder.',
    aiVerification: {
      status: 'likely_completed',
      confidence: 0.94,
      explanation: 'Comparison shows waste completely removed, ground sanitized, and pedestrian walkway clear.',
      detectedImprovements: ['Overflowing garbage mound cleared', 'Ground sanitized with lime/bleaching', 'Walkway unobstructed'],
      remainingConcerns: [],
      requiresHumanInspection: false,
      verifiedAt: new Date(Date.now() - 3600000 * 9).toISOString()
    }
  }
];

// Helper: Haversine distance in meters
const calculateDistanceMeters = (loc1: LocationCoordinates, loc2: LocationCoordinates): number => {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (loc1.latitude * Math.PI) / 180;
  const phi2 = (loc2.latitude * Math.PI) / 180;
  const deltaPhi = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const deltaLambda = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// GET /api/complaints
complaintsRouter.get('/', (req: Request, res: Response) => {
  const { citizenId, status, ward, category } = req.query;
  let results = [...inMemoryComplaints];

  if (citizenId) {
    results = results.filter((c) => c.citizenId === citizenId);
  }
  if (status) {
    results = results.filter((c) => c.status === status);
  }
  if (ward) {
    results = results.filter((c) => c.location.ward === ward);
  }
  if (category) {
    results = results.filter((c) => c.category === category);
  }

  res.json(results);
});

// GET /api/complaints/:id
complaintsRouter.get('/:id', (req: Request, res: Response) => {
  const found = inMemoryComplaints.find((c) => c.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Complaint not found' });
  }
  res.json(found);
});

// POST /api/complaints (Create complaint with 50-metre duplicate clustering)
complaintsRouter.post('/', (req: Request, res: Response) => {
  try {
    const data = req.body;
    const newId = `CP-VZ-${1000 + inMemoryComplaints.length + 1}`;
    const now = new Date().toISOString();

    // 50-metre geospatial duplicate detection
    const isDup = inMemoryComplaints.find((c) => {
      if (c.category !== data.category || c.status === 'Resolved' || c.status === 'Rejected') {
        return false;
      }
      const dist = calculateDistanceMeters(c.location, data.location);
      return dist <= 50;
    });

    const complaint: Complaint = {
      ...data,
      id: newId,
      citizenId: data.citizenId || 'citizen-guest',
      citizenName: data.citizenName || 'Vizag Citizen',
      status: data.status || 'Submitted',
      priorityScore: Number(data.priorityScore) || (data.severity ? data.severity * 18 : 50),
      isDuplicate: !!isDup,
      parentIncidentId: isDup ? isDup.id : undefined,
      createdAt: now,
      updatedAt: now,
      slaDeadline: new Date(Date.now() + 3600000 * 48).toISOString()
    };

    // If duplicate found, increase priority of parent incident to reflect multiple citizen reports
    if (isDup) {
      isDup.priorityScore = Math.min(100, isDup.priorityScore + 10);
      isDup.updatedAt = now;
    }

    inMemoryComplaints.unshift(complaint);
    res.status(201).json(complaint);
  } catch (err: unknown) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to create complaint' });
  }
});

// POST /api/complaints/:id/reopen
complaintsRouter.post('/:id/reopen', (req: Request, res: Response) => {
  const found = inMemoryComplaints.find((c) => c.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const { reason } = req.body;
  found.status = 'Reopened';
  found.reopenCount = (found.reopenCount || 0) + 1;
  found.reopenReason = reason || 'Issue reported as not properly rectified.';
  found.reopenAt = new Date().toISOString();
  found.updatedAt = new Date().toISOString();

  res.json(found);
});

// POST /api/complaints/:id/confirm
complaintsRouter.post('/:id/confirm', (req: Request, res: Response) => {
  const found = inMemoryComplaints.find((c) => c.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  found.status = 'Resolved';
  found.resolvedAt = new Date().toISOString();
  found.updatedAt = new Date().toISOString();

  res.json(found);
});

// PATCH /api/complaints/:id/status
complaintsRouter.patch('/:id/status', (req: Request, res: Response) => {
  const found = inMemoryComplaints.find((c) => c.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const { status, departmentId, departmentName, contractorId, contractorName, slaDeadline, completionPhotoUrl, completionNotes, aiVerification } = req.body;
  if (status) found.status = status;
  if (departmentId) found.departmentId = departmentId;
  if (departmentName) found.departmentName = departmentName;
  if (contractorId) found.contractorId = contractorId;
  if (contractorName) found.contractorName = contractorName;
  if (slaDeadline) found.slaDeadline = slaDeadline;
  if (completionPhotoUrl) found.completionPhotoUrl = completionPhotoUrl;
  if (completionNotes) found.completionNotes = completionNotes;
  if (aiVerification) found.aiVerification = aiVerification;

  found.updatedAt = new Date().toISOString();
  res.json(found);
});
