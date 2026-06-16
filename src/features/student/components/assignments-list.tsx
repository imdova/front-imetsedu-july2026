"use client";

import { useState } from "react";
import {
  Play, Upload, Check, Calendar, Clock, Paperclip, FileText,
  Download, Send, Hourglass, Loader2, X, MessageCircle,
  FileArchive,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { FileUpload } from "@/components/shared/file-upload";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import type { StudentAssignment, AssignmentKpis } from "@/lib/db/student";

/* ─── helpers ──────────────────────────────────────────────── */

function isAssignmentClosed(a: StudentAssignment): boolean {
  if (!a.rawDueDate) return false;
  return new Date(a.rawDueDate).getTime() < Date.now();
}

function getDueCountdown(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "Passed";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const d = days > 0 ? `${days}d : ` : "";
  return `${d}${hours}h : ${mins}m`;
}

function getLetterGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

/* ─── tabs ─────────────────────────────────────────────────── */

const TABS = [
  { id: "active", label: "Active", icon: Play },
  { id: "submitted", label: "Submitted", icon: Upload },
  { id: "graded", label: "Graded", icon: Check },
] as const;
type TabId = (typeof TABS)[number]["id"];

/* ─── AssignmentCard ────────────────────────────────────────── */

function AssignmentCard({
  item,
  onSubmitWork,
}: {
  item: StudentAssignment;
  onSubmitWork: () => void;
}) {
  const isUrgent = item.priority === "urgent";
  const isPassed = isAssignmentClosed(item);

  return (
    <div className="relative rounded-2xl border bg-card p-6 shadow-xs">
      <span
        className={`mb-2.5 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white ${
          isUrgent ? "bg-destructive" : "bg-primary"
        }`}
      >
        {isUrgent ? "URGENT" : "REGULAR"}
      </span>
      <p className="mb-1.5 text-xs text-muted-foreground">{item.groupTitle ?? item.course}</p>
      <h2 className="mb-3 text-lg font-bold leading-snug">{item.title}</h2>

      <p className="mb-0.5 text-xs text-muted-foreground">
        {isPassed ? "DUE DATE PASSED" : "DUE IN"}
      </p>
      <p className="mb-4 text-sm font-semibold">
        {item.rawDueDate ? getDueCountdown(item.rawDueDate) : "—"}
      </p>

      <Button
        type="button"
        onClick={onSubmitWork}
        disabled={isPassed}
        className="mb-3.5"
      >
        {isPassed ? "Closed" : "Submit Work"}
      </Button>

      {item.files && item.files.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Paperclip className="size-4 opacity-80" />
            {item.files.length} Attachment{item.files.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {item.files && item.files.length > 0 && (
        <a
          href={item.files[0]}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Download className="size-4" />
          Download Brief
        </a>
      )}
    </div>
  );
}

/* ─── SubmittedAssignmentCard ───────────────────────────────── */

function SubmittedAssignmentCard({ item }: { item: StudentAssignment }) {
  const sub = item.submission;
  const isUnderReview = sub?.status === "under_review";
  const formattedDate = sub?.createdAt || sub?.submissionDate
    ? new Date((sub.createdAt || sub.submissionDate) as string).toLocaleString()
    : "—";
  const fileName = sub?.assignmentFileUrl
    ? sub.assignmentFileUrl.split("/").pop() || "submitted_file"
    : "No file uploaded";
  const confirmationId = sub?._id
    ? `SUB-${sub._id.substring(16).toUpperCase()}`
    : "—";

  return (
    <div className="relative rounded-2xl border bg-card p-6 shadow-xs">
      <span className="mb-2.5 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
        SUBMITTED
      </span>
      <p className="mb-1.5 text-xs text-muted-foreground">{item.groupTitle ?? item.course}</p>
      <h2 className="mb-3 text-lg font-bold leading-snug">{item.title}</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider ${
            isUnderReview ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"
          }`}
        >
          <Hourglass className="size-3.5" />
          {isUnderReview ? "Under review" : "Awaiting review"}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 rounded-xl border bg-muted/20 p-3.5 sm:grid-cols-2">
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Submitted on
          </p>
          <p className="text-sm font-semibold">{formattedDate}</p>
        </div>
        <div>
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Confirmation ID
          </p>
          <p className="font-mono text-sm font-semibold text-muted-foreground">{confirmationId}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <span className="inline-flex max-w-full items-center gap-1.5 truncate text-xs text-muted-foreground">
          <FileText className="size-4 shrink-0 opacity-80" />
          {fileName}
        </span>
      </div>

      {sub?.notes && (
        <div className="mb-4 rounded-lg border bg-muted/20 p-3 text-xs italic text-muted-foreground">
          <strong>My notes:</strong> {sub.notes}
        </div>
      )}

      {sub?.assignmentFileUrl && (
        <a
          href={sub.assignmentFileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
        >
          <Download className="size-4" />
          Download copy
        </a>
      )}
    </div>
  );
}

/* ─── GradedAssignmentCard ──────────────────────────────────── */

function GradedAssignmentCard({ item }: { item: StudentAssignment }) {
  const sub = item.submission;
  const score = sub?.score;
  const hasScore = score !== null && score !== undefined;
  const letter = hasScore ? (sub?.letterGrade ?? getLetterGrade(score as number)) : "";
  const gradedDate = sub?.updatedAt
    ? new Date(sub.updatedAt).toLocaleDateString()
    : "—";

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xs">
      <div className="pointer-events-none absolute right-0 top-0 size-28 -translate-y-1/2 translate-x-1/2 rounded-full bg-emerald-500/10" />
      <span className="mb-2.5 inline-block rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">
        GRADED
      </span>
      <p className="mb-1.5 text-xs text-muted-foreground">{item.groupTitle ?? item.course}</p>
      <h2 className="mb-3 text-lg font-bold leading-snug">{item.title}</h2>

      <div className="mb-4 flex flex-wrap items-end gap-4">
        {hasScore ? (
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold leading-none text-emerald-600">{score}/100</span>
            <span className="text-lg font-bold">{letter}</span>
          </div>
        ) : (
          <span className="text-3xl font-bold leading-none text-emerald-600">Approved</span>
        )}
        <div>
          <span className="text-xs text-muted-foreground">Graded on {gradedDate}</span>
        </div>
      </div>

      <div className="mb-4 rounded-xl border bg-muted/20 p-3.5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Instructor feedback
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {sub?.feedback ?? "No feedback comments left by the instructor."}
        </p>
      </div>

      {sub?.assignmentFileUrl && (
        <a
          href={sub.assignmentFileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground no-underline transition-colors hover:bg-primary/90"
        >
          <Download className="size-4" />
          Download copy
        </a>
      )}
    </div>
  );
}

/* ─── EmptyState ────────────────────────────────────────────── */

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border bg-card p-10 text-center">
      <p className="mb-1.5 text-base font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/* ─── ActivityRow ───────────────────────────────────────────── */

function ActivityRow({ item }: { item: { id: string; type: string; title: string; detail: string } }) {
  const isGraded = item.type === "graded";
  return (
    <div className="flex gap-3 border-b py-2.5 last:border-b-0 last:pb-0">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
          isGraded ? "bg-emerald-50 text-emerald-700" : "bg-primary/10 text-primary"
        }`}
      >
        {isGraded ? <Check className="size-4" strokeWidth={2.5} /> : <Clock className="size-4" />}
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 text-sm font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.detail}</p>
      </div>
    </div>
  );
}

/* ─── SubmissionModal ───────────────────────────────────────── */

function SubmissionModal({
  open,
  assignment,
  onClose,
  onSuccess,
}: {
  open: boolean;
  assignment: StudentAssignment | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fileUrl, setFileUrl] = useState("");
  const [note, setNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    if (submitting) return;
    onClose();
    setFileUrl("");
    setNote("");
    setConfirmed(false);
  };

  const handleSubmit = async () => {
    if (!fileUrl || !assignment) return;
    setSubmitting(true);
    const toastId = toast.loading("Submitting assignment…");
    const res = await dal.student.submitAssignment(assignment.id, { assignmentFileUrl: fileUrl, notes: note });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Assignment submitted successfully!", { id: toastId });
      onSuccess();
      handleClose();
    } else {
      toast.error(res.error || "Failed to submit assignment.", { id: toastId });
    }
  };

  const countdown = assignment?.rawDueDate ? getDueCountdown(assignment.rawDueDate) : "—";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg p-0">
        <div className="flex items-start justify-between gap-4 border-b p-6 pb-5">
          <div>
            <h2 className="mb-1.5 text-2xl font-bold leading-tight">Assignment Submission</h2>
            <p className="text-sm text-muted-foreground">{assignment?.groupTitle ?? assignment?.course}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive">
            <Clock className="size-3.5" />
            DUE IN {countdown}
          </span>
        </div>

        <div className="p-6 space-y-5">
          <FileUpload
            value={fileUrl}
            onChange={setFileUrl}
            label="Drag & drop or browse your file"
            hint="PDF, DOCX, ZIP, XLSX — max 20 MB"
            accept=".pdf,.doc,.docx,.zip,.xlsx,.png,.jpg,.jpeg"
          />

          <div className="space-y-1.5">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MessageCircle className="size-4" />
              Submission Note
            </h3>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Leave a message for the instructor…"
              rows={3}
              className="min-h-[80px]"
              disabled={submitting}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(c) => setConfirmed(!!c)}
              disabled={submitting}
              className="mt-0.5"
            />
            <span>
              I confirm that this assignment is my own{" "}
              <span className="font-medium text-foreground">original work</span> and adheres to
              the IMETS Academic Integrity policies.
            </span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <Button variant="ghost" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!confirmed || !fileUrl || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Send className="size-4" />
                Submit Assignment
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── KPI Card ──────────────────────────────────────────────── */

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  iconClass,
  iconWrapClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
  iconClass: string;
  iconWrapClass: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-xs">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}>
        <Icon className={`size-6 ${iconClass}`} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <p className="mb-1 text-3xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

