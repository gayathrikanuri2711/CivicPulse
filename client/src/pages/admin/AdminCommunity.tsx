import React, { useState, useMemo } from 'react';
import { CommunityProposal } from '../../types';
import { INITIAL_COMMUNITY_PROPOSALS } from '../../data/mockData';
import {
  Users,
  ThumbsUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Tag,
  MapPin,
  User
} from 'lucide-react';

const statusLabels: Record<CommunityProposal['status'], string> = {
  open: 'Open',
  under_review: 'Under Review',
  budget_approved: 'Budget Approved',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const statusColors: Record<CommunityProposal['status'], string> = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  under_review: 'bg-purple-50 text-purple-700 border-purple-200',
  budget_approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-teal-50 text-teal-700 border-teal-200',
};

export const AdminCommunity: React.FC = () => {
  const [proposals, setProposals] = useState<CommunityProposal[]>(INITIAL_COMMUNITY_PROPOSALS);

  const stats = useMemo(() => {
    const total = proposals.length;
    const totalUpvotes = proposals.reduce((sum, p) => sum + p.upvotes, 0);
    const byStatus = new Map<CommunityProposal['status'], number>();
    proposals.forEach(p => {
      byStatus.set(p.status, (byStatus.get(p.status) || 0) + 1);
    });
    return { total, totalUpvotes, byStatus };
  }, [proposals]);

  const handleApprove = (id: string) => {
    setProposals(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'budget_approved' as CommunityProposal['status'] } : p
      )
    );
  };

  const handleMarkInProgress = (id: string) => {
    setProposals(prev =>
      prev.map(p =>
        p.id === id ? { ...p, status: 'in_progress' as CommunityProposal['status'] } : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Users size={20} className="text-teal-600" />
          Community Participation & Ward Proposals
        </h2>
        <p className="text-xs text-slate-500">Manage citizen-proposed civic improvements and ward-level development initiatives</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-indigo-500" />
            <span className="text-[11px] font-medium text-slate-500">Total Proposals</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <ThumbsUp size={14} className="text-teal-500" />
            <span className="text-[11px] font-medium text-slate-500">Total Upvotes</span>
          </div>
          <div className="text-2xl font-bold text-teal-600">{stats.totalUpvotes}</div>
        </div>

        {Array.from(stats.byStatus.entries()).slice(0, 2).map(([status, count]) => (
          <div key={status} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              {status === 'open' || status === 'under_review' ? (
                <Clock size={14} className="text-purple-500" />
              ) : (
                <CheckCircle2 size={14} className="text-emerald-500" />
              )}
              <span className="text-[11px] font-medium text-slate-500">{statusLabels[status]}</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{count}</div>
          </div>
        ))}
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-bold text-sm text-slate-900 flex-1 leading-tight">{proposal.title}</h4>
              <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusColors[proposal.status]}`}>
                {statusLabels[proposal.status]}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{proposal.description}</p>

            <div className="flex items-center gap-3 flex-wrap text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {proposal.ward}
              </span>
              <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 font-medium">
                <Tag size={10} />
                {proposal.category}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-teal-700">
                <ThumbsUp size={12} />
                {proposal.upvotes} upvotes
              </span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-400">
              <User size={12} />
              Proposed by: <span className="font-medium text-slate-600">{proposal.proposedBy}</span>
            </div>

            {/* Admin Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              {proposal.status !== 'budget_approved' && proposal.status !== 'in_progress' && proposal.status !== 'completed' && (
                <button
                  type="button"
                  onClick={() => handleApprove(proposal.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                >
                  <CheckCircle2 size={12} />
                  Approve
                </button>
              )}
              {(proposal.status === 'budget_approved' || proposal.status === 'open' || proposal.status === 'under_review') && (
                <button
                  type="button"
                  onClick={() => handleMarkInProgress(proposal.id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
                >
                  <ArrowUpRight size={12} />
                  Mark In Progress
                </button>
              )}
              {proposal.status === 'completed' && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Completed
                </span>
              )}
              {proposal.status === 'in_progress' && (
                <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                  <ArrowUpRight size={12} />
                  Work In Progress
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {proposals.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No community proposals found.
        </div>
      )}
    </div>
  );
};

