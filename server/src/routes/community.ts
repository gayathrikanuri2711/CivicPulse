// CivicPulse AI - Community Participation Routes
// GET /proposals, POST /proposals, POST /proposals/:id/vote

import { Router, Request, Response } from 'express';
import { CommunityProposal } from '../types.js';

export const communityRouter = Router();

// Track which users have voted on each proposal (proposalId → Set of userIds)
const votedUsers = new Map<string, Set<string>>();

// ─── In-memory proposal store ───────────────────────────────────────────────
// Pre-populated with 2 demo proposals from Visakhapatnam.
const proposals: CommunityProposal[] = [
  {
    id: 'PROP-VZ-001',
    title: 'Install Solar-Powered Pedestrian Lights on Beach Road',
    description:
      'Beach Road from Kailasagiri ropeway junction to VMRDA Park is poorly lit after 8 PM. Installing solar-powered bollard lights along the pedestrian promenade will improve safety for evening walkers and joggers, and reduce GVMC electricity expenditure.',
    ward: 'Ward 18',
    locality: 'Beach Road (RK Beach)',
    category: 'Street Lighting',
    upvotes: 47,
    status: 'open',
    proposedBy: 'citizen-praveen',
    createdAt: new Date(Date.now() - 3600000 * 120).toISOString()
  },
  {
    id: 'PROP-VZ-002',
    title: 'Weekly Wet-Waste Composting at Madhurawada Community Garden',
    description:
      'Set up a community composting station at the existing Madhurawada GVMC park where residents from Wards 5-7 can deposit segregated wet waste every Saturday. This will reduce landfill load on Kapuluppada and produce free organic compost for local gardens.',
    ward: 'Ward 5',
    locality: 'Madhurawada',
    category: 'Waste Management',
    upvotes: 23,
    status: 'under_review',
    proposedBy: 'citizen-lakshmi',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

// Initialise voted-user sets for demo proposals
votedUsers.set('PROP-VZ-001', new Set());
votedUsers.set('PROP-VZ-002', new Set());

// ─── GET /api/community/proposals ───────────────────────────────────────────
communityRouter.get('/proposals', (_req: Request, res: Response) => {
  res.json(proposals);
});

// ─── POST /api/community/proposals ──────────────────────────────────────────
communityRouter.post('/proposals', (req: Request, res: Response) => {
  try {
    const { title, description, ward, locality, category, proposedBy } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    const newProposal: CommunityProposal = {
      id: `PROP-VZ-${Date.now().toString(36).toUpperCase()}`,
      title,
      description,
      ward: ward || 'Citywide',
      locality: locality || 'Visakhapatnam',
      category: category || 'General',
      upvotes: 0,
      status: 'open',
      proposedBy: proposedBy || 'citizen-anonymous',
      createdAt: new Date().toISOString()
    };

    proposals.push(newProposal);
    votedUsers.set(newProposal.id, new Set());
    res.status(201).json(newProposal);
  } catch (err: unknown) {
    console.error('Error creating proposal:', err);
    res.status(500).json({ error: 'Failed to create proposal' });
  }
});

// ─── POST /api/community/proposals/:id/vote ─────────────────────────────────
communityRouter.post('/proposals/:id/vote', (req: Request, res: Response) => {
  const proposal = proposals.find((p) => p.id === req.params.id);
  if (!proposal) {
    return res.status(404).json({ error: 'Proposal not found' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  // Ensure a Set exists for this proposal
  if (!votedUsers.has(proposal.id)) {
    votedUsers.set(proposal.id, new Set());
  }

  const voters = votedUsers.get(proposal.id)!;
  if (voters.has(userId)) {
    return res.status(409).json({ error: 'User has already voted on this proposal' });
  }

  voters.add(userId);
  proposal.upvotes++;

  res.json(proposal);
});
