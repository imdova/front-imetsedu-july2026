import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { AssignmentDetailView } from "@/features/admin/components/assignment-detail";

export default async function AdminAssignmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const res = await dal.admin.fetchAssignment(id);
  if (!res.ok || !res.data) notFound();

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/admin/assignments">
          <ArrowLeft className="size-4 rtl:rotate-180" />{t("backToAssignments")}
        </Link>
      </Button>
      <AssignmentDetailView assignment={res.data} />
    </div>
  );
}
