import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  AlertTriangle, 
  PlusCircle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Users, 
  Radio, 
  X, 
  ThumbsUp,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { INITIAL_COMMUNITY_PROPOSALS } from '../../data/mockData';

export const CitizenHome: React.FC = () => {
  const { user } = useAuth();
  const { complaints, currentLocation, activeAlerts, getUserComplaints, supportComplaint } = useComplaints();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [proposals, setProposals] = useState(INITIAL_COMMUNITY_PROPOSALS);

  const userComplaints = getUserComplaints();
  const totalSubmitted = userComplaints.length;
  const resolvedCount = userComplaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = userComplaints.filter(c => ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Verification Pending'].includes(c.status)).length;

  const recentPersonal = userComplaints.slice(0, 3);
  const nearbyReports = complaints.filter(c => c.citizenId !== user?.id).slice(0, 5);

  const handleUpvoteProposal = (id: string) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id === id && !p.userHasVoted) {
          return { ...p, upvotes: p.upvotes + 1, userHasVoted: true };
        }
        return p;
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 sm:pb-12 space-y-6">
      
      {/* 1. Emergency Alert Banner (when active) */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-50 border-l-4 border-rose-500 rounded-xl p-4 shadow-sm flex items-start gap-3">
          <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={22} />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-rose-900">
                {t.emergencyAdvisory}: {activeAlerts[0].title}
              </h4>
              <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-2 py-0.5 rounded-full uppercase">
                {activeAlerts[0].severity}
              </span>
            </div>
            <p className="text-xs text-rose-700 mt-1">
              {activeAlerts[0].description}
            </p>
            <div className="text-[11px] text-rose-600 font-medium mt-1.5 flex items-center gap-1">
              <MapPin size={12} />
              <span>{t.affecting}: {activeAlerts[0].locality}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Welcome & Location Header */}
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-teal-300 bg-teal-900/50 px-2.5 py-1 rounded-full border border-teal-700/50 mb-2">
              <MapPin size={12} />
              <span>{currentLocation.locality || 'MVP Colony, Visakhapatnam'}</span>
              {currentLocation.ward && <span className="font-semibold font-mono">({currentLocation.ward})</span>}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t.namaskaram}, {user?.name || 'Citizen'}!
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {t.homeSubtitle}
            </p>
          </div>

          {/* Prominent Report Issue Button */}
          <Link
            to="/report"
            className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold px-5 py-3.5 rounded-xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all text-sm shrink-0"
          >
            <PlusCircle size={18} />
            <span>{t.reportAnIssue}</span>
          </Link>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 3. Personal Complaint Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.totalSubmitted}</span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalSubmitted}</div>
          <span className="text-[10px] text-slate-400">{t.allSubmissions}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.inProgressPending}</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[10px] text-slate-400">{t.activeResolution}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>{t.resolved}</span>
            <CheckCircle size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolvedCount}</div>
          <span className="text-[10px] text-slate-400">{t.verifiedRepairs}</span>
        </div>
      </div>

      {/* 4. Secondary Action Entries: Nearby Civic Reports & Community Participation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setShowNearbyModal(true)}
          className="bg-white border border-slate-200 hover:border-teal-300 hover:bg-slate-50 rounded-xl p-4 text-left transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Radio size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">{t.nearbyCivicReports}</h4>
              <p className="text-xs text-slate-500">{t.nearbySubtitle} {currentLocation.locality || 'your area'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
        </button>

        <button
          type="button"
          onClick={() => setShowCommunityModal(true)}
          className="bg-white border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 rounded-xl p-4 text-left transition-all shadow-sm flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">{t.communityWardPolls}</h4>
              <p className="text-xs text-slate-500">{t.communityPollsSubtitle} {currentLocation.ward || 'Ward 21'}</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* 5. Recent Personal Complaints Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">{t.myRecentComplaints}</h3>
            <p className="text-xs text-slate-500">{t.trackStatus}</p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <span>{t.viewAll} ({userComplaints.length})</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {recentPersonal.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
              <PlusCircle size={22} />
            </div>
            <p className="text-sm font-semibold text-slate-800">{t.noComplaintsYet}</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-3">
              {t.noComplaintsDesc}
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 px-4 py-2 rounded-lg transition-colors"
            >
              {t.reportAnIssue}
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentPersonal.map((complaint) => (
              <div
                key={complaint.id}
                onClick={() => navigate('/complaints')}
                className="py-3.5 first:pt-1 last:pb-1 flex items-start justify-between gap-3 hover:bg-slate-50/80 rounded-lg p-2 transition-colors cursor-pointer"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono text-slate-400 font-semibold">{complaint.id}</span>
                    <StatusBadge status={complaint.status} size="sm" />
                    {complaint.safetyRiskAlert && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                        <AlertTriangle size={10} />
                        {t.safetyRiskLabel}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 truncate">
                    {complaint.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="truncate">{complaint.category}</span>
                    <span>•</span>
                    <span className="truncate">{complaint.location.locality || complaint.location.ward}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: Nearby Civic Reports */}
      {showNearbyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Radio size={16} className="text-teal-400" />
                  {t.nearbyReportsTitle}
                </h3>
                <p className="text-xs text-slate-400">{t.nearbyReportsSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowNearbyModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {nearbyReports.map((report) => (
                <div key={report.id} className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500 font-semibold">{report.id}</span>
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Priority: {report.priorityScore}/100
                    </span>
                  </div>

                  <h5 className="font-semibold text-sm text-slate-900">{report.title}</h5>
                  <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-teal-600" />
                      {report.location.locality} ({report.location.ward})
                    </span>
                    <button
                      type="button"
                      onClick={() => supportComplaint(report.id)}
                      className="inline-flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors text-xs"
                    >
                      <ThumbsUp size={12} />
                      {t.supportPriority}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setShowNearbyModal(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Community Participation Polls */}
      {showCommunityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Users size={16} className="text-indigo-400" />
                  {t.wardProposals} ({currentLocation.ward || 'Ward 21'})
                </h3>
                <p className="text-xs text-slate-400">{t.wardProposalsSubtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCommunityModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {proposals.map((prop) => (
                <div key={prop.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                      {prop.category}
                    </span>
                    <span className="text-xs font-medium text-slate-500 capitalize">
                      Status: {prop.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-slate-900">{prop.title}</h4>
                  <p className="text-xs text-slate-600">{prop.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>{t.proposedBy} {prop.proposedBy}</span>
                    <button
                      type="button"
                      disabled={prop.userHasVoted}
                      onClick={() => handleUpvoteProposal(prop.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        prop.userHasVoted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                      }`}
                    >
                      <ThumbsUp size={13} />
                      {prop.userHasVoted ? `${t.voted} (${prop.upvotes})` : `${t.upvote} (${prop.upvotes})`}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-100 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setShowCommunityModal(false)}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

