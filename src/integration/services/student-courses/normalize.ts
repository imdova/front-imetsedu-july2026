import type {
  CourseDetailInfo,
  CurriculumLesson,
  CurriculumModule,
  LessonPageData,
  MyCourseCard,
  SidebarLesson,
  SidebarModule,
  StudyMaterialResource,
  StudyMaterialsModule,
  CurriculumNavLink,
} from "./view-models";
import type {
  StudentPortalCourseDetail,
  StudentPortalCourseListItem,
  StudentPortalModule,
  StudentPortalModuleItem,
} from "./types";

export function lessonSlug(moduleIndex: number, itemIndex: number): string {
  return `m${moduleIndex}-i${itemIndex}`;
}

export function parseLessonSlug(
  slug: string,
): { moduleIndex: number; itemIndex: number } | null {
  const match = /^m(\d+)-i(\d+)$/.exec(slug);
  if (!match) return null;
  return { moduleIndex: Number(match[1]), itemIndex: Number(match[2]) };
}

function formatInstructors(
  instructors?: StudentPortalCourseListItem["instructors"],
): string {
  if (!instructors?.length) return "";
  return instructors
    .map((i) =>
      typeof i === "string" ? i : i.name,
    )
    .filter(Boolean)
    .join(", ");
}

function countLessonItems(modules?: StudentPortalModule[]): number {
  if (!modules?.length) return 0;
  return modules.reduce(
    (sum, mod) =>
      sum + (mod.items?.filter((i) => i.type === "lesson").length ?? 0),
    0,
  );
}

function guessMaterialIcon(url: string): StudyMaterialResource["iconType"] {
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".pptx") || lower.endsWith(".ppt")) return "pptx";
  if (lower.endsWith(".zip")) return "zip";
  return "pdf";
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function normalizeCourseCard(
  item: StudentPortalCourseListItem,
): MyCourseCard {
  const thumb = item.thumbnail?.[0];
  const tags: MyCourseCard["tags"] = [];
  if (item.category?.name) {
    tags.push({ label: item.category.name, variant: "dark" });
  }
  if (item.subcategory?.name) {
    tags.push({ label: item.subcategory.name, variant: "light" });
  }

  return {
    id: item._id,
    title: item.title,
    instructor: formatInstructors(item.instructors) || "—",
    bannerText: "",
    bannerVariant: thumb ? "white" : "teal",
    imageUrl: thumb,
    isFavorite: false,
    tags,
    progress: item.isCompleted ? null : (item.progress ?? 0),
    buttonLabel: item.isCompleted ? "View Certificate" : "Resume Learning",
    buttonVariant: item.isCompleted ? "outline" : "primary",
  };
}

export function normalizeCurriculum(
  modules?: StudentPortalModule[],
): CurriculumModule[] {
  if (!modules?.length) return [];

  return modules.map((mod, moduleIndex) => ({
    id: `mod-${moduleIndex}`,
    title: mod.title,
    lessons: (mod.items ?? []).map((item, itemIndex) =>
      mapCurriculumLesson(item, moduleIndex, itemIndex),
    ),
  }));
}

function mapCurriculumLesson(
  item: StudentPortalModuleItem,
  moduleIndex: number,
  itemIndex: number,
): CurriculumLesson {
  const id = lessonSlug(moduleIndex, itemIndex);
  if (item.type === "quiz" && item.quiz?._id) {
    return {
      id,
      title: item.quiz.titleEn || item.quiz.titleAr || item.title || "Quiz",
      lesson_type: "quiz",
      quizId: item.quiz._id,
      status: "active",
    };
  }

  const isVideo =
    item.contentType === "youtube_url" ||
    item.contentType === "vdocipher_embed";

  return {
    id,
    title: item.title,
    lesson_type: isVideo ? "video" : "reading",
    status: "active",
  };
}

export function normalizeMaterials(
  materials?: StudentPortalCourseDetail["materials"],
): StudyMaterialsModule[] {
  if (!materials?.length) return [];

  const resources: StudyMaterialResource[] = materials.map((m) => ({
    id: m._id,
    title: m.title,
    typeLabel: isHttpUrl(m.document) ? "Download" : "Document",
    sizeOrDuration: "—",
    iconType: isHttpUrl(m.document)
      ? guessMaterialIcon(m.document)
      : "pdf",
    action: "download" as const,
    downloadUrl: isHttpUrl(m.document) ? m.document : undefined,
  }));

  return [
    {
      id: "course-materials",
      number: 1,
      title: "Course materials",
      resourceCount: resources.length,
      totalSize: "—",
      resources,
    },
  ];
}

export function normalizeCourseDetailInfo(
  course: StudentPortalCourseDetail,
  storedProgress?: number | null,
): CourseDetailInfo {
  const lessonsTotal = countLessonItems(course.modules);
  const studentsMax = course.students?.reduce((max, s) => Math.max(max, s.progress ?? 0), 0) ?? 0;
  const apiProgress = Math.max(course.progress ?? 0, studentsMax);
  const progress = storedProgress != null && storedProgress > apiProgress
    ? storedProgress
    : apiProgress;
  const lessonsCompleted = Math.min(
    lessonsTotal,
    Math.round((progress / 100) * lessonsTotal),
  );

  return {
    id: course._id,
    category: course.category?.name?.toUpperCase() ?? "COURSE",
    studentsEnrolled: course.students?.length ?? 0,
    title: course.title,
    instructor: formatInstructors(course.instructors) || "—",
    instructorDept: course.subcategory?.name ?? "",
    completionPercent: progress,
    lessonsCompleted,
    lessonsTotal: lessonsTotal || 0,
    lastAccessed: "—",
    imageUrl: course.thumbnail?.[0] ?? null,
  };
}

