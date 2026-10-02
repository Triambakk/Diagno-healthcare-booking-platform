import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-ink p-8 shadow-2xl z-10 animate-fadeIn">
        <div className="flex items-start justify-between pb-6 border-b border-border">
          <div>
            <h3 className="font-display font-bold text-xl uppercase tracking-tight text-ink">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs font-mono text-ink-muted uppercase tracking-wider mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 border border-border text-ink-muted hover:text-ink hover:border-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-6">{children}</div>
      </div>
    </div>
  );
};
