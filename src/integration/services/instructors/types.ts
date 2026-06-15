export interface SocialLink {
  key: string;
  value: string;
}

export interface InstructorReview {
  reviewerNameAr: string;
  reviewerNameEn: string;
  reviewerImage?: string;
  rating: number;
  commentAr: string;
  commentEn: string;
  media?: string[];
}

export interface CreateInstructorDto {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  professionalTitle?: string;
  professionalTitleAr?: string;
  professionalTitleEn?: string;
  bio?: string;
  bioAr?: string;
  bioEn?: string;
  experience?: string | number;
  yearsOfExperience?: number;
  rating?: number;
  website?: string;
  image?: string;
  number?: string;
  country?: string;
  address?: string;
  birthday?: string;
   "6a05e1f537c10d66e58aff55"?: string;
  isActive?: boolean;
  socialLinks?: SocialLink[];
  certificates?: string[];
  reviews?: InstructorReview[];
}

export interface InstructorResponse extends CreateInstructorDto {
  _id: string; // From the provided json, it seems it's _id
  id?: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorsKpis {
  totalFaculty: number;
  activeInstructors: number;
  inactiveInstructors: number;
}

export interface InstructorsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetInstructorsResponse {
  kpis: InstructorsKpis;
  data: InstructorResponse[];
  pagination: InstructorsPagination;
}

export interface GetInstructorsQuery {
  search?: string;
   "6a05e1f537c10d66e58aff55"?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  lang?: string;
}
