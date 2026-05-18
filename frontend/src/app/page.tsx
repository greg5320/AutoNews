import { fetchArticles, fetchFeeds, Article, Feed } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Filters } from "@/components/Filters";
import { DeleteAllButton, DeleteArticleButton } from "@/components/DeleteButtons";

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
    <main className="container mx-auto py-10 max-w-5xl px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">AutoNews 📰</h1>
          <p className="text-muted-foreground mt-2">
            Агрегатор статей с AI-выжимкой. Написано с душой.
          </p>
        </div>
        <div className="flex gap-4">
          <DeleteAllButton />
          <Link href="/settings">
            <Button variant="outline">Настройки RSS</Button>
          </Link>
        </div>
      </div>

      <Filters feeds={feeds} />

      {articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Ничего не найдено. Попробуйте сбросить фильтры.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Card key={article.ID} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl line-clamp-2 mb-2">
                      {article.OriginalURL ? (
                        <a href={article.OriginalURL} target="_blank" rel="noreferrer" className="hover:underline">
                          {article.Title}
                        </a>
                      ) : (
                        article.Title
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        article.Status === 'done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.Status === 'done' ? 'Готово' : 'В обработке'}
                      </span>
                      <CardDescription className="m-0">
                        {format(new Date(article.CreatedAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                      </CardDescription>
                    </div>
                  </div>
                  <DeleteArticleButton id={article.ID} />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                {article.Status === 'done' && article.AISummary ? (
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-700">
                    <span className="font-semibold block mb-2 text-slate-900">✨ Самое важное:</span>
                    {article.AISummary}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Ожидаем ответа от нейросети... Попробуйте обновить страницу чуть позже.
                  </p>
                )}
              </CardContent>
              {article.Tags && article.Tags.length > 0 && (
                <CardFooter className="pt-0 flex flex-wrap gap-2">
                  {article.Tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      <Link href={`/?tag=${encodeURIComponent(tag)}`} className="hover:underline">
                        {tag}
                      </Link>
                    </Badge>
                  ))}
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
