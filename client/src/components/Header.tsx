import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  User, 
  Briefcase, 
  AlertCircle, 
  LogOut, 
  Languages
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CitizenDesktopNav } from './CitizenDesktopNav';

export const Header: React.FC = () => {
  const { user, role, logout } = useAuth();
  const { currentLocation, activeAlerts } = useComplaints();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return { label: 'GVMC Admin', icon: Building2, color: 'bg-indigo-900 text-indigo-100 border-indigo-700' };
      case 'contractor':
        return { label: 'Contractor', icon: Briefcase, color: 'bg-amber-800 text-amber-100 border-amber-600' };
      default:
        return { label: language === 'te' ? 'పౌరుడు' : 'Citizen', icon: User, color: 'bg-teal-700 text-teal-100 border-teal-600' };
    }
  };

  const badge = getRoleBadge();
  const RoleIcon = badge.icon;

  return (
    <header className="sticky top-0 z-40 bg-navy-900 border-b border-navy-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <Link to={role === 'admin' ? '/admin' : role === 'contractor' ? '/contractor' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform shadow-inner">
                <ShieldCheck size={22} className="text-teal-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-white">CivicPulse</span>
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-400/30">AI</span>
                </div>
                <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">
                  {t.headerSubtitle}
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Locality + Citizen Nav */}
          <div className="flex items-center gap-3">
            {role === 'citizen' && <CitizenDesktopNav />}

            <div className="hidden md:flex items-center gap-2 bg-navy-800/80 px-3 py-1.5 rounded-full border border-navy-700 text-xs">
              <MapPin size={13} className="text-teal-400 shrink-0" />
              <span className="text-slate-300 font-medium truncate max-w-[200px]">
                {currentLocation.locality || 'MVP Colony Sector 2'}
              </span>
              {currentLocation.ward && (
                <span className="bg-teal-900/60 text-teal-300 text-[10px] px-1.5 py-0.5 rounded font-mono border border-teal-700/50">
                  {currentLocation.ward}
                </span>
              )}
            </div>
          </div>

          {/* Right: Language + Role Badge + User + Logout */}
          <div className="flex items-center gap-2.5">
            {/* Emergency indicator */}
            {activeAlerts.length > 0 && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-1 rounded-full animate-pulse">
                <AlertCircle size={12} />
                <span>{activeAlerts.length} Active Hazard</span>
              </div>
            )}

            {/* Language toggle */}
            <div className="hidden sm:flex items-center gap-0.5 bg-navy-800/80 p-0.5 rounded-lg border border-navy-700 text-[10px] font-medium">
              <Languages size={11} className="text-slate-400 ml-1" />
              <button type="button" onClick={() => setLanguage('en')}
                className={`px-1.5 py-1 rounded transition-colors ${language === 'en' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                EN
              </button>
              <button type="button" onClick={() => setLanguage('te')}
                className={`px-1.5 py-1 rounded transition-colors ${language === 'te' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                తె
              </button>
            </div>

            {/* Role Badge (read-only, no switching) */}
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${badge.color} shadow-sm`}>
              <RoleIcon size={14} />
              <span className="hidden sm:inline font-semibold">{badge.label}</span>
            </div>

            {/* Current user */}
            <div className="text-xs text-right hidden lg:block">
              <div className="font-semibold text-slate-200">{user?.name}</div>
              <div className="text-[10px] text-slate-400">{user?.phone}</div>
            </div>

            <button type="button" onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition-colors"
              title={t.logout}>
              <LogOut size={16} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
