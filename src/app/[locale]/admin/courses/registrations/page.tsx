import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import {
  RegistrationsTable,
  type CourseApplicant,
} from "@/features/admin/components/registrations-table";

export default async function AdminRegistrationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  // "Registrations" = applicants captured by the public course apply form, i.e.
  // CRM leads that carry a course of interest.
  const [leadsRes, coursesRes, counselorsRes] = await Promise.all([
    dal.crm.fetchLeads({ source: "Website" }),
    dal.courses.fetchCourses(),
    dal.crm.fetchCounselors(),
  ]);

  const courses = coursesRes.ok ? coursesRes.data : [];
  const nameById = new Map(courses.map((c) => [c.id, c.titleEn || c.titleAr || c.slug]));
  const fmt = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString("en-US", {
          month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
        })
      : "—";

  const applicants: CourseApplicant[] = (leadsRes.ok ? leadsRes.data : [])
    .filter((l) => l.coursesOfInterest.length > 0)
    .map((l) => ({
      id: l.id,
      student: l.fullName,
      email: l.email,
      courses: l.coursesOfInterest.map((c) => nameById.get(c) ?? c),
      country: l.country,
      specialty: l.specialty ?? "",
      salesAgent: l.counselorName,
      leadSource: l.source,
      createdAt: fmt(l.createdAtISO),
      createdAtISO: l.createdAtISO,
    }));

  const courseOptions = courses
    .map((c) => c.titleEn || c.titleAr || c.slug)
    .filter(Boolean)
    .map((v) => ({ value: v, label: v }));
  const counselorList = counselorsRes.ok ? counselorsRes.data : [];
  const counselorOptions = counselorList.map((c) => ({ value: c.name, label: c.name }));
  // Id-keyed options for the bulk "assign sales agent" action.
  const counselorAssignOptions = counselorList.map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("registrationsTitle")} description={t("registrationsSubtitle")} />
      <RegistrationsTable
        applicants={applicants}
        courseOptions={courseOptions}
        counselorOptions={counselorOptions}
        counselorAssignOptions={counselorAssignOptions}
        basePath="/admin/crm"
      />
    </div>
  );
}
