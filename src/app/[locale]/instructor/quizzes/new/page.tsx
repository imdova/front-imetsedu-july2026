import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import type { QuizDetail } from "@/lib/db/admin";
import { Button } from "@/components/ui/button";
import { QuizBuilder } from "@/features/admin/components/quiz-builder";

const BLANK_QUIZ: QuizDetail = {
  id: "new",
  title: "",
  category: "",
  questions: 0,
  attempts: 0,
  status: "draft",
  maxGrade: 100,
  questionsList: [],
};

export default async function InstructorNewQuizPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Instructor");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/instructor/quizzes">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("quizzesTitle")}
        </Link>
      </Button>
      <QuizBuilder quiz={BLANK_QUIZ} />
    </div>
  );
}
