import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { TranscriptView } from "@/features/student/components/transcript-view";

export default async function StudentTranscriptPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchTranscript();
  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <PageHeader title={t("transcriptTitle")} description={t("transcriptSubtitle")} />
      <TranscriptView rows={res.ok ? res.data : []} />
    </div>
  );
}
