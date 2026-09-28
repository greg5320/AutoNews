import { fetchArticles, fetchFeeds, Article, Feed } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Filters } from "@/components/Filters";
import { DeleteAllButton } from "@/components/DeleteButtons";
import { RefreshButton } from "@/components/RefreshButton";
import { cookies, headers } from "next/headers";
import { ArticleFeed } from "@/components/ArticleFeed";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { tag?: string, feed_id?: string } }) {
  const cookieStore = cookies();
  const headerStore = headers();
  const userId = cookieStore.get("user_id")?.value || headerStore.get("x-user-id") || "";

  let articles: Article[] = [];
  let feeds: Feed[] = [];
  try {
    articles = await fetchArticles(searchParams.tag, searchParams.feed_id, userId);
    feeds = await fetchFeeds(userId);
  } catch (error) {
    console.error("Ошибка при загрузке:", error);
  }

  return (
    <main className="container mx-auto py-6 sm:py-10 max-w-5xl px-3 sm:px-4 relative z-10 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            AutoNews
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Агрегатор статей с AI-выжимкой. Написано с душой.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <RefreshButton />
          <DeleteAllButton />
          <Link href="/settings" className="flex-1 sm:flex-initial">
            <Button variant="outline" className="w-full shadow-sm hover:shadow transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm px-2.5 sm:px-4 h-9 justify-center whitespace-nowrap">
              <span className="hidden sm:inline">Настройки ленты</span>
              <span className="sm:hidden">Настройки</span>
            </Button>
          </Link>
        </div>
      </div>

      <Filters feeds={feeds} />

      {articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Ничего не найдено. Попробуйте сбросить фильтры.
        </div>
      ) : (
        <ArticleFeed articles={articles} feeds={feeds} />
      )}
    </main>
  );
}
