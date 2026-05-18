"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteArticle, deleteAllArticles } from "@/lib/api";
import { toast } from "sonner";

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
      className="text-destructive hover:bg-destructive/10 shrink-0" 
      onClick={handleDelete}
      disabled={loading}
      title="Удалить статью"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function DeleteAllButton() {
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
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Удалить все
    </Button>
  );
}
