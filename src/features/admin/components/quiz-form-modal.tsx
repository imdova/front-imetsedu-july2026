"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { HelpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import type { QuizRow, QuizCategoryOption, QuizDifficulty } from "@/lib/dal/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useResetOnChange } from "@/hooks/use-reset-on-change";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const DIFFICULTIES: QuizDifficulty[] = ["beginner", "intermediate", "advanced"];

export function QuizFormModal({
  open, onOpenChange, categories, editing, onSaved,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categories: QuizCategoryOption[];
  editing?: QuizRow | null;
  onSaved: (quiz: QuizRow, isNew: boolean) => void;
}) {
  const t = useTranslations("Admin");
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState("none");
  const [timeLimitEnabled, setTimeLimitEnabled] = React.useState(true);
  const [timeLimit, setTimeLimit] = React.useState(45);
  const [passingScore, setPassingScore] = React.useState(70);
  const [attempts, setAttempts] = React.useState("1");
  const [difficulty, setDifficulty] = React.useState<QuizDifficulty>("intermediate");
  const [antiCheat, setAntiCheat] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Seed form whenever the dialog opens (create = blank, edit = existing).
  useResetOnChange([open, editing], () => {
    if (!open) return;
    setTitle(editing?.titleEn ?? "");
    setCategory(editing?.categoryId ?? "none");
    setTimeLimitEnabled((editing?.timeLimitMinutes ?? 45) > 0);
    setTimeLimit(editing?.timeLimitMinutes && editing.timeLimitMinutes > 0 ? editing.timeLimitMinutes : 45);
    setPassingScore(editing?.passingScore ?? 70);
    setAttempts(editing ? (editing.numberOfAttempts === 0 ? "unlimited" : String(editing.numberOfAttempts || 1)) : "1");
    setDifficulty(editing?.difficultyLevel ?? "intermediate");
    setAntiCheat(editing?.antiCheat ?? false);
  });

  const save = async () => {
    const safeTitle = title.trim();
    if (safeTitle.length < 2) { toast.error(t("qzTitleRequired")); return; }
    if (category === "none") { toast.error(t("qzCategoryRequired")); return; }
    setSaving(true);
    const payload = {
      titleEn: safeTitle,
      titleAr: safeTitle,
      category,
      timeLimitMinutes: timeLimitEnabled ? timeLimit : 0,
      passingScore,
      numberOfAttempts: attempts === "unlimited" ? 0 : Number(attempts),
      difficultyLevel: difficulty,
      antiCheat,
      isActive: true,
    };
    const res = editing
      ? await dal.quizzes.updateQuiz(editing.id, payload)
      : await dal.quizzes.createQuiz({ ...payload, status: "published" });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? t("qzUpdated") : t("qzCreated"));
      onSaved(res.data, !editing);
      onOpenChange(false);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            {editing ? t("qzEditTitle") : t("qzNewTitle")}
          </DialogTitle>
          <DialogDescription>{editing ? t("qzEditHint") : t("qzNewHint")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Identity */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("qzIdentity")}</h3>
            <div className="space-y-1.5">
              <Label>{t("qzTitle")} <span className="text-destructive">*</span></Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("qzTitlePh")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("qzCategory")} <span className="text-destructive">*</span></Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder={t("qzSelectCategory")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t("qzSelectCategory")}</SelectItem>
                  {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("qzSettings")}</h3>
            <div className="space-y-1.5">
              <Label>{t("qzTimeLimit")}</Label>
              <div className="flex items-center gap-3">
                <Switch checked={timeLimitEnabled} onCheckedChange={setTimeLimitEnabled} />
                <Input type="number" min={1} max={999} className="h-9 w-20 text-center" value={timeLimit}
                  disabled={!timeLimitEnabled}
                  onChange={(e) => setTimeLimit(Number(e.target.value) || 45)} />
                <span className="text-sm text-muted-foreground">{t("qzMins")}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("qzPassingScore")}</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} max={100} className="h-9 w-20 text-center" value={passingScore}
                  onChange={(e) => setPassingScore(Math.min(100, Math.max(0, Number(e.target.value) || 0)))} />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("qzAttempts")}</Label>
              <Select value={attempts} onValueChange={setAttempts}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t("qzAttemptsN", { n: 1 })}</SelectItem>
                  <SelectItem value="2">{t("qzAttemptsN", { n: 2 })}</SelectItem>
                  <SelectItem value="3">{t("qzAttemptsN", { n: 3 })}</SelectItem>
                  <SelectItem value="unlimited">{t("qzUnlimited")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("qzDifficulty")}</Label>
              <div className="inline-flex w-full rounded-lg border p-0.5">
                {DIFFICULTIES.map((d) => (
                  <button key={d} type="button" onClick={() => setDifficulty(d)}
                    className={cn("flex-1 rounded-md px-2 py-1.5 text-xs font-semibold capitalize transition-colors",
                      difficulty === d ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
                    {t(`qzDiff_${d}` as "qzDiff_beginner")}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 pt-1">
              <Switch checked={antiCheat} onCheckedChange={setAntiCheat} />
              <span className="text-sm text-muted-foreground">{t("qzAntiCheat")}</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>{t("qzCancel")}</Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {editing ? t("qzUpdateQuiz") : t("qzCreateQuiz")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
