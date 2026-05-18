"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchFeeds, createFeed, deleteFeed, Feed } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function SettingsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    try {
      const data = await fetchFeeds();
      setFeeds(data);
    } catch (e) {
      toast.error("Ошибка загрузки фидов");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;
    try {
      await createFeed(newUrl);
      toast.success("Фид добавлен");
      setNewUrl("");
      loadFeeds();
    } catch (e) {
      toast.error("Ошибка добавления фида");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFeed(id);
      toast.success("Фид удален");
      loadFeeds();
    } catch (e) {
      toast.error("Ошибка удаления");
    }
  };

  return (
    <main className="container mx-auto py-10 max-w-4xl px-4">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к списку
          </Button>
        </Link>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Настройки RSS</h1>

      <form onSubmit={handleAdd} className="flex gap-4 mb-8">
        <Input 
          placeholder="https://hnrss.org/frontpage" 
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Plus className="w-4 h-4 mr-2" /> Добавить
        </Button>
      </form>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Дата добавления</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center">Загрузка...</TableCell></TableRow>
            ) : feeds.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">Нет добавленных фидов</TableCell></TableRow>
            ) : (
              feeds.map((feed) => (
                <TableRow key={feed.id}>
                  <TableCell className="font-medium">{feed.url}</TableCell>
                  <TableCell>{format(new Date(feed.created_at), "d MMM yyyy, HH:mm", { locale: ru })}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(feed.id)} className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
