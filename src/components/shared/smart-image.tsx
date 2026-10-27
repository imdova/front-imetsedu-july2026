"use client";

import * as React from "react";
import Image, { type ImageProps } from "next/image";

import { cn } from "@/lib/utils";
import { isOptimizableImage } from "@/lib/image-hosts";

type SmartImageProps = Omit<ImageProps, "src" | "priority" | "preload"> & {
  src: string;
  /**
   * The image is likely the Largest Contentful Paint element — a hero, or the
   * first thing in the viewport. Loads eagerly at high fetch priority. Leave it
   * off for everything else: a page with five "priority" images has none.
   */
  priority?: boolean;
};

/**
 * An image that is optimized when it can be and still renders when it cannot.
 *
 * `next/image` resizes to the size actually shown and serves AVIF or WebP, which
 * is most of the weight of a photo; but it throws for a host that is not in
 * `images.remotePatterns`. Uploaded media lives on hosts we control, so those go
 * through the optimizer. A URL an admin pasted from somewhere else, a `data:`
 * URI or a `blob:` preview cannot, and renders as a plain lazy `<img>` — sized, so
 * it still cannot shift the layout — instead of breaking the page.
 *
 * The optimizer can also fail on an image it was allowed to take: it gives up on
 * the upstream download after about seven seconds, and some uploads are 6 MB
 * PNGs. A broken image is worse than a heavy one, so an optimized image that
 * errors is swapped for the original file.
 *
 * The allow-list is `src/lib/image-hosts.ts`, shared with `next.config.ts`.
 *
 * Give it `width` and `height`, or `fill` inside a sized, positioned parent, and
 * a `sizes` that describes the image's CSS width at each breakpoint — that is what
 * lets the browser pick the smallest candidate instead of the largest.
 */
export function SmartImage({
  src,
  alt,
  priority,
  loading,
  fill,
  width,
  height,
  className,
  style,
  // Next-only props: harmless to the optimizer, noise on a plain <img>.
  quality: _quality,
  unoptimized: _unoptimized,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  loader: _loader,
  overrideSrc: _overrideSrc,
  sizes,
  onError,
  ...rest
}: SmartImageProps) {
  const load = priority ? ("eager" as const) : (loading ?? ("lazy" as const));
  const fetchPriority = priority ? ("high" as const) : undefined;

  // The optimizer refused or timed out: show the original instead.
  const [failed, setFailed] = React.useState(false);
  const ref = React.useRef<HTMLImageElement>(null);

  // An error that fires before hydration is never seen by `onError`; a finished
  // load with no pixels is the same failure, so look for it once on mount.
  React.useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (isOptimizableImage(src) && !failed) {
    return (
      <Image
        ref={ref}
        src={src}
        alt={alt}
        fill={fill}
        width={width}
        height={height}
        sizes={sizes}
        loading={load}
        fetchPriority={fetchPriority}
        className={className}
        style={style}
        quality={_quality}
        unoptimized={_unoptimized}
        placeholder={_placeholder}
        blurDataURL={_blurDataURL}
        loader={_loader}
        overrideSrc={_overrideSrc}
        onError={(e) => {
          setFailed(true);
          onError?.(e);
        }}
        {...rest}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- host not on the optimizer's allow-list, or the optimizer failed
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={load}
      fetchPriority={fetchPriority}
      decoding="async"
      className={fill ? cn("absolute inset-0 size-full", className) : className}
      style={style}
      aria-hidden={rest["aria-hidden"]}
      onLoad={rest.onLoad}
      onError={onError}
    />
  );
}
