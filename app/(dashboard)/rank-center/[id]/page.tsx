'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import Link from 'next/link';
import type { RankEntry } from '@/types';

const centerSchema = z.object({
  name: z.string().min(3).max(100),
  group_id: z.string().regex(/^\d+$/, 'Must be numeric'),
  universe_id: z.string().regex(/^\d+$/).optional().or(z.literal('')),
});
type CenterBasic = z.infer<typeof centerSchema>;

function newRankEntry(): RankEntry {
  return {
    id: `rank_${Date.now()}`,
    rank_id: 0,
    name: '',
    description: '',
    price: 0,
    is_for_sale: false,
    regional_pricing: false,
  };
}

export default function RankCenterBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';
  const { showToast } = useToast();
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [ranks, setRanks] = useState<RankEntry[]>([newRankEntry()]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CenterBasic>({
    resolver: zodResolver(centerSchema),
  });

  useEffect(() => {
    if (isNew) return;
    fetch(`/api/rank-centers/${id}`).then((r) => r.json()).then((d) => {
      if (!d.success) { router.push('/dashboard/rank-center'); return; }
      const c = d.rank_center;
      setValue('name', c.name);
      setValue('group_id', c.group_id);
      setValue('universe_id', c.universe_id || '');
      setRanks(c.ranks || [newRankEntry()]);
    }).finally(() => setLoading(false));
  }, [id, isNew, router, setValue]);

  const addRank = () => setRanks((p) => [...p, newRankEntry()]);
  const removeRank = (idx: number) => setRanks((p) => p.filter((_, i) => i !== idx));
  const updateRank = (idx: number, field: keyof RankEntry, value: any) => {
    setRanks((p) => { const n = [...p]; (n[idx] as any)[field] = value; return n; });
  };

  const onSubmit = async (data: CenterBasic) => {
    if (ranks.length === 0) { setServerError('Add at least one rank'); return; }
    setSaving(true);
    setServerError('');
    try {
      const url = isNew ? '/api/rank-centers' : `/api/rank-centers/${id}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ranks }),
      });
      const json = await res.json();
      if (!json.success) { setServerError(json.error || 'Save failed'); return; }
      showToast({ variant: 'success', title: isNew ? 'Rank center created!' : 'Rank center saved!' });
      if (isNew) router.push(`/dashboard/rank-center/${json.rank_center.id}`);
    } catch { setServerError('Network error. Try again.'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loading size="lg" /></div>;

  return (
    <div className="space-y-6 page-enter max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/rank-center"><Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={15} />}>Back</Button></Link>
        <h1 className="text-2xl font-bold text-white font-heading flex-1">{isNew ? 'New Rank Center' : 'Edit Rank Center'}</h1>
        <Button variant="primary" leftIcon={<Save size={15} />} loading={saving} onClick={handleSubmit(onSubmit)}>Save</Button>
      </div>
      {serverError && <Alert variant="error" onClose={() => setServerError('')}>{serverError}</Alert>}
      <form className="space-y-6">
        <div className="form-section space-y-4">
          <h2 className="text-base font-semibold text-white">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[['name', 'Center Name', 'e.g. Premium Ranks'], ['group_id', 'Group ID', 'e.g. 123456'], ['universe_id', 'Universe ID (optional)', 'e.g. 9876543']].map(([key, label, placeholder]) => (
              <div key={key}>
                <label className="form-label">{label}</label>
                <input placeholder={placeholder} className={`input-base h-10 px-4 ${(errors as any)[key] ? 'border-red-500/60' : ''}`} {...register(key as any)} />
                {(errors as any)[key] && <p className="text-red-400 text-xs mt-1">{(errors as any)[key]?.message}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Ranks ({ranks.length})</h2>
            <Button type="button" variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={addRank}>Add Rank</Button>
          </div>

          <div className="space-y-4">
            {ranks.map((rank, i) => (
              <div key={rank.id} className="glass p-5 rounded-xl border border-white/5 relative">
                <div className="absolute top-3 right-3">
                  <Button type="button" variant="danger" size="xs" leftIcon={<Trash2 size={12} />} onClick={() => removeRank(i)}>Remove</Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pr-24">
                  {[
                    { key: 'name', label: 'Rank Name', placeholder: 'e.g. Member', type: 'text' },
                    { key: 'rank_id', label: 'Rank ID (0-255)', placeholder: '0', type: 'number' },
                    { key: 'gamepass_id', label: 'Gamepass ID', placeholder: 'optional', type: 'number' },
                    { key: 'price', label: 'Price (Robux)', placeholder: '0', type: 'number' },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label className="form-label">{label}</label>
                      <input
                        type={type}
                        value={(rank as any)[key] ?? ''}
                        onChange={(e) => updateRank(i, key as keyof RankEntry, type === 'number' ? Number(e.target.value) : e.target.value)}
                        placeholder={placeholder}
                        className="input-base h-10 px-4"
                        min={type === 'number' ? 0 : undefined}
                        max={key === 'rank_id' ? 255 : undefined}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-3">
                    <label className="form-label">Description</label>
                    <input value={rank.description || ''} onChange={(e) => updateRank(i, 'description', e.target.value)} placeholder="e.g. Basic member rank" className="input-base h-10 px-4" />
                  </div>
                  <div className="flex items-center gap-6">
                    {[['is_for_sale', 'For Sale'], ['regional_pricing', 'Regional Pricing']].map(([k, l]) => (
                      <label key={k} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={(rank as any)[k]} onChange={(e) => updateRank(i, k as keyof RankEntry, e.target.checked)}
                          className="w-4 h-4 rounded border-white/20 accent-primary" />
                        <span className="text-slate-300">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
