/**
 * Per-lesson student notes, persisted in localStorage (per device). A lightweight
 * MVP — mirrors the localStorage approach used by `lesson-progress`. Swap the two
 * accessors for a backend call if cross-device sync is later required.
 */
export interface LessonNote {
  id: string;
  text: string;
  /** Epoch ms when the note was created. */
  at: number;
}

const key = (courseId: string, slug: string) => `imets:notes:${courseId}:${slug}`;

export function getLessonNotes(courseId: string, slug: string): LessonNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(courseId, slug));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? (parsed as LessonNote[]) : [];
  } catch {
    return [];
  }
}

export function saveLessonNotes(courseId: string, slug: string, notes: LessonNote[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(courseId, slug), JSON.stringify(notes));
  } catch {
    /* ignore quota / private-mode errors */
  }
}
