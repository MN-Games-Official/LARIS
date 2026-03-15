'use client';

import { clsx } from 'clsx';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// ─── Badge ────────────────────────────────────────────────────────────────────

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'primary' | 'purple' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const badgeMap: Record<BadgeVariant, string> = {
  success: 'badge-success',
  error: 'badge-error',
  warning: 'badge-warning',
  info: 'badge-info',
  primary: 'badge-primary',
  purple: 'badge-purple',
  neutral: 'badge-neutral',
};

export function Badge({ variant = 'neutral', children, dot = false, className }: BadgeProps) {
  return (
    <span className={clsx('badge', badgeMap[variant], className)}>
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full', {
            'bg-emerald-400': variant === 'success',
            'bg-red-400': variant === 'error',
            'bg-amber-400': variant === 'warning',
            'bg-cyan-400': variant === 'info',
            'bg-primary': variant === 'primary',
            'bg-purple-400': variant === 'purple',
            'bg-slate-500': variant === 'neutral',
          })}
        />
      )}
      {children}
    </span>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────

type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const alertConfig: Record<AlertVariant, { icon: React.ReactNode; styles: string }> = {
  success: {
    icon: <CheckCircle size={18} />,
    styles: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
  },
  error: {
    icon: <XCircle size={18} />,
    styles: 'bg-red-500/10 border-red-500/20 text-red-300',
  },
  warning: {
    icon: <AlertCircle size={18} />,
    styles: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
  },
  info: {
    icon: <Info size={18} />,
    styles: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
  },
};

export function Alert({ variant, title, children, onClose, className }: AlertProps) {
  const config = alertConfig[variant];

  return (
    <div
      className={clsx(
        'flex gap-3 p-4 rounded-xl border animate-fade-in',
        config.styles,
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm mb-1">{title}</p>}
        <div className="text-sm opacity-80">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullPage?: boolean;
}

const loadingSizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-[3px]',
};

export function Loading({ size = 'md', text, fullPage = false }: LoadingProps) {
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={clsx(
          loadingSizes[size],
          'rounded-full border-white/10 border-t-primary animate-spin'
        )}
      />
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'shimmer-bg rounded-lg h-4',
              i === lines - 1 && 'w-2/3',
              className
            )}
          />
        ))}
      </div>
    );
  }

  return <div className={clsx('shimmer-bg rounded-lg', className)} />;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in',
        className
      )}
    >
      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-[320px] mb-6">{description}</p>}
      {action}
    </div>
  );
}
