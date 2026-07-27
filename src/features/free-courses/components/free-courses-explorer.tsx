"use client";

import * as React from "react";
import { Search, SearchX } from "lucide-react";

import type { FreeProgram } from "@/lib/dal/free-courses";
import { Input } from "@/components/ui/input";
import { FreeProgramCard } from "./free-program-card";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

/** Searchable, responsive grid of free programs. */
export function FreeCoursesExplorer({ locale, programs }: { locale: string; programs: FreeProgram[] }) {
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return programs;
    return programs.filter((p) => {
      const hay = [
        p.titleEn, p.titleAr, p.descriptionEn, p.descriptionAr,
        ...p.lectures.map((l) => `${l.titleEn} ${l.titleAr}`),
      ].join(" ").toLowerCase();
      return hay.includes(s);
    });
  }, [programs, q]);

  return (
    <div>
      <div className="mx-auto flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr(locale, "Search topics or lectures…", "ابحث عن موضوع أو محاضرة…")}
            className="h-11 ps-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed border-border/70 py-14 text-center">
          <SearchX className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">{tr(locale, "No results", "لا توجد نتائج")}</p>
          <p className="text-xs text-muted-foreground">{tr(locale, "Try another keyword.", "جرّب كلمة أخرى.")}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <FreeProgramCard key={p.id} locale={locale} program={p} />
          ))}
        </div>
      )}
    </div>
  );
}
