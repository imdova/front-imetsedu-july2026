import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EventsTable } from "@/features/admin/components/events-table";

export default async function AdminEventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");
  const res = await dal.admin.fetchEvents();
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("eventsTitle")} description={t("eventsSubtitle")}>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          {t("newEvent")}
        </Button>
      </PageHeader>
      <EventsTable initialData={res.ok ? res.data : []} />
    </div>
  );
}
