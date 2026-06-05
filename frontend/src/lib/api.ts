// src/lib/api.ts

const isServer = typeof window === 'undefined';
const API_BASE = isServer ? "http://app:8002" : "http://localhost:8002";

export interface Article {
  ID: number;
  OriginalURL: string | null;
  FeedID: number | null;
  Title: string;
  Content: string;
  AISummary: string | null;
  Tags: string[] | null;
  Status: string;
  CreatedAt: string;
}

export interface Feed {
  id: number;
  name: string;
  url: string;
  created_at: string;
}

export async function fetchArticles(tag?: string, feedId?: string): Promise<Article[]> {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (feedId) params.set("feed_id", feedId);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/articles${query}`, { cache: "no-store" });
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

export async function deleteArticle(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/articles/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete article");
}

export async function deleteAllArticles(): Promise<void> {
  const res = await fetch(`${API_BASE}/articles`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete all articles");
}

export async function fetchFeeds(): Promise<Feed[]> {
  const res = await fetch(`${API_BASE}/feeds`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load feeds");
  return res.json();
}

export async function createFeed(name: string, url: string): Promise<void> {
  const res = await fetch(`${API_BASE}/feeds`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, url }),
  });
  if (!res.ok) throw new Error("Failed to create feed");
}

export async function deleteFeed(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/feeds/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete feed");
}

export async function getSettings(): Promise<{ cron_interval: string }> {
  const res = await fetch(`${API_BASE}/settings`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load settings");
  return res.json();
}

export async function updateSettings(interval: string): Promise<void> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cron_interval: interval }),
  });
  if (!res.ok) throw new Error("Failed to update settings");
}
