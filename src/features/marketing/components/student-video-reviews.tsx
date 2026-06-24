"use client";

import * as React from "react";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoFacade } from "@/features/marketing/components/video-facade";

export interface StudentReviewVideo {
  /** YouTube video id (or full URL — VideoFacade extracts the id). */
  id: string;
  name: string;
  role?: string;
}

/** YouTube auto-generated poster; `hqdefault` always exists for any video. */
const poster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function ReviewCard({
  video,
  feature = false,
}: {
  video: StudentReviewVideo;
  feature?: boolean;
}) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-[#0b2545] shadow-sm ring-1 ring-slate-200",
        feature && "sm:col-span-2 lg:col-span-1 lg:row-span-2",
      )}
    >
      <div className={cn("relative aspect-video", feature && "lg:aspect-auto lg:h-full")}>
        <VideoFacade videoId={video.id} thumbnail={poster(video.id)} title={video.name} />
      </div>
      {/* caption overlay — pointer-events-none so the play button / native
          controls underneath stay clickable */}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-8">
        <p className={cn("font-bold text-white", feature ? "text-base" : "text-sm")}>{video.name}</p>
        {video.role && (
          <p className={cn("text-white/75", feature ? "text-xs" : "text-[11px]")}>{video.role}</p>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * Wall of student video testimonials: one large featured video plus a grid of
 * smaller ones (mirrors the admin "Video Reviews" layout). Each card is a
 * lightweight facade — the YouTube player only loads when the user clicks play,
 * so a 7-video wall doesn't pull seven iframes on page load.
 */
export function StudentVideoReviews({
  videos,
  title = "آراء طلابنا بالفيديو",
  subtitle = "استمع من خريجين اجتازوا امتحان CPHQ فعليًا — تجارب حقيقية بكلماتهم.",
  className,
}: {
  videos: StudentReviewVideo[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  if (!videos.length) return null;
  const isSingle = videos.length === 1;
  const [feature, ...rest] = videos;

  return (
    <section dir="rtl" className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#B8860B]">
          <Quote className="size-4" /> قصص نجاح حقيقية
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b2545]">{title}</h2>
        <p className="mt-3 text-slate-600">{subtitle}</p>
      </div>

      {isSingle ? (
        // Single video → vertical "story" format, centered.
        <div className="mx-auto w-full max-w-[320px] sm:max-w-sm">
          <figure className="group relative overflow-hidden rounded-3xl bg-black shadow-xl ring-1 ring-slate-200">
            <div className="relative aspect-[9/16]">
              <VideoFacade videoId={feature.id} thumbnail={poster(feature.id)} title={feature.name} />
            </div>
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 pt-10">
              <p className="text-base font-bold text-white">{feature.name}</p>
              {feature.role && <p className="text-xs text-white/75">{feature.role}</p>}
            </figcaption>
          </figure>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ReviewCard video={feature} feature />
          {rest.map((v, i) => (
            <ReviewCard key={`${v.id}-${i}`} video={v} />
          ))}
        </div>
      )}
    </section>
  );
}
