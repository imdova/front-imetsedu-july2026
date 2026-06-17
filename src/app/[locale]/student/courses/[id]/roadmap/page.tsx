import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@integration/constants";

// The roadmap was merged into the course overview — keep the old path working.
export default async function StudentCourseRoadmapPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  redirect({ href: ROUTES.STUDENT.COURSE_OVERVIEW(id), locale });
}
