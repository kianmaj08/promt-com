'use client';

import { useState, useRef } from 'react';
import { Plus, Variable } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import showToast from '@/components/ui/Toast';

interface VariablesModeProps {
  value: string;
  onChange: (value: string) => void;
}

const COMMON_VARIABLES = [
  '[TOPIC]', '[AUDIENCE]', '[TONE]', '[FORMAT]',
  '[LANGUAGE]', '[LENGTH]', '[STYLE]', '[GOAL]',
  '[CONTEXT]', '[EXAMPLES]', '[CONSTRAINTS]', '[PERSONA]',
];

export default function VariablesMode({ value, onChange }: VariablesModeProps) {
  const [customVar, setCustomVar] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    const ta = textareaRef.current;
    if (!ta) {
      onChange(value + ' ' + variable);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newValue = value.slice(0, start) + variable + value.slice(end);
    onChange(newValue);

    // Restore cursor after variable
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + variable.length, start + variable.length);
    }, 0);
  };

  const addCustomVariable = () => {
    const trimmed = customVar.trim().toUpperCase().replace(/\s+/g, '_');
    if (!trimmed) return;
    const variable = `[${trimmed}]`;
    insertVariable(variable);
    setCustomVar('');
    showToast.success(`Variable ${variable} inserted!`);
  };

  // Render prompt with highlighted variables
  const renderHighlighted = () => {
    const parts = value.split(/(\[[A-Z_]+\])/g);
    return parts.map((part, i) => {
      if (/^\[[A-Z_]+\]$/.test(part)) {
        return (
          <mark
            key={i}
            className="bg-[#F5C518]/30 text-[#0a0a0a] dark:text-white rounded px-0.5 font-mono font-semibold"
          >
            {part}
          </mark>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const variableCount = (value.match(/\[[A-Z_]+\]/g) ?? []).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Variable className="w-4 h-4 text-[#F5C518]" />
          <span className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
            Variables Mode
          </span>
        </div>
        {variableCount > 0 && (
          <span className="text-xs bg-[#F5C518]/20 text-[#0a0a0a] dark:text-white px-2 py-0.5 rounded-full font-medium">
            {variableCount} variable{variableCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Insert placeholders like <code className="bg-[#F5C518]/20 text-[#0a0a0a] dark:text-white px-1 rounded font-mono">[TOPIC]</code> to make your prompt reusable. Click anywhere in the text first, then click a variable to insert it.
      </p>

      {/* Prompt textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white',
            'border-[#e5e5e5] dark:border-[#2a2a2a]',
            'focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:border-[#F5C518]',
            'transition-all duration-200 resize-y font-mono text-sm',
            'py-3 px-3.5 min-h-[140px]'
          )}
          placeholder="Your prompt text..."
        />
      </div>

      {/* Preview with highlighted variables */}
      {variableCount > 0 && (
        <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-3 border border-[#e5e5e5] dark:border-[#2a2a2a]">
          <p className="text-xs text-gray-400 mb-2 font-medium">Preview with highlighted variables:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-mono">
            {renderHighlighted()}
          </p>
        </div>
      )}

      {/* Quick insert chips */}
      <div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Quick insert:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_VARIABLES.map((v) => (
            <button
              key={v}
              onClick={() => insertVariable(v)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full font-mono font-medium border transition-all duration-200',
                'border-[#e5e5e5] dark:border-[#2a2a2a]',
                'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400',
                'hover:bg-[#F5C518]/10 hover:border-[#F5C518] hover:text-[#0a0a0a] dark:hover:text-white'
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Custom variable input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={customVar}
          onChange={(e) => setCustomVar(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustomVariable()}
          placeholder="Custom variable name..."
          className={cn(
            'flex-1 rounded-lg border bg-white dark:bg-[#1a1a1a] text-[#0a0a0a] dark:text-white text-sm',
            'border-[#e5e5e5] dark:border-[#2a2a2a] px-3 py-2 h-9',
            'focus:outline-none focus:ring-2 focus:ring-[#F5C518] placeholder:text-gray-400',
            'font-mono uppercase'
          )}
        />
        <Button
          size="sm"
          variant="primary"
          onClick={addCustomVariable}
          disabled={!customVar.trim()}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Add
        </Button>
      </div>
    </div>
  );
}
