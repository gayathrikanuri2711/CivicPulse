import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintContext';
import { useLanguage } from '../../context/LanguageContext';
import { VIZAG_LOCALITIES } from '../../types';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Languages, 
  Wifi, 
  ShieldCheck, 
  Check, 
  Save, 
  RotateCcw 
} from 'lucide-react';

export const CitizenProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { currentLocation, setCurrentLocation } = useComplaints();
  const { t, language: globalLang, setLanguage: setGlobalLang } = useLanguage();

  const [name, setName] = useState(user?.name || 'Praveen Varma');
  const [phone, setPhone] = useState(user?.phone || '+91 98480 98765');
  const [language, setLanguage] = useState<'en' | 'te'>(user?.preferredLanguage || 'en');
  const [selectedLocality, setSelectedLocality] = useState(user?.locality || 'MVP Colony Sector 2');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      phone,
      preferredLanguage: language,
      locality: selectedLocality
    });

    // Also sync global language
    setGlobalLang(language);

    const matched = VIZAG_LOCALITIES.find(l => l.name === selectedLocality);
    if (matched) {
      setCurrentLocation({
        latitude: matched.lat,
        longitude: matched.lng,
        locality: matched.name,
        ward: matched.ward,
        address: `${matched.name}, Visakhapatnam`
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm(t.resetConfirm)) {
      localStorage.removeItem('civicpulse_complaints');
      localStorage.removeItem('civicpulse_user');
      localStorage.removeItem('civicpulse_registered_users');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-28 sm:pb-14 space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t.citizenProfile}</h1>
        <p className="text-xs text-slate-500 mt-1">
          {t.profileSubtitle}
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <User size={14} className="text-teal-600" />
            {t.fullName}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Email (Read only for demo) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Mail size={14} className="text-teal-600" />
            {t.emailAddress}
          </label>
          <input
            type="email"
            disabled
            value={user?.email || 'praveen.vizag@example.com'}
            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-100 text-slate-500 cursor-not-allowed"
          />
        </div>

        {/* Mobile Phone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Phone size={14} className="text-teal-600" />
            {t.phoneHelp}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
        </div>

        {/* Preferred Language */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Languages size={14} className="text-teal-600" />
            {t.preferredLanguage}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                language === 'en'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('te')}
              className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                language === 'te'
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              తెలుగు (Telugu)
            </button>
          </div>
        </div>

        {/* Home Ward / Locality */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin size={14} className="text-teal-600" />
            {t.homeWard}
          </label>
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            {VIZAG_LOCALITIES.map((loc) => (
              <option key={loc.name} value={loc.name}>
                {loc.name} ({loc.ward})
              </option>
            ))}
          </select>
        </div>

        {/* Save button & success message */}
        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold px-5 py-2.5 rounded-xl text-xs shadow transition-colors"
          >
            <Save size={14} />
            <span>{t.savePreferences}</span>
          </button>

          {saveSuccess && (
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 animate-fadeIn">
              <Check size={14} />
              {t.savedSuccess}
            </span>
          )}
        </div>
      </form>

      {/* Offline-First & Network Status Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Wifi size={14} className="text-teal-600" />
          {t.offlinePwaStatus}
        </h3>
        
        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span>{t.networkConnection}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t.onlineActive}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span>{t.offlineQueue}</span>
            <span className="font-mono font-semibold text-slate-700">{t.pendingSync}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span>{t.serviceWorker}</span>
            <span className="inline-flex items-center gap-1 font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              <ShieldCheck size={12} />
              {t.activeCache}
            </span>
          </div>
        </div>
      </div>

      {/* Development / Demo Mode Actions */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-800">{t.resetDemoData}</h4>
          <p className="text-[11px] text-slate-500">{t.resetDemoDesc}</p>
        </div>
        <button
          type="button"
          onClick={handleResetData}
          className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold px-3 py-1.5 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 transition-colors"
        >
          <RotateCcw size={12} />
          {t.resetState}
        </button>
      </div>

    </div>
  );
};
