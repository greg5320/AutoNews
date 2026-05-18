import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { DotPattern } from "@/components/ui/dot-pattern";

const inter = Inter({ 
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AutoNews - AI Article Summarizer",
  description: "Агрегатор статей с автоматической выжимкой через LLM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn("relative min-h-screen bg-background font-sans antialiased overflow-x-hidden", inter.variable)}>
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <DotPattern className="opacity-30 [mask-image:radial-gradient(ellipse_at_top,white,transparent)]" />
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] dark:bg-blue-600/5 animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] dark:bg-purple-600/5 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
