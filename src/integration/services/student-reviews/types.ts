export type ReviewKind = "video" | "graduation" | "facebook" | "whatsapp" | "gallery";
export type ReviewOrientation = "portrait" | "landscape";

export interface StudentReviewDto {
  _id: string;
  kind: ReviewKind;
  studentName?: string;
  role?: string;
  country?: string;
  caption?: string;
  videoUrl?: string;
  orientation?: ReviewOrientation;
  imageUrl?: string;
  rank?: number;
  isPublished?: boolean;
}

export interface StudentReviewBody {
  kind: ReviewKind;
  studentName?: string;
  role?: string;
  country?: string;
  caption?: string;
  videoUrl?: string;
  orientation?: ReviewOrientation;
  imageUrl?: string;
  rank?: number;
  isPublished?: boolean;
}
