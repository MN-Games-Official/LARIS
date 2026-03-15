'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState, Loading } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatRelative } from '@/lib/formatters';
import type { RankCenterListItem } from '@/types';

export default function RankCenterPage() {
  const { showToast } = useToast();
  const [centers, setCenters] = useState<RankCenterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/rank-centers').then((r) => r.json()).then((d) => setCenters(d.rank_centers || [])).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/rank-centers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCenters((p) => p.filter((c) => c.id !== id));
      showToast({ variant: 'success', title: 'Rank center deleted' });
    } else {
      showToast({ variant: 'error', title: 'Delete failed' });
    }
    setDeleting(null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loading size="lg" text="Loading rank centers…" /></div>;

  return (
    <div className="space-y-6 page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Rank Center</h1>
          <p className="text-slate-500 text-sm mt-1">Configure group ranks with Gamepass integration</p>
        </div>
        <Link href="/dashboard/rank-center/new">
          <Button variant="primary" leftIcon={<Plus size={15} />}>New Rank Center</Button>
        </Link>
      </div>

      {centers.length === 0 ? (
        <EmptyState
          icon={<Star size={28} />}
          title="No rank centers yet"
          description="Create a rank center to manage your group's ranks with Gamepass integration and regional pricing."
          action={<Link href="/dashboard/rank-center/new"><Button variant="primary" leftIcon={<Plus size={15} />}>Create Rank Center</Button></Link>}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 stagger-children">
          {centers.map((center) => (
            <div key={center.id} className="card p-6 hover:border-secondary/20 transition-all">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/15 flex items-center justify-center text-secondary">
                    <Star size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{center.name}</h3>
                    <p className="text-xs text-slate-500">Group {center.group_id}{center.universe_id ? ` • Universe ${center.universe_id}` : ''}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{center.rank_count}</p>
                  <p className="text-[11px] text-slate-500">ranks</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-slate-600">Updated {formatRelative(center.updated_at)}</span>
                <div className="flex gap-2">
                  <Link href={`/dashboard/rank-center/${center.id}`}>
                    <Button variant="ghost" size="xs" leftIcon={<Edit2 size={13} />}>Edit</Button>
                  </Link>
                  <Button variant="danger" size="xs" leftIcon={<Trash2 size={13} />} loading={deleting === center.id} onClick={() => handleDelete(center.id, center.name)}>Delete</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
