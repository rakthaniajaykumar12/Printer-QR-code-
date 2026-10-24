import React from 'react';
import { Sparkles, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  const configs = {
    new: {
      label: 'New Order',
      bg: 'bg-purple-100 text-purple-800 border-purple-200',
      dot: 'bg-purple-600',
      pulse: true,
      icon: Sparkles,
    },
    ready: {
      label: 'Ready to Print',
      bg: 'bg-blue-100 text-blue-800 border-blue-200',
      dot: 'bg-blue-600',
      pulse: false,
      icon: Clock,
    },
    printed: {
      label: 'Printed & Ready',
      bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600',
      pulse: false,
      icon: CheckCircle2,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-500',
      pulse: false,
      icon: XCircle,
    },
  };

  const current = configs[status] || {
    label: status,
    bg: 'bg-gray-100 text-gray-800 border-gray-200',
    dot: 'bg-gray-500',
    pulse: false,
    icon: AlertCircle,
  };

  const Icon = current.icon;
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${
        isSm ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm'
      } ${current.bg}`}
    >
      <span className="relative flex h-2 w-2">
        {current.pulse && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`}></span>
      </span>
      <Icon className={isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {current.label}
    </span>
  );
}
