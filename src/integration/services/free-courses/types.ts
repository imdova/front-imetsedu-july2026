export interface FreeLectureDto {
  _id: string;
  programId?: string;
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
  /** Present on the public list endpoint. */
  lectureCount?: number;
  /** Present on the by-slug + admin detail endpoints. */
  lectures?: FreeLectureDto[];
  createdAt?: string;
  updatedAt?: string;
}
