"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { FileText, Upload, SquarePen } from "lucide-react";
import { toast } from "sonner";

import type { AssignmentDetail, Submission } from "@/lib/db/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { AdminStatusBadge } from "./admin-status-badge";

export function AssignmentDetailView({ assignment }: { assignment: AssignmentDetail }) {
  const t = useTranslations("Admin");
  const [subs, setSubs] = React.useState(assignment.submissionsList);
  const gradedCount = subs.filter((s) => s.status === "graded").length;

  const saveGrade = (sub: Submission, grade: number) => {
    setSubs((p) => p.map((s) => (s.id === sub.id ? { ...s, grade, status: "graded" } : s)));
    toast.success(t("gradeSaved", { name: sub.studentName }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">{assignment.title}</h1>
            <p className="text-sm text-muted-foreground">{assignment.course} · {t("colDue")}: {assignment.dueDate}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5" onClick={() => toast.success(t("uploadExcel"))}>
              <Upload className="size-4" />{t("uploadExcel")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("submissionsTitle")} · {gradedCount}/{subs.length}</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="ps-6">{t("colStudent")}</TableHead>
                <TableHead>{t("colFile")}</TableHead>
                <TableHead>{t("colSubmitted")}</TableHead>
                <TableHead>{t("colStatus")}</TableHead>
                <TableHead>{t("colGrade")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="ps-6">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] text-primary">{s.initials}</AvatarFallback></Avatar>
                      <span className="font-medium">{s.studentName}</span>
                    </div>
                  </TableCell>
                  <TableCell><span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground"><FileText className="size-3.5" />{s.fileName}</span></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.submittedAt}</TableCell>
                  <TableCell><AdminStatusBadge value={s.status === "graded" ? "completed" : "pending"} /></TableCell>
                  <TableCell className="tabular-nums">
                    {s.status === "graded"
                      ? <span className="font-semibold">{s.grade}/{assignment.maxGrade}</span>
                      : <span className="text-muted-foreground">{t("ungraded")}</span>}
                  </TableCell>
                  <TableCell className="text-end">
                    <GradeDialog sub={s} max={assignment.maxGrade} onSave={saveGrade} label={t("gradeBtn")} saveLabel={t("saveGrade")} colGrade={t("colGrade")} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function GradeDialog({
  sub, max, onSave, label, saveLabel, colGrade,
}: {
  sub: Submission; max: number; onSave: (s: Submission, g: number) => void;
  label: string; saveLabel: string; colGrade: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [grade, setGrade] = React.useState(sub.grade ?? Math.round(max * 0.8));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><SquarePen className="size-3.5" />{label}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>{sub.studentName}</DialogTitle></DialogHeader>
        <div className="space-y-1.5">
          <Label>{colGrade} (/{max})</Label>
          <Input type="number" min={0} max={max} value={grade} onChange={(e) => setGrade(Number(e.target.value))} />
        </div>
        <DialogFooter>
          <Button onClick={() => { onSave(sub, Math.min(grade, max)); setOpen(false); }}>{saveLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
