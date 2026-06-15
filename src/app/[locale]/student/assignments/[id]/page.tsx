import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { AssignmentSubmit } from "@/features/student/components/assignment-submit";

export default async function StudentAssignmentDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchAssignment(id);
  if (!res.ok || !res.data) notFound();
  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/student/assignments"><ArrowLeft className="size-4 rtl:rotate-180" />{t("backToAssignments")}</Link>
      </Button>
      <AssignmentSubmit assignment={res.data} />
    </div>
  );
}
