'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, Lock, User, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';
import { SignupSchema } from '@/lib/validation';
import { useToast } from '@/components/ui/Toast';
import type { z } from 'zod';

type FormData = z.infer<typeof SignupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(SignupSchema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!json.success) {
        setServerError(json.error || 'Signup failed');
        return;
      }

      setSuccess(true);
      showToast({ variant: 'success', title: 'Account created!', description: 'Check your email to verify your account.' });
    } catch {
      setServerError('Network error. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-3xl">
          ✉️
        </div>
        <h1 className="text-2xl font-bold text-white font-heading">Check your email</h1>
        <p className="text-slate-400 text-sm">
          We sent a verification email to activate your account. Check your inbox and spam folder.
        </p>
        <Link href="/login">
          <Button variant="outline" size="md" fullWidth className="mt-4">
            Back to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading mb-1">Create account</h1>
        <p className="text-slate-500 text-sm">Join Polaris Pilot to get started</p>
      </div>

      {serverError && (
        <Alert variant="error" className="mb-5" onClose={() => setServerError('')}>
          {serverError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest">
            Full Name <span className="text-slate-600 normal-case">(optional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><UserCircle size={16} /></div>
            <input type="text" placeholder="Your Name" className="input-base h-11 pl-10 pr-4" {...register('full_name')} />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest">Email Address <span className="text-primary">*</span></label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Mail size={16} /></div>
            <input type="email" placeholder="you@example.com" className={`input-base h-11 pl-10 pr-4 ${errors.email ? 'border-red-500/60' : ''}`} {...register('email')} />
          </div>
          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest">Username <span className="text-primary">*</span></label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><User size={16} /></div>
            <input type="text" placeholder="username" className={`input-base h-11 pl-10 pr-4 ${errors.username ? 'border-red-500/60' : ''}`} {...register('username')} />
          </div>
          {errors.username && <p className="text-red-400 text-xs">{errors.username.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest">Password <span className="text-primary">*</span></label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock size={16} /></div>
            <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" className={`input-base h-11 pl-10 pr-10 ${errors.password ? 'border-red-500/60' : ''}`} {...register('password')} />
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password ? (
            <p className="text-red-400 text-xs">{errors.password.message}</p>
          ) : (
            <p className="text-[11px] text-slate-600">Min 8 chars • 1 uppercase • 1 number • 1 special char</p>
          )}
        </div>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
