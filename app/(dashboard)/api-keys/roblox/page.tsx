'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Shield, Save, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

export default function RobloxApiKeyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [validate, setValidate] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState('');
  const [existing, setExisting] = useState<any>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    fetch('/api/api-keys/roblox').then((r) => r.json()).then((d) => setExisting(d.key || null));
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) { setError('Please enter an API key'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/api-keys/roblox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: apiKey.trim(), validate }),
      });
      const json = await res.json();
      if (!json.success) {
        setValidationStatus('invalid');
        setError(json.error || 'Failed to save');
        return;
      }
      setValidationStatus('valid');
      setExisting(json.key);
      setApiKey('');
      showToast({ variant: 'success', title: 'Roblox API key saved!', description: validate ? 'Key validated and active.' : 'Key saved (not validated).' });
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  const handleRemove = async () => {
    if (!confirm('Remove your Roblox API key? Group promotions will stop working.')) return;
    setRemoving(true);
    await fetch('/api/api-keys/roblox', { method: 'DELETE' });
    setExisting(null);
    showToast({ variant: 'info', title: 'Roblox API key removed' });
    setRemoving(false);
  };

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">Roblox API Key</h1>
        <p className="text-slate-500 text-sm mt-1">Required for auto-promoting applicants in your Roblox group</p>
      </div>

      {/* Current key */}
      {existing && (
        <Card>
          <CardHeader>
            <CardTitle subtitle="Your currently active Roblox API key">Active Key</CardTitle>
            <Badge variant="success" dot>Active</Badge>
          </CardHeader>
          <div className="flex items-center gap-3 p-3 glass rounded-xl font-mono text-sm text-white mb-4">
            <Shield size={16} className="text-emerald-400 flex-shrink-0" />
            <span className="flex-1">{existing.key_prefix}</span>
            <span className="text-slate-600 text-xs">encrypted</span>
          </div>
          <Button variant="danger" size="sm" leftIcon={<Trash2 size={14} />} loading={removing} onClick={handleRemove}>
            Remove Key
          </Button>
        </Card>
      )}

      {/* Add/Update form */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Paste your Roblox Cloud API key below">
            {existing ? 'Update Key' : 'Add Roblox API Key'}
          </CardTitle>
        </CardHeader>

        {error && <Alert variant="error" className="mb-4" onClose={() => setError('')}>{error}</Alert>}

        {validationStatus === 'valid' && !error && (
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-4">
            <CheckCircle size={15} /> Key validated successfully
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="form-label">API Key</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Paste your Roblox Cloud API key…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="input-base h-11 pl-4 pr-10 font-mono text-sm"
              />
              <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={validate} onChange={(e) => setValidate(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
            <div>
              <p className="text-sm text-white font-medium">Validate key against Roblox API</p>
              <p className="text-xs text-slate-500">Recommended — verifies the key is valid before saving</p>
            </div>
          </label>

          <Button variant="primary" fullWidth leftIcon={<Save size={15} />} loading={saving} onClick={handleSave}>
            {existing ? 'Update Key' : 'Save Key'}
          </Button>
        </div>

        <div className="mt-5 pt-5 border-t border-white/5 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Required Permissions</p>
          {['Group: Read', 'Group: Write', 'Group Membership: Read', 'Group Membership: Write'].map((perm) => (
            <div key={perm} className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle size={12} className="text-emerald-400" /> {perm}
            </div>
          ))}
          <a href="https://create.roblox.com/credentials" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-dark transition-colors mt-2">
            Open Roblox Creator Hub <ExternalLink size={11} />
          </a>
        </div>
      </Card>
    </div>
  );
}
