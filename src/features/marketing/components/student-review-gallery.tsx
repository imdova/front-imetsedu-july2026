"use client";

import * as React from "react";
import { X, ChevronLeft, ChevronRight, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ReviewShot {
  src: string;
  alt?: string;
}

/**
 * Gallery of student review screenshots (e.g. Facebook recommendations) in a
 * masonry grid with a click-to-zoom lightbox. Screenshots that fail to load
 * (not yet uploaded) are hidden automatically, so the section stays clean while
 * the `public/reviews/` folder is being populated.
 */
export function StudentReviewGallery({
  shots,
  title = "What our students say",
  subtitle = "Real recommendations from graduates on Facebook.",
  recommendPct = 96,
  reviewCount = 52,
  className,
}: {
  shots: ReviewShot[];
  title?: string;
  subtitle?: string;
  recommendPct?: number;
  reviewCount?: number;
  className?: string;
}) {
  const [failed, setFailed] = React.useState<Record<number, boolean>>({});
  const [open, setOpen] = React.useState<number | null>(null);

  const visible = shots.map((s, i) => ({ ...s, i })).filter(({ i }) => !failed[i]);

  const close = React.useCallback(() => setOpen(null), []);
  const step = React.useCallback(
    (dir: 1 | -1) => {
      setOpen((cur) => {
        if (cur === null || visible.length === 0) return cur;
        const pos = visible.findIndex((v) => v.i === cur);
        const next = (pos + dir + visible.length) % visible.length;
        return visible[next].i;
      });
    },
    [visible],
  );

  React.useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, step]);

  const activeShot = open === null ? null : shots[open];

  return (
    <section dir="ltr" className={cn("mx-auto max-w-6xl px-4 py-16 text-left sm:px-6 lg:px-8", className)}>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1877F2]/10 px-3 py-1 text-sm font-bold text-[#1877F2]">
          <ThumbsUp className="size-4" /> {recommendPct}% recommend · {reviewCount} reviews
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0b2545]">{title}</h2>
        <p className="mt-2 text-slate-600">{subtitle}</p>
      </div>

      <div
        className={cn(
          visible.length <= 1
            ? "mx-auto max-w-4xl"
            : "gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4",
        )}
      >
        {shots.map((s, i) =>
          failed[i] ? null : (
            <button
              key={i}
              type="button"
              onClick={() => setOpen(i)}
              className="block w-full break-inside-avoid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.alt ?? `Student review ${i + 1}`}
                loading="lazy"
                onError={() => setFailed((f) => ({ ...f, [i]: true }))}
                className="w-full"
              />
            </button>
          ),
        )}
      </div>

      {/* Lightbox */}
      {activeShot && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          {visible.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(-1); }}
                aria-label="Previous"
                className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); step(1); }}
                aria-label="Next"
                className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeShot.src}
            alt={activeShot.alt ?? "Student review"}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-full rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </section>
  );
}
