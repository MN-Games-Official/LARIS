'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, Save, User, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDivider } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/formatters';

const profileSchema = z.object({
  username: z.string().min(3).max(32).optional().or(z.literal('')),
  full_name: z.string().max(64).optional().or(z.literal('')),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password required'),
  new_password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const profileForm = useForm<ProfileData>({ resolver: zodResolver(profileSchema) });
  const passwordForm = useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  useEffect(() => {
    fetch('/api/users/profile').then((r) => r.json()).then((d) => {
      if (d.success) {
        setUser(d.user);
        profileForm.setValue('username', d.user.username);
        profileForm.setValue('full_name', d.user.full_name || '');
        profileForm.setValue('avatar_url', d.user.avatar_url || '');
      }
    }).finally(() => setLoading(false));
  }, []);

  const onProfileSubmit = async (data: ProfileData) => {
    setProfileError('');
    const res = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) { setProfileError(json.error || 'Update failed'); return; }
    setUser(json.user);
    showToast({ variant: 'success', title: 'Profile updated!' });
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    setPasswordError('');
    const res = await fetch('/api/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) { setPasswordError(json.error || 'Failed to change password'); return; }
    showToast({ variant: 'success', title: 'Password changed!' });
    passwordForm.reset();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 page-enter max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your account information</p>
      </div>

      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-button-primary">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{user?.full_name || user?.username}</h2>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant={user?.email_verified ? 'success' : 'warning'} dot>
                {user?.email_verified ? 'Email Verified' : 'Email Not Verified'}
              </Badge>
              <span className="text-slate-600 text-xs">Joined {formatDate(user?.created_at)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile form */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Update your display name, username, and avatar">Profile Information</CardTitle>
        </CardHeader>
        {profileError && <Alert variant="error" className="mb-4" onClose={() => setProfileError('')}>{profileError}</Alert>}
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
          {[
            { key: 'username', label: 'Username', placeholder: 'username', icon: <User size={16} /> },
            { key: 'full_name', label: 'Full Name', placeholder: 'Your Name', icon: <User size={16} /> },
            { key: 'avatar_url', label: 'Avatar URL', placeholder: 'https://…', icon: <Mail size={16} /> },
          ].map(({ key, label, placeholder, icon }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">{icon}</div>
                <input placeholder={placeholder} className="input-base h-11 pl-10 pr-4" {...profileForm.register(key as any)} />
              </div>
              {(profileForm.formState.errors as any)[key] && (
                <p className="text-red-400 text-xs mt-1">{(profileForm.formState.errors as any)[key]?.message}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" leftIcon={<Save size={15} />} loading={profileForm.formState.isSubmitting}>Save Changes</Button>
          </div>
        </form>
      </Card>

      {/* Password form */}
      <Card>
        <CardHeader>
          <CardTitle subtitle="Minimum 8 characters with uppercase, number, and special character">Change Password</CardTitle>
        </CardHeader>
        {passwordError && <Alert variant="error" className="mb-4" onClose={() => setPasswordError('')}>{passwordError}</Alert>}
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {[
            { key: 'current_password', label: 'Current Password', show: showCurrentPw, toggle: () => setShowCurrentPw(v => !v) },
            { key: 'new_password', label: 'New Password', show: showNewPw, toggle: () => setShowNewPw(v => !v) },
            { key: 'confirm_password', label: 'Confirm Password', show: showNewPw, toggle: () => setShowNewPw(v => !v) },
          ].map(({ key, label, show, toggle }) => (
            <div key={key}>
              <label className="form-label">{label}</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={16} /></div>
                <input type={show ? 'text' : 'password'} placeholder="••••••••" className={`input-base h-11 pl-10 pr-10 ${(passwordForm.formState.errors as any)[key] ? 'border-red-500/60' : ''}`} {...passwordForm.register(key as any)} />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {(passwordForm.formState.errors as any)[key] && (
                <p className="text-red-400 text-xs mt-1">{(passwordForm.formState.errors as any)[key]?.message}</p>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" leftIcon={<Lock size={15} />} loading={passwordForm.formState.isSubmitting}>Change Password</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
