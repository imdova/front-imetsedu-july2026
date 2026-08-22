import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { GraduateCohorts } from "@/features/admin/components/graduate-cohorts";

export const metadata = { robots: { index: false } };

export default async function AdminGraduatesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const res = await dal.graduates.fetchCohorts();

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader title="Graduates" description="Graduation gallery pages — one per cohort, published at /graduates/{slug}." />
      <GraduateCohorts initial={res.ok ? res.data : []} />
    </div>
  );
}
