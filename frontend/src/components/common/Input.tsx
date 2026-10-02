import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-2xs font-mono uppercase tracking-widest text-ink-muted font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full bg-[#FAF8F5] border px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-ink transition-colors ${
            error ? 'border-accent bg-accent/5' : 'border-border'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="text-2xs font-mono text-accent uppercase tracking-wider mt-1">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-2xs font-mono text-ink-muted tracking-wide mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
