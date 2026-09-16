"use client";

import * as React from "react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { OrientationModuleCheckRecord, OrientationProgressDto } from "@/lib/dal/orientation";
import type { Translate } from "@/features/orientation/lib/i18n";
import { track } from "@/features/orientation/lib/track";

/** Where progress used to live before it moved to the server — read once, then cleared. */
const LEGACY_STORAGE_KEY = "imets_orientation_progress_v1";

/** Recording "where I am" waits this long after the learner lands on a lesson. */
const VISIT_DEBOUNCE_MS = 1500;
/** Gate steps (a rule opened, a card flipped) are batched into one save. */
const GATE_DEBOUNCE_MS = 800;

type Gates = Record<string, string[]>;

export interface QuizResult {
  ok: boolean;
  passed: boolean;
  /** First time over the pass mark — the team lead was notified. */
  firstPass: boolean;
}

/**
 * A learner's progress through Sales Orientation, saved on the server like
 * course progress — so it follows them between devices and admins can see
 * how far the team has got.
 *
 * Each lesson has a gate (open 4 rules, watch 2 videos…). Every step towards
 * it is recorded as a gate key, and the lesson completes by itself once its
 * keys reach the gate — there is no "mark complete" button. Keys are ids, not
 * text, so switching language mid-lesson keeps them.
 *
 * The page loads the saved progress server-side, so the first render already
 * shows the right lessons ticked. Changes show immediately and save in the
 * background; a failed save says so rather than pretending.
 */
