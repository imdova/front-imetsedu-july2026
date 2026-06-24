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
  /** "portrait" for Shorts/vertical clips, "landscape" for normal videos. */
  orientation?: "portrait" | "landscape";
}

/** YouTube auto-generated poster; `hqdefault` always exists for any video. */
const poster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function ReviewCard({ video, rounded = "rounded-2xl" }: { video: StudentReviewVideo; rounded?: string }) {
  const portrait = video.orientation === "portrait";
  return (
    <figure className={cn("group relative overflow-hidden bg-black shadow-sm ring-1 ring-slate-200", rounded)}>
      <div className={cn("relative", portrait ? "aspect-[9/16]" : "aspect-video")}>
        <VideoFacade videoId={video.id} thumbnail={poster(video.id)} title={video.name} />
      </div>
      {/* caption overlay — pointer-events-none so the play button / native
          controls underneath stay clickable */}
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-3 pt-8">
        <p className="text-sm font-bold text-white">{video.name}</p>
        {video.role && <p className="text-[11px] text-white/75">{video.role}</p>}
      </figcaption>
    </figure>
  );
}

/**
 * Wall of student video testimonials. Each video keeps its natural orientation
 * (portrait Shorts render phone-shaped, landscape clips render wide) and the
 * cards wrap centered so a mixed set still reads cleanly. Each card is a
 * lightweight facade — the YouTube player loads only when the user clicks play,
 * so the whole wall doesn't pull an iframe per video on page load.
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

  const header = (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#B8860B]">
        <Quote className="size-4" /> قصص نجاح حقيقية
      </p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b2545]">{title}</h2>
      <p className="mt-3 text-slate-600">{subtitle}</p>
    </div>
  );

  // Single video → centered, sized to its orientation (vertical "story" or wide).
  if (videos.length === 1) {
    const v = videos[0];
    const portrait = v.orientation !== "landscape"; // default a lone video to portrait/story
    return (
      <section dir="rtl" className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8", className)}>
        {header}
        <div className={cn("mx-auto w-full", portrait ? "max-w-[300px] sm:max-w-[340px]" : "max-w-2xl")}>
          <ReviewCard video={v} rounded="rounded-3xl" />
        </div>
      </section>
    );
  }

  // Multiple videos → centered wrap; portrait clips are phone-width, landscape wider.
  return (
    <section dir="rtl" className={cn("mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8", className)}>
      {header}
      <div className="flex flex-wrap items-start justify-center gap-5">
        {videos.map((v, i) => (
          <div
            key={`${v.id}-${i}`}
            className={cn(
              "w-full",
              v.orientation === "portrait" ? "sm:w-[240px]" : "sm:w-[420px]",
            )}
          >
            <ReviewCard video={v} />
          </div>
        ))}
      </div>
    </section>
  );
}
