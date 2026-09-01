"use client";

import * as React from "react";
import { Volume2, Play } from "lucide-react";
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
  playLabel = "Play video",
  autoPlay = true,
  unmuteOnStart = true,
  hideYouTubeChrome = false,
  onEnded,
  onProgress,
  className,
}: {
  videoId: string;
  unmuteLabel?: string;
  /** Accessible label for the click-to-load poster button. */
  playLabel?: string;
  /** Fires once when the video finishes playing (state ENDED). */
  onEnded?: () => void;
  /** Fires ~every 1.5s while playing with the watched percentage (0–100). */
  onProgress?: (pct: number) => void;
  /** Overlay the top strip so the video title + "Watch on YouTube" link aren't
   * clickable (keeps the centre play button and bottom controls usable). */
  hideYouTubeChrome?: boolean;
  /** Autoplay (muted, then attempt unmute). When false, the video loads paused —
   * the user plays/pauses/mutes via the native controls (no forced background sound). */
  autoPlay?: boolean;
  /** When false, autoplay stays MUTED (no auto-unmute). Muted autoplay is the only
   * mode mobile browsers allow, so this keeps the video playing on phones; the
   * tap-for-sound button still lets the user enable audio. */
  unmuteOnStart?: boolean;
  className?: string;
}) {
  /**
   * Click-to-load facade.
   *
   * A paused embed still pulled in the whole YouTube IFrame API and built a
   * player on mount — script work and requests every visitor paid for whether
   * or not they watched, which is where LCP and INP degrade on a mid-range
   * phone. Non-autoplay embeds now render a thumbnail and only mount the real
   * player once someone actually asks for it. Autoplay embeds are unchanged:
   * they have to be live on mount to autoplay at all.
   */
  const [activated, setActivated] = React.useState(autoPlay);

  const hostRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<any>(null);
  const [muted, setMuted] = React.useState(true);
  const [ready, setReady] = React.useState(false);
  // Track playback so we can cover YouTube's paused-screen chrome (title +
  // "Watch on YouTube" pill) with our own overlay whenever it isn't playing.
  const [playing, setPlaying] = React.useState(false);
  const [everPlayed, setEverPlayed] = React.useState(false);
  const onEndedRef = React.useRef(onEnded);
  const onProgressRef = React.useRef(onProgress);
  React.useEffect(() => { onEndedRef.current = onEnded; onProgressRef.current = onProgress; });

  React.useEffect(() => {
    // Nothing is loaded until the facade is dismissed.
    if (!activated) return;
    let cancelled = false;
    // Poll watched percentage while the video is playing.
    const progressTimer = window.setInterval(() => {
      try {
        const p = playerRef.current;
        const YT = (window as any).YT;
        if (p?.getPlayerState?.() === YT?.PlayerState?.PLAYING) {
          const d = p.getDuration?.() || 0;
          const c = p.getCurrentTime?.() || 0;
          if (d > 0) onProgressRef.current?.((c / d) * 100);
        }
      } catch { /* ignore */ }
    }, 1500);
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
            if (!autoPlay) {
              // Reached here from the facade — the click IS the user gesture,
              // so start playing rather than showing a second play button.
              try { e.target.playVideo(); } catch { /* ignore */ }
              return;
            }
            try { e.target.playVideo(); } catch { /* ignore */ }
            if (unmuteOnStart) {
              // Try to play WITH sound (works on desktop). Mobile blocks unmuted
              // autoplay and pauses the video — so if it isn't playing shortly
              // after, fall back to MUTED autoplay so it keeps running; the user
              // can then unmute via the tap button or native controls.
              try { e.target.unMute(); e.target.setVolume(100); } catch { /* ignore */ }
              window.setTimeout(() => {
                try {
                  if (e.target.getPlayerState?.() !== YT.PlayerState.PLAYING) {
                    e.target.mute();
                    e.target.playVideo();
                  }
                } catch { /* ignore */ }
                try { setMuted(!!e.target.isMuted()); } catch { /* ignore */ }
              }, 400);
            } else {
              window.setTimeout(() => { try { setMuted(!!e.target.isMuted()); } catch { /* ignore */ } }, 500);
            }
          },
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.PLAYING) {
              try { setMuted(!!e.target.isMuted()); } catch { /* ignore */ }
              setPlaying(true); setEverPlayed(true);
            } else if (e.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              onEndedRef.current?.();
            } else if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.CUED) {
              setPlaying(false);
            }
          },
        },
      });
    });
    return () => {
      cancelled = true;
      window.clearInterval(progressTimer);
      try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
    };
  }, [videoId, autoPlay, unmuteOnStart, activated]);

  const unmute = () => {
    const p = playerRef.current;
    if (!p) return;
    try { p.unMute(); p.setVolume(100); p.playVideo(); setMuted(false); } catch { /* ignore */ }
  };
  const startPlay = () => {
    const p = playerRef.current;
    if (!p) return;
    try { p.playVideo(); } catch { /* ignore */ }
  };

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden bg-black", className)}>
      {/* Facade: the thumbnail stands in for the player until it is asked for.
          A real button, so it is keyboard reachable and announced correctly. */}
      {!activated ? (
        <button
          type="button"
          onClick={() => setActivated(true)}
          aria-label={playLabel}
          className="group absolute inset-0 z-[6] flex items-center justify-center bg-black bg-cover bg-center"
          style={{ backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)` }}
        >
          <span className="grid size-16 place-items-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/30 transition group-hover:scale-105">
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
        </button>
      ) : null}
      <div ref={hostRef} className="size-full" />
      {hideYouTubeChrome && (
        // Blocks the top-bar title + "Watch on YouTube"/share links from being
        // clicked; the centre play button and bottom controls stay reachable.
        <div className="absolute inset-x-0 top-0 z-[5] h-14" aria-hidden />
      )}
      {hideYouTubeChrome && ready && !playing && (
        // Covers YouTube's paused/poster screen — title + "Watch on YouTube"
        // pill — with our own play button. Shows the video thumbnail before the
        // first play, then a light veil on later pauses. Clicking resumes.
        <button
          type="button"
          onClick={startPlay}
          aria-label="Play video"
          className={cn(
            "group absolute inset-0 z-[6] flex items-center justify-center transition",
            everPlayed ? "bg-black/45 backdrop-blur-[1px]" : "bg-black bg-cover bg-center",
          )}
          style={everPlayed ? undefined : { backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg)` }}
        >
          <span className="grid size-16 place-items-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/30 transition group-hover:scale-105">
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
        </button>
      )}
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
