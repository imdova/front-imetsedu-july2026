import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { EventsList } from "@/features/instructor/components/events-list";

export default async function InstructorEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Instructor");

  const res = await dal.instructor.fetchEvents();

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <PageHeader title={t("eventsTitle")} description={t("eventsSubtitle")} />
      <EventsList items={res.ok ? res.data : []} />
    </div>
  );
}
