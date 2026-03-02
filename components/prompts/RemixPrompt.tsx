'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GitFork, Send, RotateCcw, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import CopyButton from '@/components/prompts/CopyButton';
import showToast from '@/components/ui/Toast';

interface RemixPromptProps {
  promptId: string;
  originalContent: string;
  originalTitle: string;
  category: string;
  aiTool: string;
  language?: string;
  tags?: string[];
}

export default function RemixPrompt({
  promptId,
  originalContent,
  originalTitle,
  category,
  aiTool,
  language = 'English',
  tags = [],
}: RemixPromptProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [remixContent, setRemixContent] = useState(originalContent);
  const [showOriginal, setShowOriginal] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [changeCount, setChangeCount] = useState(0);

  useEffect(() => {
    setHasChanges(remixContent !== originalContent);
    // Count changed words
    const origWords = originalContent.split(/\s+/);
    const remixWords = remixContent.split(/\s+/);
    let changed = 0;
    const maxLen = Math.max(origWords.length, remixWords.length);
    for (let i = 0; i < maxLen; i++) {
      if (origWords[i] !== remixWords[i]) changed++;
    }
    setChangeCount(changed);
  }, [remixContent, originalContent]);

  const handleReset = () => {
    setRemixContent(originalContent);
    showToast.success('Reset to original');
  };

  const handleSubmit = () => {
    if (!hasChanges) {
      showToast.error('Make some changes before submitting your remix');
      return;
    }
    const content = encodeURIComponent(remixContent);
    const cat = encodeURIComponent(category);
    const tool = encodeURIComponent(aiTool);
    router.push(`/submit?content=${content}&category=${cat}&ai_tool=${tool}&remix=${promptId}`);
  };

  // Render diff: highlight changed words in the remix
  const renderDiff = () => {
    const origWords = originalContent.split(/(\s+)/);
    const remixWords = remixContent.split(/(\s+)/);
    const maxLen = Math.max(origWords.length, remixWords.length);

    return Array.from({ length: maxLen }, (_, i) => {
      const orig = origWords[i] ?? '';
      const remix = remixWords[i] ?? '';
      const isChanged = orig !== remix && remix.trim() !== '';
      const isNew = !orig && remix.trim() !== '';
      const isRemoved = orig.trim() !== '' && !remix;

      if (isRemoved) return null;

      return (
        <span
          key={i}
          className={cn(
            isChanged && 'bg-[#F5C518]/30 text-[#0a0a0a] dark:text-white rounded px-0.5',
            isNew && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded px-0.5'
          )}
        >
          {remix || orig}
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
          <GitFork className="w-4 h-4 text-[#F5C518]" />
          <span className="font-semibold text-[#0a0a0a] dark:text-white text-sm">
            Remix This Prompt
          </span>
          {hasChanges && (
            <span className="text-xs bg-[#F5C518]/20 text-[#0a0a0a] dark:text-white px-2 py-0.5 rounded-full font-medium">
              {changeCount} change{changeCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-gray-400" />
          : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-[#e5e5e5] dark:border-[#2a2a2a] pt-4 space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Edit a copy of this prompt and submit it as your own version. Changes are highlighted in yellow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original (read-only) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Original
                  </span>
                  <span className="flex-1 h-px bg-[#e5e5e5] dark:bg-[#2a2a2a] w-8" />
                </div>
                <button
                  onClick={() => setShowOriginal(s => !s)}
                  className="text-xs text-gray-400 hover:text-[#F5C518] transition-colors flex items-center gap-1"
                >
                  {showOriginal ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showOriginal ? 'Hide' : 'Show'}
                </button>
              </div>

              {showOriginal && (
                <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 border border-[#e5e5e5] dark:border-[#2a2a2a] min-h-[160px] max-h-64 overflow-y-auto">
                  <p className="text-xs font-mono text-gray-400 leading-relaxed whitespace-pre-wrap select-none">
                    {originalContent}
                  </p>
                </div>
              )}
            </div>

            {/* Editable remix */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#F5C518] uppercase tracking-wider">
                  Your Remix
                </span>
                <span className="flex-1 h-px bg-[#F5C518]/30" />
              </div>

              <textarea
                value={remixContent}
                onChange={e => setRemixContent(e.target.value)}
                className={cn(
                  'w-full rounded-lg border-2 bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white',
                  'font-mono text-xs leading-relaxed resize-y',
                  'focus:outline-none focus:ring-2 focus:ring-[#F5C518]',
                  'transition-all duration-200 p-3 min-h-[160px]',
                  hasChanges ? 'border-[#F5C518]/50' : 'border-[#e5e5e5] dark:border-[#2a2a2a]'
                )}
                placeholder="Edit the prompt here..."
              />
            </div>
          </div>

          {/* Live diff preview */}
          {hasChanges && (
            <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 border border-[#e5e5e5] dark:border-[#2a2a2a]">
              <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                Diff Preview
              </p>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 leading-relaxed">
                {renderDiff()}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-[#F5C518]/30 inline-block" /> Changed words
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 inline-block" /> New words
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
            <CopyButton
              text={remixContent}
              size="sm"
              variant="ghost"
              showLabel
              className="flex-1 justify-center"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!hasChanges}
              icon={<Send className="w-3.5 h-3.5" />}
              className="flex-1"
            >
              Submit as New Prompt
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={!hasChanges}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
          </div>

          {!hasChanges && (
            <p className="text-xs text-gray-400 text-center">
              Edit the prompt above to enable submission
            </p>
          )}
        </div>
      )}
    </div>
  );
}
