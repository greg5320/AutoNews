import { fetchArticles, Article } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

// Делаем страницу серверной, чтобы сразу отдавать HTML
export const dynamic = 'force-dynamic';

export default async function Home() {
  let articles: Article[] = [];
  try {
    articles = await fetchArticles();
  } catch (error) {
    console.error("Ошибка при загрузке статей:", error);
    // TODO: добавить красивую плашку с ошибкой
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
          <Link href="/settings">
            <Button variant="outline">Настройки RSS</Button>
          </Link>
          <Link href="/add">
            <Button>Добавить статью</Button>
          </Link>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Пока нет ни одной статьи. Скоро крон-джоб парсера принесет свежие новости!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articles.map((article) => (
            <Card key={article.ID} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <CardTitle className="text-xl line-clamp-2">
                    {article.OriginalURL ? (
                      <a href={article.OriginalURL} target="_blank" rel="noreferrer" className="hover:underline">
                        {article.Title}
                      </a>
                    ) : (
                      article.Title
                    )}
                  </CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                    article.Status === 'done' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {article.Status === 'done' ? 'Готово' : 'В обработке'}
                  </span>
                </div>
                <CardDescription>
                  {format(new Date(article.CreatedAt), "d MMMM yyyy, HH:mm", { locale: ru })}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {article.Status === 'done' && article.AISummary ? (
                  <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-sm text-slate-700">
                    <span className="font-semibold block mb-2 text-slate-900">✨ AI Summary:</span>
                    {article.AISummary}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Ожидаем ответа от нейросети... Попробуйте обновить страницу чуть позже.
                  </p>
                )}
              </CardContent>
              {/* Рендерим теги, если они есть */}
              {article.Tags && article.Tags.length > 0 && (
                <CardFooter className="pt-0 flex flex-wrap gap-2">
                  {article.Tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary">{tag}</Badge>
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
