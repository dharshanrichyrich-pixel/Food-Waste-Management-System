import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  variant = 'forest',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full select-none';

  const variants = {
    forest: 'bg-[#f0f7f3] text-[#1b4332] border border-[#b9ddc8]',
    sage: 'bg-[#e5eae4] text-[#2c402b] border border-[#c6d3c4]',
    ivory: 'bg-[#f7f5ee] text-[#475569] border border-[#e4dcc9]',
    charcoal: 'bg-[#f1f5f9] text-[#1e293b] border border-[#cbd5e1]',
    brand: 'bg-[#f0f7f3] text-[#1b4332] border border-[#b9ddc8]',
    teal: 'bg-[#f0fdfa] text-[#0f766e] border border-[#99f6e4]',
    emerald: 'bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]',
    cyan: 'bg-sky-50 text-sky-800 border border-sky-200',
    blue: 'bg-sky-50 text-sky-800 border border-sky-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    orange: 'bg-orange-50 text-orange-800 border border-orange-200',
    coral: 'bg-rose-50 text-rose-800 border border-rose-200',
    red: 'bg-rose-50 text-rose-800 border border-rose-200',
    purple: 'bg-purple-50 text-purple-800 border border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    live: 'bg-[#f0f7f3] text-[#1b4332] border border-[#b9ddc8]',
  };

  const dotColors = {
    forest: 'bg-[#1b4332] animate-pulse',
    sage: 'bg-[#556a52] animate-pulse',
    brand: 'bg-[#1b4332] animate-pulse',
    teal: 'bg-[#0f766e] animate-pulse',
    emerald: 'bg-[#059669] animate-pulse',
    cyan: 'bg-sky-600 animate-pulse',
    blue: 'bg-sky-600 animate-pulse',
    amber: 'bg-amber-500 animate-pulse',
    orange: 'bg-orange-500 animate-pulse',
    coral: 'bg-rose-500 animate-pulse',
    red: 'bg-rose-600',
    purple: 'bg-purple-600 animate-pulse',
    slate: 'bg-slate-400',
    live: 'bg-[#1b4332] animate-pulse',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-0.5 gap-1.5',
    lg: 'text-sm px-3 py-1 gap-2',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant] || variants.forest, sizes[size], className))}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant] || 'bg-[#1b4332]')} />}
      {children}
    </span>
  );
};

export default Badge;
