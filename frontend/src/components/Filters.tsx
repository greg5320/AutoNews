"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Feed } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  const [activeMobileTab, setActiveMobileTab] = useState<"feeds" | "tags">("feeds");

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
  const selectedFeed = feeds.find((f) => f.id.toString() === currentFeed);

  return (
    <div className="mb-6 flex flex-wrap gap-2 items-center w-full min-w-0">
      <Popover>
        <PopoverTrigger className="w-full sm:w-auto focus:outline-none focus:ring-0">
          <div 
            className={cn(
              "inline-flex items-center justify-between sm:justify-start whitespace-nowrap rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 px-3.5 sm:px-4 py-2 w-full sm:w-[250px] shadow-sm transition-all duration-200 cursor-pointer", 
              isActive 
                ? "border border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 shadow-blue-500/10" 
                : "border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
            )}
          >
            <div className="inline-flex items-center truncate">
              <Filter className={cn("mr-2 h-4 w-4 shrink-0 transition-transform duration-300", isActive && "rotate-180")} />
              <span className="truncate">{isActive ? "Фильтры (активны)" : "Фильтры"}</span>
            </div>
            {isActive && (
              <span className="ml-2 flex h-2 w-2 rounded-full bg-blue-600 sm:hidden" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[calc(100vw-1.5rem)] sm:w-[580px] max-w-[calc(100vw-1.5rem)] p-0 overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xl" 
          align="start"
        >
          {/* Мобильные вкладки */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 sm:hidden bg-slate-50 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveMobileTab("feeds")}
              className={cn(
                "flex-1 py-2.5 px-3 text-xs font-semibold text-center border-b-2 transition-colors",
                activeMobileTab === "feeds"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              Источники {currentFeed !== "all" ? "(1)" : ""}
            </button>
            <button
              type="button"
              onClick={() => setActiveMobileTab("tags")}
              className={cn(
                "flex-1 py-2.5 px-3 text-xs font-semibold text-center border-b-2 transition-colors",
                activeMobileTab === "tags"
                  ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-950 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              Теги {currentTag !== "all" ? "(1)" : ""}
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-[320px] sm:h-[360px] divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800"
          >
            {/* Колонка: Источники */}
            <div className={cn(
              "w-full sm:w-1/2 flex-col",
              activeMobileTab === "feeds" ? "flex" : "hidden sm:flex"
            )}>
              <div className="p-2.5 sm:p-3 font-bold text-[10px] uppercase tracking-wider border-b bg-slate-50 dark:bg-slate-900 text-slate-500 hidden sm:block">
                Ленты (Источники)
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1 custom-scrollbar">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start font-normal text-xs sm:text-sm h-8 sm:h-9 transition-colors", currentFeed === "all" && "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold")}
                  onClick={() => handleFilter("feed_id", "all")}
                >
                  Все источники
                </Button>
                {feeds.map((f) => (
                  <Button
                    key={f.id}
                    variant="ghost"
                    className={cn("w-full justify-start font-normal text-xs sm:text-sm h-8 sm:h-9 truncate transition-colors", currentFeed === f.id.toString() && "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold")}
                    onClick={() => handleFilter("feed_id", f.id.toString())}
                    title={f.url}
                  >
                    <span className="truncate">{f.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Колонка: Теги */}
            <div className={cn(
              "w-full sm:w-1/2 flex-col",
              activeMobileTab === "tags" ? "flex" : "hidden sm:flex"
            )}>
              <div className="p-2.5 sm:p-3 font-bold text-[10px] uppercase tracking-wider border-b bg-slate-50 dark:bg-slate-900 text-slate-500 hidden sm:block">
                Теги
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1 custom-scrollbar">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start font-normal text-xs sm:text-sm h-8 sm:h-9 transition-colors", currentTag === "all" && "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold")}
                  onClick={() => handleFilter("tag", "all")}
                >
                  Все теги
                </Button>
                {ALLOWED_TAGS.map((t) => (
                  <Button
                    key={t}
                    variant="ghost"
                    className={cn("w-full justify-start font-normal text-xs sm:text-sm h-8 sm:h-9 transition-colors", currentTag === t && "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold")}
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

      {/* Индикация активных фильтров с кнопками удаления */}
      <AnimatePresence>
        {currentFeed !== "all" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Badge 
              variant="outline" 
              className="h-8 gap-1.5 px-2.5 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs"
            >
              <span className="max-w-[130px] sm:max-w-[180px] truncate">
                {selectedFeed?.name || `Лента #${currentFeed}`}
              </span>
              <button 
                type="button" 
                onClick={() => handleFilter("feed_id", "all")}
                className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                title="Удалить фильтр по ленте"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
        )}

        {currentTag !== "all" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Badge 
              variant="outline" 
              className="h-8 gap-1.5 px-2.5 bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs"
            >
              <span className="max-w-[130px] sm:max-w-[180px] truncate">{currentTag}</span>
              <button 
                type="button" 
                onClick={() => handleFilter("tag", "all")}
                className="hover:text-blue-900 dark:hover:text-blue-100 transition-colors"
                title="Удалить фильтр по тегу"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </motion.div>
        )}

        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
          >
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-muted-foreground hover:text-destructive transition-colors h-8 px-2 text-xs"
            >
              <X className="mr-1 h-3.5 w-3.5" />
              Сбросить все
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
