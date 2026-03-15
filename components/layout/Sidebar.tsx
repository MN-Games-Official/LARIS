'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileText,
  Star,
  Key,
  User,
  Settings,
  LogOut,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Application Center', href: '/dashboard/application-center', icon: FileText },
  { label: 'Rank Center', href: '/dashboard/rank-center', icon: Star },
  { label: 'API Keys', href: '/dashboard/api-keys', icon: Key },
] as const;

const bottomItems = [
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
] as const;

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobile, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }, [router]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={clsx(
        'sidebar flex flex-col',
        mobile && 'relative w-full h-full border-r-0'
      )}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center shadow-button-primary">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight tracking-tight font-heading">
              Polaris<span className="text-primary">Pilot</span>
            </h1>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <p className="section-title px-3 mb-3">Navigation</p>
        {navItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={clsx('sidebar-link', isActive(href) && 'active')}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {isActive(href) && (
              <ChevronRight size={14} className="text-primary/60" />
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom items */}
      <div className="px-3 py-3 border-t border-white/5 space-y-1">
        {bottomItems.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={clsx('sidebar-link', isActive(href) && 'active')}
          >
            <Icon size={18} className="flex-shrink-0" />
            <span>{label}</span>
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/8"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Version tag */}
      <div className="px-6 py-3 border-t border-white/5">
        <p className="text-[11px] text-slate-700">Polaris Pilot v1.0.0</p>
      </div>
    </aside>
  );
}
