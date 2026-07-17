"use client";

import * as React from "react";
import {
  Briefcase,
  ExternalLink,
  FileText,
  Globe,
  Inbox,
  Loader2,
  Mail,
  Phone,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { InstructorApplicationDto } from "@/lib/dal/instructor-applications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/hooks/use-confirm";

const STATUSES = ["new", "reviewing", "interview", "accepted", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLE: Record<Status, string> = {
  new: "bg-primary/10 text-primary ring-primary/20",
  reviewing: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  interview: "bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950/40 dark:text-violet-300",
  accepted: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  rejected: "bg-muted text-muted-foreground ring-border",
};

const LABEL: Record<Status | "all", string> = {
  all: "All",
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

/**
 * "Teach at IMETS" applications.
 *
 * Read-mostly: the only writes are moving an application through the pipeline
 * and leaving internal notes. Applicant-supplied fields are never editable here
 * — this is their submission, not our record to rewrite.
 */
export function InstructorApplicationsManager() {
  // Destructured, not called bare: useConfirm returns { confirm, Confirmation },
  // and <Confirmation /> must be rendered or the dialog never mounts.
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<InstructorApplicationDto[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [filter, setFilter] = React.useState<Status | "all">("all");
  const [loading, setLoading] = React.useState(true);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const load = React.useCallback(async (status: Status | "all") => {
    const [listRes, countRes] = await Promise.all([
      dal.instructorApplications.fetchApplications(status),
      dal.instructorApplications.fetchApplicationCounts(),
    ]);
    if (listRes.ok) setRows(listRes.data);
    else toast.error(listRes.error);
    if (countRes.ok) setCounts(countRes.data);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const [listRes, countRes] = await Promise.all([
        dal.instructorApplications.fetchApplications(filter),
        dal.instructorApplications.fetchApplicationCounts(),
      ]);
      if (!alive) return;
      if (listRes.ok) setRows(listRes.data);
      else toast.error(listRes.error);
      if (countRes.ok) setCounts(countRes.data);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [filter]);

  const setStatus = async (row: InstructorApplicationDto, status: Status) => {
    const prev = rows;
    // Optimistic: the pipeline is the thing you click most, so it should feel instant.
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, status } : x)));
    const res = await dal.instructorApplications.updateApplication(row._id, { status });
    if (!res.ok) {
      setRows(prev);
      toast.error(res.error);
      return;
    }
    toast.success(`Moved to ${LABEL[status]}`);
    load(filter);
  };

  const saveNotes = async (row: InstructorApplicationDto, notes: string) => {
    const res = await dal.instructorApplications.updateApplication(row._id, { notes });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, notes } : x)));
    toast.success("Notes saved");
  };

  const remove = async (row: InstructorApplicationDto) => {
    const ok = await confirm({
      title: "Delete application",
      description: `${row.fullName}'s application will be permanently removed.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    const res = await dal.instructorApplications.deleteApplication(row._id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows((r) => r.filter((x) => x._id !== row._id));
    toast.success("Application deleted");
    load(filter);
  };

  return (
    <div className="space-y-5">
      {Confirmation}
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Instructor applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          People applying to teach via the public “Teach at IMETS” page.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors",
              filter === s
                ? "bg-foreground text-background ring-foreground"
                : "bg-card text-muted-foreground ring-border hover:text-foreground",
            )}
          >
            {LABEL[s]}
            {counts[s] != null && (
              <span className="ms-1.5 tabular-nums opacity-60">{counts[s]}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed py-20 text-center">
          <Inbox className="size-8 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {filter === "all" ? "No applications yet." : `No ${LABEL[filter].toLowerCase()} applications.`}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row._id} className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-heading text-base font-bold">{row.fullName}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1",
                        STATUS_STYLE[row.status],
                      )}
                    >
                      {LABEL[row.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {row.expertise}
                    {row.yearsExperience ? ` · ${row.yearsExperience} yrs` : ""}
                    {row.currentRole ? ` · ${row.currentRole}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1 hover:text-foreground">
                      <Mail className="size-3.5" /> {row.email}
                    </a>
                    {row.phone && (
                      <a href={`tel:${row.phone}`} className="inline-flex items-center gap-1 hover:text-foreground">
                        <Phone className="size-3.5" /> {row.phone}
                      </a>
                    )}
                    {row.country && (
                      <span className="inline-flex items-center gap-1">
                        <Globe className="size-3.5" /> {row.country}
                      </span>
                    )}
                    {row.linkedIn && (
                      <a
                        href={row.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <ExternalLink className="size-3.5" /> LinkedIn
                      </a>
                    )}
                    <span>{fmt(row.createdAt)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Select value={row.status} onValueChange={(v) => setStatus(row, v as Status)}>
                    <SelectTrigger className="h-8 w-36 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    aria-label="Delete application"
                    onClick={() => remove(row)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>

              {(row.topics?.length || row.cvUrl) && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {row.topics?.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      <Briefcase className="size-3" /> {t}
                    </span>
                  ))}
                  {row.cvUrl && (
                    <a
                      href={row.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/15"
                    >
                      <FileText className="size-3" /> CV (PDF)
                      <ExternalLink className="size-2.5" />
                    </a>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => setOpenId(openId === row._id ? null : row._id)}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                {openId === row._id ? "Hide details" : "View bio & notes"}
              </button>

              {openId === row._id && (
                <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      About them
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                      {row.bio}
                    </p>
                  </div>
                  <NotesBox row={row} onSave={saveNotes} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Internal notes — never shown to the applicant. */
function NotesBox({
  row,
  onSave,
}: {
  row: InstructorApplicationDto;
  onSave: (row: InstructorApplicationDto, notes: string) => Promise<void>;
}) {
  const [value, setValue] = React.useState(row.notes ?? "");
  const [saving, setSaving] = React.useState(false);
  const dirty = value !== (row.notes ?? "");

  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        Internal notes
      </p>
      <Textarea
        rows={3}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Only your team sees this."
        className="mt-1"
      />
      {dirty && (
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSave(row, value);
              setSaving(false);
            }}
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : "Save notes"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setValue(row.notes ?? "")}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
