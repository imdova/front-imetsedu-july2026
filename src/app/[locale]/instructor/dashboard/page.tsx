import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { InstructorDashboard } from "@/features/instructor/components/instructor-dashboard";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Instructor" });
  return { title: t("dashTitle") };
}

export default async function InstructorDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [statsRes, revenueRes, eventsRes, perfRes] = await Promise.all([
    dal.instructor.fetchStats(),
    dal.instructor.fetchRevenue(),
    dal.instructor.fetchEvents(),
    dal.instructor.fetchPerformance(),
  ]);

  return (
    <InstructorDashboard
      stats={statsRes.ok ? statsRes.data : { students: 0, activeCourses: 0, avgRating: 0, monthlyEarnings: 0, pendingGrading: 0, upcomingEvents: 0 }}
      revenue={revenueRes.ok ? revenueRes.data : []}
      events={eventsRes.ok ? eventsRes.data : []}
      performance={perfRes.ok ? perfRes.data : []}
    />
  );
}
