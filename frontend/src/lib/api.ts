// src/lib/api.ts

// TODO: Вынести базовый урл в переменные окружения (.env.local), чтобы на проде не отвалилось
const API_BASE = "http://localhost:8080";

export interface Article {
  ID: number;
  Title: string;
  Content: string;
  AISummary: string | null;
  Status: string;
  CreatedAt: string;
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${API_BASE}/articles`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Не удалось загрузить статьи");
  }
  return res.json();
}

export async function createArticle(title: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  });

  if (!res.ok) {
    throw new Error("Не удалось создать статью");
  }
}
