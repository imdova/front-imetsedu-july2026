import { api, type Result } from "@integration/services/http/client";

export interface PublicProfileDto {
  username: string;
  name: string;
  image: string;
  headline: string;
  summary: string;
  location: string;
  specialty: string;
  jobTitle: string;
  skills: string[];
  links: { linkedin: string; website: string; email: string; phone: string };
  showEmail: boolean;
  showPhone: boolean;
  publicProfileEnabled: boolean;
  verified: boolean;
  stats: { certificates: number; programs: number; completion: number; classYear: number | null };
  certificates: { code: string; program: string; issuedAt: string | null; link: string; status: string }[];
  progress: { label: string; pct: number; note: string }[];
  memberSince: string | null;
}

export interface UpdatePublicProfileInput {
  username?: string;
  publicProfileEnabled?: boolean;
  headline?: string;
  summary?: string;
  skills?: string[];
  linkedin?: string;
  website?: string;
  showEmail?: boolean;
  showPhone?: boolean;
}

/* Public */
export const getPublicProfile = (username: string): Promise<Result<PublicProfileDto>> =>
  api.get(`/profile/${encodeURIComponent(username)}`, { requireAuth: false, revalidate: false });

/* Owner */
export const getMyPublicProfile = (): Promise<Result<PublicProfileDto>> => api.get("/profiles/me", { revalidate: false });
export const updateMyPublicProfile = (input: UpdatePublicProfileInput): Promise<Result<PublicProfileDto>> => api.patch("/profiles/me", input);