export function useOrientationProgress({
  lessonIds,
  initial,
  t,
  onLessonComplete,
}: {
  lessonIds: readonly string[];
  /** Null when the saved progress couldn't be loaded — the page still works. */
  initial: OrientationProgressDto | null;
  t: Translate;
  onLessonComplete?: (lessonId: string) => void;
}) {
  const total = lessonIds.length;
  const valid = React.useCallback((ids: string[]) => ids.filter((id) => lessonIds.includes(id)), [lessonIds]);

  const [done, setDone] = React.useState<ReadonlySet<string>>(() => new Set(valid(initial?.completed ?? [])));
  const [gates, setGates] = React.useState<Gates>(() => ({ ...(initial?.gates ?? {}) }));
  const [completedAt, setCompletedAt] = React.useState<string | null>(initial?.completedAt ?? null);
  const [startedAt, setStartedAt] = React.useState<string | null>(initial?.startedAt ?? null);
  const [quiz, setQuiz] = React.useState({
    score: initial?.quizScore ?? null,
    total: initial?.quizTotal ?? null,
    passedAt: initial?.quizPassedAt ?? null,
  });

  const [moduleChecks, setModuleChecks] = React.useState<Record<string, OrientationModuleCheckRecord>>(
    () => ({ ...(initial?.moduleChecks ?? {}) }),
  );

  const doneRef = React.useRef(done);
  const gatesRef = React.useRef(gates);
  const lastSaved = React.useRef<string | null>(initial?.lastLessonId ?? null);
  const currentLesson = React.useRef<string | undefined>(undefined);
  const visitTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const gateTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = React.useRef(onLessonComplete);
  const tRef = React.useRef(t);

  React.useEffect(() => {
    onCompleteRef.current = onLessonComplete;
    tRef.current = t;
  });

  const persist = React.useCallback(
    async (lastLessonId?: string) => {
      const res = await dal.orientation.saveMyOrientationProgress({
        completed: [...doneRef.current],
        gates: gatesRef.current,
        lastLessonId,
        total,
      });
      if (!res.ok) {
        toast.error(tRef.current("progress.saveFailed", { error: res.error }));
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
      await persist();
    })();
    // Runs once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(
    () => () => {
      if (visitTimer.current) clearTimeout(visitTimer.current);
      if (gateTimer.current) clearTimeout(gateTimer.current);
    },
    [],
  );

  const complete = React.useCallback(
    (id: string) => {
      if (doneRef.current.has(id)) return;
      const next = new Set(doneRef.current).add(id);
      doneRef.current = next;
      setDone(next);
      if (gateTimer.current) clearTimeout(gateTimer.current);
      void persist(id);
      track("orientation_lesson_completed", { lessonId: id });
      onCompleteRef.current?.(id);
    },
    [persist],
  );

  /**
   * Record one step towards a lesson's gate. Completes the lesson when its keys
   * reach `required` (0 ⇒ the first step completes it).
   */
  const mark = React.useCallback(
    (lessonId: string, key: string, required: number) => {
      const current = gatesRef.current[lessonId] ?? [];
      if (current.includes(key)) {
        if (!doneRef.current.has(lessonId) && current.length >= required) complete(lessonId);
        return;
      }
      const keys = [...current, key];
      const next = { ...gatesRef.current, [lessonId]: keys };
      gatesRef.current = next;
      setGates(next);
      track("orientation_gate_progress", { lessonId, key, count: keys.length });
      if (!doneRef.current.has(lessonId) && keys.length >= required) {
        complete(lessonId);
        return;
      }
      if (gateTimer.current) clearTimeout(gateTimer.current);
      gateTimer.current = setTimeout(() => void persist(currentLesson.current), GATE_DEBOUNCE_MS);
    },
    [complete, persist],
  );

  /** Remember the lesson the learner is on, so "Continue" resumes there. */
  const visit = React.useCallback(
    (id: string) => {
      currentLesson.current = id;
      if (visitTimer.current) clearTimeout(visitTimer.current);
      if (id === lastSaved.current) return;
      visitTimer.current = setTimeout(() => {
        // Nothing to record for someone who hasn't started anything yet.
        if (doneRef.current.size === 0 && Object.keys(gatesRef.current).length === 0 && !startedAt) return;
        void persist(id);
      }, VISIT_DEBOUNCE_MS);
    },
    [persist, startedAt],
  );

  const reset = React.useCallback(async () => {
    const empty = new Set<string>();
    doneRef.current = empty;
    gatesRef.current = {};
    setDone(empty);
    setGates({});
    setCompletedAt(null);
    setStartedAt(null);
    setQuiz({ score: null, total: null, passedAt: null });
    lastSaved.current = null;
    const res = await dal.orientation.resetMyOrientationProgress();
    if (!res.ok) toast.error(tRef.current("progress.resetFailed", { error: res.error }));
  }, []);

  const recordQuiz = React.useCallback(async (score: number, outOf: number, passMark: number): Promise<QuizResult> => {
    track("orientation_quiz_submitted", { score, total: outOf });
    const res = await dal.orientation.submitOrientationQuiz({ score, total: outOf, passMark });
    if (!res.ok) {
      toast.error(tRef.current("quiz.saveFailed", { error: res.error }));
      return { ok: false, passed: score >= passMark, firstPass: false };
    }
    const firstPass = res.data.passed && !quiz.passedAt;
    setQuiz({ score: res.data.quizScore ?? score, total: res.data.quizTotal ?? outOf, passedAt: res.data.quizPassedAt ?? null });
    setStartedAt(res.data.startedAt);
    return { ok: true, passed: res.data.passed, firstPass };
  }, [quiz.passedAt]);

  /** Save a module-check run. Best score, XP and stars are kept server-side. */
  const recordModuleCheck = React.useCallback(
    async (
      moduleId: string,
      run: { score: number; total: number; passPercent: number; xp: number; stars: number },
    ): Promise<{ ok: boolean; passed: boolean; firstPass: boolean; newBest: boolean }> => {
      const prev = moduleChecks[moduleId];
      const passed = (run.score / run.total) * 100 >= run.passPercent;
      track("orientation_module_check", { moduleId, score: run.score, total: run.total, xp: run.xp, stars: run.stars });
      const res = await dal.orientation.submitOrientationModuleCheck(moduleId, run);
      if (!res.ok) {
        toast.error(tRef.current("check.saveFailed", { error: res.error }));
        return { ok: false, passed, firstPass: false, newBest: false };
      }
      setModuleChecks({ ...(res.data.moduleChecks ?? {}) });
      setStartedAt(res.data.startedAt);
      return { ok: true, passed, firstPass: passed && !prev?.passedAt, newBest: run.xp > (prev?.xp ?? 0) };
    },
    [moduleChecks],
  );

  return {
    done,
    gates,
    moduleChecks,
    recordModuleCheck,
    complete,
    mark,
    visit,
    reset,
    recordQuiz,
    quiz,
    count: done.size,
    total,
    percent: total > 0 ? Math.min(100, Math.round((done.size / total) * 100)) : 0,
    allDone: total > 0 && lessonIds.every((id) => done.has(id)),
    startedAt,
    completedAt,
    signedOffAt: initial?.signedOffAt ?? null,
    lastLessonId: initial?.lastLessonId ?? null,
  };
}
