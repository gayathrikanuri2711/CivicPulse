import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const CitizenBottomNav: React.FC = () => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-lg sm:hidden">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home size={20} className={isActive ? 'text-teal-600 scale-110 transition-transform' : ''} />
              <span>{t.home}</span>
            </>
          )}
        </NavLink>

        {/* 2. My Complaints */}
        <NavLink
          to="/complaints"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <ClipboardList size={20} className={isActive ? 'text-teal-600 scale-110 transition-transform' : ''} />
              <span>{t.complaints}</span>
            </>
          )}
        </NavLink>

        {/* 3. Report Issue (Highlighted Prominent Action) */}
        <NavLink
          to="/report"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors -mt-4 ${
              isActive ? 'text-teal-700 font-semibold' : 'text-teal-600'
            }`
          }
        >
          <div className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 ring-4 ring-white active:scale-95 transition-all">
            <PlusCircle size={26} />
          </div>
          <span className="font-semibold text-slate-800">{t.report}</span>
        </NavLink>

        {/* 4. My Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
              isActive ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User size={20} className={isActive ? 'text-teal-600 scale-110 transition-transform' : ''} />
              <span>{t.profile}</span>
            </>
          )}
        </NavLink>

      </div>
    </nav>
  );
};

