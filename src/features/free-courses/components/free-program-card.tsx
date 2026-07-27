import { PlayCircle, ArrowRight, Sparkles, Clock, Play } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { FreeProgram } from "@/lib/dal/free-courses";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

function duration(locale: string, min: number): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}${tr(locale, "h", "س")} ${m}${tr(locale, "m", "د")}`;
  if (h) return `${h}${tr(locale, "h", "س")}`;
  return `${m}${tr(locale, "m", "د")}`;
}

export function FreeProgramCard({ locale, program }: { locale: string; program: FreeProgram }) {
  const title = (locale === "ar" ? program.titleAr : program.titleEn) || program.titleEn;
  const desc = (locale === "ar" ? program.descriptionAr : program.descriptionEn) || "";
  const lectures = program.lectures.filter((l) => l.isPublished).sort((a, b) => a.order - b.order);
  const totalMin = program.lectures.reduce((s, l) => s + (l.durationMinutes || 0), 0);
  const peek = lectures.slice(0, 3);
  const count = program.lectureCount || lectures.length;

  return (
    <Link
      href={`/free-courses/${program.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl"
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {program.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={program.thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-gradient-to-br from-primary/15 to-primary/5">
            <PlayCircle className="size-12 text-primary/40" />
          </div>
        )}
        {/* hover play overlay */}
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-black/50 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="grid size-14 place-items-center rounded-full bg-white/95 text-primary shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Play className="size-6 translate-x-0.5 fill-current rtl:-translate-x-0.5 rtl:-scale-x-100" />
          </span>
        </div>
        <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
          <Sparkles className="size-3" /> {tr(locale, "FREE", "مجاني")}
        </span>
        {totalMin > 0 && (
          <span className="absolute bottom-2.5 end-2.5 inline-flex items-center gap-1 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur">
            <Clock className="size-3" /> {duration(locale, totalMin)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {title}
        </h3>
        {desc && <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{desc}</p>}

        {peek.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
            {peek.map((l) => (
              <li key={l.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <PlayCircle className="size-3.5 shrink-0 text-primary/60" />
                <span className="line-clamp-1">{(locale === "ar" ? l.titleAr : l.titleEn) || l.titleEn}</span>
              </li>
            ))}
            {count > peek.length && (
              <li className="text-xs font-medium text-primary/70">
                + {count - peek.length} {tr(locale, "more lectures", "محاضرة إضافية")}
              </li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <PlayCircle className="size-3.5" />
            {count} {count === 1 ? tr(locale, "lecture", "محاضرة") : tr(locale, "lectures", "محاضرة")}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {tr(locale, "Watch free", "شاهد مجانًا")}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  );
}
