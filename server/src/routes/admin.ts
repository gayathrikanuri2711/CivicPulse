// CivicPulse AI - Admin Dashboard Routes
// GET /overview, GET /analytics, POST /assign

import { Router, Request, Response } from 'express';
import { Complaint, ComplaintStatus } from '../types.js';
import { inMemoryComplaints } from './complaints.js';

export const adminRouter = Router();

// ─── GET /api/admin/overview ────────────────────────────────────────────────
// Returns summary statistics computed from the live in-memory complaints store.
adminRouter.get('/overview', (_req: Request, res: Response) => {
  const complaints = inMemoryComplaints;
  const now = Date.now();

  const total = complaints.length;
  const open = complaints.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const critical = complaints.filter((c) => c.severity >= 4).length;

  // SLA breaches: complaints with a deadline in the past that are NOT resolved/rejected
  const slaBreaches = complaints.filter((c) => {
    if (!c.slaDeadline) return false;
    if (c.status === 'Resolved' || c.status === 'Rejected') return false;
    return new Date(c.slaDeadline).getTime() < now;
  }).length;

  // Average resolution hours (only for resolved complaints)
  const resolvedComplaints = complaints.filter((c) => c.resolvedAt && c.createdAt);
  const avgResolutionHours =
    resolvedComplaints.length > 0
      ? Math.round(
          resolvedComplaints.reduce((sum, c) => {
            const created = new Date(c.createdAt).getTime();
            const resolved = new Date(c.resolvedAt!).getTime();
            return sum + (resolved - created) / (1000 * 60 * 60);
          }, 0) / resolvedComplaints.length
        )
      : 0;

  // Per-department stats
  const deptMap = new Map<string, { departmentName: string; total: number; open: number; resolved: number }>();
  for (const c of complaints) {
    const deptId = c.departmentId || 'unassigned';
    const deptName = c.departmentName || 'Unassigned';
    if (!deptMap.has(deptId)) {
      deptMap.set(deptId, { departmentName: deptName, total: 0, open: 0, resolved: 0 });
    }
    const d = deptMap.get(deptId)!;
    d.total++;
    if (c.status === 'Resolved') d.resolved++;
    else d.open++;
  }
  const departmentStats = Array.from(deptMap.entries()).map(([id, stats]) => ({ departmentId: id, ...stats }));

  res.json({
    total,
    open,
    inProgress,
    resolved,
    slaBreaches,
    critical,
    avgResolutionHours,
    departmentStats
  });
});

// ─── GET /api/admin/analytics ───────────────────────────────────────────────
// Category distribution, ward distribution, daily trend (last 7 days).
adminRouter.get('/analytics', (_req: Request, res: Response) => {
  const complaints = inMemoryComplaints;

  // Category distribution
  const categoryMap = new Map<string, number>();
  for (const c of complaints) {
    categoryMap.set(c.category, (categoryMap.get(c.category) || 0) + 1);
  }
  const categoryDistribution = Array.from(categoryMap.entries()).map(([category, count]) => ({ category, count }));

  // Ward distribution
  const wardMap = new Map<string, number>();
  for (const c of complaints) {
    const ward = c.location.ward || 'Unknown';
    wardMap.set(ward, (wardMap.get(ward) || 0) + 1);
  }
  const wardDistribution = Array.from(wardMap.entries()).map(([ward, count]) => ({ ward, count }));

  // Daily complaint counts for last 7 days
  const dailyCounts: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - i);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const count = complaints.filter((c) => {
      const ct = new Date(c.createdAt).getTime();
      return ct >= dayStart.getTime() && ct < dayEnd.getTime();
    }).length;

    dailyCounts.push({ date: dayStart.toISOString().slice(0, 10), count });
  }

  res.json({ categoryDistribution, wardDistribution, dailyCounts });
});

// ─── POST /api/admin/assign ─────────────────────────────────────────────────
// Assign a complaint to a department / contractor with an SLA.
adminRouter.post('/assign', (req: Request, res: Response) => {
  const { complaintId, departmentId, departmentName, contractorId, contractorName, slaHours } = req.body;

  if (!complaintId) {
    return res.status(400).json({ error: 'complaintId is required' });
  }

  const complaint = inMemoryComplaints.find((c) => c.id === complaintId);
  if (!complaint) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  complaint.status = 'Assigned' as ComplaintStatus;
  if (departmentId) complaint.departmentId = departmentId;
  if (departmentName) complaint.departmentName = departmentName;
  if (contractorId) complaint.contractorId = contractorId;
  if (contractorName) complaint.contractorName = contractorName;
  if (slaHours) {
    complaint.slaDeadline = new Date(Date.now() + Number(slaHours) * 3600000).toISOString();
  }
  complaint.updatedAt = new Date().toISOString();

  res.json(complaint);
});
