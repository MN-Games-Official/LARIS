'use client';

import { clsx } from 'clsx';

// ─── Card ─────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ children, className, hover = false, glow = false, onClick, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'card rounded-2xl',
        paddingMap[padding],
        hover && 'card-interactive hover:border-primary/30',
        glow && 'glow-primary',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

// ─── Card Header ──────────────────────────────────────────────────────────────

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('flex items-center justify-between mb-6', className)}>
      {children}
    </div>
  );
}

// ─── Card Title ───────────────────────────────────────────────────────────────

export function CardTitle({
  children,
  subtitle,
  className,
}: {
  children: React.ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="text-lg font-bold text-white font-heading">{children}</h2>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Card Divider ─────────────────────────────────────────────────────────────

export function CardDivider({ className }: { className?: string }) {
  return <div className={clsx('divider my-6', className)} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon?: React.ReactNode;
  accent?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  loading?: boolean;
  className?: string;
}

const accentStyles = {
  primary: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  secondary: { bg: 'bg-secondary/10', text: 'text-secondary', border: 'border-secondary/20' },
  accent: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  success: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  warning: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
};

export function StatCard({ title, value, change, icon, accent = 'primary', loading = false, className }: StatCardProps) {
  const style = accentStyles[accent];

  return (
    <div className={clsx('card p-6 group hover:border-primary/20 transition-all', className)}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-widest">{title}</p>
        {icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', style.bg, style.text, style.border)}>
            {icon}
          </div>
        )}
      </div>

      {loading ? (
        <div className="shimmer-bg h-8 w-24 rounded-lg mb-2" />
      ) : (
        <p className="text-3xl font-bold text-white font-heading">{value}</p>
      )}

      {change && !loading && (
        <p className={clsx('text-xs mt-2 font-medium', change.positive ? 'text-emerald-400' : 'text-red-400')}>
          {change.positive ? '↑' : '↓'} {change.value}
        </p>
      )}
    </div>
  );
}
