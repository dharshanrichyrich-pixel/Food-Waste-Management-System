import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1b4332] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5] disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variants = {
    // Forest Green Primary - Editorial & Dignified
    primary:
      'bg-[#1b4332] hover:bg-[#143527] text-white shadow-sm border border-[#143527]/40',
    // Subtle Sage
    sage:
      'bg-[#e5eae4] hover:bg-[#d6ded5] text-[#2c402b] border border-[#c6d3c4]',
    // Clean Secondary White/Ivory
    secondary:
      'bg-white hover:bg-[#FAF8F5] text-slate-800 hover:text-slate-900 border border-[#E5E2DC] shadow-sm',
    // Outline
    outline:
      'bg-transparent hover:bg-white text-[#1b4332] hover:text-[#143527] border border-[#1b4332]/30 hover:border-[#1b4332]',
    // Ghost
    ghost:
      'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900',
    // Gradient / Accent
    gradient:
      'bg-[#1b4332] hover:bg-[#23573f] text-white shadow-sm border border-[#143527]',
    // Danger
    danger:
      'bg-rose-700 hover:bg-rose-800 text-white shadow-sm border border-rose-900/30',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variants[variant] || variants.primary, sizes[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
