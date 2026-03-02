'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, ChevronLeft, Zap, Target,
  Settings, Eye, Send, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES, AI_TOOLS, LANGUAGES, TONE_OPTIONS, LENGTH_OPTIONS, GOAL_SUGGESTIONS } from '@/lib/constants';
import type { GeneratorParams, GeneratedPromptVariant, Tone, PromptLength } from '@/types';
import Button from '@/components/ui/Button';
import CopyButton from '@/components/prompts/CopyButton';
import VariantSelector from './VariantSelector';
import VariablesMode from './VariablesMode';
import ImproveMode from './ImproveMode';
import showToast from '@/components/ui/Toast';

const STEPS = [
  { id: 1, label: 'Goal', icon: <Target className="w-4 h-4" /> },
  { id: 2, label: 'Category', icon: <Zap className="w-4 h-4" /> },
  { id: 3, label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  { id: 4, label: 'Result', icon: <Eye className="w-4 h-4" /> },
];

function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
              current === step.id
                ? 'bg-[#F5C518] text-[#0a0a0a] shadow-lg scale-110'
                : current > step.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-400'
            )}>
              {current > step.id ? '✓' : step.id}
            </div>
            <span className={cn(
              'text-xs font-medium hidden sm:block transition-colors',
              current === step.id ? 'text-[#F5C518]' : current > step.id ? 'text-green-500' : 'text-gray-400'
            )}>
              {step.label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-2 transition-all duration-500',
              current > step.id ? 'bg-green-500' : 'bg-gray-200 dark:bg-[#2a2a2a]'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function GeneratorWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'result' | 'variants' | 'variables' | 'improve'>('result');

  // Form state
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('');
  const [aiTool, setAiTool] = useState('ChatGPT');
  const [tone, setTone] = useState<Tone>('casual');
  const [length, setLength] = useState<PromptLength>('medium');
  const [targetAudience, setTargetAudience] = useState('');
  const [language, setLanguage] = useState('English');
  const [style, setStyle] = useState('');

  // Results
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [variants, setVariants] = useState<GeneratedPromptVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<GeneratedPromptVariant | null>(null);
  const [editablePrompt, setEditablePrompt] = useState('');

  const suggestions = GOAL_SUGGESTIONS[category] ?? GOAL_SUGGESTIONS.default;
  const selectedCategory = CATEGORIES.find(c => c.slug === category);

  const handleGenerate = async () => {
    if (!goal.trim() || !category || !aiTool) {
      showToast.error('Please complete all required fields');
      return;
    }
    setLoading(true);

    try {
      const params: GeneratorParams = {
        goal, category, ai_tool: aiTool,
        tone, length, target_audience: targetAudience,
        language, style,
      };

      // Generate main prompt + variants in parallel
      const [promptRes, variantsRes] = await Promise.all([
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        }),
        fetch('/api/variants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goal, ...params }),
        }),
      ]);

      const [promptJson, variantsJson] = await Promise.all([
        promptRes.json(),
        variantsRes.json(),
      ]);

      if (!promptRes.ok) throw new Error(promptJson.error ?? 'Generation failed');

      const generated = promptJson.data.prompt;
      setGeneratedPrompt(generated);
      setEditablePrompt(generated);

      if (variantsRes.ok && variantsJson.data?.variants) {
        setVariants(variantsJson.data.variants);
      }

      setStep(4);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Generation failed';
      showToast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrompt = () => {
    const content = encodeURIComponent(editablePrompt);
    const cat = encodeURIComponent(category);
    const tool = encodeURIComponent(aiTool);
    router.push(`/submit?content=${content}&category=${cat}&ai_tool=${tool}`);
  };

  // ---- STEP 1: Goal ----
  const Step1 = (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0a0a0a] dark:text-white mb-1">
          What do you want to achieve?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Describe your goal — the more detail, the better your prompt.
        </p>
      </div>

      <textarea
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="e.g. Write a compelling product launch email for a SaaS tool targeting startup founders..."
        className={cn(
          'w-full rounded-xl border bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white',
          'border-[#e5e5e5] dark:border-[#2a2a2a] text-sm',
          'focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:border-[#F5C518]',
          'transition-all duration-200 resize-none py-3 px-4 min-h-[120px]'
        )}
      />

      {/* Quick suggestion chips */}
      <div>
        <p className="text-xs font-medium text-gray-400 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setGoal(s)}
              className={cn(
                'text-xs px-3 py-1.5 rounded-full border transition-all duration-200',
                goal === s
                  ? 'bg-[#F5C518] text-[#0a0a0a] border-[#F5C518] font-medium'
                  : 'bg-white dark:bg-[#1a1a1a] border-[#e5e5e5] dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-[#F5C518] hover:text-[#F5C518]'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ---- STEP 2: Category & AI Tool ----
  const Step2 = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0a0a0a] dark:text-white mb-1">
          Choose category & AI tool
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          This helps tailor the prompt to your use case.
        </p>
      </div>

      {/* Category grid */}
      <div>
        <p className="text-sm font-medium text-[#0a0a0a] dark:text-white mb-3">Category</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setCategory(cat.slug)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all duration-200',
                'focus:outline-none',
                category === cat.slug
                  ? 'border-[#F5C518] bg-[#F5C518]/10 shadow-sm'
                  : 'border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] hover:border-[#F5C518]/50'
              )}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-xs font-medium text-[#0a0a0a] dark:text-white leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Tool */}
      <div>
        <p className="text-sm font-medium text-[#0a0a0a] dark:text-white mb-3">AI Tool</p>
        <div className="flex flex-wrap gap-2">
          {AI_TOOLS.map((tool) => (
            <button
              key={tool}
              onClick={() => setAiTool(tool)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200',
                aiTool === tool
                  ? 'bg-[#0a0a0a] dark:bg-white text-white dark:text-[#0a0a0a] border-[#0a0a0a] dark:border-white'
                  : 'border-[#e5e5e5] dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-[#F5C518]'
              )}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ---- STEP 3: Parameters ----
  const Step3 = (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0a0a0a] dark:text-white mb-1">
          Fine-tune your prompt
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Adjust tone, length and other parameters.
        </p>
      </div>

      {/* Tone */}
      <div>
        <p className="text-sm font-medium text-[#0a0a0a] dark:text-white mb-3">Tone</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {TONE_OPTIONS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value as Tone)}
              className={cn(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                tone === t.value
                  ? 'border-[#F5C518] bg-[#F5C518]/10'
                  : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#F5C518]/50'
              )}
            >
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs font-medium text-[#0a0a0a] dark:text-white">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Length */}
      <div>
        <p className="text-sm font-medium text-[#0a0a0a] dark:text-white mb-3">Length</p>
        <div className="grid grid-cols-3 gap-3">
          {LENGTH_OPTIONS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLength(l.value as PromptLength)}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all duration-200',
                length === l.value
                  ? 'border-[#F5C518] bg-[#F5C518]/10'
                  : 'border-[#e5e5e5] dark:border-[#2a2a2a] hover:border-[#F5C518]/50'
              )}
            >
              <p className="text-sm font-semibold text-[#0a0a0a] dark:text-white">{l.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{l.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Additional params */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">
            Target Audience <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="e.g. startup founders, designers..."
            className="w-full rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-[#0a0a0a] dark:text-white mb-1.5">
            Writing Style <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            placeholder="e.g. minimalist, storytelling, bullet points..."
            className="w-full rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white px-3 py-2 text-sm h-10 focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
          />
        </div>
      </div>
    </div>
  );

  // ---- STEP 4: Result ----
  const Step4 = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0a0a0a] dark:text-white mb-1">
            Your Generated Prompt
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Edit, improve, or submit your prompt.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F5C518]/10 px-3 py-1.5 rounded-full">
          <span className="text-lg">{selectedCategory?.icon}</span>
          <span className="text-xs font-medium text-[#0a0a0a] dark:text-white">{selectedCategory?.name}</span>
          <span className="text-xs text-gray-400">· {aiTool}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1">
        {([
          { id: 'result', label: '✨ Prompt' },
          { id: 'variants', label: '⚡ Variants' },
          { id: 'variables', label: '🔧 Variables' },
          { id: 'improve', label: '🚀 Improve' },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
              activeTab === tab.id
                ? 'bg-[#F5C518] text-[#0a0a0a] shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-[#0a0a0a] dark:hover:text-white'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'result' && (
        <div className="space-y-3">
          <textarea
            value={editablePrompt}
            onChange={(e) => setEditablePrompt(e.target.value)}
            className={cn(
              'w-full rounded-xl border-2 border-[#F5C518]/30 bg-white dark:bg-[#1a1a1a]',
              'text-[#0a0a0a] dark:text-white font-mono text-sm',
              'focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:border-[#F5C518]',
              'transition-all duration-200 resize-y py-4 px-4 min-h-[180px]'
            )}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <CopyButton
              text={editablePrompt}
              size="md"
              variant="primary"
              showLabel
              className="flex-1 justify-center"
            />
            <Button
              variant="secondary"
              onClick={handleSubmitPrompt}
              icon={<Send className="w-4 h-4" />}
              className="flex-1"
            >
              Submit to Community
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setStep(1); setGeneratedPrompt(''); setEditablePrompt(''); }}
              icon={<Sparkles className="w-4 h-4" />}
            >
              New
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'variants' && variants.length > 0 && (
        <div className="space-y-3">
          <VariantSelector
            variants={variants}
            selectedId={selectedVariant?.id ?? null}
            onSelect={(v) => {
              setSelectedVariant(v);
              setEditablePrompt(v.content);
              setActiveTab('result');
              showToast.success(`Variant "${v.title}" selected!`);
            }}
          />
        </div>
      )}

      {activeTab === 'variables' && (
        <VariablesMode
          value={editablePrompt}
          onChange={setEditablePrompt}
        />
      )}

      {activeTab === 'improve' && (
        <ImproveMode
          initialPrompt={editablePrompt}
          onUseImproved={(improved) => {
            setEditablePrompt(improved);
            setActiveTab('result');
          }}
        />
      )}
    </div>
  );

  const steps = [Step1, Step2, Step3, Step4];
  const canAdvance = [
    goal.trim().length > 0,
    category !== '' && aiTool !== '',
    true,
    true,
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress */}
      <StepProgress current={step} />

      {/* Step content */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-6 sm:p-8 shadow-card dark:shadow-card-dark min-h-[400px]">
        {steps[step - 1]}
      </div>

      {/* Navigation */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="ghost"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 1}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Back
          </Button>

          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep(s => s + 1)}
              disabled={!canAdvance[step - 1]}
              icon={<ChevronRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleGenerate}
              loading={loading}
              icon={<Zap className="w-4 h-4" />}
            >
              {loading ? 'Generating...' : 'Generate Prompt'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
