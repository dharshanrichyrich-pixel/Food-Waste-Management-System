import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none';

  const variants = {
    brand: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    teal: 'bg-teal-50 text-teal-700 border border-teal-200',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    cyan: 'bg-cyan-50 text-cyan-700 border border-cyan-200',
    blue: 'bg-sky-50 text-sky-700 border border-sky-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200',
    coral: 'bg-rose-50 text-rose-700 border border-rose-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    live: 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm',
  };

  const dotColors = {
    brand: 'bg-emerald-500 animate-pulse',
    teal: 'bg-teal-500 animate-pulse',
    emerald: 'bg-emerald-500 animate-pulse',
    cyan: 'bg-cyan-500 animate-pulse',
    blue: 'bg-sky-500 animate-pulse',
    amber: 'bg-amber-500 animate-pulse',
    orange: 'bg-orange-500 animate-pulse',
    coral: 'bg-rose-500 animate-pulse',
    red: 'bg-red-500',
    purple: 'bg-purple-500 animate-pulse',
    slate: 'bg-slate-400',
    live: 'bg-emerald-500 animate-pulse',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant] || variants.brand, sizes[size], className))}>
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full', dotColors[variant] || 'bg-emerald-500')} />}
      {children}
    </span>
  );
};

export default Badge;
