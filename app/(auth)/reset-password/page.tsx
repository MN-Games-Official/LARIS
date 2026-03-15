'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';

const schema = z.object({
  new_password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[^a-zA-Z0-9]/),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] });

type FormData = z.infer<typeof schema>;

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [showPw, setShowPw] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    const res = await fetch('/api/password/reset', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...data }),
    });
    const json = await res.json();
    if (!json.success) { setError(json.error || 'Reset failed'); return; }
    setSuccess(true);
  };

  if (success) return (
    <div className="text-center space-y-4 animate-fade-in">
      <div className="text-4xl">🎉</div>
      <h1 className="text-2xl font-bold text-white font-heading">Password reset!</h1>
      <p className="text-slate-400 text-sm">You can now log in with your new password.</p>
      <Link href="/login"><Button variant="primary" size="md" fullWidth className="mt-4">Sign In</Button></Link>
    </div>
  );

  if (!token) return (
    <div className="text-center"><Alert variant="error">Invalid reset link. <Link href="/forgot-password" className="underline">Request a new one.</Link></Alert></div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading mb-1">Reset password</h1>
        <p className="text-slate-500 text-sm">Choose a strong new password.</p>
      </div>
      {error && <Alert variant="error" className="mb-5">{error}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {['new_password', 'confirm_password'].map((field) => (
          <div key={field} className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest">
              {field === 'new_password' ? 'New Password' : 'Confirm Password'}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={16} /></div>
              <input type={showPw ? 'text' : 'password'} placeholder="••••••••"
                className={`input-base h-11 pl-10 pr-10 ${(errors as any)[field] ? 'border-red-500/60' : ''}`}
                {...register(field as any)} />
              {field === 'new_password' && (
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
            {(errors as any)[field] && <p className="text-red-400 text-xs">{(errors as any)[field]?.message}</p>}
          </div>
        ))}
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>Reset Password</Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={null}><ResetForm /></Suspense>;
}
