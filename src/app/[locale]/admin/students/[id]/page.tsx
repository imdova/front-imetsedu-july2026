import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { StudentDetail } from "@/features/admin/components/student-detail";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const res = await dal.admin.fetchStudent(id);
  if (!res.ok || !res.data) notFound();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/admin/students">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("studentsTitle")}
        </Link>
      </Button>
      <PageHeader title={res.data.name} description={t("studentDetailSubtitle")} />
      {/* The installment plan lives on the student's CRM lead; StudentDetail
          looks it up by email client-side so this server render never blocks. */}
      <StudentDetail student={res.data} />
    </div>
  );
}
