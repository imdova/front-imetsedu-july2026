import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { QuizRunner } from "@/features/student/components/quiz-runner";

export default async function StudentQuizPage({
  params,
}: {
  params: Promise<{ locale: string; id: string; quizId: string }>;
}) {
  const { locale, id, quizId } = await params;
  setRequestLocale(locale);

  const [quizRes, attemptsRes] = await Promise.all([
    dal.student.fetchQuiz(id, quizId, locale === "ar" ? "ar" : "en"),
    dal.student.fetchQuizAttempts(quizId),
  ]);
  const attemptsUsed = attemptsRes.ok ? attemptsRes.data.attemptsCount : 0;

  if (!quizRes.ok) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {quizRes.error}
        </p>
      </div>
    );
  }

  return <QuizRunner quiz={quizRes.data} attemptsUsed={attemptsUsed} />;
}
