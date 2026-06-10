// src/lib/api.ts

const isServer = typeof window === 'undefined';
const API_BASE = isServer ? "http://app:8002" : "/api";

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

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function getUserId(): string {
  if (typeof window === 'undefined') {
    return "";
  }
  let id = getCookie("user_id");
  if (!id) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    document.cookie = `user_id=${id}; max-age=${60 * 60 * 24 * 365 * 10}; path=/; SameSite=Lax`;
  }
  return id;
}

function getHeaders(userId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const actualUserId = userId || getUserId();
  if (actualUserId) {
    headers["X-User-ID"] = actualUserId;
  }
  return headers;
}

export async function fetchArticles(tag?: string, feedId?: string, userId?: string): Promise<Article[]> {
  const params = new URLSearchParams();
  if (tag) params.set("tag", tag);
  if (feedId) params.set("feed_id", feedId);
  
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${API_BASE}/articles${query}`, { 
    cache: "no-store",
    headers: getHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to load articles");
  return res.json();
}

export async function fetchArticle(id: number, userId?: string): Promise<Article> {
  const res = await fetch(`${API_BASE}/articles/${id}`, {
    cache: "no-store",
    headers: getHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to load article");
  return res.json();
}

export async function createArticle(title: string, content: string, userId?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/articles`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) throw new Error("Failed to create article");
}

export async function deleteArticle(id: number, userId?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/articles/${id}`, { 
    method: "DELETE",
    headers: getHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to delete article");
}

export async function deleteAllArticles(userId?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/articles`, { 
    method: "DELETE",
    headers: getHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to delete all articles");
}

export async function fetchFeeds(userId?: string): Promise<Feed[]> {
  const res = await fetch(`${API_BASE}/feeds`, { 
    cache: "no-store",
    headers: getHeaders(userId),
  });
  if (!res.ok) throw new Error("Failed to load feeds");
  return res.json();
}

export async function createFeed(name: string, url: string, userId?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/feeds`, {
    method: "POST",
    headers: getHeaders(userId),
    body: JSON.stringify({ name, url }),
  });
  if (!res.ok) throw new Error("Failed to create feed");
}

export async function deleteFeed(id: number, userId?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/feeds/${id}`, { 
    method: "DELETE",
    headers: getHeaders(userId),
  });
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
