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
      <body className={cn("relative min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <DotPattern className="fixed inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,white,transparent)] z-[-1]" />
        <div className="relative z-10">
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
