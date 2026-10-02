import React from 'react';
import { AppointmentStatus } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'BOOKED':
        return 'bg-[#2D382E] text-[#FAF8F5] border-[#2D382E]';
      case 'CANCELLED':
        return 'bg-accent/10 text-accent border-accent/30';
      case 'COMPLETED':
        return 'bg-bg-subtle text-ink-muted border-border';
      default:
        return 'bg-bg-alt text-ink border-border';
    }
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-2xs' : 'px-3 py-1 text-2xs';

  return (
    <span
      className={`inline-flex items-center font-mono uppercase tracking-widest border font-semibold ${sizeClass} ${getStyle()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {normalized}
    </span>
  );
};
