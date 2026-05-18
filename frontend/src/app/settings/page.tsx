"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchFeeds, createFeed, deleteFeed, Feed, getSettings, updateSettings } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trash2, Plus, Clock, Settings2, Database } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

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
    <main className="container mx-auto py-10 max-w-4xl px-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link href="/">
          <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Назад к списку
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="bg-primary/10 p-2 rounded-xl">
          <Settings2 className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки RSS</h1>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Блок настройки расписания */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/60 dark:border-slate-800/60 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Частота обновления</CardTitle>
                  <CardDescription>Как часто робот должен проверять ленты на наличие новых статей.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-end">
                <div className="w-full sm:w-[220px]">
                  <Select value={interval} onValueChange={handleIntervalChange} disabled={loading}>
                    <SelectTrigger className="bg-background/50 border-slate-200 dark:border-slate-800">
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Источники (Feeds)</h2>
          </div>
          
          <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border-dashed border-slate-300 dark:border-slate-700 shadow-none">
            <CardContent className="pt-6">
              <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
                <Input 
                  placeholder="Название (напр. Hacker News)" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="sm:w-1/3 bg-background/50"
                />
                <Input 
                  placeholder="URL (напр. https://hnrss.org/frontpage)" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="flex-1 bg-background/50"
                />
                <Button type="submit" disabled={loading} className="shadow-sm">
                  <Plus className="w-4 h-4 mr-2" /> Добавить
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200/60 dark:border-slate-800/60 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Название</TableHead>
                  <TableHead className="font-semibold">URL</TableHead>
                  <TableHead className="font-semibold">Дата добавления</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Загрузка...</TableCell></TableRow>
                ) : feeds.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Нет добавленных фидов</TableCell></TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {feeds.map((feed) => (
                      <motion.tr 
                        key={feed.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="group border-b last:border-0 border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell className="font-medium">{feed.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono max-w-[300px] truncate">{feed.url}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(feed.created_at), "d MMM yyyy, HH:mm", { locale: ru })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDelete(feed.id)} 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </motion.div>
    </main>
  );
}