/* ─── AssignmentsView (main export) ─────────────────────────── */

export function AssignmentsList({
  items,
  kpis,
  onReload,
}: {
  items: StudentAssignment[];
  kpis?: AssignmentKpis;
  onReload?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("active");
  const [modalAssignment, setModalAssignment] = useState<StudentAssignment | null>(null);

  const activeAssignments = items.filter((a) => !a.submission);
  const openActive = activeAssignments.filter((a) => !isAssignmentClosed(a));
  const submittedAssignments = items.filter(
    (a) => a.submission && a.submission.status?.toLowerCase() !== "approved",
  );
  const gradedAssignments = items.filter(
    (a) => a.submission && a.submission.status?.toLowerCase() === "approved",
  );

  const nextDeliverable = openActive.reduce<StudentAssignment | null>((acc, curr) => {
    if (!curr.rawDueDate) return acc;
    if (!acc?.rawDueDate) return curr;
    return new Date(curr.rawDueDate).getTime() < new Date(acc.rawDueDate).getTime() ? curr : acc;
  }, null);

  const allActiveClosed = activeAssignments.length > 0 && openActive.length === 0;

  const recentActivity = items
    .filter((a) => a.submission)
    .map((a) => {
      const isApproved = a.submission?.status?.toLowerCase() === "approved";
      return {
        id: a.id,
        type: isApproved ? "graded" : "processing",
        title: isApproved ? `Graded: ${a.title}` : `Submitted: ${a.title}`,
        detail: isApproved
          ? `Score: ${a.submission?.score != null ? `${a.submission.score}/100` : "Approved"}`
          : "Awaiting review",
        date: new Date(a.submission?.updatedAt ?? a.submission?.createdAt ?? 0),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const kpiData = kpis ?? { inProgress: 0, deadlines: 0, averageGrade: 0 };

  return (
    <>
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Calendar}
          label="In Progress"
          value={kpiData.inProgress}
          sub="Active tasks"
          iconWrapClass="bg-primary/10"
          iconClass="text-primary"
        />
        <KpiCard
          icon={Calendar}
          label="Deadlines"
          value={kpiData.deadlines}
          sub="Due soon"
          iconWrapClass="bg-destructive/10"
          iconClass="text-destructive"
        />
        <KpiCard
          icon={Check}
          label="Average Grade"
          value={kpiData.averageGrade > 0 ? `${kpiData.averageGrade}%` : "—"}
          sub="Completed works"
          iconWrapClass="bg-purple-100"
          iconClass="text-purple-600"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b" role="tablist" aria-label="Assignment status">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`-mb-px inline-flex min-h-11 cursor-pointer items-center gap-2 border-b-2 bg-transparent px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-b-primary text-primary"
                  : "border-b-transparent text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {isActive && <span className="size-2 shrink-0 rounded-full bg-primary" />}
              <Icon className="size-4 shrink-0" strokeWidth={2} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main list */}
        <div className="flex flex-col gap-5">
          {activeTab === "active" &&
            (activeAssignments.length ? (
              activeAssignments.map((a) => (
                <AssignmentCard key={a.id} item={a} onSubmitWork={() => setModalAssignment(a)} />
              ))
            ) : (
              <EmptyState
                title="No active assignments"
                description="You are all caught up! There are no assignments pending submission."
              />
            ))}
          {activeTab === "submitted" &&
            (submittedAssignments.length ? (
              submittedAssignments.map((a) => <SubmittedAssignmentCard key={a.id} item={a} />)
            ) : (
              <EmptyState
                title="No submitted assignments"
                description="Work you submit will appear here while it awaits instructor review."
              />
            ))}
          {activeTab === "graded" &&
            (gradedAssignments.length ? (
              gradedAssignments.map((a) => <GradedAssignmentCard key={a.id} item={a} />)
            ) : (
              <EmptyState
                title="No graded assignments yet"
                description="Once instructors publish grades, scores and feedback will show here."
              />
            ))}
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-5 max-lg:order-first max-lg:grid max-lg:grid-cols-2 max-md:grid-cols-1">
          {/* Quick Submission */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs">
            <h3 className="mb-1 text-base font-semibold">Quick Submission</h3>
            <p className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              NEXT DELIVERABLE
            </p>
            {nextDeliverable ? (
              <>
                <div className="mb-4.5 flex gap-2.5">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-destructive" />
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">
                      {nextDeliverable.groupTitle ?? nextDeliverable.course}
                    </p>
                    <p className="mb-0.5 text-sm font-semibold">{nextDeliverable.title}</p>
                    {nextDeliverable.rawDueDate && (
                      <p className="text-xs text-muted-foreground">
                        Deadline: {new Date(nextDeliverable.rawDueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className="mb-4 cursor-pointer rounded-xl border-2 border-dashed bg-muted/20 p-6 text-center transition-colors hover:border-border hover:bg-muted/30"
                  onClick={() => setModalAssignment(nextDeliverable)}
                >
                  <Upload className="mx-auto mb-3 block size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to submit work</p>
                </div>
                <Button className="w-full" onClick={() => setModalAssignment(nextDeliverable)}>
                  <Send className="size-4" />
                  Submit Work
                </Button>
              </>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                {allActiveClosed
                  ? "All assignments are closed. Submissions are no longer accepted."
                  : "No upcoming deliverables"}
              </p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border bg-card p-5 shadow-xs">
            <h3 className="mb-3.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              RECENT ACTIVITY
            </h3>
            {recentActivity.length > 0 ? (
              recentActivity.map((a) => <ActivityRow key={a.id} item={a} />)
            ) : (
              <p className="text-sm italic text-muted-foreground">No recent activity</p>
            )}
          </div>
        </aside>
      </div>

      {/* Submission modal */}
      <SubmissionModal
        open={!!modalAssignment}
        assignment={modalAssignment}
        onClose={() => setModalAssignment(null)}
        onSuccess={() => onReload?.()}
      />
    </>
  );
}
