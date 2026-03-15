'use client';

import { createContext, useContext, useCallback, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Toast Types ──────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  dismissToast: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// ─── Toast Config ─────────────────────────────────────────────────────────────

const toastConfig: Record<ToastVariant, { icon: React.ReactNode; styles: string }> = {
  success: {
    icon: <CheckCircle size={18} className="text-emerald-400" />,
    styles: 'border-emerald-500/20 bg-emerald-500/5',
  },
  error: {
    icon: <XCircle size={18} className="text-red-400" />,
    styles: 'border-red-500/20 bg-red-500/5',
  },
  warning: {
    icon: <AlertCircle size={18} className="text-amber-400" />,
    styles: 'border-amber-500/20 bg-amber-500/5',
  },
  info: {
    icon: <Info size={18} className="text-blue-400" />,
    styles: 'border-blue-500/20 bg-blue-500/5',
  },
};

// ─── ToastItem ────────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = toastConfig[toast.variant];

  return (
    <div
      className={clsx(
        'flex items-start gap-3 p-4 rounded-xl border glass-strong shadow-elevated w-80 animate-toast-in',
        config.styles
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{toast.title}</p>
        {toast.description && (
          <p className="text-xs text-slate-400 mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-slate-500 hover:text-white transition-colors p-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── ToastProvider ────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerRefs.current[id]);
    delete timerRefs.current[id];
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).slice(2);
      const duration = toast.duration ?? 4000;

      setToasts((prev) => [...prev.slice(-4), { ...toast, id }]);

      timerRefs.current[id] = setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
