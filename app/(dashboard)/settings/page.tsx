'use client';

import { useState } from 'react';
import { Bell, Shield, Globe, Moon as MoonIcon, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDivider } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1 mr-4">
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full border-2 transition-all flex-shrink-0 ${checked ? 'bg-primary border-primary' : 'bg-white/5 border-white/15'}`}
      >
        <span
          className={`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-md transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({
    email_on_submission: true,
    email_on_pass: true,
    email_on_fail: false,
    auto_promote: true,
    webhook_enabled: false,
    webhook_url: '',
    dark_mode: true,
    compact_view: false,
  });
  const [saving, setSaving] = useState(false);

  const update = (key: string, value: boolean | string) => {
    setSettings((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Optimistic save — settings would be persisted via API in a full implementation
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    showToast({ variant: 'success', title: 'Settings saved!' });
  };

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure your Polaris Pilot preferences</p>
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Choose when to receive email notifications">
            <div className="flex items-center gap-2"><Bell size={18} className="text-primary" /> Email Notifications</div>
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-white/5">
          <Toggle checked={settings.email_on_submission} onChange={(v) => update('email_on_submission', v)} label="New Submission" description="Email when someone submits an application" />
          <Toggle checked={settings.email_on_pass} onChange={(v) => update('email_on_pass', v)} label="Applicant Passed" description="Email when an applicant passes the form" />
          <Toggle checked={settings.email_on_fail} onChange={(v) => update('email_on_fail', v)} label="Applicant Failed" description="Email when an applicant fails the form" />
        </div>
      </Card>

      {/* Auto-promotion */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Automatic group promotion behavior">
            <div className="flex items-center gap-2"><Shield size={18} className="text-secondary" /> Promotion Settings</div>
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-white/5">
          <Toggle checked={settings.auto_promote} onChange={(v) => update('auto_promote', v)} label="Auto-Promote on Pass" description="Automatically promote users who pass via Roblox API" />
        </div>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Forward submission events to an external webhook">
            <div className="flex items-center gap-2"><Globe size={18} className="text-cyan-400" /> Webhook</div>
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <Toggle checked={settings.webhook_enabled} onChange={(v) => update('webhook_enabled', v)} label="Enable Webhook" description="Send POST requests to your endpoint on key events" />
          {settings.webhook_enabled && (
            <div>
              <label className="form-label">Webhook URL</label>
              <input
                type="url"
                value={settings.webhook_url}
                onChange={(e) => update('webhook_url', e.target.value)}
                placeholder="https://your-site.com/webhook"
                className="input-base h-10 px-4"
              />
              <p className="text-[11px] text-slate-600 mt-1">Must be HTTPS. Events: submission.created, submission.passed, submission.failed</p>
            </div>
          )}
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Interface preferences">
            <div className="flex items-center gap-2"><MoonIcon size={18} className="text-amber-400" /> Appearance</div>
          </CardTitle>
        </CardHeader>
        <div className="divide-y divide-white/5">
          <Toggle checked={settings.dark_mode} onChange={(v) => update('dark_mode', v)} label="Dark Mode" description="Use dark theme across the admin portal (default)" />
          <Toggle checked={settings.compact_view} onChange={(v) => update('compact_view', v)} label="Compact View" description="Use denser layout with smaller cards" />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" leftIcon={<Save size={15} />} loading={saving} onClick={handleSave}>Save Settings</Button>
      </div>
    </div>
  );
}
