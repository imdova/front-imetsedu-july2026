/** UI view-model for public student reviews (backed by the live API). */

export type ReviewKind = "video" | "graduation" | "facebook" | "whatsapp";
export type ReviewOrientation = "portrait" | "landscape";

export interface StudentReview {
  id: string;
  kind: ReviewKind;
  studentName: string;
  role: string;
  country: string;
  caption: string;
  videoUrl: string;
  orientation: ReviewOrientation;
  imageUrl: string;
  rank: number;
  isPublished: boolean;
}

export type StudentReviewInput = Omit<StudentReview, "id">;

export const REVIEW_KINDS: ReviewKind[] = ["video", "graduation", "facebook", "whatsapp"];
