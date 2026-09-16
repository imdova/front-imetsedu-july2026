"use client";

import * as React from "react";
import { PlayCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { youTubeId } from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";

interface FrameVideo {
  id: string;
  url: string;
  title: string;
}

/** One YouTube video in a responsive frame (privacy-enhanced embed, no related-video wall). */
export function VideoFrame({
  video,
  className,
  iframeRef,
  onLoad,
  trackable,
}: {
  video: FrameVideo;
  className?: string;
  iframeRef?: React.Ref<HTMLIFrameElement>;
  onLoad?: () => void;
  /** Ask the player to report progress (see `video-lesson`). */
  trackable?: boolean;
}) {
  const id = youTubeId(video.url);
  if (!id) return null;
  return (
    <div className={cn("aspect-video w-full max-w-full overflow-hidden rounded-xl bg-black ring-1 ring-border", className)}>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0${trackable ? "&enablejsapi=1" : ""}`}
        title={video.title || "Training video"}
        className="size-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        onLoad={onLoad}
      />
    </div>
  );
}

/**
 * A set of videos with a picker — used for programme videos, where watching
 * isn't part of a gate. Lesson videos that count use `VideoLesson`.
 */
export function LessonVideos({
  videos,
  label,
}: {
  videos: FrameVideo[];
  label?: { one: string; many: string };
}) {
  const { t } = useOrientationT();
  const [active, setActive] = React.useState(0);
  if (videos.length === 0) return null;
  const current = videos[Math.min(active, videos.length - 1)];

  return (
    <section className="rounded-2xl border border-border/70 bg-muted/30 p-3 sm:p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <PlayCircle className="size-4 text-primary" />
        {videos.length === 1 ? (label?.one ?? t("video.list", { n: 1 })) : `${label?.many ?? t("video.list", { n: videos.length })} (${num(videos.length)})`}
      </p>
      <div className={cn("grid gap-3", videos.length > 1 && "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]")}>
        <div className="min-w-0">
          <VideoFrame key={current.id} video={current} />
          {current.title && <p className="mt-2 text-sm font-semibold">{current.title}</p>}
        </div>
        {videos.length > 1 && (
          <ol className="space-y-1.5">
            {videos.map((v, i) => (
              <li key={v.id}>
                <button
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm transition-colors",
                    i === active ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold",
                      i === active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{v.title || t("video.fallbackTitle", { n: i + 1 })}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
