"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Compass,
  GraduationCap,
  Loader2,
  Pencil,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type {
  CareerMatch,
  CareerMatchGap,
  CareerMatchReason,
  CareerProfile,
  CareerProfileDto,
} from "@/lib/dal/career-hub";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "@/features/career-hub/components/job-card";
import {
  CAREER_COUNTRIES,
  CAREER_PROFESSIONS,
  CAREER_TRACKS,
  EDUCATION_LEVELS,
  countryOf,
  educationOf,
  pick,
  professionOf,
  trackOf,
} from "@/features/career-hub/lib/career-taxonomy";

export interface HubCourse {
  slug: string;
  titleEn: string;
  titleAr: string;
  careerRoles: { titleEn: string; titleAr: string; descriptionEn?: string; descriptionAr?: string }[];
}

const EMPTY: CareerProfile = {
  profession: "",
  educationLevel: "",
  yearsOfExperience: null,
  courseSlugs: [],
  tracks: [],
  countries: [],
};

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/**
 * A graduate's Career Hub: their preferences, the open listings that fit them,
 * and the career ladders their programmes lead to.
 *
 * Every listing here was added by the IMETS team and every career ladder comes
 * from a published course. When nothing matches, the page says so plainly —
 * an empty match list is never padded with loosely related roles.
 */
