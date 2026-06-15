"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import { Plus, Pencil, Trash2, Upload, Download, FileQuestion, Loader2, GripVertical } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { QuizDetailUI, QuizQuestionUI, QuestionInput } from "@/lib/dal/quizzes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuizQuestionModal } from "./quiz-question-modal";

const TYPE_LABEL_KEY: Record<string, string> = {
  single: "qqTypeSingle",
  multiple: "qqTypeMultiple",
  "true-false": "qqTypeTrueFalse",
  "short-answer": "qqTypeShort",
  essay: "qqTypeEssay",
};

export function QuizQuestionBuilder({ initial }: { initial: QuizDetailUI }) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const [quiz, setQuiz] = React.useState<QuizDetailUI>(initial);
  const [questions, setQuestions] = React.useState<QuizQuestionUI[]>(initial.questions);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<QuizQuestionUI | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const title = locale === "ar" ? quiz.titleAr || quiz.titleEn : quiz.titleEn || quiz.titleAr;
  const desc = locale === "ar" ? quiz.descriptionAr : quiz.descriptionEn;

  const refresh = async () => {
    const res = await dal.quizzes.fetchQuizDetail(quiz.id);
    if (res.ok) { setQuiz(res.data); setQuestions(res.data.questions); }
  };

  const typeLabel = (type: string) => t((TYPE_LABEL_KEY[type] ?? "qqTypeSingle") as "qqTypeSingle");

  const handleSave = async (input: QuestionInput, stayOpen: boolean): Promise<boolean> => {
    const res = editing
      ? await dal.quizzes.updateQuestion(quiz.id, editing.id, input)
      : await dal.quizzes.addQuestion(quiz.id, input);
    if (!res.ok) { toast.error(res.error); return false; }
    toast.success(editing ? t("qqUpdated") : t("qqAdded"));
    await refresh();
    if (!stayOpen) setEditing(null);
    return true;
  };

  const remove = async (q: QuizQuestionUI) => {
    if (!window.confirm(t("qqDeleteConfirm"))) return;
    const prev = questions;
    setQuestions((p) => p.filter((x) => x.id !== q.id));
    const res = await dal.quizzes.deleteQuestion(quiz.id, q.id);
    if (res.ok) { toast.success(t("qqDeleted")); await refresh(); }
    else { setQuestions(prev); toast.error(res.error); }
  };

  const onUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    const res = await dal.quizzes.uploadQuestionsExcel(quiz.id, file);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (res.ok) { toast.success(t("qqUploaded")); await refresh(); }
    else toast.error(res.error);
  };

  const onDownload = async () => {
    const res = await dal.quizzes.downloadQuestions(quiz.id, `${title || "quiz"}-questions.xlsx`);
    if (!res.ok) toast.error(res.error);
  };

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (q: QuizQuestionUI) => { setEditing(q); setModalOpen(true); };

  return (
    <div className="space-y-6">
      {/* Quiz header */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
              <Badge variant="secondary">{t("qqBuildBadge")}</Badge>
            </div>
            {desc && <p className="max-w-2xl text-sm text-muted-foreground">{desc}</p>}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
              {quiz.categoryName && <Badge variant="outline">{quiz.categoryName}</Badge>}
              <span>{questions.length} {t("qzColQuestions").toLowerCase()}</span>
              <span>•</span><span>{quiz.passingScore}% {t("qzColPassing").toLowerCase()}</span>
              {quiz.timeLimitMinutes > 0 && <><span>•</span><span>{quiz.timeLimitMinutes} {t("qzMins")}</span></>}
            </div>
          </div>
        </div>
      </div>

      {/* Questions panel */}
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
          <h2 className="font-heading text-base font-bold">{t("qqPanelTitle")}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => onUpload(e.target.files?.[0])} />
            <Button variant="outline" className="gap-1.5" disabled={uploading} onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}{t("qqUploadExcel")}
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={onDownload}><Download className="size-4" />{t("qqDownloadExcel")}</Button>
            <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" />{t("qqAddQuestion")}</Button>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <FileQuestion className="size-9 text-muted-foreground/50" />
            <p className="font-semibold">{t("qqEmptyTitle")}</p>
            <p className="max-w-md text-sm text-muted-foreground">{t("qqEmptyHint")}</p>
            <Button className="mt-2 gap-1.5" onClick={openCreate}><Plus className="size-4" />{t("qqAddQuestion")}</Button>
          </div>
        ) : (
          <ul className="divide-y">
            {questions.map((q, i) => (
              <li key={q.id} className="flex items-center gap-4 p-5 hover:bg-muted/20">
                <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{q.prompt}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">{typeLabel(q.type)}</span>
                    <span>{q.points} {t("qqPts")}</span>
                    <span>{q.choices.length} {t("qqChoices").toLowerCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(q)}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => remove(q)}><Trash2 className="size-4" /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <QuizQuestionModal open={modalOpen} onOpenChange={setModalOpen} editing={editing} onSave={handleSave} />
    </div>
  );
}
