export interface FreeModuleDto {
  _id: string;
  programId?: string;
  titleEn: string;
  titleAr?: string;
  order?: number;
}

export interface FreeLectureDto {
  _id: string;
  programId?: string;
  moduleId?: string | null;
  kind?: "lesson" | "quiz";
  quizId?: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  videoProvider?: "youtube" | "vdocipher";
  videoUrl?: string;
  durationMinutes?: number;
  resourceUrl?: string;
  order?: number;
  isPublished?: boolean;
}

export interface FreeProgramDto {
  _id: string;
  titleEn: string;
  titleAr: string;
  slug: string;
  descriptionEn?: string;
  descriptionAr?: string;
  thumbnailUrl?: string;
  order?: number;
  isPublished?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  quizId?: string;
  /** Present on the public list endpoint. */
  lectureCount?: number;
  /** Present on the by-slug + admin detail endpoints. */
  lectures?: FreeLectureDto[];
  modules?: FreeModuleDto[];
  createdAt?: string;
  updatedAt?: string;
}
