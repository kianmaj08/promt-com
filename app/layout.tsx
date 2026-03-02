import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Prompt.com – Community Platform for High-Quality AI Prompts",
    template: "%s | Prompt.com",
  },
  description:
    "Discover, share, and generate high-quality AI prompts for ChatGPT, Midjourney, DALL-E, and more. Rated by AI and community.",
  keywords: ["AI prompts", "ChatGPT prompts", "Midjourney prompts", "prompt engineering", "AI tools"],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Prompt.com",
    title: "Prompt.com – Community Platform for High-Quality AI Prompts",
    description:
      "Discover, share, and generate high-quality AI prompts for ChatGPT, Midjourney, DALL-E, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prompt.com",
    description: "Community Platform for High-Quality AI Prompts",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "var(--color-bg-card)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "14px",
                },
                success: {
                  iconTheme: {
                    primary: "#F5C518",
                    secondary: "#0a0a0a",
                  },
                },
                duration: 3000,
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
