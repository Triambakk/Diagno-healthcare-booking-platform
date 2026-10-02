import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast viewport */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 border bg-[#FAF8F5] shadow-xl transition-all duration-300 transform translate-y-0 ${
              toast.type === 'error'
                ? 'border-accent text-ink'
                : toast.type === 'success'
                ? 'border-ink text-ink'
                : 'border-border text-ink'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#111110] mt-0.5 flex-shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-ink-muted mt-0.5 flex-shrink-0" />}
            <div className="flex-1 text-xs font-medium tracking-wide uppercase">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-ink-muted hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
