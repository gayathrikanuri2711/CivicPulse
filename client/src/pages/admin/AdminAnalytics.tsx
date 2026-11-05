import React, { useMemo } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { ComplaintStatus } from '../../types';
import {
  BarChart3,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PieChart
} from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { complaints } = useComplaints();

  const stats = useMemo(() => {
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : '0';

    // Average resolution time in hours (for resolved complaints)
    const resolvedComplaints = complaints.filter(c => c.resolvedAt);
    let avgResolutionHours = 0;
    if (resolvedComplaints.length > 0) {
      const totalHours = resolvedComplaints.reduce((sum, c) => {
        const created = new Date(c.createdAt).getTime();
        const resolved = new Date(c.resolvedAt!).getTime();
        return sum + (resolved - created) / (1000 * 60 * 60);
      }, 0);
      avgResolutionHours = Math.round(totalHours / resolvedComplaints.length);
    }

    // SLA breach count
    const slaBreach = complaints.filter(c => {
      if (c.status === 'Resolved' || !c.slaDeadline) return false;
      return new Date(c.slaDeadline).getTime() < Date.now();
    }).length;

    return { total, resolved, resolutionRate, avgResolutionHours, slaBreach };
  }, [complaints]);

  // Category distribution
  const categoryDist = useMemo(() => {
    const map = new Map<string, number>();
    complaints.forEach(c => {
      map.set(c.category, (map.get(c.category) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  // Ward distribution
  const wardDist = useMemo(() => {
    const map = new Map<string, number>();
    complaints.forEach(c => {
      const ward = c.location.ward || 'Unknown';
      map.set(ward, (map.get(ward) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  // Status distribution
  const statusDist = useMemo(() => {
    const map = new Map<ComplaintStatus, number>();
    complaints.forEach(c => {
      map.set(c.status, (map.get(c.status) || 0) + 1);
    });
    return Array.from(map.entries());
  }, [complaints]);

  const statusColors: Record<string, string> = {
    Submitted: 'bg-blue-100 text-blue-700',
    'Under Review': 'bg-purple-100 text-purple-700',
    Assigned: 'bg-amber-100 text-amber-700',
    'In Progress': 'bg-indigo-100 text-indigo-700',
    'Verification Pending': 'bg-teal-100 text-teal-700',
    Resolved: 'bg-emerald-100 text-emerald-700',
    Reopened: 'bg-orange-100 text-orange-700',
    Rejected: 'bg-rose-100 text-rose-700',
  };

  const maxCategoryCount = categoryDist.length > 0 ? categoryDist[0][1] : 1;
  const maxWardCount = wardDist.length > 0 ? wardDist[0][1] : 1;

  const barColors = [
    'bg-teal-500',
    'bg-indigo-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-blue-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-pink-500',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Ward Analytics & Reports</h2>
        <p className="text-xs text-slate-500">Comprehensive analytics across all GVMC wards and departments</p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <BarChart3 size={16} className="text-indigo-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Total Complaints</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp size={16} className="text-emerald-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Resolution Rate</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600">{stats.resolutionRate}%</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock size={16} className="text-blue-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">Avg Resolution</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.avgResolutionHours}h</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center">
              <AlertTriangle size={16} className="text-rose-600" />
            </div>
            <span className="text-[11px] font-medium text-slate-500">SLA Breaches</span>
          </div>
          <div className="text-2xl font-bold text-rose-600">{stats.slaBreach}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PieChart size={16} className="text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">Complaints by Category</h3>
          </div>

          {categoryDist.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No complaint data available</p>
          ) : (
            <div className="space-y-3">
              {categoryDist.map(([category, count], i) => (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[70%]">{category}</span>
                    <span className="font-bold text-slate-900 font-mono">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${barColors[i % barColors.length]}`}
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ward Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Complaints by Ward</h3>
          </div>

          {wardDist.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No ward data available</p>
          ) : (
            <div className="space-y-3">
              {wardDist.map(([ward, count], i) => (
                <div key={ward} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{ward}</span>
                    <span className="font-bold text-slate-900 font-mono">{count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${barColors[(i + 3) % barColors.length]}`}
                      style={{ width: `${(count / maxWardCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Status Distribution</h3>
        </div>

        {statusDist.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No data available</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {statusDist.map(([status, count]) => (
              <div
                key={status}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${statusColors[status] || 'bg-slate-100 text-slate-700'}`}
              >
                <span>{status}</span>
                <span className="bg-white/60 rounded-full px-2 py-0.5 text-[11px] font-bold font-mono">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

