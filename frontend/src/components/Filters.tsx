"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Feed } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const isActive = currentTag !== "all" || currentFeed !== "all";

  return (
    <div className="mb-6">
      <Popover>
        <PopoverTrigger>
          <div className={cn("inline-flex items-center justify-start whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 w-full sm:w-[250px]", isActive ? "bg-secondary text-secondary-foreground hover:bg-secondary/80" : "bg-transparent")}>
            <Filter className="mr-2 h-4 w-4" />
            {isActive ? "Фильтры (активны)" : "Фильтры"}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0" align="start">
          <div className="flex h-[350px] divide-x">
            
            {/* Левая колонка: Источники */}
            <div className="w-1/2 flex flex-col">
              <div className="p-3 font-semibold text-sm border-b bg-muted/50">
                Ленты (Источники)
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start font-normal", currentFeed === "all" && "bg-accent font-medium")}
                  onClick={() => handleFilter("feed_id", "all")}
                >
                  Все источники
                </Button>
                {feeds.map((f) => (
                  <Button
                    key={f.id}
                    variant="ghost"
                    className={cn("w-full justify-start font-normal truncate", currentFeed === f.id.toString() && "bg-accent font-medium")}
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
              <div className="p-3 font-semibold text-sm border-b bg-muted/50">
                Теги
              </div>
              <div className="p-2 overflow-y-auto flex-1 space-y-1">
                <Button
                  variant="ghost"
                  className={cn("w-full justify-start font-normal", currentTag === "all" && "bg-accent font-medium")}
                  onClick={() => handleFilter("tag", "all")}
                >
                  Все теги
                </Button>
                {ALLOWED_TAGS.map((t) => (
                  <Button
                    key={t}
                    variant="ghost"
                    className={cn("w-full justify-start font-normal", currentTag === t && "bg-accent font-medium")}
                    onClick={() => handleFilter("tag", t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>

          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
