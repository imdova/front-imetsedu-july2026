import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { AssignmentsTable } from "@/features/admin/components/assignments-table";

export default async function AdminAssignmentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const res = await dal.admin.fetchAssignments();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("assignmentsTitle")} description={t("assignmentsSubtitle")} />
      <AssignmentsTable initialData={res.ok ? res.data : []} />
    </div>
  );
}
