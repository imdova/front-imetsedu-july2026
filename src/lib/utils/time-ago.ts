/** Compact relative-time formatter, e.g. "3d ago", "just now", "in 2h". */
export function timeAgo(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  const ms = date.getTime();
  if (Number.isNaN(ms)) return "—";

  const diff = ms - Date.now();
  const abs = Math.abs(diff);
  const sign = diff >= 0 ? "in " : "";
  const suffix = diff >= 0 ? "" : " ago";

  const units: [number, string][] = [
    [60_000, "s"],
    [3_600_000, "m"],
    [86_400_000, "h"],
    [604_800_000, "d"],
    [2_629_800_000, "w"],
    [31_557_600_000, "mo"],
    [Infinity, "y"],
  ];

  if (abs < 45_000) return "just now";

  const divisors = [1000, 60_000, 3_600_000, 86_400_000, 604_800_000, 2_629_800_000, 31_557_600_000];
  for (let i = 0; i < units.length; i++) {
    if (abs < units[i][0]) {
      const value = Math.round(abs / divisors[i]);
      return `${sign}${value}${units[i][1]}${suffix}`;
    }
  }
  return date.toLocaleDateString();
}
