'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, FileText, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState, Loading } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatRelative } from '@/lib/formatters';
import type { ApplicationListItem } from '@/types';

export default function ApplicationCenterPage() {
  const { showToast } = useToast();
  const [apps, setApps] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = apps.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((d) => setApps(d.applications || []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApps((prev) => prev.filter((a) => a.id !== id));
        showToast({ variant: 'success', title: 'Application deleted' });
      } else {
        showToast({ variant: 'error', title: 'Failed to delete' });
      }
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loading size="lg" text="Loading applications…" /></div>;
  }

  return (
    <div className="space-y-6 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Application Center</h1>
          <p className="text-slate-500 text-sm mt-1">Build and manage Q&A application forms for your Roblox group</p>
        </div>
        <Link href="/dashboard/application-center/new">
          <Button variant="primary" leftIcon={<Plus size={15} />}>New Application</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search applications…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base h-10 pl-9 pr-4"
        />
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title={search ? 'No results found' : 'No applications yet'}
          description={search ? 'Try a different search term.' : 'Create your first application form to start collecting submissions and auto-promoting group members.'}
          action={!search && (
            <Link href="/dashboard/application-center/new">
              <Button variant="primary" leftIcon={<Plus size={15} />}>Create Application</Button>
            </Link>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 stagger-children">
          {filtered.map((app) => {
            const passRate = app.submission_count > 0 ? Math.round((app.pass_count / app.submission_count) * 100) : 0;
            return (
              <div key={app.id} className="card p-6 hover:border-primary/20 transition-all group">
                <div className="flex items-start justify-between gap-4 mb-4">
                  {/* Color swatch + name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex-shrink-0 shadow-md"
                      style={{ background: `linear-gradient(135deg, ${app.primary_color}, ${app.secondary_color})` }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-white truncate">{app.name}</h3>
                      {app.description && (
                        <p className="text-xs text-slate-500 truncate">{app.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={app.is_active ? 'success' : 'neutral'} dot>
                    {app.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Group', value: app.group_id },
                    { label: 'Submissions', value: app.submission_count },
                    { label: 'Pass Rate', value: `${passRate}%` },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-[12px] text-slate-500 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-white font-semibold text-sm mt-0.5">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-slate-600">Updated {formatRelative(app.updated_at)}</span>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/application-center/${app.id}`}>
                      <Button variant="ghost" size="xs" leftIcon={<Edit2 size={13} />}>Edit</Button>
                    </Link>
                    <Button
                      variant="danger"
                      size="xs"
                      leftIcon={<Trash2 size={13} />}
                      loading={deleting === app.id}
                      onClick={() => handleDelete(app.id, app.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
