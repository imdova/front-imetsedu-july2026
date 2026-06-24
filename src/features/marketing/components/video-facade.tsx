"use client";

import * as React from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

import { loadYouTubeApi, type YouTubePlayerInstance } from "@/features/marketing/lib/youtube";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface VideoFacadeProps {
  videoId?: string;
  embedUrl?: string;
  thumbnail: string;
  title: string;
  autoPlay?: boolean;
}

/**
 * Embeds a YouTube preview with the player's NATIVE controls enabled, so the
 * user can play, pause, mute, unmute, change volume, seek and go fullscreen.
 * When `autoPlay` is set we start muted (browser policy) and attempt to unmute;
 * the native control bar lets the user toggle sound regardless.
 */
function YouTubePreviewPlayer({
  videoId,
  title,
  autoStart,
}: {
  videoId: string;
  title: string;
  autoStart: boolean;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<YouTubePlayerInstance | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current) return;
      const YT = (window as any).YT;
      if (!YT?.Player) return;

      playerRef.current = new YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: autoStart ? 1 : 0,
          mute: autoStart ? 1 : 0,
          controls: 1, // native controls: play/pause, mute/unmute, volume, seek, fullscreen
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: (e: { target: YouTubePlayerInstance }) => {
            if (cancelled) return;
            playerRef.current = e.target;
            if (autoStart) {
              try { e.target.playVideo(); } catch { /* ignore */ }
              try { e.target.unMute(); e.target.setVolume(100); } catch { /* ignore */ }
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
      playerRef.current = null;
    };
  }, [videoId, autoStart]);

  return <div ref={hostRef} className="absolute inset-0 size-full" title={title} />;
}

export function VideoFacade({
  videoId: videoIdProp,
  embedUrl,
  thumbnail,
  title,
  autoPlay = false,
}: VideoFacadeProps) {
  const videoId = videoIdProp ?? extractYouTubeVideoId(embedUrl) ?? "";
  const [active, setActive] = React.useState(autoPlay);

  if (!videoId) return null;

  if (active) {
    return <YouTubePreviewPlayer videoId={videoId} title={title} autoStart={autoPlay} />;
  }

  // Lightweight facade: load the player (with controls) only after the user clicks.
  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="absolute inset-0 size-full"
      aria-label={`Play preview: ${title}`}
    >
      <Image src={thumbnail} alt={title} fill sizes="360px" className="object-cover" />
      <span className="absolute inset-0 grid place-items-center bg-black/20 transition-colors hover:bg-black/30">
        <PlayCircle className="size-14 text-white/90" />
      </span>
    </button>
  );
}
