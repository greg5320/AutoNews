"use client";

import { useEffect, useRef, useState } from "react";
import { Article, Feed, fetchArticle } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteArticleButton } from "@/components/DeleteButtons";
import { FormattedDate } from "@/components/FormattedDate";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LazyArticleCardProps {
  initialArticle: Article;
  feed?: Feed;
}

export function LazyArticleCard({ initialArticle, feed }: LazyArticleCardProps) {
  const [article, setArticle] = useState<Article>(initialArticle);
  const [analyzing, setAnalyzing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Если статья уже обработана, ничего делать не нужно
    if (article.Status === "done") return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Отключаем наблюдение, чтобы не отправлять повторные запросы
          observer.disconnect();
          
          setAnalyzing(true);
          try {
            const updated = await fetchArticle(article.ID);
            setArticle(updated);
          } catch (e) {
            console.error("Ошибка при получении выжимки:", e);
          } finally {
            setAnalyzing(false);
          }
        }
      },
      {
        rootMargin: "100px", // Начинаем запрашивать чуть заранее до прокрутки
        threshold: 0.1,
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [article.ID, article.Status]);

  return (
    <div ref={cardRef} className="h-full w-full min-w-0">
      <Card className="flex flex-col h-full w-full min-w-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden break-words">
        <CardHeader className="px-3.5 sm:px-5 py-3 sm:py-4">
          <div className="flex justify-between items-start gap-2 sm:gap-4 w-full min-w-0">
            <div className="flex-1 min-w-0">
              {feed && (
                <div className="mb-2 inline-flex items-center text-[10px] uppercase tracking-wider font-bold text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-sm max-w-full truncate">
                  <svg className="w-3 h-3 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  <span className="truncate">{feed.name}</span>
                </div>
              )}
              <CardTitle className="text-base sm:text-lg md:text-xl line-clamp-2 mb-2 font-semibold break-words [overflow-wrap:anywhere]">
                {article.OriginalURL ? (
                  <a href={article.OriginalURL} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {article.Title}
                  </a>
                ) : (
                  article.Title
                )}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className={`text-[11px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-md whitespace-nowrap font-medium transition-colors duration-300 ${
                  article.Status === 'done' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' 
                    : analyzing 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 animate-pulse'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                }`}>
                  {article.Status === 'done' ? 'Готово' : analyzing ? 'Анализируем...' : 'В очереди'}
                </span>
                <CardDescription className="m-0 text-slate-500 text-xs sm:text-sm truncate">
                  <FormattedDate date={article.CreatedAt} />
                </CardDescription>
              </div>
            </div>
            <DeleteArticleButton id={article.ID} />
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-[100px] sm:min-h-[120px] px-3.5 sm:px-5 py-2">
          <AnimatePresence mode="wait">
            {article.Status === 'done' && article.AISummary ? (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-slate-50 dark:bg-slate-900 p-3 sm:p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 shadow-inner break-words [overflow-wrap:anywhere]"
              >
                <span className="font-bold block mb-1.5 sm:mb-2 text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">
                  Самое важное:
                </span>
                <div className="leading-relaxed break-words [overflow-wrap:anywhere]">{article.AISummary}</div>
              </motion.div>
            ) : analyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-6 text-center text-sm text-muted-foreground gap-3"
              >
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                <span className="font-medium text-slate-600 dark:text-slate-400">
                  Читаем статью и пишем выжимку...
                </span>
              </motion.div>
            ) : (
              <motion.div 
                key="unprocessed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-between h-full py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 px-4"
              >
                <p className="text-xs text-muted-foreground text-center">
                  Прокрутите, чтобы ИИ подготовил краткую выжимку
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        {article.Status === 'done' && article.Tags && article.Tags.length > 0 && (
          <CardFooter className="pt-0 px-3.5 sm:px-5 pb-3 sm:pb-4 flex flex-wrap gap-1.5 sm:gap-2 bg-transparent border-t-0">
            {article.Tags.map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="hover:bg-secondary/80 transition-colors text-xs max-w-full">
                <Link href={`/?tag=${encodeURIComponent(tag)}`} className="truncate max-w-full block">
                  {tag}
                </Link>
              </Badge>
            ))}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
