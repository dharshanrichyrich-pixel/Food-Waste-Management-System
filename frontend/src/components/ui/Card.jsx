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
          'bg-white border border-[#E5E2DC] rounded-2xl p-6 relative overflow-hidden transition-all duration-200 shadow-sm text-slate-800',
          hover && 'hover:border-[#C8D3C5] hover:shadow-md hover:shadow-[#1b4332]/5 hover:-translate-y-0.5',
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
