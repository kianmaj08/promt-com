'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap, CheckCircle, AlertCircle, XCircle, ChevronDown,
  ChevronUp, RotateCcw, Send, Lightbulb, Star
} from 'lucide-react';
import { cn, getScoreColor } from '@/lib/utils';
import type { AiFeedback } from '@/types';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';

interface EvaluationResultProps {
  evaluation: AiFeedback;
  status: 'published' | 'published_with_note' | 'rejected';
  promptId?: string;
  onRevise?: () => void;
  onSubmitAnyway?: () => void;
  className?: string;
}

const CRITERIA_META = {
  clarity: {
    label: 'Clarity',
    description: 'Clear and unambiguous instructions',
    weight: '25%',
    icon: '🎯',
  },
  completeness: {
    label: 'Completeness',
    description: 'Includes context, goal and format',
    weight: '20%',
    icon: '📋',
  },
  reusability: {
    label: 'Reusability',
    description: 'Easily adaptable for similar tasks',
    weight: '20%',
    icon: '♻️',
  },
  creativity: {
    label: 'Creativity',
    description: 'Original and inventive approach',
    weight: '15%',
    icon: '✨',
  },
  specificity: {
    label: 'Specificity',
    description: 'Sufficient detail for the AI',
    weight: '20%',
    icon: '🔍',
  },
} as const;

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700',
          score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-[#F5C518]' : 'bg-red-400'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusBanner({ status, score }: { status: EvaluationResultProps['status']; score: number }) {
  const configs = {
    published: {
      icon: <CheckCircle className="w-5 h-5" />,
      title: score >= 4.5 ? '🌟 Outstanding! Featured Prompt' : '✅ Approved & Published',
      desc: score >= 4.5
        ? 'Your prompt scored exceptionally well and has been featured on the platform!'
        : 'Your prompt meets our quality standards and is now live.',
      bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-400',
    },
    published_with_note: {
      icon: <AlertCircle className="w-5 h-5" />,
      title: '⚠️ Published with Note',
      desc: 'Your prompt has been published, but could be improved. Consider revising to increase its quality.',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-500',
    },
    rejected: {
      icon: <XCircle className="w-5 h-5" />,
      title: '❌ Needs Improvement',
      desc: 'Your prompt did not meet our quality threshold. Please review the feedback below and revise.',
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-400',
    },
  };

  const cfg = configs[status];

  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl border', cfg.bg)}>
      <span className={cfg.text}>{cfg.icon}</span>
      <div>
        <p className={cn('font-semibold text-sm', cfg.text)}>{cfg.title}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{cfg.desc}</p>
      </div>
    </div>
  );
}

export default function EvaluationResult({
  evaluation,
  status,
  promptId,
  onRevise,
  onSubmitAnyway,
  className,
}: EvaluationResultProps) {
  const router = useRouter();
  const [expandedCriteria, setExpandedCriteria] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const score = evaluation.total_score;

  return (
    <div className={cn('space-y-5', className)}>
      {/* Status banner */}
      <StatusBanner status={status} score={score} />

      {/* Total Score Hero */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-[#F5C518]" />
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            AI Quality Score
          </span>
        </div>

        <div className={cn('text-6xl font-black mb-3', getScoreColor(score))}>
          {score.toFixed(1)}
          <span className="text-2xl font-medium text-gray-300 dark:text-gray-600">/5</span>
        </div>

        <StarRating
          value={score}
          readOnly
          size="lg"
          showValue={false}
          className="justify-center mb-3"
        />

        {/* Mini score bar */}
        <div className="max-w-xs mx-auto">
          <div className="w-full h-3 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-1000',
                score >= 4 ? 'bg-green-500' : score >= 3 ? 'bg-[#F5C518]' : 'bg-red-400'
              )}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span>5</span>
          </div>
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#e5e5e5] dark:border-[#2a2a2a]">
          <h3 className="font-semibold text-[#0a0a0a] dark:text-white flex items-center gap-2">
            <Star className="w-4 h-4 text-[#F5C518]" />
            Evaluation Breakdown
          </h3>
        </div>

        <div className="divide-y divide-[#e5e5e5] dark:divide-[#2a2a2a]">
          {(Object.keys(CRITERIA_META) as Array<keyof typeof CRITERIA_META>).map((key) => {
            const meta = CRITERIA_META[key];
            const criterion = evaluation.breakdown[key];
            const isExpanded = expandedCriteria === key;

            return (
              <div key={key}>
                <button
                  onClick={() => setExpandedCriteria(isExpanded ? null : key)}
                  className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors text-left"
                >
                  <span className="text-xl flex-shrink-0">{meta.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#0a0a0a] dark:text-white">
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-400 hidden sm:inline">
                          {meta.weight}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={cn('text-sm font-bold tabular-nums', getScoreColor(criterion.score))}>
                          {criterion.score}/5
                        </span>
                        <StarRating value={criterion.score} readOnly size="sm" />
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-gray-400" />
                          : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                    <ScoreBar score={criterion.score} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 bg-gray-50 dark:bg-[#0a0a0a] border-t border-[#e5e5e5] dark:border-[#2a2a2a]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 pt-3">
                      {meta.description}
                    </p>
                    <p className="text-sm text-[#0a0a0a] dark:text-white leading-relaxed">
                      {criterion.feedback}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Overall Feedback */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-5">
        <h3 className="font-semibold text-[#0a0a0a] dark:text-white mb-3 flex items-center gap-2">
          <span>💬</span> Overall Feedback
        </h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          {evaluation.overall_feedback}
        </p>
      </div>

      {/* Improvement Suggestions */}
      {evaluation.improvement_suggestions?.length > 0 && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-[#e5e5e5] dark:border-[#2a2a2a] overflow-hidden">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#0a0a0a] transition-colors"
          >
            <h3 className="font-semibold text-[#0a0a0a] dark:text-white flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#F5C518]" />
              Improvement Suggestions
              <span className="bg-[#F5C518] text-[#0a0a0a] text-xs font-bold px-1.5 py-0.5 rounded-full">
                {evaluation.improvement_suggestions.length}
              </span>
            </h3>
            {showSuggestions
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>

          {showSuggestions && (
            <ul className="px-5 pb-5 space-y-2.5">
              {evaluation.improvement_suggestions.map((suggestion, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#F5C518]/20 text-[#F5C518] text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {suggestion}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {status === 'rejected' && onRevise && (
          <Button
            variant="primary"
            className="flex-1"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={onRevise}
          >
            Revise & Resubmit
          </Button>
        )}

        {status === 'rejected' && onSubmitAnyway && (
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onSubmitAnyway}
          >
            Submit Anyway
          </Button>
        )}

        {(status === 'published' || status === 'published_with_note') && promptId && (
          <Button
            variant="primary"
            className="flex-1"
            icon={<Send className="w-4 h-4" />}
            onClick={() => router.push(`/prompts/${promptId}`)}
          >
            View Published Prompt
          </Button>
        )}

        {(status === 'published' || status === 'published_with_note') && (
          <Button
            variant="ghost"
            className="flex-1"
            onClick={() => router.push('/explore')}
          >
            Explore More Prompts
          </Button>
        )}
      </div>
    </div>
  );
}
