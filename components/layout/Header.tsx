'use client';

import { useState } from 'react';
import { Bell, Menu, X, Search, User } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { Sidebar } from './Sidebar';

interface HeaderProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
  username?: string;
  email?: string;
}

export function Header({ title, breadcrumbs, actions, username, email }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 glass-strong border-b border-white/5 h-16 flex items-center px-4 md:px-6 gap-4">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          onClick={() => setMobileOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs / Title */}
        <div className="flex-1 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav className="flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-slate-600">/</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className={clsx(
                        'hover:text-white transition-colors',
                        i === breadcrumbs.length - 1
                          ? 'text-white font-semibold'
                          : 'text-slate-500'
                      )}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        i === breadcrumbs.length - 1
                          ? 'text-white font-semibold'
                          : 'text-slate-500'
                      }
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          ) : title ? (
            <h1 className="text-base font-bold text-white">{title}</h1>
          ) : null}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {actions}

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Bell size={18} />
          </button>

          {/* Avatar */}
          <Link href="/dashboard/profile">
            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
              {username ? username[0].toUpperCase() : <User size={14} />}
            </div>
          </Link>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-72 h-full bg-surface border-r border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-end px-4 py-3 border-b border-white/5">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <Sidebar mobile onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
