"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Search, Play, Heart, Sparkles, ArrowRight, GraduationCap } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@integration/constants";
import type { EnrolledCourse } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Tab = "all" | "active" | "completed" | "favorites";

export function MyCourses({ courses }: { courses: EnrolledCourse[] }) {
  const t = useTranslations("Student");
  const router = useRouter();
  const [items, setItems] = React.useState(courses);
  const [tab, setTab] = React.useState<Tab>("all");
  const [search, setSearch] = React.useState("");

  // Re-seed from the prop when it changes, keeping local edits (favourites) in
  // between. Adjusting during render rather than in an effect: React re-runs
  // this render immediately instead of committing the stale list first.
  const [prevCourses, setPrevCourses] = React.useState(courses);
  if (courses !== prevCourses) {
    setPrevCourses(courses);
    setItems(courses);
  }

  const toggleFav = (id: string) => {
    setItems((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const next = !c.isFavorite;
      toast.success(next ? t("addedToFavorites") : t("removedFromFavorites"));
      return { ...c, isFavorite: next };
    }));
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (tab === "active" && c.progress >= 100) return false;
      if (tab === "completed" && c.progress < 100) return false;
      if (tab === "favorites" && !c.isFavorite) return false;
      if (q && !c.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [items, tab, search]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: t("tabAll") },
    { key: "active", label: t("tabActive") },
    { key: "completed", label: t("tabCompleted") },
    { key: "favorites", label: t("tabFavorites") },
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchCourses")} className="h-12 rounded-xl ps-11" />
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((x) => (
          <button key={x.key} type="button" onClick={() => setTab(x.key)}
            className={cn("rounded-xl px-5 py-2 text-sm font-semibold transition-colors",
              tab === x.key ? "bg-primary text-primary-foreground shadow-sm" : "border border-border/70 bg-card text-foreground hover:bg-muted/50")}>
            {x.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Courses */}
        <div>
          {filtered.length === 0 ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-20 text-center">
              <GraduationCap className="size-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">{t("noCoursesFound")}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => <CourseCard key={c.id} course={c} onFav={() => toggleFav(c.id)} onOpen={() => router.push(ROUTES.STUDENT.COURSE_OVERVIEW(c.id))} t={t} />)}
            </div>
          )}
        </div>

        {/* Promo sidebar */}
        <aside className="space-y-5">
          <PromoCard tone="bg-primary text-primary-foreground" tag={t("promoNewTag")} title={t("promoNewTitle")} body={t("promoNewBody")}
            cta={t("exploreCatalog")} onClick={() => router.push("/courses")} />
          <PromoCard tone="bg-emerald-600 text-white" tag={t("promoReferTag")} title={t("promoReferTitle")} body={t("promoReferBody")}
            cta={t("getReferralLink")} onClick={() => { navigator.clipboard?.writeText("https://imetsedu.com/r/mostafa"); toast.success(t("referralCopied")); }} />
          <PromoCard tone="bg-slate-900 text-white" tag={t("promoCareerTag")} title={t("promoCareerTitle")} body={t("promoCareerBody")}
            cta={t("viewCertificates")} onClick={() => router.push("/student/certificates")} />
        </aside>
      </div>
    </div>
  );
}

function CourseCard({ course, onFav, onOpen, t }: { course: EnrolledCourse; onFav: () => void; onOpen: () => void; t: (k: string) => string }) {
  const done = course.progress >= 100;
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="relative aspect-video bg-muted">
        <Image src={course.thumbnailUrl} alt={course.title} fill sizes="(max-width:768px)100vw,33vw" className="object-cover" />
        <button type="button" aria-label="favorite" onClick={onFav}
          className="absolute end-3 top-3 grid size-8 place-items-center rounded-full bg-black/30 text-white backdrop-blur transition-colors hover:bg-black/50">
          <Heart className={cn("size-4", course.isFavorite && "fill-current text-red-400")} />
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {(course.category || course.subcategory) && (
          <div className="flex flex-wrap gap-1.5">
            {course.category && <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-white">{course.category}</span>}
            {course.subcategory && <span className="rounded-md bg-muted px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-muted-foreground">{course.subcategory}</span>}
          </div>
        )}
        <h3 className="line-clamp-1 font-heading text-base font-semibold">{course.title}</h3>
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wide text-muted-foreground">{t("progressLabel")}</span>
            <span className="font-bold tabular-nums">{course.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${course.progress}%` }} />
          </div>
        </div>
        <Button className="gap-2" onClick={onOpen}>
          <Play className="size-4" />{done ? t("reviewCourse") : t("resumeLearning")}
        </Button>
      </div>
    </div>
  );
}

function PromoCard({ tone, tag, title, body, cta, onClick }: { tone: string; tag: string; title: string; body: string; cta: string; onClick: () => void }) {
  return (
    <div className={cn("rounded-2xl p-5 shadow-sm", tone)}>
      <p className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-wide opacity-90"><Sparkles className="size-3.5" />{tag}</p>
      <h3 className="mt-2 text-lg font-bold leading-snug">{title}</h3>
      <p className="mt-2 text-sm opacity-90">{body}</p>
      <button type="button" onClick={onClick}
        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
        {cta}<ArrowRight className="size-4 rtl:rotate-180" />
      </button>
    </div>
  );
}
