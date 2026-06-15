import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { ScheduleView } from "@/features/student/components/schedule-view";

export default async function StudentSchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchSchedule();

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={t("scheduleTitle")} description={t("scheduleSubtitle")} />
      <ScheduleView events={res.ok ? res.data : []} />
    </div>
  );
}
