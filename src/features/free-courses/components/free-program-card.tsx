import { PlayCircle, ArrowRight, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { FreeProgram } from "@/lib/dal/free-courses";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

export function FreeProgramCard({ locale, program }: { locale: string; program: FreeProgram }) {
  const title = (locale === "ar" ? program.titleAr : program.titleEn) || program.titleEn;
  const desc = (locale === "ar" ? program.descriptionAr : program.descriptionEn) || "";

  return (
    <Link
      href={`/free-courses/${program.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {program.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={program.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-primary/10 to-primary/5">
            <PlayCircle className="size-10 text-primary/40" />
          </div>
        )}
        <span className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          <Sparkles className="size-3" /> {tr(locale, "FREE", "مجاني")}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-foreground group-hover:text-primary">
          {title}
        </h3>
        {desc && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{desc}</p>}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <PlayCircle className="size-3.5" />
            {program.lectureCount}{" "}
            {program.lectureCount === 1 ? tr(locale, "lecture", "محاضرة") : tr(locale, "lectures", "محاضرة")}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            {tr(locale, "Start free", "ابدأ مجانًا")}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}
