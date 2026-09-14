"use client";

import * as React from "react";
import {
  Building2,
  CheckCircle2,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { CareerVacancyDto, CareerVacancyStatus } from "@/lib/dal/career-hub";
import { cn } from "@/lib/utils";
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
import { countryOf, employmentOf, formatDate } from "@/features/career-hub/lib/career-taxonomy";

const STATUSES: CareerVacancyStatus[] = ["new", "reviewing", "converted", "rejected"];

const STATUS_STYLE: Record<CareerVacancyStatus, string> = {
  new: "bg-primary/10 text-primary ring-primary/20",
  reviewing: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  converted: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  rejected: "bg-muted text-muted-foreground ring-border",
};

const LABEL: Record<CareerVacancyStatus | "all", string> = {
  all: "All",
  new: "New",
  reviewing: "Reviewing",
  converted: "Listed",
  rejected: "Rejected",
};

/**
 * Vacancies employers submitted at /careers/post-a-job.
 *
 * Nothing here is public. Verify the employer, then "Create listing" opens the
 * listing form prefilled; saving it marks the submission as listed.
 */
export function CareerVacanciesManager() {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<CareerVacancyDto[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [filter, setFilter] = React.useState<CareerVacancyStatus | "all">("all");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [savingNotes, setSavingNotes] = React.useState<string | null>(null);

  const load = React.useCallback(async (status: CareerVacancyStatus | "all") => {
    const [listRes, countRes] = await Promise.all([
      dal.careerHub.fetchVacancies(status),
      dal.careerHub.fetchVacancyCounts(),
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
        dal.careerHub.fetchVacancies(filter),
        dal.careerHub.fetchVacancyCounts(),
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
      [r.companyName, r.jobTitle, r.contactName, r.email, r.city, countryOf(r.country)?.en].join(" ").toLowerCase().includes(q),
    );
  }, [rows, query]);

  const setStatus = async (row: CareerVacancyDto, status: CareerVacancyStatus) => {
    const prev = rows;
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, status } : x)));
    const res = await dal.careerHub.updateVacancy(row._id, { status });
    if (!res.ok) {
      setRows(prev);
      toast.error(res.error);
      return;
    }
    toast.success(`Moved to ${LABEL[status]}`);
    load(filter);
  };

  const saveNotes = async (row: CareerVacancyDto) => {
    const value = notes[row._id] ?? row.notes ?? "";
    setSavingNotes(row._id);
    const res = await dal.careerHub.updateVacancy(row._id, { notes: value });
    setSavingNotes(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, notes: value } : x)));
    toast.success("Notes saved");
  };

  const remove = async (row: CareerVacancyDto) => {
    const ok = await confirm({
      title: "Delete submission",
      description: `${row.companyName}'s “${row.jobTitle}” submission will be permanently removed. A listing already created from it is kept.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    const res = await dal.careerHub.deleteVacancy(row._id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows((r) => r.filter((x) => x._id !== row._id));
    toast.success("Submission deleted");
    load(filter);
  };

  return (
    <div className="space-y-5">
      {Confirmation}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
            <Inbox className="size-6 text-primary" /> Employer vacancies
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Roles employers submitted at <span className="font-medium">/careers/post-a-job</span>. Verify the employer before listing
            anything.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Company, role, contact…" className="ps-9" />
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
              filter === s ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:text-foreground",
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
          <p className="mt-3 text-sm font-medium">{query ? "No submissions match your search" : "No submissions yet"}</p>
          <p className="mt-1 text-xs text-muted-foreground">They appear here as soon as an employer submits a role.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((r) => {
            const open = openId === r._id;
            const country = countryOf(r.country);
            const waDigits = r.phone.replace(/\D/g, "");
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
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-xl">
                    {country?.flag ?? <Building2 className="size-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{r.jobTitle}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {r.companyName} · {[r.city, country?.en].filter(Boolean).join(", ")}
                    </span>
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">{formatDate(r.createdAt, "en")}</span>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", STATUS_STYLE[r.status])}>
                    {LABEL[r.status]}
                  </span>
                </button>

                {open && (
                  <div className="grid gap-5 border-t border-border/60 bg-muted/20 p-4 md:grid-cols-[1fr_300px]">
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 font-medium ring-1 ring-border">
                          {r.contactName}
                        </span>
                        <a
                          href={`mailto:${r.email}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 font-medium ring-1 ring-border hover:ring-primary/40"
                        >
                          <Mail className="size-3.5" /> {r.email}
                        </a>
                        <a
                          href={`https://wa.me/${waDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 ring-1 ring-emerald-200 hover:ring-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900"
                        >
                          <MessageCircle className="size-3.5" /> <span dir="ltr">{r.phone}</span>
                        </a>
                        {r.applyUrl && (
                          <a
                            href={r.applyUrl}
                            target="_blank"
                            rel="nofollow noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 font-medium ring-1 ring-border hover:ring-primary/40"
                          >
                            <ExternalLink className="size-3.5" /> Application link
                          </a>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {country?.flag} {[r.city, country?.en].filter(Boolean).join(", ")}
                        </span>
                        <span>{employmentOf(r.employmentType)?.en ?? r.employmentType}</span>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                        <p className="mt-1.5 whitespace-pre-line rounded-xl bg-card p-3 text-sm leading-relaxed ring-1 ring-border/60">
                          {r.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {r.status === "converted" ? (
                        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                          <span>
                            A listing was created from this submission.{" "}
                            <Link href="/admin/career-hub/jobs" className="font-semibold underline">
                              Open listings
                            </Link>
                          </span>
                        </div>
                      ) : (
                        <Button className="w-full gap-1.5" asChild>
                          <Link href={`/admin/career-hub/jobs?fromVacancy=${r._id}`}>
                            <Sparkles className="size-4" /> Create listing from this
                          </Link>
                        </Button>
                      )}

                      <div className="space-y-1.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                        <Select value={r.status} onValueChange={(v) => setStatus(r, v as CareerVacancyStatus)}>
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
                          placeholder="Verification steps, calls made…"
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
                        <Trash2 className="size-4" /> Delete submission
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
