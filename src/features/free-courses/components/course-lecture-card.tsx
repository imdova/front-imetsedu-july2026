import { PlayCircle, Play, Sparkles, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CourseRow } from "@/types";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

/**
 * A real platform course shown as a "free lecture" entry point. Clicking it
 * opens the course's free-lecture landing page (`href`).
 */
export function CourseLectureCard({
  locale, course, href,
}: {
  locale: string; course: CourseRow; href: string;
}) {
  const title = (locale === "ar" ? course.titleAr : course.titleEn) || course.titleEn;
  const category = (locale === "ar" ? course.categoryAr : course.category) || course.category;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={course.thumbnailUrl} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-primary/15 to-primary/5">
            <PlayCircle className="size-12 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid size-14 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="size-6 translate-x-0.5 fill-current rtl:-translate-x-0.5 rtl:-scale-x-100" />
          </span>
        </div>
        <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
          <Sparkles className="size-3" /> {tr(locale, "FREE LECTURE", "محاضرة مجانية")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {category && (
          <span className="mb-2 inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {category}
          </span>
        )}
        <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs font-medium text-muted-foreground">{tr(locale, "Free intro lecture", "محاضرة تعريفية مجانية")}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {tr(locale, "Watch free", "شاهد مجانًا")}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}
