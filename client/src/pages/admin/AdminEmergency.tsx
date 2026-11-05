import React, { useState } from 'react';
import { EmergencyAlert, CivicServiceStatus, VIZAG_LOCALITIES } from '../../types';
import { INITIAL_EMERGENCY_ALERTS, INITIAL_SERVICE_STATUS } from '../../data/mockData';
import {
  AlertTriangle,
  Plus,
  X,
  Siren,
  MapPin,
  Clock,
  Shield,
  Activity,
  Droplets,
  Lightbulb,
  Trash2,
  Route,
  Zap,
  Info
} from 'lucide-react';

const severityColors: Record<EmergencyAlert['severity'], string> = {
  critical: 'bg-rose-100 text-rose-700 border-rose-300',
  high: 'bg-amber-100 text-amber-700 border-amber-300',
  moderate: 'bg-blue-100 text-blue-700 border-blue-300',
};

const typeLabels: Record<EmergencyAlert['type'], string> = {
  cyclone: 'Cyclone',
  flash_flood: 'Flash Flood',
  tree_fall: 'Tree Fall',
  structural_hazard: 'Structural Hazard',
  power_hazard: 'Power Hazard',
};

const serviceStatusColors: Record<CivicServiceStatus['status'], string> = {
  Normal: 'bg-emerald-500',
  'Partial Disruption': 'bg-amber-500',
  'Critical Interruption': 'bg-rose-500',
};

const serviceStatusTextColors: Record<CivicServiceStatus['status'], string> = {
  Normal: 'text-emerald-700',
  'Partial Disruption': 'text-amber-700',
  'Critical Interruption': 'text-rose-700',
};

const serviceIcons: Record<CivicServiceStatus['service'], React.ElementType> = {
  'Water Supply': Droplets,
  'Drainage & Sewage': Activity,
  'Street Lighting': Lightbulb,
  'Garbage Collection': Trash2,
  'Road Network': Route,
};

const sourceLabels: Record<CivicServiceStatus['source'], string> = {
  citizen_reported: 'Citizen Reported',
  ai_inferred: 'AI Inferred',
  admin_verified: 'Admin Verified',
};

const sourceBadgeColors: Record<CivicServiceStatus['source'], string> = {
  citizen_reported: 'bg-blue-50 text-blue-700 border-blue-200',
  ai_inferred: 'bg-purple-50 text-purple-700 border-purple-200',
  admin_verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

interface AlertFormState {
  title: string;
  type: EmergencyAlert['type'];
  severity: EmergencyAlert['severity'];
  locality: string;
  description: string;
}

const defaultAlertForm: AlertFormState = {
  title: '',
  type: 'flash_flood',
  severity: 'moderate',
  locality: VIZAG_LOCALITIES[0].name,
  description: '',
};

export const AdminEmergency: React.FC = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(INITIAL_EMERGENCY_ALERTS);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AlertFormState>(defaultAlertForm);

  const activeAlerts = alerts.filter(a => a.status === 'active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loc = VIZAG_LOCALITIES.find(l => l.name === form.locality) || VIZAG_LOCALITIES[0];
    const newAlert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      title: form.title,
      type: form.type,
      severity: form.severity,
      locality: form.locality,
      location: {
        latitude: loc.lat,
        longitude: loc.lng,
        locality: loc.name,
        ward: loc.ward,
      },
      description: form.description,
      status: 'active',
      createdAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
    setAlerts(prev => [newAlert, ...prev]);
    setForm(defaultAlertForm);
    setShowModal(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMin = Math.floor(diffMs / (1000 * 60));
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Siren size={20} className="text-rose-500" />
            Emergency & Disaster Management
          </h2>
          <p className="text-xs text-slate-500">Monitor active alerts and civic service continuity across Visakhapatnam</p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition-colors"
        >
          <Plus size={14} />
          Issue New Alert
        </button>
      </div>

      {/* Active Alerts Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          Active Alerts ({activeAlerts.length})
        </h3>

        {activeAlerts.length === 0 ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <Shield size={24} className="mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-emerald-700">No Active Emergencies</p>
            <p className="text-xs text-emerald-600">All clear across Visakhapatnam municipal zones</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900 flex-1">{alert.title}</h4>
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${severityColors[alert.severity]}`}>
                    {alert.severity}
                  </span>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    <Zap size={10} />
                    {typeLabels[alert.type]}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} />
                    {alert.locality}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Clock size={12} />
                    {formatTime(alert.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Civic Service Status Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Activity size={16} className="text-teal-500" />
          Civic Service Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_SERVICE_STATUS.map((svc) => {
            const SvcIcon = serviceIcons[svc.service];
            return (
              <div key={svc.service} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SvcIcon size={16} className="text-slate-600" />
                    <h4 className="font-bold text-sm text-slate-900">{svc.service}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${serviceStatusColors[svc.status]}`} />
                    <span className={`text-xs font-semibold ${serviceStatusTextColors[svc.status]}`}>
                      {svc.status}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{svc.details}</p>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Affected Areas</span>
                  {svc.affectedAreas.map((area, i) => (
                    <div key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                      <Info size={10} className="text-slate-400 mt-0.5 shrink-0" />
                      {area}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sourceBadgeColors[svc.source]}`}>
                    {sourceLabels[svc.source]}
                  </span>
                  <span className="text-[10px] text-slate-400">{svc.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-rose-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Siren size={16} />
                Issue New Emergency Alert
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-rose-200 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Alert Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="e.g. Cyclone Warning — Coastal Wards"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value as EmergencyAlert['type'] }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm(f => ({ ...f, severity: e.target.value as EmergencyAlert['severity'] }))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Locality</label>
                <select
                  value={form.locality}
                  onChange={(e) => setForm(f => ({ ...f, locality: e.target.value }))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  {VIZAG_LOCALITIES.map(loc => (
                    <option key={loc.name} value={loc.name}>{loc.name} ({loc.ward})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  required
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none resize-none"
                  placeholder="Describe the emergency situation and advisory for citizens..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-xs font-semibold text-slate-600 px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition-colors"
                >
                  <Siren size={13} />
                  Issue Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

