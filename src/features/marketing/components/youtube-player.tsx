"use client";

import * as React from "react";
import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadYouTubeApi } from "@/features/marketing/lib/youtube";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * YouTube player that autoplays on mount and attempts to unmute immediately.
 *
 * Browsers block sound-on autoplay without a prior user gesture, so we start
 * muted (required for autoplay to begin) then call `unMute()`. Where the browser
 * still keeps it muted, a one-tap "play sound" button appears.
 */
export function YouTubePlayer({
  videoId,
  unmuteLabel = "Tap for sound",
  autoPlay = true,
  className,
}: {
  videoId: string;
  unmuteLabel?: string;
  /** Autoplay (muted, then attempt unmute). When false, the video loads paused —
   * the user plays/pauses/mutes via the native controls (no forced background sound). */
  autoPlay?: boolean;
  className?: string;
}) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<any>(null);
  const [muted, setMuted] = React.useState(true);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current) return;
      const YT = (window as any).YT;
      playerRef.current = new YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          mute: autoPlay ? 1 : 0,
          controls: 1,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
        },
        events: {
          onReady: (e: any) => {
            setReady(true);
            if (autoPlay) {
              try { e.target.unMute(); e.target.setVolume(100); } catch { /* ignore */ }
              try { e.target.playVideo(); } catch { /* ignore */ }
              window.setTimeout(() => { try { setMuted(!!e.target.isMuted()); } catch { /* ignore */ } }, 500);
            }
          },
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.PLAYING) {
              try { setMuted(!!e.target.isMuted()); } catch { /* ignore */ }
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
    };
  }, [videoId, autoPlay]);

  const unmute = () => {
    const p = playerRef.current;
    if (!p) return;
    try { p.unMute(); p.setVolume(100); p.playVideo(); setMuted(false); } catch { /* ignore */ }
  };

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-black", className)}>
      <div ref={hostRef} className="size-full" />
      {ready && autoPlay && muted && (
        <button
          type="button"
          onClick={unmute}
          className="absolute bottom-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white shadow backdrop-blur transition hover:bg-black/90 start-3"
        >
          <Volume2 className="size-4" /> {unmuteLabel}
        </button>
      )}
    </div>
  );
}
