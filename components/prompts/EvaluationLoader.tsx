'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Analyzing clarity and structure...', duration: 1800 },
  { label: 'Checking completeness and context...', duration: 1600 },
  { label: 'Evaluating reusability...', duration: 1400 },
  { label: 'Measuring creativity and specificity...', duration: 1500 },
  { label: 'Calculating final score...', duration: 1200 },
];

interface EvaluationLoaderProps {
  className?: string;
}

export default function EvaluationLoader({ className }: EvaluationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let stepIndex = 0;
    let elapsed = 0;
    const total = STEPS.reduce((sum, s) => sum + s.duration, 0);

    const tick = setInterval(() => {
      elapsed += 80;
      setProgress(Math.min((elapsed / total) * 100, 95));

      let acc = 0;
      for (let i = 0; i < STEPS.length; i++) {
        acc += STEPS[i].duration;
        if (elapsed < acc) {
          setCurrentStep(i);
          break;
        }
      }
    }, 80);

    return () => clearInterval(tick);
  }, []);

  return (
    <div className={cn(
      'bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#e5e5e5] dark:border-[#2a2a2a] p-8 text-center',
      className
    )}>
      {/* Animated icon */}
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-20 h-20 rounded-full border-4 border-[#F5C518]/20 animate-ping absolute" />
        <div className="w-16 h-16 rounded-full bg-[#F5C518]/10 flex items-center justify-center relative z-10">
          <Zap className="w-8 h-8 text-[#F5C518] animate-pulse" />
        </div>
      </div>

      <h3 className="text-lg font-bold text-[#0a0a0a] dark:text-white mb-2">
        AI is evaluating your prompt
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Gemini 1.5 Flash is analyzing quality across 5 criteria
      </p>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#F5C518] rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Current step */}
      <p className="text-sm text-[#F5C518] font-medium animate-pulse">
        {STEPS[currentStep]?.label}
      </p>

      {/* Step dots */}
      <div className="flex justify-center gap-2 mt-5">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-2 h-2 rounded-full transition-all duration-300',
              i < currentStep
                ? 'bg-[#F5C518]'
                : i === currentStep
                ? 'bg-[#F5C518] scale-125'
                : 'bg-gray-200 dark:bg-[#2a2a2a]'
            )}
          />
        ))}
      </div>
    </div>
  );
}
