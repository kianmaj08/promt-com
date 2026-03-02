import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ---- Tailwind class merger ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ---- Date formatting ----
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return formatDate(dateString);
}

// ---- Text utilities ----
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function truncateWords(text: string, maxWords: number): string {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}

// ---- Slug generation ----
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ---- Number formatting ----
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// ---- Tag parsing ----
export function parseTags(input: string): string[] {
  return input
    .split(/[,\s]+/)
    .map((tag) => tag.trim().toLowerCase().replace(/^#/, ''))
    .filter((tag) => tag.length > 0 && tag.length <= 30)
    .slice(0, 10);
}

// ---- Star rating helpers ----
export function starsToPercent(stars: number): number {
  return (stars / 5) * 100;
}

export function formatStars(stars: number): string {
  return stars.toFixed(1);
}

// ---- Color helpers ----
export function getStatusColor(status: string): string {
  switch (status) {
    case 'published':
      return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
    case 'published_with_note':
      return 'text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400';
    case 'rejected':
      return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
    case 'pending':
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'published': return 'Published';
    case 'published_with_note': return 'Published with Note';
    case 'rejected': return 'Needs Improvement';
    case 'pending': return 'Pending Review';
    default: return status;
  }
}

export function getScoreColor(score: number): string {
  if (score >= 4.5) return 'text-green-500';
  if (score >= 3.5) return 'text-yellow-500';
  if (score >= 2.5) return 'text-orange-500';
  return 'text-red-500';
}

// ---- Prompt content highlight ----
export function highlightVariables(text: string): string {
  // Highlight [PLACEHOLDER] patterns
  return text.replace(
    /\[([A-Z_]+)\]/g,
    '<mark class="bg-accent/30 text-accent-foreground rounded px-0.5">[$1]</mark>'
  );
}

// ---- Copy to clipboard ----
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

// ---- URL helpers ----
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      searchParams.set(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

// ---- Avatar placeholder ----
export function getInitials(username: string): string {
  return username
    .split(/[\s_-]/)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarColor(username: string): string {
  const colors = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500',
    'bg-yellow-500', 'bg-lime-500', 'bg-green-500',
    'bg-teal-500', 'bg-cyan-500', 'bg-blue-500',
    'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
  ];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
}
