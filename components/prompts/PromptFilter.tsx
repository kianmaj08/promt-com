'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CATEGORIES, AI_TOOLS, LANGUAGES, SORT_OPTIONS } from '@/lib/constants';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface FilterState {
  category: string;
  ai_tool: string;
  language: string;
  min_stars: string;
  sort: string;
}

const DEFAULT_FILTERS: FilterState = {
  category: '',
  ai_tool: '',
  language: '',
  min_stars: '',
  sort: 'newest',
};

export default function PromptFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') ?? '',
    ai_tool: searchParams.get('ai_tool') ?? '',
    language: searchParams.get('language') ?? '',
    min_stars: searchParams.get('min_stars') ?? '',
    sort: searchParams.get('sort') ?? 'newest',
  });

  // Sync URL → state
  useEffect(() => {
    setFilters({
      category: searchParams.get('category') ?? '',
      ai_tool: searchParams.get('ai_tool') ?? '',
      language: searchParams.get('language') ?? '',
      min_stars: searchParams.get('min_stars') ?? '',
      sort: searchParams.get('sort') ?? 'newest',
    });
  }, [searchParams]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    applyFilters(updated);
  };

  const removeFilter = (key: keyof FilterState) => {
    updateFilter(key, key === 'sort' ? 'newest' : '');
  };

  const applyFilters = (f: FilterState) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(f).forEach(([key, val]) => {
      if (val && !(key === 'sort' && val === 'newest')) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    params.delete('page');
    router.push(`/explore?${params.toString()}`);
  };

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    const search = searchParams.get('search');
    router.push(search ? `/explore?search=${search}` : '/explore');
  };

  // Active filter badges (excluding sort=newest)
  const activeFilters = Object.entries(filters).filter(
    ([key, val]) => val && !(key === 'sort' && val === 'newest')
  );

  const getFilterLabel = (key: string, value: string): string => {
    if (key === 'category') return CATEGORIES.find((c) => c.slug === value)?.name ?? value;
    if (key === 'min_stars') return `Min ${value}★`;
    if (key === 'sort') return SORT_OPTIONS.find((s) => s.value === value)?.label ?? value;
    return value;
  };

  return (
    <div className="space-y-3">
      {/* Sort + Toggle row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Sort tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-lg p-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('sort', opt.value)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
                filters.sort === opt.value
                  ? 'bg-[#F5C518] text-[#0a0a0a] shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-[#0a0a0a] dark:hover:text-white'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filter toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
        >
          Filters
          {activeFilters.length > 0 && (
            <span className="ml-1 bg-[#F5C518] text-[#0a0a0a] text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {activeFilters.length}
            </span>
          )}
          <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', showFilters && 'rotate-180')} />
        </Button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full text-sm rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5C518] transition-all"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Tool */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                AI Tool
              </label>
              <select
                value={filters.ai_tool}
                onChange={(e) => updateFilter('ai_tool', e.target.value)}
                className="w-full text-sm rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5C518] transition-all"
              >
                <option value="">All Tools</option>
                {AI_TOOLS.map((tool) => (
                  <option key={tool} value={tool}>{tool}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => updateFilter('language', e.target.value)}
                className="w-full text-sm rounded-lg border border-[#e5e5e5] dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a] text-[#0a0a0a] dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5C518] transition-all"
              >
                <option value="">All Languages</option>
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Min Stars */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Min AI Rating
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => updateFilter('min_stars', filters.min_stars === String(star) ? '' : String(star))}
                    className={cn(
                      'flex-1 h-9 rounded-lg text-sm font-medium border transition-all duration-200',
                      filters.min_stars === String(star)
                        ? 'bg-[#F5C518] text-[#0a0a0a] border-[#F5C518]'
                        : 'border-[#e5e5e5] dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-[#F5C518]'
                    )}
                  >
                    {star}★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {activeFilters.length > 0 && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearAll}
                className="text-xs text-gray-500 hover:text-red-500 transition-colors duration-200 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filter badges */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Active:</span>
          {activeFilters.map(([key, value]) => (
            <Badge
              key={key}
              variant="category"
              onRemove={() => removeFilter(key as keyof FilterState)}
            >
              {getFilterLabel(key, value)}
            </Badge>
          ))}
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
