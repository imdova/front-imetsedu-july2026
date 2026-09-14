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
