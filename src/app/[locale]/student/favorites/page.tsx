import { Heart } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CourseProgressCard } from "@/features/student/components/course-progress-card";

export default async function StudentFavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchFavorites();
  const courses = res.ok ? res.data : [];
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("favoritesTitle")} description={t("favoritesSubtitle")}>
        <Button asChild variant="outline" className="gap-1.5">
          <Link href="/courses"><Heart className="size-4" />{t("browseMore")}</Link>
        </Button>
      </PageHeader>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => <CourseProgressCard key={c.id} course={c} />)}
      </div>
    </div>
  );
}
