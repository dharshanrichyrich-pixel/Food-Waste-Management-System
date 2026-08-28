import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({
  children,
  className = '',
  hover = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white border border-slate-200/90 rounded-2xl p-6 relative overflow-hidden transition-all duration-300 shadow-sm text-slate-800',
          hover && 'hover:border-slate-300 hover:shadow-md hover:shadow-emerald-500/5',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
