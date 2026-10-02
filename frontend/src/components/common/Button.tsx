import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-sans text-xs font-semibold uppercase tracking-wider transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-2xs',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-7 py-3.5 text-sm tracking-widest',
  };

  const variantStyles = {
    primary: 'bg-ink text-white hover:bg-accent border border-ink hover:border-accent',
    secondary: 'bg-bg-alt text-ink hover:bg-bg-subtle border border-border',
    outline: 'border border-ink text-ink hover:bg-ink hover:text-white',
    accent: 'bg-accent text-white hover:bg-accent-dark border border-accent hover:border-accent-dark',
    ghost: 'text-ink hover:text-accent hover:bg-bg-alt/50',
    danger: 'bg-red-900 text-white hover:bg-red-800 border border-red-900',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
