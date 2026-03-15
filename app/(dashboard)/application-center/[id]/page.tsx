'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { PRESET_COLORS, DEFAULT_PRIMARY_COLOR, DEFAULT_SECONDARY_COLOR, QUESTION_TYPES, FORM_VIBES } from '@/lib/constants';
import type { Question } from '@/types';
import {
  Plus, Save, ArrowLeft, Trash2, GripVertical, Sparkles
} from 'lucide-react';
import Link from 'next/link';

// Form schema for basic fields only (questions managed as separate state)
const appFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().max(500).optional(),
  group_id: z.string().regex(/^\d+$/, 'Group ID must be numeric'),
  target_role: z.string().min(1, 'Target role is required').max(100),
  pass_score: z.number().min(0).max(100),
});
type AppFormData = z.infer<typeof appFormSchema>;

// ─── Question Editor Modal ────────────────────────────────────────────────────

interface QuestionEditorProps {
  question?: Question;
  onSave: (q: Question) => void;
  onClose: () => void;
  isOpen: boolean;
}

function QuestionEditorModal({ question, onSave, onClose, isOpen }: QuestionEditorProps) {
  const [type, setType] = useState<Question['type']>(question?.type || 'multiple_choice');
  const [text, setText] = useState(question?.text || '');
  const [options, setOptions] = useState<string[]>(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState<any>(question?.correct_answer ?? 0);
  const [maxScore, setMaxScore] = useState(question?.max_score || 10);
  const [criteria, setCriteria] = useState(question?.grading_criteria || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');
    if (!text.trim()) { setError('Question text is required'); return; }
    if (type === 'multiple_choice' && options.some((o) => !o.trim())) {
      setError('All options must have text'); return;
    }
    const q: Question = {
      id: question?.id || `q_${Date.now()}`,
      type,
      text: text.trim(),
      options: type === 'multiple_choice' ? options : undefined,
      correct_answer: type === 'true_false' ? correctAnswer === 'true' : correctAnswer,
      max_score: maxScore,
      grading_criteria: type === 'short_answer' ? criteria || undefined : undefined,
    };
    onSave(q);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={question ? 'Edit Question' : 'Add Question'}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Question</Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        {/* Type selector */}
        <div>
          <label className="form-label">Question Type</label>
          <div className="flex gap-2 flex-wrap">
            {QUESTION_TYPES.map((qt) => (
              <button
                key={qt.value}
                onClick={() => { setType(qt.value as Question['type']); setCorrectAnswer(qt.value === 'true_false' ? 'true' : 0); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${type === qt.value ? 'bg-primary/15 border-primary/30 text-primary' : 'border-white/8 text-slate-400 hover:border-white/15'}`}
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question text */}
        <div>
          <label className="form-label">Question Text <span className="text-primary">*</span></label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter your question…"
            rows={3}
            className="input-base px-4 py-3 resize-none"
          />
        </div>

        {/* Multiple choice options */}
        {type === 'multiple_choice' && (
          <div>
            <label className="form-label">Options</label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrectAnswer(i)}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${correctAnswer === i ? 'border-primary bg-primary' : 'border-white/20'}`}
                  />
                  <input
                    value={opt}
                    onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="input-base h-9 px-3 flex-1"
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">Click the circle to select the correct answer</p>
          </div>
        )}

        {/* Short answer criteria */}
        {type === 'short_answer' && (
          <div>
            <label className="form-label">Grading Criteria</label>
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="Describe what a good answer looks like for AI grading…"
              rows={2}
              className="input-base px-4 py-3 resize-none"
            />
          </div>
        )}

        {/* True/false */}
        {type === 'true_false' && (
          <div>
            <label className="form-label">Correct Answer</label>
            <div className="flex gap-3">
              {['true', 'false'].map((v) => (
                <button
                  key={v}
                  onClick={() => setCorrectAnswer(v)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm border transition-all capitalize ${correctAnswer === v ? v === 'true' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400' : 'border-white/8 text-slate-400'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Max score */}
        <div>
          <label className="form-label">Max Score</label>
          <input type="number" min={1} max={100} value={maxScore} onChange={(e) => setMaxScore(Number(e.target.value))} className="input-base h-10 px-4 w-24" />
        </div>
      </div>
    </Modal>
  );
}

// ─── AI Generator Modal ───────────────────────────────────────────────────────

interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
  onImport: (questions: Question[], mode: 'replace' | 'merge') => void;
  defaultValues: { name: string; group_id: string };
}

function AIGeneratorModal({ isOpen, onClose, appId, onImport, defaultValues }: AIGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<Question[] | null>(null);
  const [error, setError] = useState('');
  const [params, setParams] = useState({
    name: defaultValues.name || '',
    description: '',
    group_id: defaultValues.group_id || '',
    rank: '',
    questions_count: 6,
    vibe: 'professional',
    instructions: '',
  });

  const handleGenerate = async () => {
    if (!params.name || !params.group_id || !params.rank) {
      setError('Name, Group ID, and Target Rank are required'); return;
    }
    setGenerating(true);
    setError('');
    setGenerated(null);
    try {
      const res = await fetch(`/api/applications/${appId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!json.success) { setError(json.error || 'Generation failed'); return; }
      setGenerated(json.form.questions);
    } catch { setError('Network error'); }
    finally { setGenerating(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Form Generator" subtitle="Generate questions using Polaris AI" size="lg"
      footer={generated ? (
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={() => { onImport(generated!, 'merge'); onClose(); }}>Merge with Existing</Button>
          <Button variant="primary" onClick={() => { onImport(generated!, 'replace'); onClose(); }}>Replace All</Button>
        </>
      ) : undefined}
    >
      <div className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        {!generated ? (
          <>
            <div className="grid grid-cols-2 gap-4">
              {[['name', 'App Name', 'text'], ['group_id', 'Group ID', 'text'], ['rank', 'Target Rank', 'text'], ['questions_count', 'Question Count', 'number']].map(([key, label, type]) => (
                <div key={key}>
                  <label className="form-label">{label}</label>
                  <input
                    type={type}
                    value={(params as any)[key]}
                    onChange={(e) => setParams((p) => ({ ...p, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="input-base h-10 px-4"
                    min={type === 'number' ? 1 : undefined}
                    max={type === 'number' ? 20 : undefined}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="form-label">Tone/Vibe</label>
              <div className="flex gap-2 flex-wrap">
                {FORM_VIBES.map((v) => (
                  <button key={v.value} onClick={() => setParams((p) => ({ ...p, vibe: v.value }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${params.vibe === v.value ? 'bg-secondary/15 border-secondary/30 text-secondary' : 'border-white/8 text-slate-400'}`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="form-label">Custom Instructions (optional)</label>
              <textarea value={params.instructions} onChange={(e) => setParams((p) => ({ ...p, instructions: e.target.value }))}
                placeholder="Any custom requirements or topics…" rows={2} className="input-base px-4 py-3 resize-none" />
            </div>
            <Button variant="primary" fullWidth leftIcon={<Sparkles size={15} />} loading={generating} onClick={handleGenerate}>
              Generate with AI
            </Button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-emerald-400 font-semibold">✓ Generated {generated.length} questions! Choose how to import them:</p>
            {generated.map((q, i) => (
              <div key={q.id} className="glass p-3 rounded-xl text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={q.type === 'multiple_choice' ? 'primary' : q.type === 'short_answer' ? 'warning' : 'info'} className="text-[10px]">
                    {q.type.replace('_', ' ')}
                  </Badge>
                  <span className="text-slate-500 text-xs">max {q.max_score} pts</span>
                </div>
                <p className="text-white">{i + 1}. {q.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Main Application Builder ─────────────────────────────────────────────────

export default function ApplicationBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isNew = id === 'new';
  const { showToast } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [primaryColor, setPrimaryColor] = useState(DEFAULT_PRIMARY_COLOR);
  const [secondaryColor, setSecondaryColor] = useState(DEFAULT_SECONDARY_COLOR);
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>();
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<AppFormData>({
    resolver: zodResolver(appFormSchema),
    defaultValues: { pass_score: 70 },
  });

  const watchedName = watch('name') || '';
  const watchedGroupId = watch('group_id') || '';

  // Load existing application
  useEffect(() => {
    if (isNew) return;
    fetch(`/api/applications/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.success) { router.push('/dashboard/application-center'); return; }
        const app = d.application;
        setValue('name', app.name);
        setValue('description', app.description || '');
        setValue('group_id', app.group_id);
        setValue('target_role', app.target_role);
        setValue('pass_score', app.pass_score);
        setQuestions(app.questions || []);
        setPrimaryColor(app.primary_color || DEFAULT_PRIMARY_COLOR);
        setSecondaryColor(app.secondary_color || DEFAULT_SECONDARY_COLOR);
      })
      .finally(() => setLoading(false));
  }, [id, isNew, router, setValue]);

  const handleSaveQuestion = (q: Question) => {
    if (editingQuestion) {
      setQuestions((prev) => prev.map((existing) => existing.id === q.id ? q : existing));
    } else {
      setQuestions((prev) => [...prev, q]);
    }
    setEditingQuestion(undefined);
  };

  const handleDeleteQuestion = (qId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleImport = (newQuestions: Question[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setQuestions(newQuestions);
    } else {
      setQuestions((prev) => [...prev, ...newQuestions]);
    }
    showToast({ variant: 'success', title: `${newQuestions.length} questions ${mode === 'replace' ? 'imported' : 'merged'}` });
  };

  const onSubmit = async (data: AppFormData) => {
    if (questions.length === 0) {
      setServerError('Add at least one question');
      return;
    }
    const shortAnswerCount = questions.filter((q) => q.type === 'short_answer').length;
    if (shortAnswerCount > 3) {
      setServerError('Maximum 3 short-answer questions allowed');
      return;
    }

    setSaving(true);
    setServerError('');

    const payload = {
      ...data,
      questions,
      style: { primary_color: primaryColor, secondary_color: secondaryColor },
    };

    try {
      const url = isNew ? '/api/applications' : `/api/applications/${id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!json.success) { setServerError(json.error || 'Save failed'); return; }

      showToast({ variant: 'success', title: isNew ? 'Application created!' : 'Application saved!' });
      if (isNew) router.push(`/dashboard/application-center/${json.application.id}`);
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loading size="lg" text="Loading…" /></div>;
  }

  const shortAnswerCount = questions.filter((q) => q.type === 'short_answer').length;

  return (
    <div className="space-y-6 page-enter max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/application-center">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={15} />}>Back</Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white font-heading">
            {isNew ? 'New Application' : 'Edit Application'}
          </h1>
        </div>
        <Button variant="primary" leftIcon={<Sparkles size={15} />} onClick={() => setAiModalOpen(true)}>
          AI Generate
        </Button>
        <Button variant="secondary" leftIcon={<Save size={15} />} loading={saving} onClick={handleSubmit(onSubmit)}>
          Save
        </Button>
      </div>

      {serverError && <Alert variant="error" onClose={() => setServerError('')}>{serverError}</Alert>}

      <form className="space-y-6">
        {/* Basic Info */}
        <div className="form-section space-y-4">
          <h2 className="text-base font-semibold text-white">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Application Name <span className="text-primary">*</span></label>
              <input placeholder="e.g. Moderator Application" className={`input-base h-10 px-4 ${errors.name ? 'border-red-500/60' : ''}`} {...register('name')} />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="form-label">Group ID <span className="text-primary">*</span></label>
              <input placeholder="e.g. 123456" className={`input-base h-10 px-4 ${errors.group_id ? 'border-red-500/60' : ''}`} {...register('group_id')} />
              {errors.group_id && <p className="text-red-400 text-xs mt-1">{errors.group_id.message}</p>}
            </div>
            <div>
              <label className="form-label">Target Role <span className="text-primary">*</span></label>
              <input placeholder='e.g. "rank: 218"' className={`input-base h-10 px-4 ${errors.target_role ? 'border-red-500/60' : ''}`} {...register('target_role')} />
              {errors.target_role && <p className="text-red-400 text-xs mt-1">{errors.target_role.message}</p>}
            </div>
            <div>
              <label className="form-label">Pass Score (%) <span className="text-primary">*</span></label>
              <input type="number" min={0} max={100} className={`input-base h-10 px-4 ${errors.pass_score ? 'border-red-500/60' : ''}`} {...register('pass_score', { valueAsNumber: true })} />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Description</label>
              <textarea rows={2} placeholder="Short description of this application…" className="input-base px-4 py-3 resize-none" {...register('description')} />
            </div>
          </div>
        </div>

        {/* Style */}
        <div className="form-section space-y-4">
          <h2 className="text-base font-semibold text-white">Style</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Primary Color', value: primaryColor, set: setPrimaryColor },
              { label: 'Secondary Color', value: secondaryColor, set: setSecondaryColor },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="form-label">{label}</label>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl border border-white/10 flex-shrink-0" style={{ background: value }} />
                  <input type="text" value={value} onChange={(e) => set(e.target.value)} className="input-base h-10 px-4 flex-1 font-mono text-sm" />
                  <input type="color" value={value} onChange={(e) => set(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => set(c)}
                      className={`color-swatch ${value === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Preview */}
          <div className="rounded-xl overflow-hidden border border-white/8">
            <div className="h-10 flex items-center px-4 gap-2" style={{ background: secondaryColor }}>
              <div className="w-2 h-2 rounded-full" style={{ background: primaryColor }} />
              <span className="text-xs font-medium text-white/70 font-mono">{watchedName || 'Application Preview'}</span>
            </div>
            <div className="p-4" style={{ background: `${secondaryColor}cc` }}>
              <div className="h-3 rounded" style={{ background: primaryColor, width: '60%', opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="form-section space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white">Questions ({questions.length})</h2>
              {shortAnswerCount > 0 && (
                <p className="text-xs text-slate-500 mt-0.5">{shortAnswerCount}/3 short-answer questions used</p>
              )}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => { setEditingQuestion(undefined); setQuestionModalOpen(true); }}
            >
              Add Question
            </Button>
          </div>

          {questions.length === 0 && (
            <div className="border-2 border-dashed border-white/8 rounded-xl p-8 text-center">
              <p className="text-slate-500 text-sm">No questions yet. Add questions or use AI to generate them.</p>
            </div>
          )}

          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={q.id} className="flex items-start gap-3 p-4 glass rounded-xl border border-white/5 hover:border-white/10 transition-all">
                <div className="text-slate-600 cursor-grab mt-0.5"><GripVertical size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">Q{i + 1}</span>
                    <Badge variant={q.type === 'multiple_choice' ? 'primary' : q.type === 'short_answer' ? 'warning' : 'info'} className="text-[10px]">
                      {q.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-600">{q.max_score} pts</span>
                  </div>
                  <p className="text-sm text-white truncate">{q.text}</p>
                  {q.type === 'multiple_choice' && q.options && (
                    <p className="text-xs text-slate-600 mt-0.5">{q.options.length} options • Answer: {String.fromCharCode(65 + (q.correct_answer as number))}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="xs" onClick={() => { setEditingQuestion(q); setQuestionModalOpen(true); }}>Edit</Button>
                  <Button type="button" variant="danger" size="xs" leftIcon={<Trash2 size={12} />} onClick={() => handleDeleteQuestion(q.id)}>Del</Button>
                </div>
              </div>
            ))}
          </div>

          {questions.length > 0 && (
            <div className="flex items-center justify-between pt-2 text-sm text-slate-500">
              <span>Total max score: {questions.reduce((s, q) => s + q.max_score, 0)} pts</span>
              <span>Pass threshold: {watch('pass_score') || 70}%</span>
            </div>
          )}
        </div>
      </form>

      {/* Question Editor Modal */}
      {questionModalOpen && (
        <QuestionEditorModal
          isOpen={questionModalOpen}
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => { setQuestionModalOpen(false); setEditingQuestion(undefined); }}
        />
      )}

      {/* AI Generator Modal */}
      {aiModalOpen && (
        <AIGeneratorModal
          isOpen={aiModalOpen}
          onClose={() => setAiModalOpen(false)}
          appId={isNew ? 'new' : id}
          onImport={handleImport}
          defaultValues={{ name: watchedName, group_id: watchedGroupId }}
        />
      )}
    </div>
  );
}
