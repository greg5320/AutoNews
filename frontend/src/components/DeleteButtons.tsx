"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteArticle, deleteAllArticles } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function DeleteArticleButton({ id }: { id: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Удалить эту статью?")) return;
    
    setLoading(true);
    try {
      await deleteArticle(id);
      toast.success("Статья удалена");
      router.refresh();
    } catch (e) {
      toast.error("Ошибка при удалении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8 sm:h-9 sm:w-9" 
      onClick={handleDelete}
      disabled={loading}
      title="Удалить статью"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function DeleteAllButton({ className }: { className?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDeleteAll = async () => {
    if (!confirm("ВЫ УВЕРЕНЫ? Это удалит все статьи из базы данных!")) return;

    setLoading(true);
    try {
      await deleteAllArticles();
      toast.success("Все статьи удалены");
      router.refresh();
    } catch (e) {
      toast.error("Ошибка при удалении");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleDeleteAll}
      disabled={loading}
      className={cn(
        "text-xs sm:text-sm px-2.5 sm:px-4 h-9 flex-1 sm:flex-initial justify-center whitespace-nowrap",
        className
      )}
    >
      <Trash2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
      <span>Удалить все</span>
    </Button>
  );
}
