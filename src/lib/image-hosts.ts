/**
 * Which hosts `next/image` may fetch from and optimize.
 *
 * Shared by `next.config.ts` (the allow-list the optimizer enforces) and by
 * `SmartImage` (which decides whether an `src` can go through it at all), so the
 * two cannot drift apart. This file must stay free of `@/` imports: the Next
 * config loads it before path aliases exist.
 *
 * `IMAGE_HOST` is the host of the bucket (or the CDN in front of it) that holds
 * uploaded media. Putting a CDN in front of S3 later is then a one-line change in
 * the server's environment — set `IMAGE_HOST=cdn.imetsedu.com` and rebuild — with
 * no code edit. It is inlined into the client bundle by `next.config.ts`, so
 * `SmartImage` sees the same value the optimizer does.
 */

/** The S3 bucket uploads live in today. */
export const DEFAULT_IMAGE_HOST = "imets-medical.s3.us-east-1.amazonaws.com";

/** The upload host: `IMAGE_HOST`, or the bucket above. */
export const imageHost = (): string =>
  (process.env.NEXT_PUBLIC_IMAGE_HOST || process.env.IMAGE_HOST || DEFAULT_IMAGE_HOST)
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .trim();

/**
 * Exact hosts, plus `**.` wildcards for subdomains. A wildcard is as wide as it
 * reads: `**.amazonaws.com` used to be here, which let anyone use the optimizer
 * to fetch and proxy any file on AWS. Only hosts the site actually serves images
 * from are listed.
 */
export const STATIC_IMAGE_HOSTS = [
  // Marketing photography, until it moves to the media bucket.
  "images.unsplash.com",
  // Course and platform media served from our own domain (medical.imetsedu.com).
  "**.imetsedu.com",
  // YouTube video posters (hero facade, student testimonials).
  "i.ytimg.com",
  "img.youtube.com",
] as const;

export const allImageHosts = (): string[] => [imageHost(), ...STATIC_IMAGE_HOSTS];

/** Does `host` match a pattern as `images.remotePatterns` would? */
function hostMatches(host: string, pattern: string): boolean {
  if (pattern.startsWith("**.")) {
    const root = pattern.slice(3);
    return host === root || host.endsWith(`.${root}`);
  }
  return host === pattern;
}

/**
 * Can this URL go through the optimizer? Relative paths (our own `public/`) can;
 * absolute URLs only when their host is on the list. Anything else — a URL an
 * admin pasted from elsewhere, a `data:` URI, a `blob:` preview — would make
 * `next/image` throw, and has to be a plain `<img>`.
 */
export function isOptimizableImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return allImageHosts().some((p) => hostMatches(url.hostname, p));
}
