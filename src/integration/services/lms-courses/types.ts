export enum LmsModuleItemType {
  LESSON = 'lesson',
  QUIZ = 'quiz',
}

export enum LmsLessonContentType {
  YOUTUBE_URL = 'youtube_url',
  VDOCIPHER_EMBED = 'vdocipher_embed',
}

export interface LmsModuleItem {
  _id: string;
  title: string;
  type: LmsModuleItemType;
  contentType?: LmsLessonContentType;
  contentUrl?: string;
  quiz?: any; // Can be ID or populated object
  duration?: string;
}

export interface LmsModule {
  _id: string;
  title: string;
  items: LmsModuleItem[];
}

export interface LmsCourse {
  _id: string;
  title: string;
  thumbnail: string[];
  category: {
    _id: string;
    name: string;
  } | string | null;
  subcategory?: {
    _id: string;
    name: string;
  } | string | null;
  assignedGroups: string[];
  instructors?: string[] | Array<{ _id: string; name?: string; firstName?: string; lastName?: string }>;
  webhookUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v?: number;
  status: string;
  modules?: LmsModule[];
  materials?: any[];
  students?: any[];
  ratings?: any[];
  totalEnrollment?: number;
  quizPassRate?: number;
  revenue: number;
  rating?: number;
  ratingCount?: number;
}

export interface LmsCourseListResponse {
  data: LmsCourse[];
  kpis: {
    totalActiveCourses: number;
    totalLessons: number;
    avgCompletionRate: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateLmsCourseInput {
  title: string;
  thumbnail: string[];
  category: string;
  subcategory?: string;
  instructors?: string[];
  assignedGroups?: string[];
  webhookUrl?: string;
  isActive?: boolean;
}

export interface UpdateLmsCourseInput {
  title?: string;
  thumbnail?: string[];
  category?: string;
  subcategory?: string;
  instructors?: string[];
  assignedGroups?: string[];
  webhookUrl?: string;
  isActive?: boolean;
  status?: string;
  modules?: any[];
}
