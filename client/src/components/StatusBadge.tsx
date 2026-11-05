import React from 'react';
import { ComplaintStatus } from '../types';
import { 
  Clock, 
  Search, 
  UserCheck, 
  Wrench, 
  CheckCircle2, 
  RotateCcw, 
  XCircle, 
  AlertTriangle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (s: ComplaintStatus) => {
    switch (s) {
      case 'Submitted':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: Clock,
          label: 'Submitted'
        };
      case 'Under Review':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: Search,
          label: 'Under Review'
        };
      case 'Assigned':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: UserCheck,
          label: 'Assigned'
        };
      case 'In Progress':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: Wrench,
          label: 'In Progress'
        };
      case 'Verification Pending':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-200',
          icon: AlertTriangle,
          label: 'Verification Pending'
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: CheckCircle2,
          label: 'Resolved'
        };
      case 'Reopened':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: RotateCcw,
          label: 'Reopened'
        };
      case 'Rejected':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: XCircle,
          label: 'Rejected'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: Clock,
          label: s
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-medium'
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} shadow-sm transition-colors`}
    >
      <Icon size={iconSizes} className="shrink-0" />
      <span>{config.label}</span>
    </span>
  );
};
