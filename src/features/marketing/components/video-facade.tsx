"use client";

import * as React from "react";
import Image from "next/image";
import { Play, PlayCircle, Square, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  loadYouTubeApi,
  YT_ENDED,
  YT_PAUSED,
  YT_PLAYING,
  type YouTubePlayerInstance,
} from "@/features/marketing/lib/youtube";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";

interface VideoFacadeProps {
  videoId?: string;
  /** Legacy embed URL — video id is extracted when `videoId` is omitted. */
  embedUrl?: string;
  thumbnail: string;
  title: string;
  /** Mount and play immediately on page load. */
  autoPlay?: boolean;
}

function syncMuted(player: YouTubePlayerInstance, setMuted: (v: boolean) => void) {
  try {
    setMuted(!!player.isMuted());
  } catch {
    /* ignore */
  }
}

function syncPlaying(player: YouTubePlayerInstance, setPlaying: (v: boolean) => void) {
  try {
    const state = player.getPlayerState();
    setPlaying(state === YT_PLAYING);
  } catch {
    /* ignore */
  }
}

function ensureUnmuted(player: YouTubePlayerInstance) {
  try {
    player.unMute();
    player.setVolume(100);
  } catch {
    /* ignore */
  }
}

function PlayerControls({
  playing,
  muted,
  onPlay,
  onStop,
  onMute,
  onUnmute,
}: {
  playing: boolean;
  muted: boolean;
  onPlay: () => void;
  onStop: () => void;
  onMute: () => void;
  onUnmute: () => void;
}) {
  const btn =
    "size-8 shrink-0 rounded-md text-white hover:bg-white/15 hover:text-white disabled:opacity-40";

  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex items-center gap-0.5 border-t border-white/10 bg-black/80 px-1.5 py-1 backdrop-blur-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btn}
        onClick={onPlay}
        disabled={playing}
        aria-label="Play"
      >
        <Play className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btn}
        onClick={onStop}
        aria-label="Stop"
      >
        <Square className="size-3.5 fill-current" />
      </Button>
      <span className="mx-0.5 h-5 w-px bg-white/20" aria-hidden />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btn}
        onClick={onMute}
        disabled={muted}
        aria-label="Mute"
      >
        <VolumeX className="size-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={btn}
        onClick={onUnmute}
        disabled={!muted}
        aria-label="Unmute"
      >
        <Volume2 className="size-4" />
      </Button>
    </div>
  );
}

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
  const [ready, setReady] = React.useState(false);
  const [playing, setPlaying] = React.useState(false);
  const [muted, setMuted] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    let unmuteTimer: number | undefined;
    let unmuteStop: number | undefined;

    loadYouTubeApi().then(() => {
      if (cancelled || !hostRef.current) return;
      const YT = (window as Window & { YT?: { Player: new (...args: unknown[]) => YouTubePlayerInstance } }).YT;
      if (!YT?.Player) return;

      const player = new YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: autoStart ? 1 : 0,
          // Browsers allow muted autoplay; we unmute immediately in onReady.
          mute: autoStart ? 1 : 0,
          controls: 0,
          rel: 0,
          playsinline: 1,
          modestbranding: 1,
          enablejsapi: 1,
        },
        events: {
          onReady: (e: { target: YouTubePlayerInstance }) => {
            if (cancelled) return;
            playerRef.current = e.target;
            setReady(true);
            if (autoStart) {
              try {
                e.target.playVideo();
              } catch {
                /* ignore */
              }
            }
            ensureUnmuted(e.target);
            syncMuted(e.target, setMuted);
            syncPlaying(e.target, setPlaying);
            unmuteTimer = window.setInterval(() => ensureUnmuted(e.target), 400);
            unmuteStop = window.setTimeout(() => {
              if (unmuteTimer) window.clearInterval(unmuteTimer);
            }, 5000);
          },
          onStateChange: (e: { data: number; target: YouTubePlayerInstance }) => {
            if (cancelled) return;
            setPlaying(e.data === YT_PLAYING);
            if (e.data === YT_PLAYING) {
              ensureUnmuted(e.target);
              syncMuted(e.target, setMuted);
            }
            if (e.data === YT_PAUSED || e.data === YT_ENDED) {
              setPlaying(false);
            }
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      if (unmuteTimer) window.clearInterval(unmuteTimer);
      if (unmuteStop) window.clearTimeout(unmuteStop);
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [videoId, autoStart]);

  const player = () => playerRef.current;

  const onPlay = () => {
    const p = player();
    if (!p) return;
    try {
      p.playVideo();
      ensureUnmuted(p);
      setPlaying(true);
      syncMuted(p, setMuted);
    } catch {
      /* ignore */
    }
  };

  const onStop = () => {
    const p = player();
    if (!p) return;
    try {
      p.stopVideo();
      setPlaying(false);
    } catch {
      /* ignore */
    }
  };

  const onMute = () => {
    const p = player();
    if (!p) return;
    try {
      p.mute();
      setMuted(true);
    } catch {
      /* ignore */
    }
  };

  const onUnmute = () => {
    const p = player();
    if (!p) return;
    try {
      ensureUnmuted(p);
      setMuted(false);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="absolute inset-0 size-full">
      <div ref={hostRef} className="size-full" title={title} />
      {ready && (
        <PlayerControls
          playing={playing}
          muted={muted}
          onPlay={onPlay}
          onStop={onStop}
          onMute={onMute}
          onUnmute={onUnmute}
        />
      )}
    </div>
  );
}

/**
 * Course preview video with custom controls (play, stop, mute, unmute).
 * Autoplays unmuted when `autoPlay` is set.
 */
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
