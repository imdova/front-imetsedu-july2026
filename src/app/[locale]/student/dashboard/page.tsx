import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { StudentDashboard } from "@/features/student/components/student-dashboard";

export default async function StudentDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");

  const res = await dal.student.fetchDashboard();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("dashboardTitle")} description={t("dashboardSubtitle")} />
      {res.ok && <StudentDashboard data={res.data} />}
    </div>
  );
}
