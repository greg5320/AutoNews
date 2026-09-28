"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Article, Feed } from "@/lib/api";
import { LazyArticleCard } from "@/components/LazyArticleCard";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface ArticleFeedProps {
  articles: Article[];
  feeds: Feed[];
}

const BATCH_SIZE = 6;

export function ArticleFeed({ articles, feeds }: ArticleFeedProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const halfwayCardRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Сброс при смене набора статей (например, при смене фильтра по тегу или источнику)
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [articles]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= articles.length) return prev;
      return Math.min(prev + BATCH_SIZE, articles.length);
    });
  }, [articles.length]);

  // Индекс карточки на середине текущего видимого списка.
  // Например, при visibleCount = 6: halfIndex = 3 (4-я карточка).
  // При visibleCount = 12: halfIndex = 6 (7-я карточка).
  const halfIndex = Math.max(0, Math.floor(visibleCount / 2));

  // Наблюдатель за серединой списка: когда пользователь доходит до середины, подгружаются следующие 6
  useEffect(() => {
    const target = halfwayCardRef.current;
    if (!target || visibleCount >= articles.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "150px", // Срабатывает чуть заранее для плавности
        threshold: 0.1,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, articles.length, loadMore, halfIndex]);

  // Дополнительный наблюдатель снизу: если пользователь быстро пролистал до конца
  useEffect(() => {
    const target = bottomRef.current;
    if (!target || visibleCount >= articles.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.05,
      }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visibleCount, articles.length, loadMore]);

  const visibleArticles = articles.slice(0, visibleCount);

  return (
    <div className="w-full min-w-0">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 w-full min-w-0">
        {visibleArticles.map((article, index) => {
          const feed = feeds.find((f) => f.id === article.FeedID);
          const isHalfwayCard = index === halfIndex;

          return (
            <div
              key={article.ID}
              ref={isHalfwayCard ? halfwayCardRef : null}
              className="w-full min-w-0"
            >
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="w-full h-full min-w-0"
              >
                <LazyArticleCard initialArticle={article} feed={feed} />
              </motion.div>
            </div>
          );
        })}
      </div>

      {visibleCount < articles.length && (
        <div
          ref={bottomRef}
          className="py-8 flex justify-center items-center text-muted-foreground gap-2.5 text-xs sm:text-sm"
        >
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Подгружаем ещё новости ({visibleCount} из {articles.length})...</span>
        </div>
      )}

      {visibleCount >= articles.length && articles.length > BATCH_SIZE && (
        <div className="py-8 text-center text-xs text-muted-foreground">
          Показаны все новости ({articles.length})
        </div>
      )}
    </div>
  );
}
