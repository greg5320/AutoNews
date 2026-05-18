// src/lib/api.ts

const isServer = typeof window === 'undefined';
const API_BASE = isServer ? "http://app:8002" : "http://localhost:8002";

export interface Article {
  ID: number;
  OriginalURL: string | null;
  Title: string;
  Content: string;
  AISummary: string | null;
  Tags: string[] | null;
  Status: string;
  CreatedAt: string;
}

export interface Feed {
  id: number;
  url: string;
  created_at: string;
}

export async function fetchArticles(): Promise<Article[]> {
  const res = await fetch(`${API_BASE}/articles`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load articles");
  return res.json();
}

export async function createArticle(title: string, content: string): Promise<void> {
  const res = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to create article");
}

export async function fetchFeeds(): Promise<Feed[]> {
  const res = await fetch(`${API_BASE}/feeds`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load feeds");
  return res.json();
}

export async function createFeed(url: string): Promise<void> {
  const res = await fetch(`${API_BASE}/feeds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("Failed to create feed");
}

export async function deleteFeed(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/feeds/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feed");
}
