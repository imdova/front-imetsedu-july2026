/**
 * Module-check scoring, shared by the game (client) and the employee report
 * (server): XP per answer, stars per run and the XP levels.
 */

export const QUESTION_SECONDS = 20;
export const BASE_XP = 100;
export const SPEED_XP = 50;
const STREAK_STEP = 20;
const STREAK_CAP = 100;

export const streakBonus = (streakBefore: number) => Math.min(STREAK_CAP, STREAK_STEP * streakBefore);

/** The most XP a run of `n` questions can earn. */
export const maxXp = (n: number) => Array.from({ length: n }, (_, i) => BASE_XP + SPEED_XP + streakBonus(i)).reduce((a, b) => a + b, 0);

export function starsFor(correct: number, total: number, passPercent: number) {
  const pct = total ? (correct / total) * 100 : 0;
  if (pct < passPercent) return 0;
  return pct >= 90 ? 3 : pct >= 75 ? 2 : 1;
}

/** XP levels. `key` is the i18n key of the level name. */
export const LEVELS = [
  { min: 0, key: "level.1", en: "Trainee" },
  { min: 800, key: "level.2", en: "Advisor" },
  { min: 2500, key: "level.3", en: "Senior advisor" },
  { min: 5000, key: "level.4", en: "Sales pro" },
] as const;

export function levelFor(xp: number) {
  let i = 0;
  LEVELS.forEach((l, j) => {
    if (xp >= l.min) i = j;
  });
  return { index: i, current: LEVELS[i], next: LEVELS[i + 1] ?? null };
}
