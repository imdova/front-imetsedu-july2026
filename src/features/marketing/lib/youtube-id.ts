/** Extract a YouTube video id from watch, embed, shorts, or youtu.be URLs. */
export function extractYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return m?.[1] ?? null;
}
