"use client";

import * as React from "react";

import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";
import { YouTubePlayer } from "@/features/marketing/components/youtube-player";

/**
 * Hero-section YouTube video for a landing page, editable from
 * Admin → Marketing → Landing (the `heroVideoUrl` field on the landing row).
 *
 * Fetches the registry config client-side by `path`, so changing the URL in the
 * admin takes effect without a rebuild. Renders NOTHING when no video is set, so
 * dropping it into a hero never changes the layout until an admin adds a URL.
 */
export function LandingHeroVideo({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const [videoId, setVideoId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    dal.landing
      .fetchLandingHeroVideo(path)
      .then((url) => {
        if (alive) setVideoId(extractYouTubeVideoId(url));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [path]);

  if (!videoId) return null;

  return (
    <YouTubePlayer
      videoId={videoId}
      autoPlay={false}
      className={cn(
        "rounded-2xl border border-border/60 shadow-lg shadow-black/10",
        className,
      )}
    />
  );
}
