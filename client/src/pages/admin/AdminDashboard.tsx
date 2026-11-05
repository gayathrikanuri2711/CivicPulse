import React, { useState } from 'react';
import { useComplaints } from '../../context/ComplaintContext';
import { StatusBadge } from '../../components/StatusBadge';
import { INITIAL_DEPARTMENTS, INITIAL_CONTRACTORS } from '../../data/mockData';
import { 
  Building2, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Search, 
  Wrench, 
  Users, 
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Send
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '../../types';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminInfrastructure } from './AdminInfrastructure';
import { AdminEmergency } from './AdminEmergency';
import { AdminCommunity } from './AdminCommunity';

export const AdminDashboard: React.FC = () => {
  const { complaints, updateComplaintStatus } = useComplaints();

  const [activeTab, setActiveTab] = useState<'overview' | 'complaints' | 'departments' | 'contractors' | 'analytics' | 'infrastructure' | 'emergency' | 'community'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncident, setSelectedIncident] = useState<Complaint | null>(null);

  // Assignment modal
  const [assignDept, setAssignDept] = useState(INITIAL_DEPARTMENTS[0].id);
  const [assignContractor, setAssignContractor] = useState(INITIAL_CONTRACTORS[0].id);
  const [assignSuccess, setAssignSuccess] = useState(false);

  // Metrics
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const pending = complaints.filter(c => ['Submitted', 'Under Review'].includes(c.status)).length;
  const critical = complaints.filter(c => c.severity >= 4 || c.safetyRiskAlert).length;
  const reopened = complaints.filter(c => c.status === 'Reopened').length;

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.location.locality && c.location.locality.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesCat && matchesSearch;
  });

  const handleDispatchAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    const dept = INITIAL_DEPARTMENTS.find(d => d.id === assignDept);
    const cont = INITIAL_CONTRACTORS.find(c => c.id === assignContractor);

    updateComplaintStatus(selectedIncident.id, 'Assigned', {
      departmentId: dept?.id,
      departmentName: dept?.name,
      contractorId: cont?.id,
      contractorName: cont?.name,
      slaDeadline: new Date(Date.now() + (dept?.slaHoursDefault || 48) * 3600000).toISOString()
    });

    setAssignSuccess(true);
    setTimeout(() => {
      setAssignSuccess(false);
      setSelectedIncident(null);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-900 text-white p-6 rounded-2xl shadow-md border border-navy-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-teal-400 bg-teal-500/20 px-2.5 py-1 rounded-full border border-teal-500/30 mb-2 font-mono">
            <span>GVMC Command Hub</span>
            <span>•</span>
            <span>Visakhapatnam Zones 1-8</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Municipal Administration Portal</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time civic intelligence, SLA monitoring, multimodal AI verification, and field contractor dispatch.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1.5 bg-navy-800/80 p-1 rounded-xl border border-navy-700 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'complaints' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Complaints ({complaints.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('departments')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'departments' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Departments ({INITIAL_DEPARTMENTS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contractors')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'contractors' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Contractors ({INITIAL_CONTRACTORS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'analytics' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('infrastructure')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'infrastructure' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Infrastructure
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'emergency' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Emergency
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('community')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'community' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
            }`}
          >
            Community
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-slate-500 block">Total Complaints</span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{total}</div>
          <span className="text-[10px] text-slate-400">All GVMC Wards</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-amber-600 block">Pending Review</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{pending}</div>
          <span className="text-[10px] text-slate-400">Awaiting assignment</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-indigo-600 block">In Progress</span>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{inProgress}</div>
          <span className="text-[10px] text-slate-400">Contractors active</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-emerald-600 block">Resolved</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{resolved}</div>
          <span className="text-[10px] text-slate-400">{((resolved / (total || 1)) * 100).toFixed(0)}% completion</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-rose-600 block">Critical Hazards</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{critical}</div>
          <span className="text-[10px] text-slate-400">High severity</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm">
          <span className="text-[11px] font-medium text-orange-600 block">Reopened</span>
          <div className="text-2xl font-bold text-orange-600 mt-1">{reopened}</div>
          <span className="text-[10px] text-slate-400">Citizen escalated</span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Incident Feed */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Active Incident Queue</h3>
                <p className="text-xs text-slate-500">Live feed prioritized by dynamic risk score</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('complaints')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700"
              >
                View Table
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {complaints.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedIncident(c)}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                      <StatusBadge status={c.status} size="sm" />
                      <span className="text-[10px] font-mono font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                        Priority {c.priorityScore}/100
                      </span>
                      {c.safetyRiskAlert && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                          <AlertTriangle size={10} />
                          Hazard
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-sm text-slate-900 truncate">{c.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{c.category}</span>
                      <span>•</span>
                      <span>{c.location.locality || c.location.ward}</span>
                      <span>•</span>
                      <span>Reported by {c.citizenName}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-indigo-600 hover:underline">
                      Assign & Review →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Workloads Side Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Department Workloads</h3>
            <div className="space-y-3">
              {INITIAL_DEPARTMENTS.slice(0, 5).map((dept) => (
                <div key={dept.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900">{dept.name}</span>
                    <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                      {dept.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>SLA: {dept.slaHoursDefault}h default</span>
                    <span className="font-bold text-slate-800">{dept.activeWorkload} active tasks</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: COMPLAINTS MANAGEMENT */}
      {activeTab === 'complaints' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, keyword, or locality..."
                className="w-full text-xs border border-slate-300 rounded-xl pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Verification Pending">Verification Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Reopened">Reopened</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:outline-none max-w-[180px]"
              >
                <option value="All">All Categories</option>
                <option value="Potholes and road damage">Roads & Potholes</option>
                <option value="Garbage accumulation">Garbage & Waste</option>
                <option value="Drainage blockage">Drainage</option>
                <option value="Water leakage">Water Leakage</option>
                <option value="Streetlight failure">Streetlights</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Title & Category</th>
                  <th className="py-2.5 px-3">Locality / Ward</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredComplaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{c.id}</td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-400">{c.category}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div>{c.location.locality || 'Vizag'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.location.ward}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-teal-700">
                      {c.priorityScore}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {c.departmentName || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedIncident(c)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_DEPARTMENTS.map((dept) => (
            <div key={dept.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {dept.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">SLA: {dept.slaHoursDefault}h</span>
              </div>

              <h4 className="font-bold text-sm text-slate-900">{dept.name}</h4>
              <p className="text-xs text-slate-500">Official Head: {dept.headOfficialName}</p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Active Workload:</span>
                <span className="font-bold font-mono text-slate-900">{dept.activeWorkload} complaints</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CONTRACTORS */}
      {activeTab === 'contractors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INITIAL_CONTRACTORS.map((cont) => (
            <div key={cont.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Rating: {cont.rating} ★
                </span>
                <span className="text-xs font-semibold text-emerald-700">{cont.completedJobs} Completed</span>
              </div>

              <h4 className="font-bold text-sm text-slate-900">{cont.name}</h4>
              <p className="text-xs text-slate-600">{cont.companyName}</p>
              <p className="text-xs text-slate-400">Speciality: {cont.speciality}</p>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Coverage: {cont.assignedWards.join(', ')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASSIGNMENT & INSPECTION MODAL */}

      {/* TAB 5: ANALYTICS */}
      {activeTab === 'analytics' && <AdminAnalytics />}

      {/* TAB 6: INFRASTRUCTURE */}
      {activeTab === 'infrastructure' && <AdminInfrastructure />}

      {/* TAB 7: EMERGENCY */}
      {activeTab === 'emergency' && <AdminEmergency />}

      {/* TAB 8: COMMUNITY */}
      {activeTab === 'community' && <AdminCommunity />}

      {/* ASSIGNMENT & INSPECTION MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-teal-300">{selectedIncident.id}</span>
                <h3 className="font-bold text-base mt-0.5">{selectedIncident.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800">
              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div><span className="font-semibold">Category:</span> {selectedIncident.category}</div>
                <div><span className="font-semibold">Location:</span> {selectedIncident.location.address || selectedIncident.location.locality} ({selectedIncident.location.ward})</div>
                <div><span className="font-semibold">Reported by:</span> {selectedIncident.citizenName} ({selectedIncident.citizenPhone || 'N/A'})</div>
                <div><span className="font-semibold">Description:</span> {selectedIncident.description}</div>
              </div>

              {selectedIncident.photoUrl && (
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1">Citizen Photo:</span>
                  <div className="h-40 rounded-xl overflow-hidden border border-slate-200">
                    <img src={selectedIncident.photoUrl} alt="Incident" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Department & Contractor Dispatch Form */}
              <form onSubmit={handleDispatchAssignment} className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                  Assign Department & Dispatch Contractor
                </h4>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Responsible Department</label>
                  <select
                    value={assignDept}
                    onChange={(e) => setAssignDept(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                  >
                    {INITIAL_DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code} - SLA {d.slaHoursDefault}h)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assign Verified Contractor</label>
                  <select
                    value={assignContractor}
                    onChange={(e) => setAssignContractor(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-slate-50 focus:bg-white"
                  >
                    {INITIAL_CONTRACTORS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.companyName} - {c.speciality})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIncident(null)}
                    className="text-xs font-semibold text-slate-600 px-3 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition-colors"
                  >
                    <Send size={13} />
                    <span>Dispatch Work Order</span>
                  </button>
                </div>
              </form>

              {assignSuccess && (
                <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-center animate-fadeIn">
                  Work order dispatched successfully to contractor!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
