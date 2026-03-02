import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GeneratorWizard from '@/components/generator/GeneratorWizard';

export const metadata: Metadata = {
  title: 'Prompt Generator',
  description: 'Generate high-quality AI prompts in 4 steps using Gemini 1.5 Flash. Choose your goal, category, and parameters.',
};

export default function GeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      <Navbar />
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F5C518]/10 text-[#F5C518] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <span>⚡</span> Powered by Gemini 1.5 Flash
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0a0a0a] dark:text-white mb-3">
            AI Prompt Generator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Generate, refine, and submit high-quality prompts in 4 simple steps.
          </p>
        </div>
        <GeneratorWizard />
      </main>
      <Footer />
    </div>
  );
}
