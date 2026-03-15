'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatRelative, formatDate } from '@/lib/formatters';
import { StatCard } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Badge';
import {
  FileText, Star, Key, TrendingUp, Users, CheckCircle,
  Plus, ExternalLink, Activity, Zap
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface RecentSubmission {
  id: string;
  roblox_user_id: string;
  passed: boolean;
  score: number;
  max_score: number;
  submitted_at: string;
  application: { name: string };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [submissions, setSubmissions] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [appsRes, centersRes, keysRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/rank-centers'),
          fetch('/api/api-keys/polaris'),
        ]);
        const [appsData, centersData] = await Promise.all([
          appsRes.json(),
          centersRes.json(),
        ]);

        const apps = appsData.applications || [];
        const totalSubmissions = apps.reduce((s: number, a: any) => s + (a.submission_count || 0), 0);
        const totalPass = apps.reduce((s: number, a: any) => s + (a.pass_count || 0), 0);

        setStats({
          total_applications: apps.length,
          total_submissions: totalSubmissions,
          total_pass: totalPass,
          pass_rate: totalSubmissions > 0 ? Math.round((totalPass / totalSubmissions) * 100) : 0,
          total_rank_centers: (centersData.rank_centers || []).length,
          roblox_key_active: false,
          polaris_keys_count: 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text="Loading dashboard…" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Applications', value: stats?.total_applications ?? 0, icon: <FileText size={18} />, accent: 'primary' as const },
    { title: 'Total Submissions', value: stats?.total_submissions ?? 0, icon: <Users size={18} />, accent: 'secondary' as const },
    { title: 'Pass Rate', value: `${stats?.pass_rate ?? 0}%`, icon: <TrendingUp size={18} />, accent: 'success' as const },
    { title: 'Rank Centers', value: stats?.total_rank_centers ?? 0, icon: <Star size={18} />, accent: 'accent' as const },
  ];

  return (
    <div className="space-y-8 page-enter">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your Polaris Pilot workspace</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/application-center/new">
            <Button variant="primary" size="sm" leftIcon={<Plus size={15} />}>
              New Application
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger-children animate-fade-in">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            icon: <FileText size={20} />,
            title: 'Application Center',
            description: 'Build and manage Q&A application forms for your Roblox group',
            href: '/dashboard/application-center',
            cta: 'Manage Applications',
            color: 'from-primary/10 to-primary/5 border-primary/15',
            iconColor: 'text-primary bg-primary/10',
          },
          {
            icon: <Star size={20} />,
            title: 'Rank Center',
            description: 'Configure ranks with Gamepass IDs, prices, and regional pricing',
            href: '/dashboard/rank-center',
            cta: 'Manage Ranks',
            color: 'from-secondary/10 to-secondary/5 border-secondary/15',
            iconColor: 'text-secondary bg-secondary/10',
          },
          {
            icon: <Key size={20} />,
            title: 'API Keys',
            description: 'Manage Roblox API keys and generate Polaris integration keys',
            href: '/dashboard/api-keys',
            cta: 'Manage Keys',
            color: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/15',
            iconColor: 'text-cyan-400 bg-cyan-500/10',
          },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="block group">
            <div className={`card p-6 bg-gradient-to-br ${item.color} hover:scale-[1.02] transition-all duration-200`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.iconColor}`}>
                {item.icon}
              </div>
              <h3 className="text-white font-semibold mb-1.5">{item.title}</h3>
              <p className="text-slate-500 text-sm mb-4">{item.description}</p>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
                {item.cta} <ExternalLink size={13} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Getting started callout */}
      {stats?.total_applications === 0 && (
        <div className="card p-8 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 border-white/5 text-center">
          <div className="w-14 h-14 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-button-primary">
            <Zap size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white font-heading mb-2">Ready to get started?</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Create your first application form, connect your Roblox API key, and start managing your group like a pro.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard/application-center/new">
              <Button variant="primary" leftIcon={<Plus size={15} />}>Create Application</Button>
            </Link>
            <Link href="/dashboard/api-keys/roblox">
              <Button variant="secondary" leftIcon={<Key size={15} />}>Add Roblox API Key</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
