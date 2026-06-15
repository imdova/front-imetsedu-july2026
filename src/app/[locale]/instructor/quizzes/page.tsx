import { Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { QuizzesTable } from "@/features/admin/components/quizzes-table";

export default async function InstructorQuizzesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Instructor");

  const res = await dal.admin.fetchQuizzes();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("quizzesTitle")} description={t("quizzesSubtitle")}>
        <Button asChild className="gap-1.5">
          <Link href="/instructor/quizzes/new">
            <Plus className="size-4" />
            {t("newQuiz")}
          </Link>
        </Button>
      </PageHeader>
      <QuizzesTable initialData={res.ok ? res.data : []} />
    </div>
  );
}
