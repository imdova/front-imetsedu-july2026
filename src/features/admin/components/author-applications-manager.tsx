"use client";

import * as React from "react";
import {
  Briefcase,
  Flag,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Search,
  Stethoscope,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { AuthorApplicationDto } from "@/lib/dal/author-applications";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/hooks/use-confirm";

const STATUSES = ["new", "reviewing", "accepted", "rejected"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_STYLE: Record<Status, string> = {
  new: "bg-primary/10 text-primary ring-primary/20",
  reviewing: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  accepted: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  rejected: "bg-muted text-muted-foreground ring-border",
};

const LABEL: Record<Status | "all", string> = {
  all: "All",
  new: "New",
  reviewing: "Reviewing",
  accepted: "Accepted",
  rejected: "Rejected",
};

const fmt = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

/**
 * "Write for IMETS" author applications.
 *
 * Read-mostly: the only writes are moving an application through review and
 * leaving internal notes. What the applicant submitted is never editable here.
 */
export function AuthorApplicationsManager() {
  // useConfirm returns { confirm, Confirmation }; <Confirmation /> must render or the dialog never mounts.
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<AuthorApplicationDto[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [filter, setFilter] = React.useState<Status | "all">("all");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = React.useState<string | null>(null);

  const load = React.useCallback(async (status: Status | "all") => {
    const [listRes, countRes] = await Promise.all([
      dal.authorApplications.fetchApplications(status),
      dal.authorApplications.fetchApplicationCounts(),
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
        dal.authorApplications.fetchApplications(filter),
        dal.authorApplications.fetchApplicationCounts(),
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

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.fullName, r.email, r.whatsapp, r.nationality, r.profession, r.jobTitle, ...(r.interests ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [rows, query]);

  const setStatus = async (row: AuthorApplicationDto, status: Status) => {
    const prev = rows;
    // Optimistic — moving through review is the most frequent action, so it should feel instant.
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, status } : x)));
    const res = await dal.authorApplications.updateApplication(row._id, { status });
    if (!res.ok) {
      setRows(prev);
      toast.error(res.error);
      return;
    }
    toast.success(`Moved to ${LABEL[status]}`);
    load(filter);
  };

  const saveNotes = async (row: AuthorApplicationDto) => {
    const value = notes[row._id] ?? row.notes ?? "";
    setSavingNotes(row._id);
    const res = await dal.authorApplications.updateApplication(row._id, { notes: value });
    setSavingNotes(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, notes: value } : x)));
    toast.success("Notes saved");
  };

  const remove = async (row: AuthorApplicationDto) => {
    const ok = await confirm({
      title: "Delete application",
      description: `${row.fullName}'s application will be permanently removed.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    const res = await dal.authorApplications.deleteApplication(row._id);
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Author applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Healthcare professionals applying via the public “Write for IMETS” page.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, topic…"
            className="ps-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors",
              filter === s
                ? "bg-primary text-primary-foreground ring-primary"
                : "bg-card text-muted-foreground ring-border hover:text-foreground",
            )}
          >
            {LABEL[s]}
            <span className={cn("tabular-nums", filter === s ? "text-primary-foreground/80" : "text-muted-foreground/70")}>
              {counts[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-border/70 bg-card py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-20 text-center">
          <Inbox className="size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">{query ? "No applications match your search" : "No applications yet"}</p>
          <p className="mt-1 text-xs text-muted-foreground">They appear here as soon as someone applies at /become-author.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((r) => {
            const open = openId === r._id;
            const status = (STATUSES as readonly string[]).includes(r.status) ? (r.status as Status) : "new";
            const waDigits = r.whatsapp.replace(/\D/g, "");
            return (
              <div
                key={r._id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-card transition-shadow",
                  open ? "border-primary/30 shadow-md" : "border-border/70 hover:shadow-sm",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : r._id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-start"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-sm font-bold text-white">
                    {getInitials(r.fullName)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.fullName}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.jobTitle} · {r.profession} · {r.nationality}
                    </span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{fmt(r.createdAt)}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1",
                      STATUS_STYLE[status],
                    )}
                  >
                    {LABEL[status]}
                  </span>
                </button>

                {open && (
                  <div className="grid gap-5 border-t border-border/60 bg-muted/20 p-4 md:grid-cols-[1fr_300px]">
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`mailto:${r.email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-medium ring-1 ring-border hover:ring-primary/40"
                        >
                          <Mail className="size-3.5" /> {r.email}
                        </a>
                        <a
                          href={`https://wa.me/${waDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900"
                        >
                          <MessageCircle className="size-3.5" /> <span dir="ltr">{r.whatsapp}</span>
                        </a>
                      </div>

                      <dl className="grid gap-3 text-sm sm:grid-cols-3">
                        <Detail icon={Stethoscope} label="Profession" value={r.profession} />
                        <Detail icon={Briefcase} label="Job title" value={r.jobTitle} />
                        <Detail icon={Flag} label="Nationality" value={r.nationality} />
                      </dl>

                      {r.interests?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Areas of interest</p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {r.interests.map((i) => (
                              <span key={i} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {i}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Bio</p>
                        <p className="mt-1.5 whitespace-pre-line rounded-xl bg-card p-3 text-sm leading-relaxed ring-1 ring-border/60">
                          {r.bio}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                        <Select value={status} onValueChange={(v) => setStatus(r, v as Status)}>
                          <SelectTrigger className="w-full bg-card">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUSES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {LABEL[s]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Internal notes</p>
                        <Textarea
                          rows={4}
                          value={notes[r._id] ?? r.notes ?? ""}
                          onChange={(e) => setNotes((n) => ({ ...n, [r._id]: e.target.value }))}
                          placeholder="Only visible to admins"
                          className="bg-card"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          disabled={savingNotes === r._id}
                          onClick={() => saveNotes(r)}
                        >
                          {savingNotes === r._id ? <Loader2 className="size-4 animate-spin" /> : "Save notes"}
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => remove(r)}
                      >
                        <Trash2 className="size-4" /> Delete application
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-card p-3 ring-1 ring-border/60">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </dt>
      <dd className="mt-1 truncate font-medium">{value || "—"}</dd>
    </div>
  );
}
