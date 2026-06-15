export interface StudentPortalCategoryRef {
  _id: string;
  name: string;
}

export interface StudentPortalInstructor {
  name?: string;
  _id?: string;
  id?: string;
  firstName?: string;
  lastName?: string;
  professionalTitle?: string;
  professionalTitleEn?: string;
  role?: string;
}

export type StudentCourseRatingTargetType = "academy" | "instructor";

export interface StudentCourseRatingEntry {
  targetType: StudentCourseRatingTargetType;
  instructorId?: string;
  targetName: string;
  scores: Record<string, number>;
  comment?: string;
  submittedAt: string;
}

export interface SubmitCourseFeedbackTargetInput {
  key: string;
  name: string;
  role?: string;
  comment?: string;
  ratings: Record<string, 1 | 2 | 3 | 4 | 5 | null>;
}

export interface SubmitCourseFeedbackInput {
  courseId: string;
  targets: SubmitCourseFeedbackTargetInput[];
  submittedAt: string;
}

export interface StudentPortalCourseListItem {
  _id: string;
  title: string;
  thumbnail?: string[];
  category?: StudentPortalCategoryRef;
  subcategory?: StudentPortalCategoryRef;
  instructors?: Array<string | StudentPortalInstructor>;
  instructorIds?: string[];
  instructorId?: string;
  progress?: number;
  isCompleted?: boolean;
}

export interface StudentPortalQuizRef {
  _id: string;
  titleAr?: string;
  titleEn?: string;
  timeLimitMinutes?: number;
}

export interface StudentPortalModuleItem {
  title: string;
  type: "lesson" | "quiz";
  contentType?: string;
  contentUrl?: string;
  quiz?: StudentPortalQuizRef;
}

export interface StudentPortalModule {
  title: string;
  items: StudentPortalModuleItem[];
}

export interface StudentPortalMaterial {
  _id: string;
  title: string;
  document: string;
}

export interface StudentRatingScore {
  overall?: number;
  support?: number;
  platform?: number;
  materials?: number;
  communication?: number;
  [key: string]: number | undefined;
}

export interface StudentRatingEntry {
  targetType: "academy" | "instructor";
  instructorId?: string;
  targetName: string;
  scores: StudentRatingScore;
  comment?: string;
  submittedAt: string;
}

export interface StudentRating {
  _id: string;
  userId: string;
  courseId: string;
  ratings: StudentRatingEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentPortalCourseDetail extends StudentPortalCourseListItem {
  assignedGroups?: Array<string | { _id?: string; id?: string }>;
  isActive?: boolean;
  modules?: StudentPortalModule[];
  materials?: StudentPortalMaterial[];
  students?: Array<{
    progress?: number;
    student: string;
    enrolledAt?: string;
  }>;
  ratings?: StudentCourseRatingEntry[];
  studentRating?: StudentRating;
  webhookUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}
