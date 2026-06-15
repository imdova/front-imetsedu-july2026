import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { QuizRunner } from "@/features/student/components/quiz-runner";

export default async function StudentQuizPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchQuiz();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/student/courses">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("myCoursesTitle")}
        </Link>
      </Button>
      {res.ok && <QuizRunner quiz={res.data} />}
    </div>
  );
}
