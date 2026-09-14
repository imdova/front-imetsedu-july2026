export type CareerJobStatus = "draft" | "published" | "closed";

/** What an admin fills in. */
export interface CareerJobInput {
  title: string;
  employer: string;
  country: string;
  city?: string;
  professions?: string[];
  tracks?: string[];
  relatedCourseSlugs?: string[];
  minEducation?: string;
  experienceMin?: number | null;
  employmentType?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  salaryPeriod?: string;
  description: string;
  requirements?: string[];
  applyUrl?: string;
  applyEmail?: string;
  sourceName: string;
  sourceUrl?: string;
  language?: "en" | "ar";
  postedAt?: string;
  expiresAt?: string | null;
  status?: CareerJobStatus;
  notes?: string;
}

export interface CareerJobDto
  extends Required<Omit<CareerJobInput, "notes" | "expiresAt" | "postedAt" | "language" | "status">> {
  _id: string;
  slug: string;
  language: "en" | "ar";
  status: CareerJobStatus;
  postedAt: string;
  expiresAt: string | null;
  /** Admin responses only. */
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerJobFacets {
  total: number;
  countries: Record<string, number>;
  tracks: Record<string, number>;
  professions: Record<string, number>;
}

export interface CareerJobListParams {
  country?: string;
  profession?: string;
  track?: string;
  course?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CareerJobList {
  data: CareerJobDto[];
  total: number;
  page: number;
  limit: number;
  facets: CareerJobFacets;
}

export interface CareerProfile {
  profession: string;
  educationLevel: string;
  yearsOfExperience: number | null;
  courseSlugs: string[];
  tracks: string[];
  countries: string[];
  /** Opt-in to being recommended to employers. */
  shareWithEmployers: boolean;
}

export interface CareerProfileDto extends CareerProfile {
  /** False until the graduate saves once; the fields are then a prefill. */
  exists: boolean;
}

export type CareerMatchReason =
  | { kind: "profession"; value: string }
  | { kind: "open-profession" }
  | { kind: "track"; value: string }
  | { kind: "course"; value: string }
  | { kind: "country"; value: string }
  | { kind: "education" }
  | { kind: "experience" };

export type CareerMatchGap = { kind: "education"; value: string } | { kind: "experience"; value: number };

export interface CareerMatch {
  job: CareerJobDto;
  score: number;
  reasons: CareerMatchReason[];
  gaps: CareerMatchGap[];
}

export interface CareerMatches {
  hasProfile: boolean;
  matches: CareerMatch[];
}

/* ── admin: graduate profiles ── */

export interface CareerProfileAdminParams {
  profession?: string;
  track?: string;
  country?: string;
  sharing?: "true";
  q?: string;
}

export interface CareerProfileAdminRow extends CareerProfile {
  _id: string;
  userId: string;
  user: { name: string; email: string; number: string; country: string; specialty: string } | null;
  /** Open listings that currently match this profile. */
  matchCount: number;
  updatedAt?: string;
}

/* ── employer vacancy submissions ── */

export type CareerVacancyStatus = "new" | "reviewing" | "converted" | "rejected";

export interface CareerVacancyInput {
  companyName: string;
  contactName: string;
  email: string;
  /** International format, e.g. "+966500000000". */
  phone: string;
  country: string;
  city?: string;
  jobTitle: string;
  employmentType?: string;
  description: string;
  applyUrl?: string;
  /** Honeypot — always empty from a real browser. */
  website?: string;
}

export interface CareerVacancyDto extends Omit<CareerVacancyInput, "website"> {
  _id: string;
  status: CareerVacancyStatus;
  jobId: string | null;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ── admin: overview ── */

export interface CareerOverview {
  jobs: {
    byStatus: Record<string, number>;
    open: number;
    expired: number;
    byCountry: Record<string, number>;
    byTrack: Record<string, number>;
    byProfession: Record<string, number>;
  };
  profiles: {
    total: number;
    sharing: number;
    /** Profiles with no country preference. */
    anywhere: number;
    byProfession: Record<string, number>;
    byCountry: Record<string, number>;
    byTrack: Record<string, number>;
  };
  vacancies: { total: number; byStatus: Record<string, number> };
  recentJobs: Pick<CareerJobDto, "_id" | "title" | "employer" | "country" | "status" | "createdAt">[];
  recentVacancies: Pick<CareerVacancyDto, "_id" | "companyName" | "jobTitle" | "country" | "status" | "createdAt">[];
}
