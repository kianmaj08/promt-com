import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Prompt.com – Community Platform for High-Quality AI Prompts",
    template: "%s | Prompt.com",
  },
  description: "Discover, share, and generate high-quality AI prompts for ChatGPT, Midjourney, DALL-E, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={sora.variable}>
        <body className={sora.className}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            {children}
            <Toaster position="bottom-right" toastOptions={{ style: { background: "var(--color-bg-card)", color: "var(--color-text)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "14px" }, success: { iconTheme: { primary: "#F5C518", secondary: "#0a0a0a" } }, duration: 3000 }} />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
