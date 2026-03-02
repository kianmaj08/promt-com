import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-0.5 text-2xl font-black">
            <span className="text-[#0a0a0a] dark:text-white">Prompt</span>
            <span className="text-[#F5C518]">.com</span>
          </a>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Create your free account</p>
        </div>
        <SignUp
          appearance={{
            elements: {
              card: 'shadow-none border border-[#e5e5e5] dark:border-[#2a2a2a] rounded-2xl',
              primaryButton: 'bg-[#F5C518] text-[#0a0a0a] hover:bg-[#e6b800] font-semibold',
            },
          }}
        />
      </div>
    </div>
  );
}
