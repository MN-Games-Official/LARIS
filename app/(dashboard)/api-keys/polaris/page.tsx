'use client';

import { useEffect, useState } from 'react';
import { Shield, Plus, Copy, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { POLARIS_SCOPES } from '@/lib/constants';
import { formatDate } from '@/lib/formatters';

export default function PolarisApiKeyPage() {
  const { showToast } = useToast();
  const [keys, setKeys] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', scopes: [] as string[], expires_in: '' });

  useEffect(() => {
    fetch('/api/api-keys/polaris').then((r) => r.json()).then((d) => setKeys(d.keys || []));
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || form.scopes.length === 0) {
      setError('Name and at least one scope are required'); return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/api-keys/polaris', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          scopes: form.scopes,
          expires_in: form.expires_in ? parseInt(form.expires_in) * 86400 : undefined,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error || 'Failed to create'); return; }
      setNewKey(json.api_key);
      setKeys((p) => [json.key, ...p]);
      setForm({ name: '', scopes: [], expires_in: '' });
    } catch { setError('Network error'); }
    finally { setCreating(false); }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    showToast({ variant: 'success', title: 'Copied to clipboard!' });
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Revoke this key? It will immediately stop working.')) return;
    await fetch('/api/api-keys/polaris', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    setKeys((p) => p.filter((k) => k.id !== id));
    showToast({ variant: 'info', title: 'API key revoked' });
  };

  const toggleScope = (scope: string) => {
    setForm((prev) => ({
      ...prev,
      scopes: prev.scopes.includes(scope) ? prev.scopes.filter((s) => s !== scope) : [...prev.scopes, scope],
    }));
  };

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Polaris API Keys</h1>
          <p className="text-slate-500 text-sm mt-1">Generate keys for third-party integrations</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => setModalOpen(true)}>Generate Key</Button>
      </div>

      {/* New key reveal */}
      {newKey && (
        <Alert variant="success">
          <div>
            <p className="font-semibold mb-2">Copy your API key — it won&apos;t be shown again!</p>
            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2.5 font-mono text-sm">
              <span className="flex-1 break-all">{showNewKey ? newKey : '•'.repeat(32)}</span>
              <button onClick={() => setShowNewKey((v) => !v)} className="text-slate-400 hover:text-white">
                {showNewKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={() => handleCopy(newKey)} className="text-slate-400 hover:text-emerald-400">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </Alert>
      )}

      {/* Keys list */}
      <Card>
        <CardHeader>
          <CardTitle subtitle={`${keys.length} API key${keys.length !== 1 ? 's' : ''} created`}>Active Keys</CardTitle>
        </CardHeader>

        {keys.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">No Polaris API keys yet.</div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <div key={k.id} className="flex items-start gap-3 p-4 glass rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                  <Shield size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">{k.name}</p>
                    <Badge variant="success" dot className="text-[10px]">Active</Badge>
                  </div>
                  <p className="text-slate-500 font-mono text-xs">{k.key_prefix}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(k.scopes || []).map((s: string) => (
                      <Badge key={s} variant="purple" className="text-[10px]">{s}</Badge>
                    ))}
                  </div>
                  <p className="text-slate-700 text-xs mt-1">Created {formatDate(k.created_at)}</p>
                </div>
                <Button variant="danger" size="xs" leftIcon={<Trash2 size={12} />} onClick={() => handleRevoke(k.id)}>Revoke</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setError(''); setNewKey(''); }}
        title="Generate API Key"
        subtitle="Choose a name and select permission scopes"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" loading={creating} onClick={handleCreate}>Generate Key</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <div>
            <label className="form-label">Key Name <span className="text-primary">*</span></label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. My Integration" className="input-base h-10 px-4" />
          </div>
          <div>
            <label className="form-label">Permission Scopes <span className="text-primary">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {POLARIS_SCOPES.map((scope) => (
                <button
                  key={scope.value}
                  type="button"
                  onClick={() => toggleScope(scope.value)}
                  className={`flex items-start gap-2 p-3 rounded-xl border text-left transition-all ${form.scopes.includes(scope.value) ? 'bg-secondary/10 border-secondary/30' : 'border-white/8 hover:border-white/15'}`}
                >
                  {form.scopes.includes(scope.value) && <CheckCircle size={14} className="text-secondary mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-white text-xs font-semibold">{scope.label}</p>
                    <p className="text-slate-500 text-[11px]">{scope.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Expires In (days, blank = never)</label>
            <input type="number" min={1} value={form.expires_in} onChange={(e) => setForm((p) => ({ ...p, expires_in: e.target.value }))} placeholder="e.g. 90" className="input-base h-10 px-4 w-40" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
