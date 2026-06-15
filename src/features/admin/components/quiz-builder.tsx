"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2, Upload, Download, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import type { QuizDetail, QuizQuestionFull } from "@/lib/db/admin";
import { createId, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AdminStatusBadge } from "./admin-status-badge";

export function QuizBuilder({ quiz }: { quiz: QuizDetail }) {
  const t = useTranslations("Admin");
  const [questions, setQuestions] = React.useState(quiz.questionsList);

  const patch = (id: string, next: Partial<QuizQuestionFull>) =>
    setQuestions((p) => p.map((q) => (q.id === id ? { ...q, ...next } : q)));

  const addQuestion = () => {
    setQuestions((p) => [...p, { id: createId("qq"), text: t("newQuestionText"), options: ["", "", "", ""], correctIndex: 0 }]);
    toast.success(t("questionAdded"));
  };
  const remove = (id: string) => {
    setQuestions((p) => p.filter((q) => q.id !== id));
    toast.success(t("questionDeleted"));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-heading text-xl font-bold tracking-tight">{quiz.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{quiz.category}</Badge>
              <AdminStatusBadge value={quiz.status} />
              <span className="text-sm text-muted-foreground">{questions.length} {t("questionsTitle").toLowerCase()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => toast.success(t("uploadExcel"))}><Upload className="size-4" />{t("uploadExcel")}</Button>
            <Button variant="outline" className="gap-1.5" onClick={() => toast.success(t("downloadQuiz"))}><Download className="size-4" />{t("downloadQuiz")}</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {questions.map((q, qi) => (
          <Card key={q.id}>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="mt-2 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{qi + 1}</span>
                <Input value={q.text} onChange={(e) => patch(q.id, { text: e.target.value })} placeholder={t("questionText")} className="font-medium" />
                <Button variant="ghost" size="icon" className="size-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(q.id)} aria-label={t("deleteQuestion")}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-2 ps-10">
                {q.options.map((opt, oi) => {
                  const correct = q.correctIndex === oi;
                  return (
                    <div key={oi} className="flex items-center gap-2.5">
                      <button type="button" onClick={() => patch(q.id, { correctIndex: oi })} aria-label={t("markCorrect")}
                        className={cn(correct ? "text-success" : "text-muted-foreground/40 hover:text-muted-foreground")}>
                        {correct ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                      </button>
                      <Input value={opt} placeholder={t("optionLabel", { n: oi + 1 })}
                        onChange={(e) => patch(q.id, { options: q.options.map((o, k) => (k === oi ? e.target.value : o)) })}
                        className={cn("h-9", correct && "border-success/50")} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" className="w-full gap-1.5 border-dashed" onClick={addQuestion}>
        <Plus className="size-4" />{t("addQuestion")}
      </Button>
    </div>
  );
}
