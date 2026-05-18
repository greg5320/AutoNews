// src/lib/api.ts

// Если код выполняется на сервере (Next.js SSR) внутри Docker, мы обращаемся к 'app' (имя сервиса backend'а в docker-compose).
// Если в браузере (клиентский компонент), то стучимся на localhost.
// TODO: Вынести урлы в переменные окружения (.env.local) для прода.
const isServer = typeof window === 'undefined';
const API_BASE = isServer ? "http://app:8080" : "http://localhost:8080";

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
