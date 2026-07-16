"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, Trash2, Plus, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { QuizQuestionUI, QuizChoiceUI } from "@/lib/dal/quizzes";
import type { QuestionInput } from "@/lib/dal/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useResetOnChange } from "@/hooks/use-reset-on-change";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

type EditableType = "single" | "multiple" | "true-false";

const BLANK_CHOICES: QuizChoiceUI[] = [
  { text: "", isCorrect: true },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
];

export function QuizQuestionModal({
  open, onOpenChange, editing, onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: QuizQuestionUI | null;
  onSave: (input: QuestionInput, stayOpen: boolean) => Promise<boolean>;
}) {
  const t = useTranslations("Admin");
  const [type, setType] = React.useState<EditableType>("single");
  const [points, setPoints] = React.useState(1);
  const [prompt, setPrompt] = React.useState("");
  const [explanation, setExplanation] = React.useState("");
  const [choices, setChoices] = React.useState<QuizChoiceUI[]>(BLANK_CHOICES);
  const [busy, setBusy] = React.useState(false);

  const reset = () => { setType("single"); setPoints(1); setPrompt(""); setExplanation(""); setChoices(BLANK_CHOICES.map((c) => ({ ...c }))); };

  useResetOnChange([open, editing], () => {
    if (!open) return;
    if (editing) {
      const isTF = editing.type === "single" && editing.choices.length === 2
        && editing.choices[0]?.text === "True" && editing.choices[1]?.text === "False";
      setType(isTF ? "true-false" : (editing.type as EditableType) || "single");
      setPoints(editing.points || 1);
      setPrompt(editing.prompt || "");
      setExplanation(editing.explanation || "");
      setChoices(editing.choices.length ? editing.choices.map((c) => ({ ...c })) : BLANK_CHOICES.map((c) => ({ ...c })));
    } else {
      reset();
    }
  });

  const updateChoice = (i: number, field: keyof QuizChoiceUI, value: string | boolean) => {
    setChoices((prev) => {
      const next = prev.map((c) => ({ ...c }));
      if (field === "isCorrect" && (type === "single" || type === "true-false")) {
        next.forEach((c, k) => (c.isCorrect = k === i));
      } else {
        (next[i] as Record<string, unknown>)[field] = value;
      }
      return next;
    });
  };
  const addChoice = () => setChoices((p) => [...p, { text: "", isCorrect: false }]);
  const removeChoice = (i: number) => setChoices((p) => (p.length <= 2 ? p : p.filter((_, k) => k !== i)));

  const submit = async (stayOpen: boolean) => {
    if (!prompt.trim()) { toast.error(t("qqPromptRequired")); return; }
    const valid = choices.filter((c) => c.text.trim());
    if (type !== "true-false" && valid.length < 2) { toast.error(t("qqChoicesRequired")); return; }
    if (choices.every((c) => !c.isCorrect)) { toast.error(t("qqCorrectRequired")); return; }

    const finalChoices = type === "true-false"
      ? [{ text: "True", isCorrect: !!choices[0]?.isCorrect }, { text: "False", isCorrect: !!choices[1]?.isCorrect }]
      : valid.map((c) => ({ text: c.text.trim(), isCorrect: c.isCorrect }));

    const input: QuestionInput = {
      prompt: prompt.trim(),
      type: type === "true-false" ? "single" : type,
      choices: finalChoices,
      points: Math.max(0, Math.min(100, Number(points) || 1)),
      ...(explanation.trim() ? { explanation: explanation.trim() } : {}),
    };
    setBusy(true);
    const okSave = await onSave(input, stayOpen);
    setBusy(false);
    if (okSave && stayOpen) reset();
    else if (okSave) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            {editing ? t("qqEditTitle") : t("qqNewTitle")}
          </DialogTitle>
          <DialogDescription>{t("qqHint")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex gap-4">
            <div className="flex-1 space-y-1.5">
              <Label>{t("qqType")}</Label>
              <Select value={type} onValueChange={(v) => setType(v as EditableType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">{t("qqTypeSingle")}</SelectItem>
                  <SelectItem value="multiple">{t("qqTypeMultiple")}</SelectItem>
                  <SelectItem value="true-false">{t("qqTypeTrueFalse")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-24 space-y-1.5">
              <Label>{t("qqScore")}</Label>
              <Input type="number" min={0} max={100} value={points}
                onChange={(e) => setPoints(Math.max(0, Math.min(100, Number(e.target.value) || 0)))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("qqPrompt")}</Label>
            <Textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder={t("qqPromptPh")} />
          </div>

          {type !== "true-false" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("qqChoices")}</Label>
                <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-primary" onClick={addChoice}><Plus className="size-3.5" />{t("qqAddChoice")}</Button>
              </div>
              {choices.map((choice, i) => (
                <div key={i} className="rounded-xl border bg-muted/20 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <input
                        type={type === "multiple" ? "checkbox" : "radio"}
                        name="qq-correct"
                        checked={choice.isCorrect}
                        onChange={(e) => updateChoice(i, "isCorrect", e.target.checked)}
                        className="size-4 accent-primary"
                      />
                      {t("qqCorrect")}
                    </label>
                    <Button type="button" variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={() => removeChoice(i)} disabled={choices.length <= 2}><Trash2 className="size-4" /></Button>
                  </div>
                  <Input value={choice.text} onChange={(e) => updateChoice(i, "text", e.target.value)} placeholder={t("qqChoiceN", { n: i + 1 })} />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <Label>{t("qqCorrectAnswer")}</Label>
              <div className="flex gap-3">
                <button type="button" onClick={() => updateChoice(0, "isCorrect", true)}
                  className={cn("flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-colors",
                    choices[0]?.isCorrect ? "border-success bg-success/10 text-success" : "border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/40")}>
                  {t("qqTrue")}
                </button>
                <button type="button" onClick={() => updateChoice(1, "isCorrect", true)}
                  className={cn("flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-colors",
                    choices[1]?.isCorrect ? "border-destructive bg-destructive/10 text-destructive" : "border-border bg-muted/30 text-muted-foreground hover:border-muted-foreground/40")}>
                  {t("qqFalse")}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>{t("qqExplanation")} <span className="text-xs font-normal text-muted-foreground">({t("qqOptional")})</span></Label>
            <Textarea rows={2} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder={t("qqExplanationPh")} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>{t("qzCancel")}</Button>
          <div className="flex gap-2">
            {!editing && <Button variant="outline" onClick={() => submit(true)} disabled={busy}>{t("qqSaveAnother")}</Button>}
            <Button onClick={() => submit(false)} disabled={busy} className="gap-1.5">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {editing ? t("qqUpdate") : t("qqSave")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
