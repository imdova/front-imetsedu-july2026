/** View models for student course UI (normalized from portal API). */

export interface CourseDetailInfo {
  id: string;
  category: string;
  studentsEnrolled: number;
  title: string;
  instructor: string;
  instructorDept: string;
  completionPercent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  lastAccessed: string;
  imageUrl?: string | null;
}

export interface CurriculumLesson {
  id: string;
  title: string;
  lesson_type?: "video" | "quiz" | "reading";
  duration?: string;
  status: "completed" | "active" | "locked";
  quizId?: string;
}

export interface CurriculumModule {
  id: string;
  title: string;
  lessons: CurriculumLesson[];
}

export interface StudyMaterialResource {
  id: string;
  title: string;
  typeLabel: string;
  sizeOrDuration: string;
  iconType: "pptx" | "pdf" | "video" | "zip";
  action: "download" | "play";
  downloadUrl?: string;
}

export interface StudyMaterialsModule {
  id: string;
  number: number;
  title: string;
  resourceCount: number;
  totalSize: string;
  resources: StudyMaterialResource[];
}

export interface MyCourseCard {
  id: string;
  title: string;
  instructor: string;
  bannerText: string;
  bannerVariant: "teal" | "pink" | "teal2" | "white";
  imageUrl?: string;
  isFavorite: boolean;
  tags: Array<{
    label: string;
    variant: "dark" | "light" | "light-green" | "orange" | "purple";
  }>;
  progress: number | null;
  buttonLabel: "Resume Learning" | "View Certificate";
  buttonVariant: "primary" | "outline";
}

export interface SidebarLesson {
  id: string;
  slug: string;
  title: string;
  duration: string;
  status: "completed" | "in_progress" | "locked";
  kind: "lesson" | "quiz";
  quizId?: string;
}

export interface SidebarModule {
  id: string;
  title: string;
  lessons: SidebarLesson[];
  expanded: boolean;
}

export interface CurriculumNavLink {
  kind: "lesson" | "quiz";
  slug: string;
  quizId?: string;
}

export interface LessonPageData {
  courseId: string;
  courseTitle: string;
  progressPct: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  modules: SidebarModule[];
  currentLesson: {
    id: string;
    slug: string;
    title: string;
    duration: string;
    currentTime: string;
    description: string;
    objectives: string[];
    resource: { name: string; size: string; type: string };
    contentType?: string;
    contentUrl?: string;
  };
  qaCount: number;
  prevNav: CurriculumNavLink | null;
  nextNav: CurriculumNavLink | null;
}
