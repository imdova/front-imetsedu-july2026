"use client";

import * as React from "react";
import { Check, Lightbulb } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LessonView } from "@/features/orientation/lib/sales-orientation";
import { useOrientationT } from "@/features/orientation/lib/i18n";
import { RichText, type GateProps } from "./lesson-parts";
import { VideoFrame } from "./lesson-videos";

/** Share of a video that counts as watched. */
const WATCHED_SHARE = 0.9;
/** No word from the player in this long ⇒ it can't report progress here. */
const NO_API_MS = 8000;

/**
 * A YouTube player that says when the video has been watched.
 *
 * The embed is asked to report its state over `postMessage` (`enablejsapi`),
 * so no player script is loaded. A video counts once playback reaches ~90%
 * or ends; if the player plays but never reports a duration, starting it
 * counts. When the player stays silent altogether (blocked or offline), the
 * learner gets an explicit "I watched this" instead.
 */
function TrackedVideo({
  video,
  watched,
  onWatched,
}: {
  video: LessonView["videos"][number];
  watched: boolean;
  onWatched: () => void;
}) {
  const { t } = useOrientationT();
  const ref = React.useRef<HTMLIFrameElement>(null);
  const [untracked, setUntracked] = React.useState(false);
  const onWatchedRef = React.useRef(onWatched);

  React.useEffect(() => {
    onWatchedRef.current = onWatched;
  });

  React.useEffect(() => {
    let heard = false;
    let fired = false;
    let duration = 0;
    let playTimer: ReturnType<typeof setTimeout> | null = null;
    const fire = () => {
      if (fired) return;
      fired = true;
      onWatchedRef.current();
    };
    const onMessage = (e: MessageEvent) => {
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      let data: { event?: string; info?: unknown } | null = null;
      try {
        data = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
      } catch {
        return;
      }
      if (!data?.event) return;
      heard = true;
      if (data.event === "onStateChange" && data.info === 0) fire();
      if (data.event !== "infoDelivery" && data.event !== "initialDelivery") return;
      const info = (data.info ?? {}) as { duration?: number; currentTime?: number; playerState?: number };
      if (typeof info.duration === "number" && info.duration > 0) duration = info.duration;
      if (typeof info.currentTime === "number" && duration > 0 && info.currentTime / duration >= WATCHED_SHARE) fire();
      if (info.playerState === 0) fire();
      if (info.playerState === 1 && !playTimer) {
        playTimer = setTimeout(() => {
          if (!duration) fire();
        }, 4000);
      }
    };
    window.addEventListener("message", onMessage);
    const silent = setTimeout(() => {
      if (!heard) setUntracked(true);
    }, NO_API_MS);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(silent);
      if (playTimer) clearTimeout(playTimer);
    };
  }, [video.id]);

  const listen = () => {
    ref.current?.contentWindow?.postMessage(JSON.stringify({ event: "listening", id: video.id, channel: "widget" }), "*");
  };

  return (
    <div className="min-w-0 space-y-2">
      <VideoFrame video={video} iframeRef={ref} onLoad={listen} trackable />
      <div className="flex flex-wrap items-center gap-2">
        <p className="min-w-0 flex-1 text-sm font-semibold">{video.title}</p>
        {untracked && !watched && (
          <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={onWatched}>
            <Check className="size-3.5" />
            {t("video.markWatched")}
          </Button>
        )}
      </div>
      {untracked && !watched && <p className="text-xs text-muted-foreground">{t("video.untracked")}</p>}
    </div>
  );
}

/**
 * A video or text lesson written in the editor (welcome, graduate stories, any
 * custom lesson): the videos with a watched list, the lesson text, and a
 * "Remember" box. With no videos to watch, reaching the end of the text
 * completes it.
 */
export function VideoLesson({ lesson, seen, mark }: { lesson: LessonView } & GateProps) {
  const { t } = useOrientationT();
  const [active, setActive] = React.useState(0);
  const sentinel = React.useRef<HTMLDivElement>(null);
  const videos = lesson.videos;
  const needsRead = lesson.gateRequired === 0 || videos.length === 0;

  React.useEffect(() => {
    if (!needsRead || !sentinel.current) return;
    const el = sentinel.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) mark("read");
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [needsRead, mark]);

  const current = videos[Math.min(active, videos.length - 1)];

  return (
    <div className="space-y-5">
      {current && (
        <div className={cn("grid gap-3.5", videos.length > 1 && "md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]")}>
          <TrackedVideo key={current.id} video={current} watched={seen.has(current.id)} onWatched={() => mark(current.id)} />
          {videos.length > 1 && (
            <ol className="grid content-start gap-2" aria-label={t("video.list", { n: videos.length })}>
              {videos.map((v, i) => {
                const watched = seen.has(v.id);
                return (
                  <li key={v.id}>
                    <button
                      type="button"
                      aria-pressed={i === active}
                      onClick={() => setActive(i)}
                      className={cn(
                        "grid w-full grid-cols-[auto_1fr] items-center gap-2.5 rounded-xl border p-2.5 text-start transition-colors",
                        i === active ? "border-primary bg-primary/[0.06]" : "border-border/70 hover:border-primary/40",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-6 place-items-center rounded-full text-[11px] font-bold",
                          watched ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {watched ? <Check className="size-3.5" /> : i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm leading-snug">{v.title || t("video.fallbackTitle", { n: i + 1 })}</span>
                        {(v.duration || watched) && (
                          <span className="block text-xs text-muted-foreground">
                            {[v.duration, watched ? t("video.watched") : ""].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      {lesson.body.trim() && <RichText body={lesson.body} />}

      {lesson.takeaways.length > 0 && (
        <div className="space-y-2 rounded-2xl bg-primary/[0.06] p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
            <Lightbulb className="size-4 text-primary" />
            {t("video.remember")}
          </p>
          <ul className="space-y-1 ps-5 text-sm leading-relaxed [list-style:disc]">
            {lesson.takeaways.map((x, i) => (
              <li key={i}>{x}</li>
            ))}
          </ul>
        </div>
      )}

      <div ref={sentinel} aria-hidden="true" className="h-px" />
    </div>
  );
}
