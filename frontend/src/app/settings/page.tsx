"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchFeeds, createFeed, deleteFeed, Feed, getSettings, updateSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Plus, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function SettingsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [interval, setIntervalVal] = useState("10");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedsData, settingsData] = await Promise.all([
        fetchFeeds(),
        getSettings(),
      ]);
      setFeeds(feedsData);
      setIntervalVal(settingsData.cron_interval);
    } catch (e) {
      toast.error("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl || !newName) {
      toast.error("Заполните оба поля");
      return;
    }
    try {
      await createFeed(newName, newUrl);
      toast.success("Фид добавлен");
      setNewName("");
      setNewUrl("");
      loadData();
    } catch (e) {
      toast.error("Ошибка добавления фида");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFeed(id);
      toast.success("Фид удален");
      loadData();
    } catch (e) {
      toast.error("Ошибка удаления");
    }
  };

  const handleIntervalChange = async (newInterval: string | null) => {
    if (!newInterval) return;
    try {
      await updateSettings(newInterval);
      setIntervalVal(newInterval);
      toast.success("Интервал обновления сохранен");
    } catch (e) {
      toast.error("Ошибка сохранения интервала");
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

      {/* Блок настройки расписания */}
      <div className="mb-10 bg-muted/30 p-6 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Частота обновления</h2>
            <p className="text-sm text-muted-foreground">Как часто робот должен проверять ленты на наличие новых статей.</p>
          </div>
          <div className="w-[180px]">
            <Select value={interval} onValueChange={handleIntervalChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите интервал" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Каждую 1 минуту</SelectItem>
                <SelectItem value="5">Каждые 5 минут</SelectItem>
                <SelectItem value="10">Каждые 10 минут</SelectItem>
                <SelectItem value="30">Каждые 30 минут</SelectItem>
                <SelectItem value="60">Каждый 1 час</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Источники (Feeds)</h2>
      <form onSubmit={handleAdd} className="flex gap-4 mb-6">
        <Input 
          placeholder="Название (напр. Hacker News)" 
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-1/3"
        />
        <Input 
          placeholder="URL (напр. https://hnrss.org/frontpage)" 
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          <Plus className="w-4 h-4 mr-2" /> Добавить
        </Button>
      </form>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Название</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Дата добавления</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center">Загрузка...</TableCell></TableRow>
            ) : feeds.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Нет добавленных фидов</TableCell></TableRow>
            ) : (
              feeds.map((feed) => (
                <TableRow key={feed.id}>
                  <TableCell className="font-medium">{feed.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{feed.url}</TableCell>
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
