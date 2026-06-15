/**
 * Lead scoring — a deterministic, explainable 0–100 score derived from profile
 * signals. Mirrors the Business Rules Catalog (BR-SCORE-1..7) so the value is
 * reproducible and a contribution breakdown can be shown to counselors.
 */

export interface LeadScoreInput {
  email?: string;
  phone?: string;
  coursesOfInterest?: string[];
  jobTitle?: string;
  educationLevel?: string;
  country?: string;
  specialty?: string;
}

export interface ScoreContribution {
  key: string;
  /** i18n key suffix (Crm namespace) for the contribution label. */
  labelKey: string;
  points: number;
  earned: boolean;
}

export type LeadPriority = "hot" | "warm" | "cold";

export interface ScoreResult {
  score: number;
  priority: LeadPriority;
  contributions: ScoreContribution[];
}

// BR-SCORE-4 senior-title detection.
const SENIOR_TITLE_RE =
  /\b(manager|director|head|lead|chief|principal|consultant|senior|specialist|coordinator|supervisor|founder|owner)\b/i;

const isValidEmail = (v?: string) =>
  !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const phoneDigits = (v?: string) => (v ? v.replace(/\D/g, "").length : 0);

/** Compute the lead score with a labelled, capped contribution breakdown. */
export function scoreLead(input: LeadScoreInput): ScoreResult {
  const c: ScoreContribution[] = [];

  // BR-SCORE-1 valid email +10
  c.push({ key: "email", labelKey: "scoreEmail", points: 10, earned: isValidEmail(input.email) });

  // BR-SCORE-2 phone ≥ 7 digits +10
  c.push({ key: "phone", labelKey: "scorePhone", points: 10, earned: phoneDigits(input.phone) >= 7 });

  // BR-SCORE-3 each course of interest +5, capped at +20
  const courses = input.coursesOfInterest?.length ?? 0;
  const coursePoints = Math.min(courses * 5, 20);
  c.push({ key: "courses", labelKey: "scoreCourses", points: coursePoints, earned: coursePoints > 0 });

  // BR-SCORE-4 senior title +15, else any non-empty title +5
  const title = input.jobTitle?.trim() ?? "";
  const titlePoints = title ? (SENIOR_TITLE_RE.test(title) ? 15 : 5) : 0;
  c.push({
    key: "jobTitle",
    labelKey: SENIOR_TITLE_RE.test(title) ? "scoreSeniorTitle" : "scoreTitle",
    points: titlePoints || 15,
    earned: titlePoints > 0,
  });

  // BR-SCORE-5 education +5, country +8, specialty +3
  c.push({ key: "education", labelKey: "scoreEducation", points: 5, earned: !!input.educationLevel });
  c.push({ key: "country", labelKey: "scoreCountry", points: 8, earned: !!input.country });
  c.push({ key: "specialty", labelKey: "scoreSpecialty", points: 3, earned: !!input.specialty });

  // BR-SCORE-6 cap at 100
  const raw = c.reduce((sum, x) => sum + (x.earned ? x.points : 0), 0);
  const score = Math.min(raw, 100);

  return { score, priority: priorityFor(score), contributions: c };
}

/** BR-LEAD-8 — priority should align with score. */
export function priorityFor(score: number): LeadPriority {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}
