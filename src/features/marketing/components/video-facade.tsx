"use client";

import * as React from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

/**
 * Click-to-play video facade: renders the course thumbnail + a play button and
 * only mounts the (heavy) YouTube iframe once the visitor clicks. Keeps the
 * iframe off the critical path so it doesn't hurt LCP/INP on the course page.
 */
export function VideoFacade({ embedUrl, thumbnail, title }: { embedUrl: string; thumbnail: string; title: string }) {
  const [playing, setPlaying] = React.useState(false);

  if (playing) {
    return (
      <iframe
        src={embedUrl}
        title={title}
        className="absolute inset-0 size-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
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
