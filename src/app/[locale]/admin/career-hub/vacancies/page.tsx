import { setRequestLocale } from "next-intl/server";

import { requireSuperAdmin } from "@/lib/permission-guard";
import { CareerVacanciesManager } from "@/features/career-hub/components/career-vacancies-manager";

export const metadata = { robots: { index: false } };

/** Employer vacancy submissions — super-admin only: each carries contact details. */
export default async function AdminCareerVacanciesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  return (
    <div className="mx-auto max-w-[1400px]">
      <CareerVacanciesManager />
    </div>
  );
}
