'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import CopyButton from '@/components/prompts/CopyButton';
import showToast from '@/components/ui/Toast';

interface ImproveModeProps {
  onUseImproved?: (improved: string) => void;
  initialPrompt?: string;
}

export default function ImproveMode({ onUseImproved, initialPrompt = '' }: ImproveModeProps) {
  const [original, setOriginal] = useState(initialPrompt);
  const [improved, setImproved] = useState('');
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(false);

  const handleImprove = async () => {
    if (!original.trim()) {
      showToast.error('Please enter a prompt to improve');
      return;
    }
    setLoading(true);
    setImproved('');
    setUsed(false);

    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: original }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setImproved(json.data.improved);
    } catch (e) {
      showToast.error('Improvement failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseImproved = () => {
    if (!improved) return;
    onUseImproved?.(improved);
    setUsed(true);
    showToast.success('Improved prompt applied!');
  };

  const handleReset = () => {
    setImproved('');
    setUsed(false);
    setOriginal('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#F5C518]" />
        <span className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
          Improve Your Prompt
        </span>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Paste any prompt below and AI will enhance it for better clarity, specificity, and results.
      </p>

      {!improved ? (
        /* Input state */
        <div className="space-y-3">
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder="Paste your prompt here to improve it..."
            className={cn(
              'w-full rounded-lg border bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white',
              'border-[#e5e5e5] dark:border-[#2a2a2a] text-sm font-mono',
              'focus:outline-none focus:ring-2 focus:ring-[#F5C518]',
              'transition-all duration-200 resize-y py-3 px-3.5 min-h-[120px]'
            )}
          />
          <Button
            variant="primary"
            onClick={handleImprove}
            loading={loading}
            disabled={!original.trim()}
            icon={<Sparkles className="w-4 h-4" />}
            className="w-full"
          >
            {loading ? 'Improving...' : 'Improve with AI'}
          </Button>
        </div>
      ) : (
        /* Before / After comparison */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Before
                </span>
                <span className="h-px flex-1 bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
              </div>
              <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 border border-[#e5e5e5] dark:border-[#2a2a2a] min-h-[120px]">
                <p className="text-sm font-mono text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {original}
                </p>
              </div>
              <div className="flex justify-end">
                <CopyButton text={original} size="sm" variant="ghost" showLabel />
              </div>
            </div>

            {/* Arrow (desktop) */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <ArrowRight className="w-5 h-5 text-[#F5C518]" />
            </div>

            {/* After */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">
                  ✨ Improved
                </span>
                <span className="h-px flex-1 bg-[#F5C518]/30" />
              </div>
              <div className="bg-[#F5C518]/5 rounded-lg p-3 border-2 border-[#F5C518]/30 min-h-[120px]">
                <p className="text-sm font-mono text-[#0a0a0a] dark:text-white leading-relaxed whitespace-pre-wrap">
                  {improved}
                </p>
              </div>
              <div className="flex justify-end">
                <CopyButton text={improved} size="sm" variant="ghost" showLabel />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {onUseImproved && (
              <Button
                variant="primary"
                onClick={handleUseImproved}
                disabled={used}
                icon={used ? <Check className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                className="flex-1"
              >
                {used ? 'Applied!' : 'Use Improved Prompt'}
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleImprove}
              loading={loading}
              icon={<Sparkles className="w-4 h-4" />}
              className="flex-1"
            >
              Improve Again
            </Button>
            <Button
              variant="ghost"
              onClick={handleReset}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
