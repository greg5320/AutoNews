import { fetchArticles, fetchFeeds, Article, Feed } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Filters } from "@/components/Filters";
import { DeleteAllButton } from "@/components/DeleteButtons";
import { RefreshButton } from "@/components/RefreshButton";
import { ArticleList, ArticleCard, articleListVariants, articleCardVariants } from "@/components/ui/motion";
import { cookies, headers } from "next/headers";
import { LazyArticleCard } from "@/components/LazyArticleCard";

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
    <main className="container mx-auto py-10 max-w-5xl px-4 relative z-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            AutoNews
          </h1>
          <p className="text-muted-foreground mt-2">
            Агрегатор статей с AI-выжимкой. Написано с душой.
          </p>
        </div>
        <div className="flex gap-4">
          <RefreshButton />
          <DeleteAllButton />
          <Link href="/settings">
            <Button variant="outline" className="shadow-sm hover:shadow transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
              Настройки ленты
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
        <ArticleList 
          variants={articleListVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2"
        >
          {articles.map((article) => {
            const feed = feeds.find(f => f.id === article.FeedID);
            return (
              <ArticleCard key={article.ID} variants={articleCardVariants}>
                <LazyArticleCard initialArticle={article} feed={feed} />
              </ArticleCard>
            )
          })}
        </ArticleList>
      )}
    </main>
  );
}
