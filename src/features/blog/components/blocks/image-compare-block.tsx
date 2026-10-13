"use client";

import * as React from "react";
import { GripVertical } from "lucide-react";

/** Before/after image comparison slider. Client island used by the block
 *  renderer. Drag the handle (or use the range input) to reveal the "before". */
export function ImageCompareBlock({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl?: string;
  afterUrl?: string;
}) {
  const [pos, setPos] = React.useState(50);
  const ref = React.useRef<HTMLDivElement>(null);
  const dragging = React.useRef(false);

  const setFromClientX = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, pct)));
  };

  if (!beforeUrl || !afterUrl) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-border/60 text-sm text-muted-foreground">
        Add both a “before” and an “after” image.
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative aspect-video w-full select-none overflow-hidden rounded-2xl border border-border/60"
      onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerLeave={() => (dragging.current = false)}
    >
      {/* After (full) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={afterUrl} alt="After" className="absolute inset-0 size-full object-cover" />
      {/* Before (clipped to pos) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={beforeUrl}
        alt="Before"
        className="absolute inset-0 size-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <span className="absolute start-3 top-3 rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-medium text-background">
        Before
      </span>
      <span className="absolute end-3 top-3 rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-medium text-background">
        After
      </span>

      {/* Divider + handle */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white/90 shadow"
        style={{ left: `${pos}%` }}
      >
        <button
          type="button"
          aria-label="Drag to compare"
          onPointerDown={(e) => {
            e.preventDefault();
            dragging.current = true;
          }}
          className="absolute top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white text-foreground shadow-lg ring-1 ring-black/10"
        >
          <GripVertical className="size-4" />
        </button>
      </div>

      {/* Accessible fallback control */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Comparison position"
        className="absolute inset-x-0 bottom-2 mx-auto w-2/3 cursor-ew-resize opacity-0"
      />
    </div>
  );
}
