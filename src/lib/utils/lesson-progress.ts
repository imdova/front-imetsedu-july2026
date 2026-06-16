const WATCHED_PREFIX = "imets_watched_";
const PROGRESS_PREFIX = "imets_progress_";

function watchedKey(courseId: string) {
  return `${WATCHED_PREFIX}${courseId}`;
}

export function getWatchedLessons(courseId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(watchedKey(courseId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return new Set<string>(parsed);
  } catch {
    // ignore parse errors
  }
  return new Set();
}

export function markLessonWatched(courseId: string, lessonSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    const watched = getWatchedLessons(courseId);
    watched.add(lessonSlug);
    localStorage.setItem(watchedKey(courseId), JSON.stringify([...watched]));
  } catch {
    // ignore storage errors
  }
}

export function calculateProgress(watchedCount: number, totalLessons: number): number {
  if (totalLessons <= 0) return 0;
  return Math.min(100, Math.floor((watchedCount / totalLessons) * 100));
}

export function saveProgressPct(courseId: string, pct: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${PROGRESS_PREFIX}${courseId}`, String(pct));
  } catch {
    // ignore
  }
}

export function getProgressPct(courseId: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PROGRESS_PREFIX}${courseId}`);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}
