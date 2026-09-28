"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RefreshButtonProps {
  className?: string;
}

export function RefreshButton({ className }: RefreshButtonProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 700); // небольшая задержка для визуального эффекта
  };

  return (
    <Button 
      variant="secondary" 
      onClick={handleRefresh} 
      className={cn(
        "shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm px-2.5 sm:px-4 h-9 flex-1 sm:flex-initial justify-center",
        className
      )}
    >
      <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 shrink-0", isRefreshing && "animate-spin")} />
      <span>Обновить</span>
    </Button>
  );
}
