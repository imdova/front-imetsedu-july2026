"use client";

import * as React from "react";
import {
  Briefcase,
  CalendarClock,
  ExternalLink,
  Inbox,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { CareerJobDto, CareerJobInput, CareerJobStatus } from "@/lib/dal/career-hub";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { useConfirm } from "@/hooks/use-confirm";
import {
  CAREER_COUNTRIES,
  CAREER_PROFESSIONS,
  CAREER_TRACKS,
  EDUCATION_LEVELS,
  EMPLOYMENT_TYPES,
  SALARY_CURRENCIES,
  countryOf,
  formatDate,
} from "@/features/career-hub/lib/career-taxonomy";

const STATUSES: CareerJobStatus[] = ["draft", "published", "closed"];

const STATUS_STYLE: Record<CareerJobStatus, string> = {
  draft: "bg-muted text-muted-foreground ring-border",
  published: "bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  closed: "bg-slate-200 text-slate-700 ring-slate-300 dark:bg-slate-800 dark:text-slate-300",
};

const LABEL: Record<CareerJobStatus | "all", string> = {
  all: "All",
  draft: "Draft",
  published: "Published",
  closed: "Closed",
};

const NONE = "__none";

interface FormState {
  title: string;
  employer: string;
  country: string;
  city: string;
  employmentType: string;
  language: "en" | "ar";
  professions: string[];
  tracks: string[];
  relatedCourseSlugs: string[];
  minEducation: string;
  experienceMin: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: string;
  description: string;
  requirements: string;
  applyUrl: string;
  applyEmail: string;
  sourceName: string;
  sourceUrl: string;
  postedAt: string;
  expiresAt: string;
  status: CareerJobStatus;
  notes: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM: FormState = {
  title: "",
  employer: "",
  country: "SA",
  city: "",
  employmentType: "full_time",
  language: "en",
  professions: [],
  tracks: [],
  relatedCourseSlugs: [],
  minEducation: "",
  experienceMin: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "",
  salaryPeriod: "month",
  description: "",
  requirements: "",
  applyUrl: "",
  applyEmail: "",
  sourceName: "",
  sourceUrl: "",
  postedAt: today(),
  expiresAt: "",
  status: "draft",
  notes: "",
};

const toForm = (j: CareerJobDto): FormState => ({
  title: j.title,
  employer: j.employer,
  country: j.country,
  city: j.city ?? "",
  employmentType: j.employmentType,
  language: j.language ?? "en",
  professions: j.professions ?? [],
  tracks: j.tracks ?? [],
  relatedCourseSlugs: j.relatedCourseSlugs ?? [],
  minEducation: j.minEducation ?? "",
  experienceMin: j.experienceMin != null ? String(j.experienceMin) : "",
  salaryMin: j.salaryMin != null ? String(j.salaryMin) : "",
  salaryMax: j.salaryMax != null ? String(j.salaryMax) : "",
  salaryCurrency: j.salaryCurrency ?? "",
  salaryPeriod: j.salaryPeriod || "month",
  description: j.description,
  requirements: (j.requirements ?? []).join("\n"),
  applyUrl: j.applyUrl ?? "",
  applyEmail: j.applyEmail ?? "",
  sourceName: j.sourceName ?? "",
  sourceUrl: j.sourceUrl ?? "",
  postedAt: j.postedAt ? j.postedAt.slice(0, 10) : today(),
  expiresAt: j.expiresAt ? j.expiresAt.slice(0, 10) : "",
  status: j.status,
  notes: j.notes ?? "",
});

const num = (s: string) => (s.trim() === "" ? null : Math.max(0, Math.round(Number(s))));

const toInput = (f: FormState): CareerJobInput => ({
  title: f.title.trim(),
  employer: f.employer.trim(),
  country: f.country,
  city: f.city.trim(),
  employmentType: f.employmentType,
  language: f.language,
  professions: f.professions,
  tracks: f.tracks,
  relatedCourseSlugs: f.relatedCourseSlugs,
  minEducation: f.minEducation,
  experienceMin: num(f.experienceMin),
  salaryMin: num(f.salaryMin),
  salaryMax: num(f.salaryMax),
  salaryCurrency: f.salaryCurrency,
  salaryPeriod: f.salaryPeriod,
  description: f.description.trim(),
  requirements: f.requirements.split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean),
  applyUrl: f.applyUrl.trim(),
  applyEmail: f.applyEmail.trim(),
  sourceName: f.sourceName.trim(),
  sourceUrl: f.sourceUrl.trim(),
  // Noon UTC, so the date doesn't slide a day in either direction across the region.
  postedAt: new Date(`${f.postedAt || today()}T12:00:00Z`).toISOString(),
  expiresAt: f.expiresAt ? new Date(`${f.expiresAt}T20:59:59Z`).toISOString() : null,
  status: f.status,
  notes: f.notes,
});

const isExpired = (j: CareerJobDto) => !!j.expiresAt && new Date(j.expiresAt).getTime() <= Date.now();

/**
 * Career Hub listings — admin curation.
 *
 * Every listing is typed in by a person, so the form insists on the two things
 * that keep the board honest: a way to apply, and where the opening was found.
 */
/** An employer submission to turn into a listing — opens the add form prefilled. */
export interface VacancyDraft {
  vacancyId: string;
  values: Partial<
    Pick<
      FormState,
      "title" | "employer" | "country" | "city" | "employmentType" | "description" | "applyUrl" | "applyEmail" | "sourceName" | "notes"
    >
  >;
}

export function CareerJobsManager({
  courses,
  initialDraft,
}: {
  courses: { slug: string; title: string }[];
  initialDraft?: VacancyDraft;
}) {
  const { confirm, Confirmation } = useConfirm();
  const router = useRouter();
  // The submission being converted, if any — marked converted once the listing saves.
  const vacancyRef = React.useRef<string | null>(initialDraft?.vacancyId ?? null);
  const [rows, setRows] = React.useState<CareerJobDto[]>([]);
  const [counts, setCounts] = React.useState<Record<string, number>>({});
  const [filter, setFilter] = React.useState<CareerJobStatus | "all">("all");
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<CareerJobDto | null>(null);
  const [open, setOpen] = React.useState(!!initialDraft);
  const [form, setForm] = React.useState<FormState>(() =>
    initialDraft ? { ...EMPTY_FORM, postedAt: today(), ...initialDraft.values } : EMPTY_FORM,
  );
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async (status: CareerJobStatus | "all") => {
    const [listRes, countRes] = await Promise.all([
      dal.careerHub.fetchAdminJobs(status),
      dal.careerHub.fetchAdminJobCounts(),
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
        dal.careerHub.fetchAdminJobs(filter),
        dal.careerHub.fetchAdminJobCounts(),
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
      [r.title, r.employer, r.city, countryOf(r.country)?.en, r.sourceName].join(" ").toLowerCase().includes(q),
    );
  }, [rows, query]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const toggleIn = (key: "professions" | "tracks" | "relatedCourseSlugs", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value],
    }));

  const startCreate = () => {
    vacancyRef.current = null;
    setEditing(null);
    setForm({ ...EMPTY_FORM, postedAt: today() });
    setOpen(true);
  };

  const startEdit = (row: CareerJobDto) => {
    setEditing(row);
    setForm(toForm(row));
    setOpen(true);
  };

  const problems = (f: FormState): string | null => {
    if (!f.title.trim() || !f.employer.trim()) return "Title and employer are required.";
    if (!f.description.trim()) return "Add a description.";
    if (!f.applyUrl.trim() && !f.applyEmail.trim()) return "Add an application link or email.";
    if (!f.sourceName.trim()) return "Say where this opening was found.";
    if ((f.salaryMin || f.salaryMax) && !f.salaryCurrency) return "Choose a salary currency.";
    return null;
  };

  const submit = async () => {
    const issue = problems(form);
    if (issue) {
      toast.error(issue);
      return;
    }
    setSaving(true);
    const input = toInput(form);
    const res = editing ? await dal.careerHub.updateJob(editing._id, input) : await dal.careerHub.createJob(input);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success(editing ? "Listing updated" : "Listing added");
    setOpen(false);
    if (!editing && vacancyRef.current) {
      const linked = await dal.careerHub.updateVacancy(vacancyRef.current, { status: "converted", jobId: res.data._id });
      if (!linked.ok) toast.error(`Listing saved, but the vacancy wasn't marked converted: ${linked.error}`);
      vacancyRef.current = null;
      router.replace("/admin/career-hub/jobs");
    }
    load(filter);
  };

  const setStatus = async (row: CareerJobDto, status: CareerJobStatus) => {
    const prev = rows;
    setRows((r) => r.map((x) => (x._id === row._id ? { ...x, status } : x)));
    const res = await dal.careerHub.updateJob(row._id, { status });
    if (!res.ok) {
      setRows(prev);
      toast.error(res.error);
      return;
    }
    toast.success(`Moved to ${LABEL[status]}`);
    load(filter);
  };

  const remove = async (row: CareerJobDto) => {
    const ok = await confirm({
      title: "Delete listing",
      description: `“${row.title}” at ${row.employer} will be permanently removed. Closing it keeps the record.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    const res = await dal.careerHub.deleteJob(row._id);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setRows((r) => r.filter((x) => x._id !== row._id));
    toast.success("Listing deleted");
    load(filter);
  };

  return (
    <div className="space-y-5">
      {Confirmation}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
            <Briefcase className="size-6 text-primary" /> Career Hub listings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Real openings in Egypt and the Gulf. Published listings appear on <span className="font-medium">/careers</span> and are
            matched to graduates in their student Career Hub.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, employer…" className="ps-9" />
          </div>
          <Button className="gap-1.5" onClick={startCreate}>
            <Plus className="size-4" /> Add listing
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
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
        {(counts.expired ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
            <CalendarClock className="size-3.5" /> {counts.expired} published but past closing date
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-border/70 bg-card py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-20 text-center">
          <Inbox className="size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">{query ? "No listings match your search" : "No listings yet"}</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Add openings you have verified — from an employer&apos;s careers page, a recruiter or a partner hospital.
          </p>
          {!query && (
            <Button size="sm" className="mt-4 gap-1.5" onClick={startCreate}>
              <Plus className="size-4" /> Add the first listing
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-start text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">Role</th>
                <th className="px-4 py-3 text-start font-semibold">Location</th>
                <th className="px-4 py-3 text-start font-semibold">Posted · closes</th>
                <th className="px-4 py-3 text-start font-semibold">Status</th>
                <th className="px-4 py-3 text-end font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visible.map((r) => {
                const expired = isExpired(r);
                const country = countryOf(r.country);
                return (
                  <tr key={r._id} className="align-top hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.employer} · source: {r.sourceName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5 text-muted-foreground" />
                        {country?.flag} {[r.city, country?.en].filter(Boolean).join(", ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {formatDate(r.postedAt, "en")}
                      <span className={cn("block", expired ? "font-semibold text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>
                        {r.expiresAt ? `${expired ? "Closed" : "Closes"} ${formatDate(r.expiresAt, "en")}` : "No closing date"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Select value={r.status} onValueChange={(v) => setStatus(r, v as CareerJobStatus)}>
                        <SelectTrigger className={cn("h-8 w-[130px] rounded-full text-xs font-semibold ring-1", STATUS_STYLE[r.status])}>
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
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {r.status === "published" && !expired && (
                          <Button size="icon" variant="ghost" asChild title="View public page">
                            <Link href={`/careers/${r.slug}`} target="_blank">
                              <ExternalLink className="size-4" />
                            </Link>
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" onClick={() => startEdit(r)} title="Edit">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => remove(r)}
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={(o) => !saving && setOpen(o)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit listing" : "Add a listing"}</DialogTitle>
            <DialogDescription>
              Only openings you can point to. Graduates apply directly with the employer.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Group title="The role">
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Job title *">
                  <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Infection Control Nurse" />
                </F>
                <F label="Employer *">
                  <Input value={form.employer} onChange={(e) => set("employer", e.target.value)} placeholder="Hospital or company name" />
                </F>
                <F label="Country *">
                  <Select value={form.country} onValueChange={(v) => set("country", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CAREER_COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.flag} {c.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="City">
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Riyadh" />
                </F>
                <F label="Employment type">
                  <Select value={form.employmentType} onValueChange={(v) => set("employmentType", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="Listing language" hint="Indexed in this language only">
                  <Select value={form.language} onValueChange={(v) => set("language", v as "en" | "ar")}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
              </div>
              <F label="Description *">
                <Textarea rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </F>
              <F label="Requirements" hint="One per line">
                <Textarea rows={4} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
              </F>
            </Group>

            <Group title="Who it's for" hint="Drives matching in the student Career Hub">
              <F label="Professions" hint="None selected = open to all">
                <Chips
                  options={CAREER_PROFESSIONS.map((p) => ({ value: p.value, label: p.en }))}
                  selected={form.professions}
                  onToggle={(v) => toggleIn("professions", v)}
                />
              </F>
              <F label="Areas">
                <Chips
                  options={CAREER_TRACKS.map((t) => ({ value: t.value, label: t.en }))}
                  selected={form.tracks}
                  onToggle={(v) => toggleIn("tracks", v)}
                />
              </F>
              {courses.length > 0 && (
                <F label="Related IMETS programmes">
                  <Chips
                    options={courses.map((c) => ({ value: c.slug, label: c.title }))}
                    selected={form.relatedCourseSlugs}
                    onToggle={(v) => toggleIn("relatedCourseSlugs", v)}
                  />
                </F>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Minimum education">
                  <Select value={form.minEducation || NONE} onValueChange={(v) => set("minEducation", v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Not specified</SelectItem>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="Minimum years of experience">
                  <Input type="number" min={0} max={50} value={form.experienceMin} onChange={(e) => set("experienceMin", e.target.value)} />
                </F>
              </div>
            </Group>

            <Group title="Salary" hint="Only if the employer published it">
              <div className="grid gap-3 sm:grid-cols-4">
                <F label="From">
                  <Input type="number" min={0} value={form.salaryMin} onChange={(e) => set("salaryMin", e.target.value)} />
                </F>
                <F label="To">
                  <Input type="number" min={0} value={form.salaryMax} onChange={(e) => set("salaryMax", e.target.value)} />
                </F>
                <F label="Currency">
                  <Select value={form.salaryCurrency || NONE} onValueChange={(v) => set("salaryCurrency", v === NONE ? "" : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>—</SelectItem>
                      {SALARY_CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="Per">
                  <Select value={form.salaryPeriod} onValueChange={(v) => set("salaryPeriod", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </F>
              </div>
            </Group>

            <Group title="Applying & source">
              <div className="grid gap-3 sm:grid-cols-2">
                <F label="Application link">
                  <Input type="url" value={form.applyUrl} onChange={(e) => set("applyUrl", e.target.value)} placeholder="https://" dir="ltr" />
                </F>
                <F label="…or application email">
                  <Input type="email" value={form.applyEmail} onChange={(e) => set("applyEmail", e.target.value)} dir="ltr" />
                </F>
                <F label="Found at *" hint="Shown publicly">
                  <Input value={form.sourceName} onChange={(e) => set("sourceName", e.target.value)} placeholder="Employer careers page" />
                </F>
                <F label="Source link">
                  <Input type="url" value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)} placeholder="https://" dir="ltr" />
                </F>
              </div>
            </Group>

            <Group title="Publishing">
              <div className="grid gap-3 sm:grid-cols-3">
                <F label="Status">
                  <Select value={form.status} onValueChange={(v) => set("status", v as CareerJobStatus)}>
                    <SelectTrigger className="w-full">
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
                </F>
                <F label="Posted on">
                  <Input type="date" value={form.postedAt} onChange={(e) => set("postedAt", e.target.value)} />
                </F>
                <F label="Closing date" hint="Hidden after this">
                  <Input type="date" value={form.expiresAt} onChange={(e) => set("expiresAt", e.target.value)} />
                </F>
              </div>
              <F label="Internal notes" hint="Admins only">
                <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
              </F>
            </Group>
          </div>

          <DialogFooter>
            <Button variant="outline" disabled={saving} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={submit} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save changes" : "Add listing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Group({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3 rounded-2xl border border-border/60 p-4">
      <legend className="px-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
        {hint && <span className="ms-2 font-normal normal-case tracking-normal">— {hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = selected.includes(o.value);
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(o.value)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium ring-1 transition-colors",
              active ? "bg-primary text-primary-foreground ring-primary" : "bg-background text-muted-foreground ring-border hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