export function CareerHubWorkspace({
  locale,
  initialProfile,
  initialMatches,
  courses,
  openCount,
}: {
  locale: string;
  initialProfile: CareerProfileDto | null;
  initialMatches: CareerMatch[];
  courses: HubCourse[];
  /** All open listings across the hub, for the empty state. Null when unknown. */
  openCount: number | null;
}) {
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);

  const [saved, setSaved] = React.useState<CareerProfile | null>(
    initialProfile?.exists ? initialProfile : null,
  );
  const [draft, setDraft] = React.useState<CareerProfile>(initialProfile ?? EMPTY);
  const [editing, setEditing] = React.useState(!initialProfile?.exists);
  const [saving, setSaving] = React.useState(false);
  const [matches, setMatches] = React.useState<CareerMatch[]>(initialMatches);

  const courseBySlug = React.useMemo(() => new Map(courses.map((c) => [c.slug, c])), [courses]);
  const courseTitle = (slug: string) => {
    const c = courseBySlug.get(slug);
    return c ? (ar ? c.titleAr || c.titleEn : c.titleEn) : slug;
  };

  const save = async () => {
    setSaving(true);
    const res = await dal.careerHub.saveMyCareerProfile(draft);
    if (!res.ok) {
      setSaving(false);
      toast.error(res.error);
      return;
    }
    const profile: CareerProfile = {
      profession: res.data.profession,
      educationLevel: res.data.educationLevel,
      yearsOfExperience: res.data.yearsOfExperience,
      courseSlugs: res.data.courseSlugs,
      tracks: res.data.tracks,
      countries: res.data.countries,
    };
    setSaved(profile);
    setDraft(profile);
    const m = await dal.careerHub.fetchMyCareerMatches();
    setSaving(false);
    if (m.ok) setMatches(m.data.matches);
    else toast.error(m.error);
    setEditing(false);
    toast.success(tr("Preferences saved", "تم حفظ تفضيلاتك"));
  };

  /* Career ladders: the courses they took, or — if none — the ones behind their interests. */
  const ladderSlugs = React.useMemo(() => {
    const source = saved?.courseSlugs.length
      ? saved.courseSlugs
      : (saved?.tracks ?? []).flatMap((t) => trackOf(t)?.courses ?? []);
    return [...new Set(source)].filter((s) => (courseBySlug.get(s)?.careerRoles.length ?? 0) > 0).slice(0, 4);
  }, [saved, courseBySlug]);

  /* Programmes that lead into their interests and that they haven't taken. */
  const suggestions = React.useMemo(() => {
    if (!saved) return [];
    const taken = new Set(saved.courseSlugs);
    const slugs = saved.tracks.flatMap((t) => trackOf(t)?.courses ?? []);
    return [...new Set(slugs)].filter((s) => !taken.has(s) && courseBySlug.has(s)).slice(0, 4);
  }, [saved, courseBySlug]);

  const reasonLabel = (r: CareerMatchReason) => {
    switch (r.kind) {
      case "profession":
        return tr(`Your profession: ${pick(professionOf(r.value), "en", r.value)}`, `مهنتك: ${pick(professionOf(r.value), "ar", r.value)}`);
      case "open-profession":
        return tr("Open to all professions", "متاحة لكل المهن");
      case "track":
        return tr(`Your interest: ${pick(trackOf(r.value), "en", r.value)}`, `اهتمامك: ${pick(trackOf(r.value), "ar", r.value)}`);
      case "course":
        return tr(`Builds on ${courseTitle(r.value)}`, `تبني على ${courseTitle(r.value)}`);
      case "country":
        return pick(countryOf(r.value), locale, r.value);
      case "education":
        return tr("Meets the education requirement", "تستوفي شرط المؤهل");
      case "experience":
        return tr("Meets the experience requirement", "تستوفي شرط الخبرة");
    }
  };

  const gapLabel = (g: CareerMatchGap) =>
    g.kind === "education"
      ? tr(`Asks for: ${pick(educationOf(g.value), "en", g.value)}`, `تتطلب: ${pick(educationOf(g.value), "ar", g.value)}`)
      : tr(`Asks for ${g.value}+ years' experience`, `تتطلب خبرة ${g.value}+ سنوات`);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary via-primary to-sky-600 p-6 text-primary-foreground shadow-xl shadow-primary/10 sm:p-8">
        <div aria-hidden="true" className="absolute -end-16 -top-20 -z-10 size-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden="true" className="absolute -bottom-24 start-1/3 -z-10 size-64 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ring-1 ring-white/20">
              <Sparkles className="size-3.5" />
              {tr("Career Hub", "مركز الوظائف")}
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {tr("Your next role in Egypt and the Gulf", "وظيفتك القادمة في مصر والخليج")}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
              {tr(
                "Openings matched to your profession, education, the courses you took and the areas you want to grow in.",
                "وظائف مطابقة لمهنتك ومؤهلك والبرامج التي درستها والمجالات التي تريد التطور فيها.",
              )}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-3 sm:w-80">
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <dt className="text-[11px] text-primary-foreground/75">{tr("Matched to you", "مطابقة لك")}</dt>
              <dd className="mt-1 font-heading text-2xl font-bold tabular-nums">{saved ? matches.length : "—"}</dd>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15 backdrop-blur">
              <dt className="text-[11px] text-primary-foreground/75">{tr("Open roles", "وظائف متاحة")}</dt>
              <dd className="mt-1 font-heading text-2xl font-bold tabular-nums">{openCount ?? "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        {/* Preferences */}
        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm xl:sticky xl:top-20">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-heading text-base font-bold">
              <Compass className="size-4 text-primary" />
              {tr("Your career profile", "ملفك المهني")}
            </h2>
            {saved && !editing && (
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => setEditing(true)}>
                <Pencil className="size-3.5" />
                {tr("Edit", "تعديل")}
              </Button>
            )}
          </div>

          {editing ? (
            <div className="mt-4 space-y-5">
              {!saved && (
                <p className="rounded-xl bg-primary/[0.06] p-3 text-xs leading-relaxed text-primary">
                  {tr(
                    "Tell us what you do and where you want to work. We use it only to match you with openings.",
                    "أخبرنا بما تعمل وأين تريد العمل. نستخدم ذلك فقط لمطابقتك مع الوظائف.",
                  )}
                </p>
              )}

              <Field label={tr("Profession", "المهنة")}>
                <Select value={draft.profession || undefined} onValueChange={(v) => setDraft((d) => ({ ...d, profession: v }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tr("Choose your profession", "اختر مهنتك")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CAREER_PROFESSIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {pick(p, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <div className="grid grid-cols-[1fr_110px] gap-3">
                <Field label={tr("Highest education", "أعلى مؤهل")}>
                  <Select
                    value={draft.educationLevel || undefined}
                    onValueChange={(v) => setDraft((d) => ({ ...d, educationLevel: v }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tr("Choose", "اختر")} />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_LEVELS.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {pick(e, locale)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={tr("Years' exp.", "سنوات الخبرة")}>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    inputMode="numeric"
                    value={draft.yearsOfExperience ?? ""}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        yearsOfExperience: e.target.value === "" ? null : Math.max(0, Math.min(50, Number(e.target.value))),
                      }))
                    }
                  />
                </Field>
              </div>

              <Field label={tr("Where do you want to work?", "أين تريد العمل؟")} hint={tr("None selected = anywhere", "بدون اختيار = أي دولة")}>
                <div className="flex flex-wrap gap-1.5">
                  {CAREER_COUNTRIES.map((c) => (
                    <Chip
                      key={c.value}
                      active={draft.countries.includes(c.value)}
                      onClick={() => setDraft((d) => ({ ...d, countries: toggle(d.countries, c.value) }))}
                    >
                      <span aria-hidden="true">{c.flag}</span> {pick(c, locale)}
                    </Chip>
                  ))}
                </div>
              </Field>

              <Field label={tr("Areas of interest", "مجالات الاهتمام")}>
                <div className="flex flex-wrap gap-1.5">
                  {CAREER_TRACKS.map((t) => (
                    <Chip
                      key={t.value}
                      active={draft.tracks.includes(t.value)}
                      onClick={() => setDraft((d) => ({ ...d, tracks: toggle(d.tracks, t.value) }))}
                    >
                      {pick(t, locale)}
                    </Chip>
                  ))}
                </div>
              </Field>

              {courses.length > 0 && (
                <Field label={tr("IMETS programmes you studied", "برامج IMETS التي درستها")}>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((c) => (
                      <Chip
                        key={c.slug}
                        active={draft.courseSlugs.includes(c.slug)}
                        onClick={() => setDraft((d) => ({ ...d, courseSlugs: toggle(d.courseSlugs, c.slug) }))}
                      >
                        {ar ? c.titleAr || c.titleEn : c.titleEn}
                      </Chip>
                    ))}
                  </div>
                </Field>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 gap-1.5" disabled={saving} onClick={save}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                  {saved ? tr("Save and update matches", "احفظ وحدّث النتائج") : tr("Find my matches", "اعرض الوظائف المناسبة")}
                </Button>
                {saved && (
                  <Button
                    variant="outline"
                    disabled={saving}
                    onClick={() => {
                      setDraft(saved);
                      setEditing(false);
                    }}
                  >
                    {tr("Cancel", "إلغاء")}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            saved && (
              <dl className="mt-4 space-y-4 text-sm">
                <Summary label={tr("Profession", "المهنة")}>
                  {saved.profession ? pick(professionOf(saved.profession), locale, saved.profession) : "—"}
                </Summary>
                <Summary label={tr("Education · experience", "المؤهل · الخبرة")}>
                  {[
                    saved.educationLevel ? pick(educationOf(saved.educationLevel), locale) : null,
                    saved.yearsOfExperience != null ? tr(`${saved.yearsOfExperience} yrs`, `${saved.yearsOfExperience} سنوات`) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </Summary>
                <Summary label={tr("Countries", "الدول")}>
                  {saved.countries.length
                    ? saved.countries.map((c) => `${countryOf(c)?.flag ?? ""} ${pick(countryOf(c), locale, c)}`).join(" · ")
                    : tr("Egypt and all Gulf countries", "مصر وكل دول الخليج")}
                </Summary>
                <Summary label={tr("Interests", "الاهتمامات")}>
                  <TagList items={saved.tracks.map((t) => pick(trackOf(t), locale, t))} empty="—" />
                </Summary>
                <Summary label={tr("Programmes", "البرامج")}>
                  <TagList items={saved.courseSlugs.map(courseTitle)} empty="—" />
                </Summary>
              </dl>
            )
          )}
        </section>

        <div className="min-w-0 space-y-6">
          {/* Matches */}
          <section>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <Briefcase className="size-5 text-primary" />
                {tr("Openings matched to you", "وظائف مطابقة لك")}
              </h2>
              <Link href="/careers" className="text-sm font-medium text-primary hover:underline">
                {tr("Browse all openings", "تصفّح كل الوظائف")}
              </Link>
            </div>

            {!saved ? (
              <EmptyState
                icon={Compass}
                title={tr("Set up your profile to see matches", "أكمل ملفك لرؤية الوظائف المطابقة")}
                body={tr(
                  "Pick your profession, interests and the countries you're open to — matches appear here straight away.",
                  "اختر مهنتك واهتماماتك والدول التي تناسبك — ستظهر الوظائف هنا فورًا.",
                )}
              />
            ) : matches.length === 0 ? (
              <EmptyState
                icon={Search}
                title={tr("No open roles match your profile right now", "لا توجد وظائف مطابقة لملفك حاليًا")}
                body={
                  openCount
                    ? tr(
                        `There ${openCount === 1 ? "is 1 open role" : `are ${openCount} open roles`} in the hub, but none fit your profession, interests or programmes yet. Try adding interests or countries — new roles are added regularly.`,
                        `في المركز ${openCount} وظيفة متاحة، لكن لا تناسب أيٌّ منها مهنتك أو اهتماماتك أو برامجك بعد. جرّب إضافة اهتمامات أو دول — تُضاف وظائف جديدة باستمرار.`,
                      )
                    : tr(
                        "The IMETS team adds verified openings from employers in Egypt and the Gulf. Your profile is saved, so matches will show here as soon as they're posted.",
                        "يضيف فريق IMETS وظائف موثّقة من جهات العمل في مصر والخليج. ملفك محفوظ، وستظهر الوظائف المطابقة هنا فور نشرها.",
                      )
                }
              />
            ) : (
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {matches.map((m) => (
                  <JobCard key={m.job._id} job={m.job} locale={locale}>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {m.reasons
                          .filter((r) => r.kind !== "country")
                          .map((r, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900"
                            >
                              <CheckCircle2 className="size-3" />
                              {reasonLabel(r)}
                            </span>
                          ))}
                      </div>
                      {m.gaps.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.gaps.map((g, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900"
                            >
                              <AlertTriangle className="size-3" />
                              {gapLabel(g)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </JobCard>
                ))}
              </div>
            )}
          </section>

          {/* Career ladders from real course data */}
          {ladderSlugs.length > 0 && (
            <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <TrendingUp className="size-5 text-primary" />
                {tr("Where your programmes lead", "إلى أين تقودك برامجك")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr("The career path each programme prepares you for, from first role to senior.", "المسار المهني الذي يؤهلك له كل برنامج، من أول وظيفة حتى المناصب القيادية.")}
              </p>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {ladderSlugs.map((slug) => {
                  const c = courseBySlug.get(slug)!;
                  return (
                    <div key={slug} className="rounded-2xl bg-muted/40 p-4 ring-1 ring-border/60">
                      <Link href={`/courses/${slug}`} className="font-heading text-sm font-bold hover:text-primary">
                        {courseTitle(slug)}
                      </Link>
                      <ol className="relative mt-3 space-y-2.5 border-s-2 border-primary/20 ps-4">
                        {c.careerRoles.map((r, i) => (
                          <li key={i} className="relative text-sm">
                            <span
                              aria-hidden="true"
                              className={cn(
                                "absolute -start-[1.4rem] top-1 size-3 rounded-full ring-2 ring-card",
                                i === c.careerRoles.length - 1 ? "bg-sky-500" : "bg-primary",
                              )}
                            />
                            <span className="font-medium">{ar ? r.titleAr || r.titleEn : r.titleEn}</span>
                            {(ar ? r.descriptionAr : r.descriptionEn) && (
                              <span className="block text-xs text-muted-foreground">{ar ? r.descriptionAr : r.descriptionEn}</span>
                            )}
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Programmes behind their interests */}
          {suggestions.length > 0 && (
            <section className="rounded-3xl border border-dashed border-primary/30 bg-primary/[0.03] p-5 sm:p-6">
              <h2 className="flex items-center gap-2 font-heading text-lg font-bold">
                <GraduationCap className="size-5 text-primary" />
                {tr("Open more doors in your areas of interest", "افتح فرصًا أكثر في مجالات اهتمامك")}
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {suggestions.map((slug) => (
                  <Link
                    key={slug}
                    href={`/courses/${slug}`}
                    className="group flex items-center justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-border/70 transition-shadow hover:shadow-md"
                  >
                    <span className="text-sm font-semibold">{courseTitle(slug)}</span>
                    <ArrowRight className="size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-semibold">{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition-colors",
        active
          ? "bg-primary text-primary-foreground ring-primary"
          : "bg-background text-muted-foreground ring-border hover:text-foreground hover:ring-primary/40",
      )}
    >
      {children}
    </button>
  );
}

function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{children}</dd>
    </div>
  );
}

function TagList({ items, empty }: { items: string[]; empty: string }) {
  if (!items.length) return <>{empty}</>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {items.map((i) => (
        <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {i}
        </span>
      ))}
    </span>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="mt-4 grid place-items-center rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10">
        <Icon className="size-6 text-primary" />
      </span>
      <p className="mt-4 font-heading text-base font-bold">{title}</p>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
