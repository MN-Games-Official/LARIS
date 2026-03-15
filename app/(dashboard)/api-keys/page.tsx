'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Key, Shield, ExternalLink, Plus, Trash2, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/formatters';

export default function ApiKeysPage() {
  const { showToast } = useToast();
  const [robloxKey, setRobloxKey] = useState<any>(null);
  const [polarisKeys, setPolarisKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/api-keys/roblox').then((r) => r.json()),
      fetch('/api/api-keys/polaris').then((r) => r.json()),
    ]).then(([rData, pData]) => {
      setRobloxKey(rData.key || null);
      setPolarisKeys(pData.keys || []);
    }).finally(() => setLoading(false));
  }, []);

  const handleDeletePolaris = async (id: number) => {
    if (!confirm('Revoke this API key? This action is permanent.')) return;
    await fetch(`/api/api-keys/polaris`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setPolarisKeys((p) => p.filter((k) => k.id !== id));
    showToast({ variant: 'success', title: 'API key revoked' });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loading size="lg" text="Loading API keys…" /></div>;

  return (
    <div className="space-y-8 page-enter">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">API Keys</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your Roblox API key and Polaris integration keys</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Roblox Key" value={robloxKey ? 'Active' : 'None'} icon={<Key size={18} />} accent={robloxKey ? 'success' : 'warning'} />
        <StatCard title="Polaris Keys" value={polarisKeys.length} icon={<Shield size={18} />} accent="secondary" />
        <StatCard title="Active Keys" value={polarisKeys.filter((k) => k.is_active).length} icon={<CheckCircle size={18} />} accent="accent" />
      </div>

      {/* Roblox API Key */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-heading">Roblox API Key</h2>
            <p className="text-slate-500 text-sm">Used for group membership lookups and user promotions</p>
          </div>
          <Link href="/dashboard/api-keys/roblox">
            <Button variant={robloxKey ? 'secondary' : 'primary'} size="sm">
              {robloxKey ? 'Update Key' : 'Add Key'}
            </Button>
          </Link>
        </div>

        {robloxKey ? (
          <div className="flex items-center gap-4 p-4 glass rounded-xl border border-emerald-500/10">
            <div className="status-dot active" />
            <div className="flex-1">
              <p className="text-white font-mono text-sm">{robloxKey.key_prefix}</p>
              <p className="text-slate-500 text-xs mt-0.5">Added {formatDate(robloxKey.created_at)}</p>
            </div>
            <Badge variant="success" dot>Active</Badge>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 glass rounded-xl border border-amber-500/10">
            <div className="status-dot inactive" />
            <div>
              <p className="text-amber-400 text-sm font-medium">No Roblox API key configured</p>
              <p className="text-slate-500 text-xs">Required for auto-promotion after application submissions</p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-white/5">
          <a href="https://create.roblox.com/credentials" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors">
            Generate API key on Roblox Creator Hub <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* Polaris API Keys */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white font-heading">Polaris API Keys</h2>
            <p className="text-slate-500 text-sm">For integrating third-party services with Polaris Pilot</p>
          </div>
          <Link href="/dashboard/api-keys/polaris">
            <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>Generate Key</Button>
          </Link>
        </div>

        {polarisKeys.length === 0 ? (
          <div className="border-2 border-dashed border-white/6 rounded-xl p-8 text-center">
            <p className="text-slate-500 text-sm">No Polaris API keys generated yet.</p>
            <Link href="/dashboard/api-keys/polaris" className="inline-block mt-3">
              <Button variant="outline" size="sm">Generate your first key</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {polarisKeys.map((k) => (
              <div key={k.id} className="flex items-center gap-4 p-4 glass rounded-xl border border-white/5">
                <div className="status-dot active" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{k.name || 'Unnamed Key'}</p>
                  <p className="text-slate-500 font-mono text-xs">{k.key_prefix}</p>
                  {k.scopes?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {k.scopes.slice(0, 4).map((s: string) => (
                        <Badge key={s} variant="purple" className="text-[10px]">{s}</Badge>
                      ))}
                      {k.scopes.length > 4 && <Badge variant="neutral" className="text-[10px]">+{k.scopes.length - 4}</Badge>}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-slate-600 text-xs">Created {formatDate(k.created_at)}</p>
                  {k.last_used && <p className="text-slate-600 text-xs">Last used {formatDate(k.last_used)}</p>}
                </div>
                <Button variant="danger" size="xs" leftIcon={<Trash2 size={12} />} onClick={() => handleDeletePolaris(k.id)}>Revoke</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
