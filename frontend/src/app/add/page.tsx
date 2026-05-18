"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createArticle } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AddArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Заполните все поля");
      return;
    }

    setLoading(true);
    try {
      await createArticle(title, content);
      toast.success("Статья успешно отправлена на обработку!");
      router.push("/");
      router.refresh(); // Обновляем данные на главной
    } catch (error) {
      console.error(error);
      toast.error("Произошла ошибка при отправке статьи. Проверьте подключение к бэкенду.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-10 max-w-2xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Новая статья</CardTitle>
          <CardDescription>
            Вставьте текст статьи, и наша нейросеть (Gemini) сделает из нее краткую выжимку в фоновом режиме.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input
                id="title"
                placeholder="Например: Релиз новой версии Go 1.22"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Текст статьи</Label>
              <Textarea
                id="content"
                placeholder="Вставьте полный текст новости сюда..."
                className="min-h-[250px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить на анализ"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
