"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Feed } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const ALLOWED_TAGS = [
  "Политика", "Экономика", "Общество", "Происшествия", "Бизнес",
  "Наука", "Технологии", "Медицина", "Здоровье", "Образование",
  "Спорт", "Культура", "Искусство", "Кино", "Музыка",
  "Путешествия", "Авто", "Недвижимость", "Криминал", "Экология",
  "Погода", "Мода", "Еда", "Игры", "История",
  "Финансы", "Психология", "Лайфстайл", "Религия", "Юмор",
];

interface FiltersProps {
  feeds: Feed[];
}

export function Filters({ feeds }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTag = searchParams.get("tag") || "all";
  const currentFeed = searchParams.get("feed_id") || "all";

  const handleFilter = (type: "tag" | "feed_id", value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(type);
    } else {
      params.set(type, value);
    }
    router.push(`/?${params.toString()}`);
  };

  const resetFilters = () => {
    router.push("/");
  };

  const isActive = currentTag !== "all" || currentFeed !== "all";

  return (
    <div className="mb-6 flex gap-2 items-center">
      <Popover>
        <PopoverTrigger className="focus:outline-none focus:ring-0">
          <div 
            className={cn(
              "inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 w-full sm:w-[250px] shadow-sm transition-all duration-200", 
              isActive 
                ? "border border-blue-500/50 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500/50" 
                : "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Filter className={cn("mr-2 h-4 w-4 transition-transform duration-300", isActive && "rotate-180")} />
            {isActive ? "Фильтры (активны)" : "Фильтры"}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0 overflow-hidden border-slate-200/60 dark:border-slate-800/60 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80" align="start">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-[350px] divide-x divide-slate-200 dark:divide-slate-800"
          >
            
            {/* Левая колонка: Источники */}
            <div className="w-1/2 flex flex-col">
              <div className="p-3 font-semibold text-sm border-b bg-muted/30">
                Ленты (Источники)
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1 custom-scrollbar">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start font-normal transition-colors", currentFeed === "all" && "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium")}
                  onClick={() => handleFilter("feed_id", "all")}
                >
                  Все источники
                </Button>
                {feeds.map((f) => (
                  <Button
                    key={f.id}
                    variant="ghost"
                    className={cn("w-full justify-start font-normal truncate transition-colors", currentFeed === f.id.toString() && "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium")}
                    onClick={() => handleFilter("feed_id", f.id.toString())}
                    title={f.url}
                  >
                    {f.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Правая колонка: Теги */}
            <div className="w-1/2 flex flex-col">
              <div className="p-3 font-semibold text-sm border-b bg-muted/30">
                Теги
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1 custom-scrollbar">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start font-normal transition-colors", currentTag === "all" && "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium")}
                  onClick={() => handleFilter("tag", "all")}
                >
                  Все теги
                </Button>
                {ALLOWED_TAGS.map((t) => (
                  <Button
                    key={t}
                    variant="ghost"
                    className={cn("w-full justify-start font-normal transition-colors", currentTag === t && "bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium")}
                    onClick={() => handleFilter("tag", t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

          </motion.div>
        </PopoverContent>
      </Popover>

      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-muted-foreground hover:text-destructive transition-colors h-9"
            >
              <X className="mr-2 h-4 w-4" />
              Сбросить
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
