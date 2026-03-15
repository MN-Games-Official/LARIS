'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await fetch('/api/password/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) {
        setServerError(json.error || 'Failed to send reset link');
        return;
      }
      setSent(true);
    } catch {
      setServerError('Network error. Please try again.');
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="text-4xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-white font-heading">Check your inbox</h1>
        <p className="text-slate-400 text-sm">If that email exists, a reset link has been sent. Check spam if you don&apos;t see it.</p>
        <Link href="/login"><Button variant="outline" size="md" fullWidth className="mt-4">Back to Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/login" className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm mb-8 transition-colors w-fit">
        <ArrowLeft size={14} /> Back to sign in
      </Link>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading mb-1">Forgot password?</h1>
        <p className="text-slate-500 text-sm">Enter your email and we&apos;ll send a reset link.</p>
      </div>
      {serverError && <Alert variant="error" className="mb-5">{serverError}</Alert>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest">Email Address</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Mail size={16} /></div>
            <input type="email" placeholder="you@example.com" autoFocus className={`input-base h-11 pl-10 pr-4 ${errors.email ? 'border-red-500/60' : ''}`} {...register('email')} />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>
        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>Send Reset Link</Button>
      </form>
    </div>
  );
}
