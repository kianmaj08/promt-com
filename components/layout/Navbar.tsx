'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import {
  Sun, Moon, Search, Menu, X, Plus, Compass,
  Zap, Trophy, BookMarked
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isSignedIn } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: <Compass className="w-4 h-4" /> },
    { href: '/generator', label: 'Generator', icon: <Zap className="w-4 h-4" /> },
    { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    ...(isSignedIn
      ? [{ href: '/collections', label: 'Collections', icon: <BookMarked className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0a0a0a] border-b border-[#e5e5e5] dark:border-[#2a2a2a] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 flex-shrink-0 group">
            <span className="text-xl font-bold text-[#0a0a0a] dark:text-white tracking-tight">
              Prompt
            </span>
            <span className="text-xl font-bold text-[#F5C518] group-hover:scale-110 transition-transform duration-200">
              .com
            </span>
          </Link>

          {/* Search bar - center */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                className={cn(
                  'w-full pl-10 pr-4 py-2 h-9 rounded-lg text-sm',
                  'bg-gray-50 dark:bg-[#1a1a1a]',
                  'border border-[#e5e5e5] dark:border-[#2a2a2a]',
                  'text-[#0a0a0a] dark:text-white placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-[#F5C518] focus:border-[#F5C518]',
                  'transition-all duration-200'
                )}
              />
            </div>
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'text-[#F5C518] bg-[#F5C518]/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#0a0a0a] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#1a1a1a]'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">

            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors duration-200 text-gray-600 dark:text-gray-400"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#F5C518]" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Auth */}
            {isSignedIn ? (
              <>
                <Link href="/submit">
                  <Button size="sm" variant="primary" icon={<Plus className="w-3.5 h-3.5" />}>
                    <span className="hidden sm:inline">Submit</span>
                  </Button>
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-8 h-8 ring-2 ring-transparent hover:ring-[#F5C518] transition-all',
                    },
                  }}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button size="sm" variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm" variant="primary">Sign Up</Button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-[#e5e5e5] dark:border-[#2a2a2a] py-3 space-y-1">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="px-1 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search prompts..."
                  className="w-full pl-10 pr-4 py-2 h-9 rounded-lg text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] text-[#0a0a0a] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F5C518]"
                />
              </div>
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-[#F5C518] bg-[#F5C518]/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#0a0a0a] dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                )}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
