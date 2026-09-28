"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { BookOpen, GraduationCap, Plus, Trash2, Users } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { AdminStudentDetail, AdminStudentLmsCourse } from "@/lib/db/admin";
import type { LmsCourse } from "@/lib/db/lms";
import { useConfirm } from "@/hooks/use-confirm";
import { useResetOnChange } from "@/hooks/use-reset-on-change";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

/**
 * Student → Assigned LMS.
 *
 * Two different things grant a student an LMS course and the difference drives
 * every control here:
 *  - a **direct** assignment, an entry in the course's student list; removable.
 *  - a **group** the course is assigned to, which the student portal honours on
 *    its own. Removing a direct entry would not take this away, so the only
 *    honest control for it is the access switch, which writes a revoking entry.
 *
 * A student with no group has no timetable, no cohort and no assignments, so
 * assigning is blocked until they are enrolled in one — the backend enforces
 * the same rule; this is the explanation, not the enforcement.
 */
export function StudentLmsAccess({ student }: { student: AdminStudentDetail }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();

  const [rows, setRows] = React.useState<AdminStudentLmsCourse[]>(student.lmsCourses);
  const [busy, setBusy] = React.useState<string>("");
  const [open, setOpen] = React.useState(false);
  const [catalog, setCatalog] = React.useState<LmsCourse[] | null>(null);
  const [picked, setPicked] = React.useState("");

  // Re-seed from the server payload after a router.refresh(), without the
  // extra paint an effect would cost.
  useResetOnChange([student.lmsCourses], () => setRows(student.lmsCourses));

  const canAssign = !!student.leadId && student.groups.length > 0;
  const assigned = new Set(rows.map((r) => r.id));
  const options = (catalog ?? []).filter((c) => !assigned.has(c.id));

  const openAssign = async () => {
    setOpen(true);
    if (catalog) return;
    const res = await dal.lms.fetchLmsCourses();
    setCatalog(res.ok ? res.data : []);
    if (!res.ok) toast.error(res.error || t("slmsLoadFailed"));
  };

  const assign = async () => {
    if (!picked) return;
    setBusy(picked);
    const res = await dal.lms.assignLmsStudent(picked, student.leadId);
    setBusy("");
    if (!res.ok) {
      toast.error(res.error || t("slmsAssignFailed"));
      return;
    }
    toast.success(t("slmsAssigned"));
    setOpen(false);
    setPicked("");
    router.refresh();
  };

  const toggle = async (row: AdminStudentLmsCourse, next: boolean) => {
    setBusy(row.id);
    const res = await dal.lms.setLmsStudentAccess(row.id, student.leadId, next);
    setBusy("");
    if (!res.ok) {
      toast.error(res.error || t("slmsUpdateFailed"));
      return;
    }
    // Switching a group-derived course off creates the entry that carries the
    // flag, so the row becomes a direct one from here on.
    setRows((p) =>
      p.map((r) => (r.id === row.id ? { ...r, isActive: next, direct: true } : r)),
    );
    toast.success(next ? t("slmsTurnedOn") : t("slmsTurnedOff"));
  };

  const remove = async (row: AdminStudentLmsCourse) => {
    const ok = await confirm({
      title: t("slmsRemoveTitle"),
      description: row.viaGroups.length
        ? t("slmsRemoveGroupWarning", { group: row.viaGroups.map((g) => g.title).join(", ") })
        : t("slmsRemoveConfirm", { course: row.title }),
      confirmText: t("slmsRemove"),
      variant: "destructive",
    });
    if (!ok) return;
    setBusy(row.id);
    const res = await dal.lms.unassignLmsStudent(row.id, student.leadId);
    setBusy("");
    if (!res.ok) {
      toast.error(res.error || t("slmsRemoveFailed"));
      return;
    }
    toast.success(t("slmsRemoved"));
    router.refresh();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{t("slmsTitle")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{t("slmsSubtitle")}</p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" disabled={!canAssign} onClick={openAssign}>
          <Plus className="size-4" />
          {t("slmsAssign")}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {!student.leadId ? (
          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
            {t("slmsNoLead")}
          </p>
        ) : !student.groups.length ? (
          <p className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-foreground">
            {t("slmsNoGroup")}
          </p>
        ) : null}

        {!rows.length ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {t("slmsEmpty")}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border p-3.5"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="size-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">{row.title}</p>
                    {!row.courseIsActive && (
                      <Badge variant="outline" className="text-[0.65rem]">{t("slmsCourseInactive")}</Badge>
                    )}
                    {!row.isActive && (
                      <Badge variant="destructive" className="text-[0.65rem]">{t("slmsOff")}</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {row.category && <span>{row.category}</span>}
                    <span className="inline-flex items-center gap-1">
                      <BookOpen className="size-3" />
                      {t("slmsLessons", { modules: row.moduleCount, lessons: row.lessonCount })}
                    </span>
                    {row.viaGroups.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" />
                        {t("slmsViaGroup", { group: row.viaGroups.map((g) => g.title).join(", ") })}
                      </span>
                    )}
                    {row.direct && row.enrolledAt && <span>{t("slmsSince", { date: row.enrolledAt })}</span>}
                  </p>
                </div>

                <div className="flex w-32 shrink-0 items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${row.progress}%` }} />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{row.progress}%</span>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    checked={row.isActive}
                    disabled={busy === row.id}
                    onCheckedChange={(v) => toggle(row, v)}
                    aria-label={t("slmsAccessLabel")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    disabled={busy === row.id || !row.direct}
                    title={row.direct ? t("slmsRemove") : t("slmsGroupOnlyHint")}
                    onClick={() => remove(row)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("slmsAssignTitle")}</DialogTitle>
            <DialogDescription>{t("slmsAssignDesc")}</DialogDescription>
          </DialogHeader>
          <Select value={picked} onValueChange={setPicked}>
            <SelectTrigger>
              <SelectValue placeholder={catalog ? t("slmsPick") : t("slmsLoading")} />
            </SelectTrigger>
            <SelectContent>
              {options.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {catalog && !options.length && (
            <p className="text-sm text-muted-foreground">{t("slmsNoneLeft")}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("slmsCancel")}
            </Button>
            <Button onClick={assign} disabled={!picked || !!busy}>
              {t("slmsAssign")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </Card>
  );
}
