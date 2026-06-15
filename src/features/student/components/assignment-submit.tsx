"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Upload, CheckCircle2, FileText } from "lucide-react";
import { toast } from "sonner";

import type { StudentAssignment } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AssignmentSubmit({ assignment }: { assignment: StudentAssignment }) {
  const t = useTranslations("Student");
  const [status, setStatus] = React.useState(assignment.status);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const submit = () => {
    setStatus("submitted");
    toast.success(t("workSubmitted"));
  };

  const badge = status === "graded"
    ? { key: "statusGradedA", style: "bg-success/15 text-success" }
    : status === "submitted"
      ? { key: "statusSubmittedA", style: "bg-chart-3/15 text-chart-3" }
      : { key: "statusPendingA", style: "bg-warning/18 text-warning" };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{assignment.title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{assignment.course} · {t("aColDue")}: {assignment.dueDate}</p>
              </div>
              <Badge className={cn("border-transparent", badge.style)}>{t(badge.key)}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="text-sm font-semibold">{t("description")}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{assignment.description}</p>
          </CardContent>
        </Card>

        {status !== "graded" && (
          <Card>
            <CardContent className="space-y-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 py-10 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <Upload className="size-6" />
                <span className="text-sm font-medium text-foreground">{fileName ?? t("attachFile")}</span>
                <input ref={inputRef} type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)} />
              </button>
              <Textarea rows={4} placeholder={t("description")} />
              <div className="flex justify-end">
                <Button onClick={submit} className="gap-1.5"><CheckCircle2 className="size-4" />{t("submitWork")}</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="space-y-3 text-sm">
            <Row label={t("aColCourse")} value={assignment.course} />
            <Row label={t("aColDue")} value={assignment.dueDate} />
            <Row label={t("aColGrade")} value={assignment.status === "graded" ? `${assignment.grade}/${assignment.maxGrade}` : "—"} />
            {assignment.status === "graded" && (
              <div className="flex items-center gap-2 rounded-lg bg-success/8 p-3 text-success">
                <FileText className="size-4" /><span className="text-xs">{t("statusGradedA")}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
