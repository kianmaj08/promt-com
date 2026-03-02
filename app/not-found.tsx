import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-8xl font-black text-[#F5C518] mb-4">404</div>
          <h1 className="text-2xl font-black text-[#0a0a0a] dark:text-white mb-3">
            Page not found
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="bg-[#F5C518] text-[#0a0a0a] font-bold px-6 py-3 rounded-xl hover:bg-[#e6b800] transition-all duration-200"
            >
              Go Home
            </Link>
            <Link
              href="/explore"
              className="bg-white dark:bg-[#1a1a1a] border border-[#e5e5e5] dark:border-[#2a2a2a] text-[#0a0a0a] dark:text-white font-semibold px-6 py-3 rounded-xl hover:border-[#F5C518] transition-all duration-200"
            >
              Explore Prompts
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
