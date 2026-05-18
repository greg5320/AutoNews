"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Feed } from "@/lib/api";

const ALLOWED_TAGS = [
  "ИИ", "Go", "Python", "JavaScript", "TypeScript",
  "Frontend", "Backend", "DevOps", "Крипто", "Безопасность",
  "OpenSource", "Cloud", "Mobile", "Startup", "Hardware",
  "Linux", "Windows", "Apple", "Google", "Data Science",
  "Machine Learning", "Web3", "GameDev", "Архитектура", "Базы Данных",
  "Сети", "SaaS", "Гаджеты", "Программирование", "Карьера",
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

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="w-full sm:w-[250px]">
        <Select value={currentFeed} onValueChange={(val) => { if(val) handleFilter("feed_id", val) }}>
          <SelectTrigger>
            <SelectValue placeholder="Все источники" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все источники</SelectItem>
            {feeds.map((f) => (
              <SelectItem key={f.id} value={f.id.toString()}>{f.url}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-[250px]">
        <Select value={currentTag} onValueChange={(val) => { if(val) handleFilter("tag", val) }}>
          <SelectTrigger>
            <SelectValue placeholder="Все теги" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все теги</SelectItem>
            {ALLOWED_TAGS.map((t) => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
