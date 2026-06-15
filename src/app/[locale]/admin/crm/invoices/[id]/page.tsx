import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { InvoiceDetail } from "@/features/finance/components/invoice-detail";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Finance");

  const [res, coursesRes] = await Promise.all([
    dal.finance.fetchInvoice(id),
    dal.courses.fetchCourses(),
  ]);
  if (!res.ok || !res.data) notFound();

  // Resolve the plan's course thumbnail/title from the live courses catalogue
  // (the invoice payload carries only the course id + title, no image).
  const invoice = res.data;
  const courses = coursesRes.ok ? coursesRes.data : [];
  const course =
    courses.find((c) => c.id === invoice.courseId) ??
    (invoice.courseTitle
      ? courses.find((c) => c.titleEn === invoice.courseTitle || c.titleAr === invoice.courseTitle)
      : undefined);
  const enriched = course
    ? { ...invoice, courseTitle: invoice.courseTitle ?? course.titleEn, courseThumbnail: course.thumbnailUrl }
    : invoice;

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/admin/crm/invoices">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("backToInvoices")}
        </Link>
      </Button>
      <InvoiceDetail invoice={enriched} />
    </div>
  );
}
