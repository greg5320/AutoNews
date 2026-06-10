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
  title: {
    default: "AutoNews - Агрегатор новостей с ИИ-выжимкой",
    template: "%s | AutoNews"
  },
  description: "Умный агрегатор статей и Telegram-каналов с автоматической краткой выжимкой на базе искусственного интеллекта. Читайте самое важное без воды.",
  keywords: ["новости", "агрегатор новостей", "искусственный интеллект", "выжимка новостей", "краткое содержание", "Telegram", "RSS", "умная лента"],
  authors: [{ name: "greg5320" }],
  creator: "greg5320",
  publisher: "AutoNews",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://autonews.ru",
    title: "AutoNews - Агрегатор новостей с ИИ-выжимкой",
    description: "Умный агрегатор статей и Telegram-каналов с автоматической краткой выжимкой на базе искусственного интеллекта.",
    siteName: "AutoNews",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoNews - Агрегатор новостей с ИИ-выжимкой",
    description: "Умный агрегатор статей и Telegram-каналов с автоматической краткой выжимкой на базе искусственного интеллекта.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={cn("relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased overflow-x-hidden", inter.variable)}>
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-40 dark:opacity-20"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 70%)
              `,
              filter: 'blur(80px)',
            }}
          />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
        </div>
        <div className="relative z-10">
          {children}
        </div>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
