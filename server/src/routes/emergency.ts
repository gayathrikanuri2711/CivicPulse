// CivicPulse AI - Emergency Alert Routes
// GET /alerts, POST /alerts, POST /sync

import { Router, Request, Response } from 'express';
import { EmergencyAlert } from '../types.js';

export const emergencyRouter = Router();

// ─── In-memory emergency alert store ────────────────────────────────────────
// Pre-populated with 1 demo monsoon alert for Visakhapatnam.
const alerts: EmergencyAlert[] = [
  {
    id: 'EMRG-VZ-001',
    title: 'Severe Waterlogging at Pandurangapuram Low-Lying Belt',
    type: 'flash_flood',
    severity: 'critical',
    locality: 'Beach Road',
    location: {
      latitude: 17.7126,
      longitude: 83.3182,
      locality: 'Pandurangapuram',
      ward: 'Ward 18'
    },
    description:
      'Knee-deep waterlogging reported across Pandurangapuram slum quarters and Beach Road underpass following 120mm rainfall in 3 hours. Stormwater culvert INF-VZ-DR-019 is overwhelmed. Residents advised to move to elevated areas. NDRF team alerted.',
    status: 'active',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    syncStatus: 'synced'
  }
];

// ─── GET /api/emergency/alerts ──────────────────────────────────────────────
// Optionally filter by ?status=active|resolved
emergencyRouter.get('/alerts', (req: Request, res: Response) => {
  const { status } = req.query;
  if (status && (status === 'active' || status === 'resolved')) {
    return res.json(alerts.filter((a) => a.status === status));
  }
  res.json(alerts);
});

// ─── POST /api/emergency/alerts ─────────────────────────────────────────────
// Create a new emergency alert.
emergencyRouter.post('/alerts', (req: Request, res: Response) => {
  try {
    const data = req.body;

    const newAlert: EmergencyAlert = {
      id: data.id || `EMRG-VZ-${Date.now().toString(36).toUpperCase()}`,
      title: data.title || 'Untitled Emergency Alert',
      type: data.type || 'flash_flood',
      severity: data.severity || 'high',
      locality: data.locality || 'Visakhapatnam',
      location: data.location || { latitude: 17.72, longitude: 83.30 },
      description: data.description || '',
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
      syncStatus: 'synced'
    };

    alerts.push(newAlert);
    res.status(201).json(newAlert);
  } catch (err: unknown) {
    console.error('Error creating emergency alert:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// ─── POST /api/emergency/sync ───────────────────────────────────────────────
// Accept an array of offline-queued alerts, deduplicate by clientId, and return
// the created alerts with syncStatus='synced'.
emergencyRouter.post('/sync', (req: Request, res: Response) => {
  try {
    const incoming: Array<EmergencyAlert & { clientId?: string }> = req.body;

    if (!Array.isArray(incoming)) {
      return res.status(400).json({ error: 'Request body must be an array of alerts' });
    }

    const created: EmergencyAlert[] = [];

    for (const item of incoming) {
      // Deduplicate by clientId — check if an alert with that clientId already exists
      if (item.clientId) {
        const existingDup = alerts.find(
          (a) => (a as EmergencyAlert & { clientId?: string }).clientId === item.clientId
        );
        if (existingDup) {
          created.push(existingDup);
          continue;
        }
      }

      const newAlert: EmergencyAlert & { clientId?: string } = {
        id: item.id || `EMRG-VZ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6)}`,
        title: item.title || 'Offline-Queued Alert',
        type: item.type || 'flash_flood',
        severity: item.severity || 'high',
        locality: item.locality || 'Visakhapatnam',
        location: item.location || { latitude: 17.72, longitude: 83.30 },
        description: item.description || '',
        status: item.status || 'active',
        createdAt: item.createdAt || new Date().toISOString(),
        syncStatus: 'synced',
        clientId: item.clientId
      };

      alerts.push(newAlert);
      created.push(newAlert);
    }

    res.json({ synced: created.length, alerts: created });
  } catch (err: unknown) {
    console.error('Error syncing emergency alerts:', err);
    res.status(500).json({ error: 'Failed to sync alerts' });
  }
});
