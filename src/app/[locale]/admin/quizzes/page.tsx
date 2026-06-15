import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { QuizzesManager } from "@/features/admin/components/quizzes-manager";

export default async function AdminQuizzesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [quizzesRes, categoriesRes] = await Promise.all([
    dal.quizzes.fetchQuizzes(),
    dal.quizzes.fetchQuizCategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={t("quizzesTitle")} description={t("quizzesSubtitle")} />
      <QuizzesManager
        initialQuizzes={quizzesRes.ok ? quizzesRes.data : []}
        initialCategories={categoriesRes.ok ? categoriesRes.data : []}
      />
    </div>
  );
}
