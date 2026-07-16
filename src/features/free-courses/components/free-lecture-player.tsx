"use client";

import * as React from "react";
import { PlayCircle, FileDown, CheckCircle2, AlertTriangle } from "lucide-react";

import type { FreeLecture } from "@/lib/dal/free-courses";
import { cn } from "@/lib/utils";
import { YouTubePlayer } from "@/features/marketing/components/youtube-player";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

/** Player + playlist. Simple public LMS: pick a lecture, watch, move on. */
export function FreeLecturePlayer({
  locale,
  lectures,
}: {
  locale: string;
  lectures: FreeLecture[];
}) {
  const [activeId, setActiveId] = React.useState(lectures[0]?.id ?? "");
  // Local-only progress: a guest has no account to persist against, and this is
  // a marketing preview — a tick that survives the session is enough.
  const [watched, setWatched] = React.useState<Set<string>>(() => new Set());

  const active = lectures.find((l) => l.id === activeId) ?? lectures[0];
  if (!active) return null;

  const title = (l: FreeLecture) => (locale === "ar" ? l.titleAr : l.titleEn) || l.titleEn;
  const desc = (l: FreeLecture) => (locale === "ar" ? l.descriptionAr : l.descriptionEn) || "";

  const select = (id: string) => {
    setActiveId(id);
    setWatched((prev) => new Set(prev).add(id));
  };

  const youTubeId = active.videoProvider === "youtube" ? extractYouTubeVideoId(active.videoUrl) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
      {/* Stage */}
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-black shadow-sm">
          {youTubeId ? (
            <YouTubePlayer key={active.id} videoId={youTubeId} autoPlay={false} />
          ) : active.videoProvider === "vdocipher" ? (
            // Reuses the paid LMS's VdoCipher embed contract.
            <div className="relative aspect-video">
              <iframe
                key={active.id}
                src={`https://player.vdocipher.com/v2/?otp=&playbackInfo=&video=${encodeURIComponent(active.videoUrl)}`}
                allow="encrypted-media; fullscreen"
                allowFullScreen
                className="absolute inset-0 size-full"
                title={title(active)}
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center gap-2 text-sm text-white/70">
              <AlertTriangle className="size-4" />
              {tr(locale, "This lecture has no video yet.", "لا يوجد فيديو لهذه المحاضرة بعد.")}
            </div>
          )}
        </div>

        <div>
          <h2 className="font-heading text-lg font-bold">{title(active)}</h2>
          {desc(active) && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc(active)}</p>}
          {active.resourceUrl && (
            <a
              href={active.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border/70 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
            >
              <FileDown className="size-3.5" /> {tr(locale, "Download resources", "تحميل المرفقات")}
            </a>
          )}
        </div>
      </div>

      {/* Playlist */}
      <aside className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm lg:sticky lg:top-24">
        <p className="px-2 pb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {tr(locale, `${lectures.length} lectures`, `${lectures.length} محاضرة`)}
        </p>
        <ol className="max-h-[26rem] space-y-1 overflow-y-auto">
          {lectures.map((l, i) => {
            const isOn = l.id === active.id;
            return (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => select(l.id)}
                  aria-current={isOn}
                  className={cn(
                    "flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2.5 text-start transition-colors",
                    isOn ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-muted/60",
                  )}
                >
                  <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold tabular-nums", isOn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {watched.has(l.id) && !isOn ? <CheckCircle2 className="size-3.5" /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm leading-snug", isOn ? "font-semibold text-foreground" : "text-foreground/80")}>
                      {title(l)}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <PlayCircle className="size-3" />
                      {l.durationMinutes > 0
                        ? tr(locale, `${l.durationMinutes} min`, `${l.durationMinutes} دقيقة`)
                        : tr(locale, "Video", "فيديو")}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
