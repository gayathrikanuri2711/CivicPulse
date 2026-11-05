import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ClipboardList, PlusCircle, User } from 'lucide-react';

export const CitizenDesktopNav: React.FC = () => {
  return (
    <div className="hidden sm:flex items-center gap-1 bg-navy-800/60 p-1 rounded-xl border border-navy-700/60 text-xs">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
          }`
        }
      >
        <Home size={15} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/complaints"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
          }`
        }
      >
        <ClipboardList size={15} />
        <span>My Complaints</span>
      </NavLink>

      <NavLink
        to="/report"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isActive ? 'bg-teal-500 text-navy-950 font-bold shadow-sm' : 'text-teal-400 hover:bg-teal-500/10'
          }`
        }
      >
        <PlusCircle size={15} />
        <span>Report Issue</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            isActive ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
          }`
        }
      >
        <User size={15} />
        <span>Profile</span>
      </NavLink>
    </div>
  );
};

