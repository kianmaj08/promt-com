'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Check, RotateCcw, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import CopyButton from '@/components/prompts/CopyButton';
import showToast from '@/components/ui/Toast';

interface ImprovePromptProps {
  originalContent: string;
  promptTitle: string;
}

type Stage = 'idle' | 'loading' | 'done';

export default function ImprovePrompt({ originalContent, promptTitle }: ImprovePromptProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [stage, setStage] = useState<Stage>('idle');
  const [improved, setImproved] = useState('');
  const [editedImproved, setEditedImproved] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleImprove = async () => {
    setStage('loading');
    try {
      const res = await fetch('/api/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: originalContent }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Improvement failed');
      setImproved(json.data.improved);
      setEditedImproved(json.data.improved);
      setStage('done');
    } catch (e: any) {
      showToast.error(e.message ?? 'Failed to improve prompt');
      setStage('idle');
    }
  };

  const handleReset = () => {
    setStage('idle');
    setImproved('');
    setEditedImproved('');
    setIsEditing(false);
  };

  const handleSubmitImproved = () => {
    const content = encodeURIComponent(editedImproved);
    router.push(`/submit?content=${content}`);
  };

  // Compute diff highlights (word-level)
  const getDiffWords = () => {
    const origWords = new Set(originalContent.toLowerCase().split(/\s+/));
    return editedImproved.split(/(\s+)/).map((token, i) => {
      const isNew = token.trim() && !origWords.has(token.toLowerCase().replace(/[^a-z0-9]/g, ''));
      return (
        <span
          key={i}
          className={cn(isNew && 'bg-[#F5C518]/25 text-[#0a0a0a] dark:text-white rounded px-0.5')}
        >
          {token}
        </span>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#F5C518]" />
          <span className="font-semibold text-[#0a0a0a] dark:text-white text-sm">
            Improve This Prompt with AI
          </span>
          {stage === 'done' && (
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
              Improved
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] pt-4 space-y-4">

          {stage === 'idle' && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gemini 1.5 Flash will analyze and enhance this prompt for better clarity, specificity and results.
              </p>
              <Button
                variant="primary"
                onClick={handleImprove}
                icon={<Sparkles className="w-4 h-4" />}
                className="w-full justify-center"
              >
                Improve with AI
              </Button>
            </>
          )}

          {stage === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-4 border-[#F5C518]/20 animate-ping absolute inset-0" />
                <div className="w-14 h-14 rounded-full bg-[#F5C518]/10 flex items-center justify-center relative">
                  <Sparkles className="w-6 h-6 text-[#F5C518] animate-pulse" />
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                Gemini is improving your prompt...
              </p>
            </div>
          )}

          {stage === 'done' && (
            <div className="space-y-4">
              {/* Before / After */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Original
                    </span>
                    <span className="flex-1 h-px bg-[#e5e5e5] dark:bg-[#2a2a2a]" />
                  </div>
                  <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 border border-[#e5e5e5] dark:border-[#2a2a2a] min-h-[120px] max-h-48 overflow-y-auto">
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                      {originalContent}
                    </p>
                  </div>
                </div>

                {/* After */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">
                      ✨ Improved
                    </span>
                    <span className="flex-1 h-px bg-[#F5C518]/30" />
                    <button
                      onClick={() => setIsEditing(e => !e)}
                      className="text-xs text-gray-400 hover:text-[#F5C518] transition-colors"
                    >
                      {isEditing ? 'Preview' : 'Edit'}
                    </button>
                  </div>

                  {isEditing ? (
                    <textarea
                      value={editedImproved}
                      onChange={e => setEditedImproved(e.target.value)}
                      className="w-full rounded-lg border-2 border-[#F5C518]/30 bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white text-xs font-mono p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#F5C518] resize-y"
                    />
                  ) : (
                    <div className="bg-[#F5C518]/5 rounded-lg p-3 border-2 border-[#F5C518]/30 min-h-[120px] max-h-48 overflow-y-auto">
                      <p className="text-xs font-mono text-[#0a0a0a] dark:text-white leading-relaxed">
                        {getDiffWords()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Diff legend */}
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="bg-[#F5C518]/25 px-1.5 py-0.5 rounded text-[#0a0a0a] dark:text-white font-medium">highlighted</span>
                <span>= new or changed words</span>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
                <CopyButton
                  text={editedImproved}
                  size="sm"
                  variant="ghost"
                  showLabel
                  className="flex-1 justify-center"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmitImproved}
                  icon={<Send className="w-3.5 h-3.5" />}
                  className="flex-1"
                >
                  Submit as New Prompt
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleImprove}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Try Again
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
