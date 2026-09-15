"use client";

import * as React from "react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { OrientationProgressDto } from "@/lib/dal/orientation";

/** Where progress used to live before it moved to the server — read once, then cleared. */
const LEGACY_STORAGE_KEY = "imets_orientation_progress_v1";

/** Recording "where I am" waits this long after the learner lands on a lesson. */
const VISIT_DEBOUNCE_MS = 1500;

/**
 * A learner's progress through Sales Orientation, saved on the server like
 * course progress — so it follows them between devices and admins can see
 * how far the team has got.
 *
 * The page loads the saved progress server-side and passes it in, so the first
 * render already shows the right lessons ticked. Completing a lesson updates
 * the view immediately and saves in the background; a failed save says so
 * rather than pretending.
 *
 * Progress kept in `localStorage` by the earlier version is carried over once
 * (only when the server has nothing for this person), then removed.
 */
export function useOrientationProgress({
  total,
  lessonIds,
  initial,
}: {
  total: number;
  lessonIds: readonly string[];
  /** Null when the saved progress couldn't be loaded — the page still works. */
  initial: OrientationProgressDto | null;
}) {
  const valid = React.useCallback((ids: string[]) => ids.filter((id) => lessonIds.includes(id)), [lessonIds]);

  const [done, setDone] = React.useState<ReadonlySet<string>>(() => new Set(valid(initial?.completed ?? [])));
  const [completedAt, setCompletedAt] = React.useState<string | null>(initial?.completedAt ?? null);
  const [startedAt, setStartedAt] = React.useState<string | null>(initial?.startedAt ?? null);

  const doneRef = React.useRef(done);
  const lastSaved = React.useRef<string | null>(initial?.lastLessonId ?? null);
  const visitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const persist = React.useCallback(
    async (next: ReadonlySet<string>, lastLessonId?: string) => {
      const res = await dal.orientation.saveMyOrientationProgress({ completed: [...next], lastLessonId, total });
      if (!res.ok) {
        toast.error(`Your progress couldn't be saved: ${res.error}`);
        return;
      }
      if (lastLessonId) lastSaved.current = lastLessonId;
      setCompletedAt(res.data.completedAt);
      setStartedAt(res.data.startedAt);
    },
    [total],
  );

  // One-time carry-over from the old on-device progress.
  React.useEffect(() => {
    void (async () => {
      let legacy: string[] = [];
      try {
        const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as unknown) : [];
        legacy = Array.isArray(parsed) ? valid(parsed.filter((x): x is string => typeof x === "string")) : [];
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        return;
      }
      // Only when the server had nothing — never overwrite real saved progress.
      if (!legacy.length || !initial || initial.completed.length > 0) return;
      const next = new Set(legacy);
      doneRef.current = next;
      setDone(next);
      await persist(next);
    })();
    // Runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => () => {
    if (visitTimer.current) clearTimeout(visitTimer.current);
  }, []);

  const complete = React.useCallback(
    (id: string) => {
      if (doneRef.current.has(id)) return;
      const next = new Set(doneRef.current).add(id);
      doneRef.current = next;
      setDone(next);
      void persist(next, id);
    },
    [persist],
  );

  /** Remember the lesson the learner is on, so "Continue" resumes there. */
  const visit = React.useCallback(
    (id: string) => {
      if (visitTimer.current) clearTimeout(visitTimer.current);
      if (id === lastSaved.current) return;
      visitTimer.current = setTimeout(() => {
        // Nothing to record for someone who hasn't started anything yet.
        if (doneRef.current.size === 0 && !startedAt) return;
        void persist(doneRef.current, id);
      }, VISIT_DEBOUNCE_MS);
    },
    [persist, startedAt],
  );

  const reset = React.useCallback(async () => {
    const empty = new Set<string>();
    doneRef.current = empty;
    setDone(empty);
    setCompletedAt(null);
    setStartedAt(null);
    lastSaved.current = null;
    const res = await dal.orientation.resetMyOrientationProgress();
    if (!res.ok) toast.error(`Couldn't reset your progress: ${res.error}`);
  }, []);

  return {
    done,
    complete,
    visit,
    reset,
    count: done.size,
    total,
    percent: total > 0 ? Math.round((done.size / total) * 100) : 0,
    allDone: done.size >= total,
    startedAt,
    completedAt,
    lastLessonId: initial?.lastLessonId ?? null,
  };
}
