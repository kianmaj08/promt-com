'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, Eye } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import EvaluationResult from '@/components/prompts/EvaluationResult';
import EvaluationLoader from '@/components/prompts/EvaluationLoader';
import { CATEGORIES, AI_TOOLS, LANGUAGES, MAX_PROMPT_LENGTH, MAX_TITLE_LENGTH } from '@/lib/constants';
import { parseTags, cn } from '@/lib/utils';
import showToast from '@/components/ui/Toast';
import type { AiFeedback, PromptStatus } from '@/types';

type Stage = 'form' | 'evaluating' | 'result';

export default function SubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<Stage>('form');
  const [form, setForm] = useState({
    title: '',
    content: searchParams.get('content') ?? '',
    description: '',
    category: searchParams.get('category') ?? '',
    subcategory: '',
    ai_tool: searchParams.get('ai_tool') ?? 'ChatGPT',
    language: 'English',
    tags: [] as string[],
  });
  const remixId = searchParams.get('remix');
  const isRemix = !!remixId;
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [evaluation, setEvaluation] = useState<AiFeedback | null>(null);
  const [resultStatus, setResultStatus] = useState<PromptStatus>('published');
  const [promptId, setPromptId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Subcategories for selected category
  const selectedCat = CATEGORIES.find(c => c.slug === form.category || c.name === form.category);

  const update = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const addTag = () => {
    const tags = parseTags(tagInput);
    const merged = Array.from(new Set([...form.tags, ...tags])).slice(0, 10);
    update('tags', merged);
    setTagInput('');
  };

  const removeTag = (tag: string) => update('tags', form.tags.filter(t => t !== tag));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (form.title.length > MAX_TITLE_LENGTH) e.title = `Max ${MAX_TITLE_LENGTH} characters`;
    if (!form.content.trim()) e.content = 'Prompt content is required';
    if (form.content.length > MAX_PROMPT_LENGTH) e.content = `Max ${MAX_PROMPT_LENGTH} characters`;
    if (!form.category) e.category = 'Please select a category';
    if (!form.ai_tool) e.ai_tool = 'Please select an AI tool';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) { showToast.error('Please fix the errors below'); return; }

    setStage('evaluating');
    try {
      const res = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Submission failed');

      setEvaluation(json.data.evaluation);
      setResultStatus(json.data.status);
      setPromptId(json.data.prompt?.id ?? null);
      setStage('result');
    } catch (e: any) {
      showToast.error(e.message ?? 'Submission failed');
      setStage('form');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {stage === 'form' && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-black text-[#0a0a0a] dark:text-white mb-2">
                {isRemix ? '🔀 Submit Your Remix' : 'Submit a Prompt'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {isRemix
                  ? 'Your remixed prompt will be evaluated by AI before publishing.'
                  : 'Your prompt will be evaluated by Gemini 1.5 Flash before publishing.'}
              </p>
              {isRemix && (
                <div className="mt-3 flex items-center gap-2 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl px-4 py-3">
                  <span className="text-[#F5C518] text-sm">🔀</span>
                  <p className="text-sm text-[#0a0a0a] dark:text-white">
                    You are submitting a remix. Add a title and adjust the content as needed.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* Form */}
              <div className="lg:col-span-3 space-y-5">

                <Input
                  label="Title"
                  required
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  placeholder="Give your prompt a descriptive title"
                  error={errors.title}
                  maxLength={MAX_TITLE_LENGTH}
                />

                <Textarea
                  label="Prompt Content"
                  required
                  value={form.content}
                  onChange={e => update('content', e.target.value)}
                  placeholder="Write your full prompt here..."
                  error={errors.content}
                  showCount
                  maxLength={MAX_PROMPT_LENGTH}
                  className="min-h-[200px] font-mono text-sm"
                />

                <Textarea
                  label="Description"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  placeholder="Briefly explain what this prompt does and when to use it..."
                  className="min-h-[80px]"
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">
                      Category <span className="text-[#F5C518]">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={e => { update('category', e.target.value); update('subcategory', ''); }}
                      className={cn(
                        'w-full rounded-lg border bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white',
                        'px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518]',
                        errors.category ? 'border-red-500' : 'border-[#e5e5e5] dark:border-[#2a2a2a]'
                      )}
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
                    </select>
                    {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">Subcategory</label>
                    <select
                      value={form.subcategory}
                      onChange={e => update('subcategory', e.target.value)}
                      disabled={!selectedCat}
                      className="w-full rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518] disabled:opacity-50"
                    >
                      <option value="">Select subcategory...</option>
                      {selectedCat?.subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* AI Tool */}
                  <div>
                    <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">
                      AI Tool <span className="text-[#F5C518]">*</span>
                    </label>
                    <select
                      value={form.ai_tool}
                      onChange={e => update('ai_tool', e.target.value)}
                      className="w-full rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                    >
                      {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  {/* Language */}
                  <div>
                    <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">Language</label>
                    <select
                      value={form.language}
                      onChange={e => update('language', e.target.value)}
                      className="w-full rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                    >
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">
                    Tags <span className="text-gray-400 font-normal">(max 10)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags separated by commas..."
                      className="flex-1 rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                    />
                    <Button size="sm" variant="ghost" onClick={addTag} disabled={!tagInput.trim()}>Add</Button>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {form.tags.map(tag => (
                        <Badge key={tag} variant="tag" onRemove={() => removeTag(tag)}>#{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSubmit}
                  icon={<Send className="w-4 h-4" />}
                >
                  Submit & Get AI Evaluation
                </Button>
              </div>

              {/* Live Preview */}
              <div className="lg:col-span-2">
                <div className="sticky top-24">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Preview</h3>
                    <button onClick={() => setShowPreview(!showPreview)} className="lg:hidden text-xs text-[#F5C518]">
                      {showPreview ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <div className={cn('space-y-3', !showPreview && 'hidden lg:block')}>
                    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-4">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {form.category && <Badge variant="category">{selectedCat?.name ?? form.category}</Badge>}
                        {form.ai_tool && <Badge variant="tool">{form.ai_tool}</Badge>}
                      </div>
                      <h4 className="font-semibold text-[#0a0a0a] dark:text-white text-sm mb-2">
                        {form.title || <span className="text-gray-400">Your title here...</span>}
                      </h4>
                      {form.description && (
                        <p className="text-xs text-gray-500 mb-3">{form.description}</p>
                      )}
                      <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 border border-[#e5e5e5] dark:border-[#2a2a2a]">
                        <p className="text-xs font-mono text-gray-500 line-clamp-4">
                          {form.content || 'Your prompt will appear here...'}
                        </p>
                      </div>
                      {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {form.tags.map(t => <span key={t} className="text-xs text-gray-400">#{t}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl p-4">
                      <p className="text-xs text-[#0a0a0a] dark:text-white font-medium mb-1">⚡ AI Evaluation</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        After submission, Gemini 1.5 Flash will evaluate your prompt on 5 criteria and provide a quality score.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {stage === 'evaluating' && (
          <div className="max-w-lg mx-auto py-10">
            <EvaluationLoader />
          </div>
        )}

        {stage === 'result' && evaluation && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black text-[#0a0a0a] dark:text-white">Evaluation Complete</h2>
            </div>
            <EvaluationResult
              evaluation={evaluation}
              status={resultStatus}
              promptId={promptId ?? undefined}
              onRevise={() => setStage('form')}
              onSubmitAnyway={() => promptId && router.push(`/prompts/${promptId}`)}
            />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
