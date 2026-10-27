"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/smart-image";

/** Image carousel — prev/next arrows, dot navigation, gentle auto-advance.
 *  Client island used by the block renderer. */
export function CarouselBlock({
  images,
}: {
  images?: { url: string; alt?: string }[];
}) {
  const list = images ?? [];
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % list.length), 5000);
    return () => clearInterval(id);
  }, [list.length]);

  if (list.length === 0) {
    return (
      <div className="grid aspect-video place-items-center rounded-2xl border border-dashed border-border/60 text-sm text-muted-foreground">
        Add carousel images.
      </div>
    );
  }

  const current = list[index % list.length] ?? { url: "", alt: "" };
  const go = (d: number) => setIndex((p) => (p + d + list.length) % list.length);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60">
      <SmartImage
        src={current.url}
        alt={current.alt ?? ""}
        width={1200}
        height={675}
        sizes="(min-width: 1024px) 768px, 100vw"
        className="aspect-video h-auto w-full object-cover"
      />
      {list.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={() => go(-1)}
            className="absolute start-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow ring-1 ring-border/60 backdrop-blur transition-colors hover:bg-background"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={() => go(1)}
            className="absolute end-3 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow ring-1 ring-border/60 backdrop-blur transition-colors hover:bg-background"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {list.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "size-2 rounded-full transition-colors",
                  i === index % list.length ? "bg-white" : "bg-white/50 hover:bg-white/75",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
