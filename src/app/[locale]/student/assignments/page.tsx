import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { AssignmentsList } from "@/features/student/components/assignments-list";

export default async function StudentAssignmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchAssignments();
  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={t("assignmentsTitle")} description={t("assignmentsSubtitle")} />
      <AssignmentsList items={res.ok ? res.data : []} />
    </div>
  );
}
