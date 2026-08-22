import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { GraduateCohortDetail } from "@/features/admin/components/graduate-cohort-detail";

export const metadata = { robots: { index: false } };

export default async function AdminGraduateCohortPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const res = await dal.graduates.fetchCohort(id);
  if (!res.ok) notFound();

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <GraduateCohortDetail initial={res.data} />
    </div>
  );
}
