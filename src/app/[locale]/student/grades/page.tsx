import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { GradesTable } from "@/features/student/components/grades-table";

export default async function StudentGradesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchGrades();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader title={t("gradesTitle")} description={t("gradesSubtitle")} />
      <GradesTable grades={res.ok ? res.data : []} />
    </div>
  );
}