export function buildFlatCurriculum(
  modules?: StudentPortalModule[],
): CurriculumNavLink[] {
  if (!modules?.length) return [];
  const items: CurriculumNavLink[] = [];
  modules.forEach((mod, mi) => {
    (mod.items ?? []).forEach((item, ii) => {
      const slug = lessonSlug(mi, ii);
      if (item.type === "lesson") {
        items.push({ kind: "lesson", slug });
      } else if (item.type === "quiz" && item.quiz?._id) {
        items.push({ kind: "quiz", slug, quizId: item.quiz._id });
      }
    });
  });
  return items;
}

export function buildCourseSidebar(
  modules?: StudentPortalModule[],
  expandedModuleIndex = 0,
): import("./view-models").SidebarModule[] {
  if (!modules?.length) return [];
  return modules.map((m, mi) => ({
    id: `mod-${mi}`,
    title: m.title,
    expanded: mi === expandedModuleIndex,
    lessons: (m.items ?? [])
      .map((item, ii) => mapSidebarItem(item, mi, ii))
      .filter((l): l is import("./view-models").SidebarLesson => l !== null),
  }));
}

function mapSidebarItem(
  item: StudentPortalModuleItem,
  moduleIndex: number,
  itemIndex: number,
): import("./view-models").SidebarLesson | null {
  const slug = lessonSlug(moduleIndex, itemIndex);
  if (item.type === "quiz" && item.quiz?._id) {
    return {
      id: item.quiz._id,
      slug,
      title: item.quiz.titleEn || item.quiz.titleAr || item.title || "Quiz",
      duration: item.quiz.timeLimitMinutes
        ? `${item.quiz.timeLimitMinutes} min`
        : "—",
      status: "in_progress",
      kind: "quiz",
      quizId: item.quiz._id,
    };
  }
  if (item.type === "lesson") {
    return {
      id: slug,
      slug,
      title: item.title,
      duration: "—",
      status: "in_progress",
      kind: "lesson",
    };
  }
  return null;
}

export function findModuleIndexForQuiz(
  modules: StudentPortalModule[] | undefined,
  quizId: string,
): number {
  if (!modules?.length) return 0;
  for (let mi = 0; mi < modules.length; mi++) {
    for (const item of modules[mi].items ?? []) {
      if (item.type === "quiz" && item.quiz?._id === quizId) {
        return mi;
      }
    }
  }
  return 0;
}

export function findFirstLessonSlug(modules?: StudentPortalModule[]): string | null {
  if (!modules?.length) return null;
  for (let mi = 0; mi < modules.length; mi++) {
    const items = modules[mi].items ?? [];
    for (let ii = 0; ii < items.length; ii++) {
      if (items[ii].type === "lesson") {
        return lessonSlug(mi, ii);
      }
    }
  }
  return null;
}

export function buildLessonPageData(
  course: StudentPortalCourseDetail,
  courseId: string,
  lessonSlugParam: string,
): LessonPageData | null {
  const modules = course.modules ?? [];
  const parsed = parseLessonSlug(lessonSlugParam);
  if (!parsed) return null;

  const { moduleIndex, itemIndex } = parsed;
  const mod = modules[moduleIndex];
  const item = mod?.items?.[itemIndex];
  if (!mod || !item || item.type !== "lesson") return null;

  const sidebarModules = buildCourseSidebar(modules, moduleIndex);
  const flat = buildFlatCurriculum(modules);
  const currentIndex = flat.findIndex(
    (i) => i.kind === "lesson" && i.slug === lessonSlugParam,
  );
  const lessonsTotal = countLessonItems(modules);
  const progress = course.progress ?? 0;

  return {
    courseId,
    courseTitle: course.title,
    progressPct: progress,
    lessonsCompleted: Math.min(
      lessonsTotal,
      Math.round((progress / 100) * lessonsTotal),
    ),
    lessonsTotal: lessonsTotal || flat.filter((i) => i.kind === "lesson").length,
    modules: sidebarModules,
    currentLesson: {
      id: lessonSlugParam,
      slug: lessonSlugParam,
      title: item.title,
      duration: "—",
      currentTime: "0:00",
      description: "",
      objectives: [],
      resource: { name: "", size: "", type: "" },
      contentType: item.contentType,
      contentUrl: item.contentUrl,
    },
    qaCount: 0,
    prevNav: currentIndex > 0 ? flat[currentIndex - 1] : null,
    nextNav:
      currentIndex >= 0 && currentIndex < flat.length - 1
        ? flat[currentIndex + 1]
        : null,
  };
}

export function unwrapCourseList(
  data: StudentPortalCourseListItem[] | { data?: StudentPortalCourseListItem[] },
): StudentPortalCourseListItem[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray(data.data)) {
    return data.data;
  }
  return [];
}

export function unwrapCourseDetail(
  data: StudentPortalCourseDetail | { data?: StudentPortalCourseDetail },
): StudentPortalCourseDetail | null {
  if (!data || typeof data !== "object") return null;
  if ("_id" in data && "title" in data) {
    return data as StudentPortalCourseDetail;
  }
  const nested = (data as { data?: StudentPortalCourseDetail }).data;
  return nested && typeof nested === "object" ? nested : null;
}
