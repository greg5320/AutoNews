import { fetchArticles, fetchFeeds, Article, Feed } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Filters } from "@/components/Filters";
import { DeleteAllButton, DeleteArticleButton } from "@/components/DeleteButtons";
import { ArticleList, ArticleCard, articleListVariants, articleCardVariants } from "@/components/ui/motion";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { tag?: string, feed_id?: string } }) {
  let articles: Article[] = [];
  let feeds: Feed[] = [];
  try {
    articles = await fetchArticles(searchParams.tag, searchParams.feed_id);
    feeds = await fetchFeeds();
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
          <DeleteAllButton />
          <Link href="/settings">
            <Button variant="outline" className="shadow-sm hover:shadow transition-shadow">
              Настройки RSS
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
          {articles.map((article) => (
            <ArticleCard key={article.ID} variants={articleCardVariants}>
              <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl line-clamp-2 mb-2 font-semibold">
                        {article.OriginalURL ? (
                          <a href={article.OriginalURL} target="_blank" rel="noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {article.Title}
                          </a>
                        ) : (
                          article.Title
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-md whitespace-nowrap font-medium ${
                          article.Status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                        }`}>
                          {article.Status === 'done' ? 'Готово' : 'В обработке'}
                        </span>
                        <CardDescription className="m-0 text-slate-500">
                          {format(new Date(article.CreatedAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                        </CardDescription>
                      </div>
                    </div>
                    <DeleteArticleButton id={article.ID} />
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {article.Status === 'done' && article.AISummary ? (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 shadow-inner">
                      <span className="font-bold block mb-2 text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[10px]">Самое важное:</span>
                      <div className="leading-relaxed">{article.AISummary}</div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Ожидаем ответа от нейросети... Попробуйте обновить страницу чуть позже.
                    </p>
                  )}
                </CardContent>
                {article.Tags && article.Tags.length > 0 && (
                  <CardFooter className="pt-0 flex flex-wrap gap-2 bg-transparent border-t-0">
                    {article.Tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="hover:bg-secondary/80 transition-colors">
                        <Link href={`/?tag=${encodeURIComponent(tag)}`}>
                          {tag}
                        </Link>
                      </Badge>
                    ))}
                  </CardFooter>
                )}
              </Card>
            </ArticleCard>
          ))}
        </ArticleList>
      )}
    </main>
  );
}
