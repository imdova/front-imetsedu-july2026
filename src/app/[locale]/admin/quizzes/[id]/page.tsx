import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { QuizQuestionBuilder } from "@/features/admin/components/quiz-question-builder";

export default async function AdminQuizDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const res = await dal.quizzes.fetchQuizDetail(id);
  if (!res.ok || !res.data) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/admin/quizzes">
          <ArrowLeft className="size-4 rtl:rotate-180" />{t("backToQuizzes")}
        </Link>
      </Button>
      <QuizQuestionBuilder initial={res.data} />
    </div>
  );
}
