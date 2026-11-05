import React, { useState } from 'react';
import { InfrastructureAsset } from '../../types';
import { INITIAL_INFRASTRUCTURE } from '../../data/mockData';
import {
  Route,
  Droplets,
  Lightbulb,
  PipetteIcon,
  Plus,
  Pencil,
  X,
  MapPin,
  Calendar,
  AlertCircle,
  History,
  Landmark,
  Trash2
} from 'lucide-react';

const categoryIcons: Record<InfrastructureAsset['category'], React.ElementType> = {
  roads: Route,
  drainage: Droplets,
  streetlights: Lightbulb,
  water_pipelines: PipetteIcon,
  garbage_points: Trash2,
  public_facilities: Landmark,
};

const categoryLabels: Record<InfrastructureAsset['category'], string> = {
  roads: 'Road',
  drainage: 'Drainage',
  streetlights: 'Streetlight',
  water_pipelines: 'Water Pipeline',
  garbage_points: 'Garbage Point',
  public_facilities: 'Public Facility',
};

const conditionColors: Record<InfrastructureAsset['condition'], string> = {
  Good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Fair: 'bg-amber-50 text-amber-700 border-amber-200',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  'Under Maintenance': 'bg-blue-50 text-blue-700 border-blue-200',
};

interface AssetFormState {
  name: string;
  category: InfrastructureAsset['category'];
  ward: string;
  condition: InfrastructureAsset['condition'];
  notes: string;
}

const defaultForm: AssetFormState = {
  name: '',
  category: 'roads',
  ward: 'Ward 5',
  condition: 'Good',
  notes: '',
};

const wards = ['Ward 5', 'Ward 8', 'Ward 16', 'Ward 18', 'Ward 21', 'Ward 25', 'Ward 29', 'Ward 65'];

export const AdminInfrastructure: React.FC = () => {
  const [assets, setAssets] = useState<InfrastructureAsset[]>(INITIAL_INFRASTRUCTURE);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AssetFormState>(defaultForm);

  const openNew = () => {
    setForm(defaultForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (asset: InfrastructureAsset) => {
    setForm({
      name: asset.name,
      category: asset.category,
      ward: asset.ward,
      condition: asset.condition,
      notes: asset.notes || '',
    });
    setEditingId(asset.id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAssets(prev =>
        prev.map(a =>
          a.id === editingId
            ? { ...a, condition: form.condition, notes: form.notes, name: form.name, category: form.category, ward: form.ward }
            : a
        )
      );
    } else {
      const newAsset: InfrastructureAsset = {
        id: `INF-VZ-NEW-${Date.now()}`,
        name: form.name,
        category: form.category,
        location: { latitude: 17.72, longitude: 83.31, ward: form.ward },
        ward: form.ward,
        condition: form.condition,
        lastInspectionDate: new Date().toISOString().split('T')[0],
        complaintHistoryCount: 0,
        notes: form.notes || undefined,
      };
      setAssets(prev => [newAsset, ...prev]);
    }
    setShowModal(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Infrastructure Digital Registry</h2>
          <p className="text-xs text-slate-500">Track and manage all municipal infrastructure assets across wards</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition-colors"
        >
          <Plus size={14} />
          Register New Asset
        </button>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => {
          const CategoryIcon = categoryIcons[asset.category];
          return (
            <div key={asset.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              {/* Top row: ID badge + category icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {asset.id}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <CategoryIcon size={14} className="text-indigo-500" />
                  {categoryLabels[asset.category]}
                </div>
              </div>

              {/* Name */}
              <h4 className="font-bold text-sm text-slate-900 leading-tight">{asset.name}</h4>

              {/* Ward + Condition */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} />
                  {asset.ward}
                </span>
                <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${conditionColors[asset.condition]}`}>
                  {asset.condition}
                </span>
              </div>

              {/* Details */}
              <div className="border-t border-slate-100 pt-2 space-y-1 text-xs text-slate-500">
                {asset.installedYear && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} />
                    Installed: {asset.installedYear}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={12} />
                  Last Inspection: {asset.lastInspectionDate}
                </div>
                <div className="flex items-center gap-1.5">
                  <History size={12} />
                  Complaint History: {asset.complaintHistoryCount} recorded
                </div>
              </div>

              {asset.notes && (
                <p className="text-[11px] text-slate-400 italic bg-slate-50 rounded-lg p-2 border border-slate-100">
                  {asset.notes}
                </p>
              )}

              {/* Edit Button */}
              <button
                type="button"
                onClick={() => openEdit(asset)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <Pencil size={12} />
                Edit
              </button>
            </div>
          );
        })}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          No infrastructure assets registered yet. Click "Register New Asset" to add one.
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-navy-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{editingId ? 'Edit Asset' : 'Register New Asset'}</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Asset Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Beach Road Stormwater Culvert"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm(f => ({ ...f, category: e.target.value as InfrastructureAsset['category'] }))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Ward</label>
                <select
                  value={form.ward}
                  onChange={(e) => setForm(f => ({ ...f, ward: e.target.value }))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  {wards.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Condition</label>
                <select
                  value={form.condition}
                  onChange={(e) => setForm(f => ({ ...f, condition: e.target.value as InfrastructureAsset['condition'] }))}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Critical">Critical</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
                  placeholder="Optional maintenance notes..."
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
                  className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow transition-colors"
                >
                  {editingId ? 'Update Asset' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

