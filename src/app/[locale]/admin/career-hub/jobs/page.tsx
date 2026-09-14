import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { CareerJobsManager, type VacancyDraft } from "@/features/career-hub/components/career-jobs-manager";

export const metadata = { robots: { index: false } };

/**
 * Career Hub listings. `?fromVacancy=<id>` opens the add form prefilled from an
 * employer's submission; saving it marks the submission converted.
 */
export default async function AdminCareerJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ fromVacancy?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();
  const { fromVacancy } = await searchParams;

  const [coursesRes, vacancyRes] = await Promise.all([
    dal.courses.fetchPublishedCourses(),
    fromVacancy && /^[a-f0-9]{24}$/i.test(fromVacancy) ? dal.careerHub.fetchVacancy(fromVacancy) : Promise.resolve(null),
  ]);
  const courses = coursesRes.ok ? coursesRes.data.map((c) => ({ slug: c.slug, title: c.titleEn || c.titleAr })) : [];

  let initialDraft: VacancyDraft | undefined;
  if (vacancyRes?.ok && vacancyRes.data.status !== "converted") {
    const v = vacancyRes.data;
    initialDraft = {
      vacancyId: v._id,
      values: {
        title: v.jobTitle,
        employer: v.companyName,
        country: v.country,
        city: v.city ?? "",
        employmentType: v.employmentType || "full_time",
        description: v.description,
        applyUrl: v.applyUrl ?? "",
        // With no application link, the employer's own address is the route in — editable before saving.
        applyEmail: v.applyUrl ? "" : v.email,
        sourceName: "Employer submission (verified by IMETS)",
        notes: `Submitted via /careers/post-a-job by ${v.contactName} · ${v.email} · ${v.phone}`,
      },
    };
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <CareerJobsManager courses={courses} initialDraft={initialDraft} />
    </div>
  );
}
