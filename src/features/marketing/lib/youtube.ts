/* eslint-disable @typescript-eslint/no-explicit-any */

let apiPromise: Promise<void> | null = null;

/** Load the YouTube IFrame Player API once (shared across players). */
export function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<void>((resolve) => {
    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.getElementById("youtube-iframe-api")) {
      const s = document.createElement("script");
      s.id = "youtube-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    }
  });
  return apiPromise;
}

export { extractYouTubeVideoId } from "./youtube-id";

export type YouTubePlayerInstance = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (n: number) => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
  destroy?: () => void;
};

export const YT_PLAYING = 1;
export const YT_PAUSED = 2;
export const YT_ENDED = 0;
