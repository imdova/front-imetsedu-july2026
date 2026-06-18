"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, FileText, Loader2, ShieldAlert, BarChart3, Clock3 } from "lucide-react";
import { toast } from "sonner";

import type { AssignmentDetailVM, AssignmentSubmissionRow, AssignmentSubRowStatus } from "@/lib/lms/map-lms";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

type TabId = "all" | "ready" | "graded" | "overdue";

const STATUS_STYLE: Record<AssignmentSubRowStatus, string> = {
  graded: "bg-success/15 text-success",
  submitted: "bg-primary/15 text-primary",
  late: "bg-warning/15 text-warning",
  overdue: "bg-destructive/15 text-destructive",
  not_submitted: "bg-muted text-muted-foreground",
};

export function AssignmentDetailLiveView({ assignment: initial }: { assignment: AssignmentDetailVM }) {
  const t = useTranslations("Admin");
  const [assignment, setAssignment] = React.useState(initial);
  const [tab, setTab] = React.useState<TabId>("all");
  const [search, setSearch] = React.useState("");
  const [active, setActive] = React.useState<AssignmentSubmissionRow | null>(null);

  const statusLabel = (s: AssignmentSubRowStatus) => ({
    graded: t("asgRowGraded"),
    submitted: t("asgRowSubmitted"),
    late: t("asgRowLate"),
    overdue: t("asgRowOverdue"),
    not_submitted: t("asgNotSubmitted"),
  })[s];

  const counts = React.useMemo(() => ({
    all: assignment.submissions.length,
    ready: assignment.submissions.filter((s) => s.status === "submitted" || s.status === "late").length,
    graded: assignment.submissions.filter((s) => s.status === "graded").length,
    overdue: assignment.submissions.filter((s) => s.status === "overdue" || s.status === "not_submitted").length,
  }), [assignment.submissions]);

  const rows = React.useMemo(() => {
    return assignment.submissions.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch = !q || s.studentName.toLowerCase().includes(q) || s.studentEmail.toLowerCase().includes(q);
      if (!matchSearch) return false;
      if (tab === "all") return true;
      if (tab === "ready") return s.status === "submitted" || s.status === "late";
      if (tab === "graded") return s.status === "graded";
      return s.status === "overdue" || s.status === "not_submitted";
    });
  }, [assignment.submissions, search, tab]);

  const avgTurnaround = assignment.kpis.avgTurnaroundHours != null ? (assignment.kpis.avgTurnaroundHours / 24).toFixed(1) : "0.0";

  const onGraded = (row: AssignmentSubmissionRow, patch: Partial<AssignmentSubmissionRow>) => {
    setAssignment((prev) => ({
      ...prev,
      submissions: prev.submissions.map((s) => (s.id === row.id ? { ...s, ...patch } : s)),
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">{assignment.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("asgDetailSubtitle")}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{assignment.courseName}</Badge>
              <span>{t("colDue")}: {assignment.dueDate}</span>
              <Badge className={cn("border-transparent", assignment.priority === "urgent" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground")}>
                {assignment.priority === "urgent" ? t("asgPriorityUrgent") : t("asgPriorityRegular")}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FileText} tone="bg-primary/10 text-primary" label={t("asgStatTotalSubmissions")}
          value={`${assignment.kpis.totalSubmissions} / ${assignment.kpis.totalStudents}`}>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${assignment.kpis.totalStudents > 0 ? (assignment.kpis.totalSubmissions / assignment.kpis.totalStudents) * 100 : 0}%` }} />
          </div>
        </StatCard>
        <StatCard icon={Clock3} tone="bg-success/10 text-success" label={t("asgStatAvgTurnaround")} value={`${avgTurnaround} ${t("asgDays")}`} />
        <StatCard icon={BarChart3} tone="bg-chart-2/15 text-chart-2" label={t("asgStatAvgGrade")} value={`${assignment.kpis.avgGrade ?? 0}%`} />
        <StatCard icon={ShieldAlert} tone="bg-destructive/10 text-destructive" label={t("asgStatPlagiarismAlerts")}
          value={`${assignment.submissions.filter((s) => (s.plagiarismScore ?? 0) > 30).length}`}
          sub={t("asgHighRisk")} />
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <TabsList>
              <TabsTrigger value="all">{t("asgTabAll")} ({counts.all})</TabsTrigger>
              <TabsTrigger value="ready">{t("asgTabReady")} ({counts.ready})</TabsTrigger>
              <TabsTrigger value="graded">{t("asgTabGraded")} ({counts.graded})</TabsTrigger>
              <TabsTrigger value="overdue">{t("asgTabOverdue")} ({counts.overdue})</TabsTrigger>
            </TabsList>
          </Tabs>
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("gdSearchStudent")} className="w-auto" />
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="ps-6">{t("colStudent")}</TableHead>
                <TableHead>{t("asgColSubmissionDate")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{t("asgColPlagiarism")}</TableHead>
                <TableHead>{t("asgColFinalGrade")}</TableHead>
                <TableHead className="text-end pe-6">{t("asgColActions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-muted-foreground">{t("asgNoSubmissions")}</TableCell></TableRow>
              ) : rows.map((row) => {
                const submittable = row.status !== "overdue" && row.status !== "not_submitted";
                return (
                  <TableRow key={row.id}>
                    <TableCell className="ps-6">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] text-primary">{row.initials}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-medium">{row.studentName}</p>
                          <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{row.submittedAt ?? t("asgNotSubmitted")}</TableCell>
                    <TableCell><Badge className={cn("border-transparent", STATUS_STYLE[row.status])}>{statusLabel(row.status)}</Badge></TableCell>
                    <TableCell className="text-sm">
                      {row.plagiarismScore != null ? `${row.plagiarismScore}%` : "—"}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {row.score != null ? <span className="font-semibold">{row.score}/100</span> : <span className="text-muted-foreground">{t("ungraded")}</span>}
                    </TableCell>
                    <TableCell className="text-end pe-6">
                      {submittable ? (
                        <Button size="sm" onClick={() => setActive(row)}>{t("asgViewAssignment")}</Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>{t("asgSendReminder")}</Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GradeWorkspace row={active} onClose={() => setActive(null)} onSaved={onGraded} t={t} />
    </div>
  );
}

function StatCard({
  icon: Icon, tone, label, value, sub, children,
}: {
  icon: React.ElementType; tone: string; label: string; value: string; sub?: string; children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", tone)}><Icon className="size-4.5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="font-heading text-lg font-bold tabular-nums">{value}</p>
        </div>
      </div>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      {children}
    </div>
  );
}

function GradeWorkspace({
  row, onClose, onSaved, t,
}: {
  row: AssignmentSubmissionRow | null;
  onClose: () => void;
  onSaved: (row: AssignmentSubmissionRow, patch: Partial<AssignmentSubmissionRow>) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const [score, setScore] = React.useState<number | "">("");
  const [plagiarism, setPlagiarism] = React.useState<number | "">("");
  const [status, setStatus] = React.useState("pending");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!row) return;
    setScore(row.score ?? "");
    setPlagiarism(row.plagiarismScore ?? "");
    setStatus(row.status === "graded" ? "approved" : "pending");
  }, [row]);

  if (!row) return null;

  const save = async () => {
    if (!row.submissionId) return;
    setSaving(true);
    const res = await dal.lms.gradeSubmission(row.submissionId, {
      status,
      score: score === "" ? null : Number(score),
      plagiarismScore: plagiarism === "" ? null : Number(plagiarism),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t("asgGradeSaved"));
      onSaved(row, {
        score: score === "" ? null : Number(score),
        plagiarismScore: plagiarism === "" ? null : Number(plagiarism),
        status: status === "approved" ? "graded" : row.status,
      });
      onClose();
    } else {
      toast.error(res.error || t("asgGradeSaved"));
    }
  };

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{t("asgWorkspaceTitle")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("colStudent")}</p>
            <p className="text-sm font-semibold">{row.studentName}</p>
            <p className="text-xs text-muted-foreground">{row.studentEmail}</p>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("asgSubmissionFile")}</p>
            {row.fileUrl ? (
              <a href={row.fileUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <Download className="size-4" />{t("asgViewDownloadFile")}
              </a>
            ) : (
              <p className="mt-1 text-xs italic text-muted-foreground">{t("asgNoFileUploaded")}</p>
            )}
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("asgStudentNotes")}</p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">{row.notes || t("asgNoNotes")}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("asgFinalGradeLabel")}</Label>
              <Input type="number" min={0} max={100} value={score} onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("asgEnterGrade")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("asgPlagiarismLabel")}</Label>
              <Input type="number" min={0} max={100} value={plagiarism} onChange={(e) => setPlagiarism(e.target.value === "" ? "" : Number(e.target.value))} placeholder={t("asgPlagiarismPh")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("asgStatusLabel")}</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">{t("asgStatusPending")}</SelectItem>
                <SelectItem value="reviewed">{t("asgStatusReviewed")}</SelectItem>
                <SelectItem value="approved">{t("asgStatusApproved")}</SelectItem>
                <SelectItem value="rejected">{t("asgStatusRejected")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t("smCancel")}</Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving && <Loader2 className="size-4 animate-spin" />}{t("asgSaveDetails")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
