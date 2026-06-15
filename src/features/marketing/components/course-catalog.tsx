"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";

import type { CourseRow } from "@/types";
import { DIFFICULTY_OPTIONS } from "@/constants/course-options";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CourseCard } from "./course-card";

export function CourseCatalog({ courses }: { courses: CourseRow[] }) {
  const t = useTranslations("Marketing");
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [level, setLevel] = React.useState("all");

  const categories = React.useMemo(
    () => Array.from(new Set(courses.map((c) => c.category))),
    [courses],
  );

  const filtered = courses.filter((c) => {
    if (search) {
      const q = search.toLowerCase();
      if (!c.titleEn.toLowerCase().includes(q) && !c.titleAr.includes(search))
        return false;
    }
    if (category !== "all" && c.category !== category) return false;
    if (level !== "all" && c.difficulty !== level) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-9"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllCategories")}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAllLevels")}</SelectItem>
            {DIFFICULTY_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          {t("noCoursesFound")}
        </p>
      )}
    </div>
  );
}
