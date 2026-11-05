import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../../components/StatusBadge';
import { Complaint, ComplaintStatus } from '../../types';
import { 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Briefcase, 
  X, 
  ExternalLink,
  ShieldCheck,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ALL_STATUS_FILTERS: (ComplaintStatus | 'All')[] = [
  'All',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Verification Pending',
  'Resolved',
  'Reopened',
  'Rejected'
];

export const MyComplaints: React.FC = () => {
  const { getUserComplaints, reopenComplaint, confirmResolution } = useComplaints();
  const { t } = useLanguage();
  const userComplaints = getUserComplaints();

  const [activeFilter, setActiveFilter] = useState<ComplaintStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Reopen modal states
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmittingReopen, setIsSubmittingReopen] = useState(false);

  // Confirmation feedback modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rating, setRating] = useState(5);

  // Filter complaints
  const filteredComplaints = userComplaints.filter((c) => {
    const matchesFilter = activeFilter === 'All' || c.status === activeFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location.locality && c.location.locality.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOpenReopenModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setReopenReason('');
    setShowReopenModal(true);
  };

  const handleConfirmReopen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !reopenReason.trim()) return;

    setIsSubmittingReopen(true);
    await reopenComplaint(selectedComplaint.id, reopenReason);
    setIsSubmittingReopen(false);
    setShowReopenModal(false);
    // Refresh modal detail
    setSelectedComplaint((prev) => (prev ? { ...prev, status: 'Reopened', reopenReason } : null));
  };

  const handleOpenConfirmModal = (c: Complaint) => {
    setSelectedComplaint(c);
    setRating(5);
    setShowConfirmModal(true);
  };

  const handleConfirmResolutionAction = async () => {
    if (!selectedComplaint) return;
    await confirmResolution(selectedComplaint.id, rating);
    setShowConfirmModal(false);
    setSelectedComplaint((prev) => (prev ? { ...prev, status: 'Resolved' } : null));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-28 sm:pb-14 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.myCivicComplaints}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.complaintsPageSubtitle}
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors shrink-0"
        >
          <span>{t.reportNewIssueBtn}</span>
        </Link>
      </div>

      {/* Search and Status Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full text-sm border border-slate-300 rounded-xl pl-9 pr-4 py-2.5 bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-sm placeholder:text-slate-400"
          />
        </div>

        {/* Filter Pills scrollable */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {ALL_STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setActiveFilter(s)}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeFilter === s
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-6">
          <Clock size={36} className="text-slate-300 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-800 text-sm">{t.noComplaintsFound}</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {activeFilter !== 'All'
              ? `${t.noComplaintsStatus} "${activeFilter}".`
              : t.noComplaints}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              onClick={() => setSelectedComplaint(complaint)}
              className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-4 shadow-sm transition-all hover:shadow cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {complaint.id}
                  </span>
                  <StatusBadge status={complaint.status} size="sm" />
                  {complaint.safetyRiskAlert && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                      <AlertTriangle size={10} />
                      {t.safetyRiskLabel}
                    </span>
                  )}
                  {complaint.reopenCount ? (
                    <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                      {t.reopened} ({complaint.reopenCount}x)
                    </span>
                  ) : null}
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-teal-700 transition-colors line-clamp-1">
                  {complaint.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-teal-600" />
                    {complaint.location.locality || complaint.location.ward}
                  </span>
                  <span>•</span>
                  <span>{complaint.category}</span>
                  <span>•</span>
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>

              {/* Right side preview / actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {complaint.photoUrl && (
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img
                      src={complaint.photoUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs font-semibold text-teal-600 group-hover:text-teal-700">
                  <span>{t.viewTimeline}</span>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPLAINT TIMELINE & DETAIL MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-300">{selectedComplaint.id}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs text-slate-300">{selectedComplaint.category}</span>
                </div>
                <h3 className="font-bold text-base mt-0.5 text-white">{selectedComplaint.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800">
              
              {/* Status and SLA bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">{t.currentStatus}:</span>
                  <StatusBadge status={selectedComplaint.status} size="md" />
                </div>
                {selectedComplaint.slaDeadline && (
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 font-mono">
                    <Clock size={13} className="text-teal-600" />
                    <span>{t.slaTarget}: {new Date(selectedComplaint.slaDeadline).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
              </div>

              {/* Location details */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.location}</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-start gap-2">
                  <MapPin size={14} className="text-teal-600 shrink-0 mt-0.5" />
                  <span>{selectedComplaint.location.address || `${selectedComplaint.location.locality}, ${selectedComplaint.location.ward}`} (GPS: {selectedComplaint.location.latitude.toFixed(4)}, {selectedComplaint.location.longitude.toFixed(4)})</span>
                </p>
              </div>

              {/* Description & Telugu Audio info */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.citizenReportDesc}</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {selectedComplaint.description}
                </p>
                {selectedComplaint.translatedText && (
                  <div className="text-[11px] text-teal-800 bg-teal-50 p-2 rounded-lg border border-teal-200 mt-1">
                    <span className="font-semibold block">Gemini AI Telugu Translation:</span>
                    {selectedComplaint.translatedText}
                  </div>
                )}
              </div>

              {/* Assigned Department & Contractor info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building2 size={14} className="text-indigo-600" />
                    <span>{t.department}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {selectedComplaint.departmentName || t.underReviewGvmc}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Briefcase size={14} className="text-amber-600" />
                    <span>{t.assignedContractor}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    {selectedComplaint.contractorName || t.pendingWorkOrder}
                  </p>
                </div>
              </div>

              {/* Resolution Evidence & Gemini AI Auditor (if available) */}
              {selectedComplaint.completionPhotoUrl && (
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      {t.resolutionEvidence}
                    </h4>
                    {selectedComplaint.aiVerification && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-mono">
                        {(selectedComplaint.aiVerification.confidence * 100).toFixed(0)}% {t.confidence}
                      </span>
                    )}
                  </div>

                  {/* Before vs After Photo comparison */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 mb-1">{t.beforeRepair}</span>
                      <div className="h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                        {selectedComplaint.photoUrl ? (
                          <img src={selectedComplaint.photoUrl} alt="Before" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-[10px] text-slate-400">{t.noPhoto}</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-semibold text-slate-500 mb-1">{t.afterRepair}</span>
                      <div className="h-28 rounded-lg overflow-hidden border border-emerald-300 bg-slate-100">
                        <img src={selectedComplaint.completionPhotoUrl} alt="After" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>

                  {selectedComplaint.completionNotes && (
                    <div className="text-xs text-slate-600">
                      <span className="font-semibold">{t.contractorNotes}: </span>
                      {selectedComplaint.completionNotes}
                    </div>
                  )}

                  {selectedComplaint.aiVerification && (
                    <div className="bg-white p-3 rounded-lg border border-emerald-200 text-xs space-y-1.5">
                      <div className="font-semibold text-slate-800 flex items-center justify-between">
                        <span>{t.aiAuditAssessment}:</span>
                        <span className="capitalize text-emerald-700 font-bold">
                          {selectedComplaint.aiVerification.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {selectedComplaint.aiVerification.explanation}
                      </p>
                      {selectedComplaint.aiVerification.detectedImprovements.length > 0 && (
                        <ul className="list-disc pl-4 text-[10px] text-emerald-800 space-y-0.5">
                          {selectedComplaint.aiVerification.detectedImprovements.map((imp, idx) => (
                            <li key={idx}>{imp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ACTION BUTTONS: Confirm or Reopen */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                {selectedComplaint.status === 'Resolved' && (
                  <button
                    type="button"
                    onClick={() => handleOpenReopenModal(selectedComplaint)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <RotateCcw size={14} />
                    {t.issueNotFixed}
                  </button>
                )}

                {selectedComplaint.status === 'Verification Pending' && (
                  <button
                    type="button"
                    onClick={() => handleOpenConfirmModal(selectedComplaint)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition-colors"
                  >
                    <CheckCircle2 size={14} />
                    {t.confirmRepair}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="w-full sm:w-auto text-slate-600 hover:text-slate-900 text-xs font-semibold px-4 py-2"
                >
                  {t.close}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* REOPEN REASON MODAL */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <RotateCcw size={16} className="text-orange-600" />
                {t.requestReopening}
              </h3>
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {t.reopenSubtitle}
            </p>

            <form onSubmit={handleConfirmReopen} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.reasonForReopening}
                </label>
                <textarea
                  rows={3}
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g. Pothole was only filled with loose sand and washed away in today's rain, or garbage is still accumulating..."
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="text-xs font-semibold text-slate-600 px-3 py-2"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReopen || !reopenReason.trim()}
                  className="inline-flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition-colors disabled:opacity-50"
                >
                  {isSubmittingReopen ? t.submitting : t.confirmReopen}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM RESOLUTION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={24} />
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-900">{t.confirmRepairTitle}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {t.rateRepair}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 rounded transition-transform hover:scale-110 ${
                    rating >= star ? 'text-amber-400' : 'text-slate-300'
                  }`}
                >
                  <Star size={26} fill={rating >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-xs font-semibold text-slate-600 px-4 py-2"
              >
                {t.notNow}
              </button>
              <button
                type="button"
                onClick={handleConfirmResolutionAction}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2 rounded-xl text-xs shadow transition-colors"
              >
                {t.confirmCloseComplaint}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
