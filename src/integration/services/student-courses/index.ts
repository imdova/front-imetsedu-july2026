export {
  getStudentCourses,
  getStudentCourseById,
  getStudentCourseRaw,
  updateCourseProgress,
} from "./student-courses.service";
export {
  collectInstructorIdsFromCourse,
  loadCourseFeedbackInstructors,
  loadFeedbackInstructorsForCourse,
  loadInstructorsByIds,
  normalizeInstructorRefsFromCourse,
  submitStudentCourseFeedback,
} from "./feedback.service";
export type { FeedbackInstructorView } from "./feedback.service";
export type { StudentCourseDetailView } from "./student-courses.service";
export {
  buildCourseSidebar,
  buildFlatCurriculum,
  findModuleIndexForQuiz,
  buildLessonPageData,
  lessonSlug,
  parseLessonSlug,
  normalizeCourseCard,
} from "./normalize";
export type {
  StudentPortalCourseDetail,
  StudentPortalCourseListItem,
  StudentCourseRatingEntry,
  StudentRating,
  StudentRatingEntry,
} from "./types";
export type {
  CourseDetailInfo,
  CurriculumModule,
  LessonPageData,
  MyCourseCard,
} from "./view-models";
