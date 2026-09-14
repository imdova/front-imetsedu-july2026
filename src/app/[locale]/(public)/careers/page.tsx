import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Compass,
  Globe2,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, localeUrl, staticPageMeta } from "@/lib/seo";
import { JobCard } from "@/features/career-hub/components/job-card";
import {
  CAREER_COUNTRIES,
  CAREER_PROFESSIONS,
  CAREER_TRACKS,
  countryOf,
  pick,
  professionOf,
  trackOf,
} from "@/features/career-hub/lib/career-taxonomy";

const PATH = "/careers";
const PAGE_SIZE = 20;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

function readFilters(sp: Record<string, string | string[] | undefined>) {
  const country = one(sp.country);
  const profession = one(sp.profession);
  const track = one(sp.track);
  return {
    // Unknown values are dropped rather than sent — the API would reject them with a 400.
    country: countryOf(country) ? country : undefined,
    profession: professionOf(profession) ? profession : undefined,
    track: trackOf(track) ? track : undefined,
    q: one(sp.q)?.slice(0, 100),
    page: Math.max(1, Number(one(sp.page)) || 1),
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { locale } = await params;
  const f = readFilters(await searchParams);
  const ar = locale === "ar";
  const meta = await staticPageMeta({
    title: ar ? "وظائف الرعاية الصحية في مصر والخليج" : "Healthcare Jobs in Egypt & the Gulf",
    description: ar
      ? "مركز وظائف IMETS: وظائف موثّقة للأطباء والتمريض والصيادلة وأخصائيي الجودة ومكافحة العدوى في مصر والسعودية والإمارات ودول الخليج."
      : "IMETS Career Hub: verified openings for doctors, nurses, pharmacists, quality and infection control professionals in Egypt, Saudi Arabia, the UAE and the Gulf.",
    path: PATH,
    locale,
  });
  // A filtered or paged view is a slice of this page, not a page of its own.
  const filtered = !!(f.country || f.profession || f.track || f.q || f.page > 1);
  return filtered ? { ...meta, robots: { index: false, follow: true } } : meta;
}

/**
 * IMETS Career Hub — public face.
 *
 * Replaces a page that listed five invented IMETS vacancies. Everything here is
 * live: openings are added by the IMETS team with their source recorded, career
 * ladders come from published courses, and guides from the blog. With no
 * listings the page says exactly that, and still earns its place with the
 * career paths — it does not fill the gap with sample jobs.
 */
export default async function CareersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);
  const f = readFilters(await searchParams);

  const [jobsRes, coursesRes, postsRes] = await Promise.all([
    dal.careerHub.fetchJobs({ ...f, limit: PAGE_SIZE }),
    dal.courses.fetchPublishedCourses(),
    dal.blog.fetchPublicArticles({ limit: 200 }),
  ]);

  const list = jobsRes.ok ? jobsRes.data : null;
  const jobs = list?.data ?? [];
  const facets = list?.facets;
  const totalOpen = facets?.total ?? 0;
  const filtered = !!(f.country || f.profession || f.track || f.q);
  const pages = list ? Math.max(1, Math.ceil(list.total / PAGE_SIZE)) : 1;

  const ladders = (coursesRes.ok ? coursesRes.data : [])
    .map((c) => ({ ...c, roles: (c.careerRoles ?? []).filter((r) => r.titleEn || r.titleAr) }))
    .filter((c) => c.roles.length > 0);

  const guides = (postsRes.ok ? postsRes.data.data : [])
    .filter((p) => /career|salar|job|وظائف|رواتب/i.test(`${p.slug} ${p.title}`))
    .slice(0, 6);

  const countriesWithRoles = Object.keys(facets?.countries ?? {}).length;
  const stats = [
    { value: totalOpen, label: tr("open roles", "وظيفة متاحة"), icon: Briefcase },
    { value: countriesWithRoles, label: tr("countries hiring", "دول تُوظّف"), icon: Globe2 },
    { value: ladders.length, label: tr("programme career paths", "مسار مهني للبرامج"), icon: TrendingUp },
  ].filter((s) => s.value > 0);

  /** Link to this page with some filters changed, dropping paging. */
  const hrefWith = (patch: Partial<Record<"country" | "profession" | "track" | "q", string | undefined>>) => {
    const next = { country: f.country, profession: f.profession, track: f.track, q: f.q, ...patch };
    const qs = new URLSearchParams(
      Object.entries(next).filter((e): e is [string, string] => !!e[1]),
    ).toString();
    return `${PATH}${qs ? `?${qs}` : ""}#openings`;
  };
  const pageHref = (page: number) => {
    const qs = new URLSearchParams(
      Object.entries({ country: f.country, profession: f.profession, track: f.track, q: f.q, page: page > 1 ? String(page) : undefined }).filter(
        (e): e is [string, string] => !!e[1],
      ),
    ).toString();
    return `${PATH}${qs ? `?${qs}` : ""}#openings`;
  };

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: tr("Home", "الرئيسية"), url: localeUrl("/", locale) },
            { name: tr("Career Hub", "مركز الوظائف"), url: localeUrl(PATH, locale) },
          ]),
        ]}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.07] via-background to-background">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 start-[-10%] -z-10 size-[34rem] rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 end-[-8%] -z-10 size-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.400/0.18)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-primary/15">
                <Sparkles className="size-3.5" />
                {tr("IMETS Career Hub", "مركز وظائف IMETS")}
              </span>
              <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.35rem]">
                {tr("Healthcare careers across ", "وظائف الرعاية الصحية في ")}
                <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  {tr("Egypt and the Gulf", "مصر والخليج")}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {tr(
                  "Verified openings for doctors, nurses, pharmacists, and quality, infection control and management professionals — and a clear view of where each IMETS programme can take you.",
                  "وظائف موثّقة للأطباء والتمريض والصيادلة وأخصائيي الجودة ومكافحة العدوى والإدارة — مع رؤية واضحة لما يمكن أن يفتحه لك كل برنامج من IMETS.",
                )}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
                  <Link href="/student/career-hub">
                    <Compass className="size-4" />
                    {tr("Get matched to roles", "اعرض الوظائف المناسبة لي")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#openings">{tr("Browse openings", "تصفّح الوظائف")}</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {tr(
                  "IMETS graduates: sign in to match openings to your profession, education, courses and interests.",
                  "خريجو IMETS: سجّل دخولك لمطابقة الوظائف مع مهنتك ومؤهلك وبرامجك واهتماماتك.",
                )}
              </p>
              {stats.length > 0 && (
                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
                      <s.icon className="size-4 text-primary" />
                      <dd className="mt-2 font-heading text-2xl font-bold tabular-nums">{s.value}</dd>
                      <dt className="text-xs leading-snug text-muted-foreground">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {/* Country tiles — counts are live, zero-count countries stay visible but quiet. */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2">
              {CAREER_COUNTRIES.map((c, i) => {
                const n = facets?.countries[c.value] ?? 0;
                return (
                  <Link
                    key={c.value}
                    href={hrefWith({ country: f.country === c.value ? undefined : c.value })}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border bg-card/80 p-3.5 backdrop-blur transition-all hover:-translate-y-0.5 hover:shadow-lg",
                      f.country === c.value ? "border-primary ring-2 ring-primary/20" : "border-border/60",
                      i === 0 && "sm:col-span-3 lg:col-span-2",
                    )}
                  >
                    <span aria-hidden="true" className="text-3xl leading-none">
                      {c.flag}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{pick(c, locale)}</span>
                      <span className={cn("block text-xs", n ? "text-primary" : "text-muted-foreground")}>
                        {n ? tr(`${n} open ${n === 1 ? "role" : "roles"}`, `${n} وظيفة`) : tr("No listings yet", "لا توجد وظائف بعد")}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Openings */}
      <section id="openings" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{tr("Openings", "الوظائف")}</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight">
              {filtered && list
                ? tr(`${list.total} matching ${list.total === 1 ? "role" : "roles"}`, `${list.total} وظيفة مطابقة`)
                : tr("Open roles", "الوظائف المتاحة")}
            </h2>
          </div>
          {filtered && (
            <Link href={`${PATH}#openings`} className="text-sm font-medium text-primary hover:underline">
              {tr("Clear filters", "مسح الفلاتر")}
            </Link>
          )}
        </div>

        {/* A plain GET form: works without JavaScript and keeps every view linkable. */}
        <form action={localeUrl(PATH, locale).replace(/^https?:\/\/[^/]+/, "")} method="get" className="mt-6 grid gap-3 rounded-2xl border border-border/70 bg-card p-3 shadow-sm sm:grid-cols-[1fr_auto_auto_auto_auto]">
          {f.country && <input type="hidden" name="country" value={f.country} />}
          <label className="relative">
            <span className="sr-only">{tr("Search", "بحث")}</span>
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              defaultValue={f.q}
              placeholder={tr("Job title, employer or city", "المسمى الوظيفي أو جهة العمل أو المدينة")}
              className="h-10 w-full rounded-xl border border-input bg-background ps-9 pe-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </label>
          <select
            name="profession"
            defaultValue={f.profession ?? ""}
            aria-label={tr("Profession", "المهنة")}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">{tr("All professions", "كل المهن")}</option>
            {CAREER_PROFESSIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {pick(p, locale)}
              </option>
            ))}
          </select>
          <select
            name="track"
            defaultValue={f.track ?? ""}
            aria-label={tr("Area", "المجال")}
            className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="">{tr("All areas", "كل المجالات")}</option>
            {CAREER_TRACKS.map((t) => (
              <option key={t.value} value={t.value}>
                {pick(t, locale)}
              </option>
            ))}
          </select>
          <Button type="submit" className="h-10 gap-1.5">
            <Search className="size-4" />
            {tr("Search", "بحث")}
          </Button>
          {f.country && (
            <Link
              href={hrefWith({ country: undefined })}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-primary/10 px-3 text-xs font-semibold text-primary"
            >
              {countryOf(f.country)?.flag} {pick(countryOf(f.country), locale)} ✕
            </Link>
          )}
        </form>

        {!list ? (
          <Empty
            icon={Briefcase}
            title={tr("Openings couldn't be loaded", "تعذّر تحميل الوظائف")}
            body={tr("Please refresh the page in a moment.", "يُرجى تحديث الصفحة بعد قليل.")}
          />
        ) : jobs.length > 0 ? (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {jobs.map((j) => (
                <JobCard key={j._id} job={j} locale={locale} />
              ))}
            </div>
            {pages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2" aria-label={tr("Pages", "الصفحات")}>
                {f.page > 1 && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageHref(f.page - 1)}>{tr("Previous", "السابق")}</Link>
                  </Button>
                )}
                <span className="px-3 text-sm text-muted-foreground tabular-nums">
                  {f.page} / {pages}
                </span>
                {f.page < pages && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={pageHref(f.page + 1)}>{tr("Next", "التالي")}</Link>
                  </Button>
                )}
              </nav>
            )}
          </>
        ) : totalOpen > 0 ? (
          <Empty
            icon={Search}
            title={tr("No openings match these filters", "لا توجد وظائف تطابق هذه الفلاتر")}
            body={tr(
              `There ${totalOpen === 1 ? "is 1 open role" : `are ${totalOpen} open roles`} in the hub — try a different country, profession or area.`,
              `في المركز ${totalOpen} وظيفة متاحة — جرّب دولة أو مهنة أو مجالًا مختلفًا.`,
            )}
            action={{ href: `${PATH}#openings`, label: tr("Show all openings", "اعرض كل الوظائف") }}
          />
        ) : (
          <Empty
            icon={Briefcase}
            title={tr("No openings are listed right now", "لا توجد وظائف منشورة حاليًا")}
            body={tr(
              "The IMETS team adds verified roles from employers in Egypt and the Gulf. Create your career profile and matching roles will be waiting for you in your student Career Hub as soon as they're posted.",
              "يضيف فريق IMETS وظائف موثّقة من جهات العمل في مصر والخليج. أنشئ ملفك المهني وستجد الوظائف المطابقة في مركز الوظائف الخاص بك فور نشرها.",
            )}
            action={{ href: "/student/career-hub", label: tr("Create my career profile", "أنشئ ملفي المهني") }}
          />
        )}

        <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
          {tr(
            "IMETS is not the employer. Every listing shows where it was found, and you apply directly with the employer. Genuine employers never ask for a fee to apply.",
            "IMETS ليست جهة التوظيف. تُظهر كل وظيفة مصدرها، وتتقدّم مباشرةً لدى جهة العمل. جهات التوظيف الحقيقية لا تطلب رسومًا للتقديم.",
          )}
        </p>
      </section>

      {/* Career ladders — from published course data */}
      {ladders.length > 0 && (
        <section className="border-y border-border/60 bg-slate-50/80 dark:bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{tr("Career paths", "المسارات المهنية")}</p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                {tr("Where each programme can take you", "إلى أين يمكن أن يأخذك كل برنامج")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {tr(
                  "The roles each IMETS programme prepares you for, from your first step to senior positions.",
                  "الوظائف التي يؤهلك لها كل برنامج من IMETS، من أول خطوة حتى المناصب القيادية.",
                )}
              </p>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ladders.map((c) => (
                <article key={c.slug} className="flex flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
                  <h3 className="font-heading text-base font-bold leading-snug">{ar ? c.titleAr || c.titleEn : c.titleEn}</h3>
                  <ol className="relative mt-4 flex-1 space-y-3 border-s-2 border-primary/20 ps-4">
                    {c.roles.map((r, i) => (
                      <li key={i} className="relative text-sm">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute -start-[1.4rem] top-1 size-3 rounded-full ring-2 ring-card",
                            i === c.roles.length - 1 ? "bg-sky-500" : "bg-primary",
                          )}
                        />
                        <span className="font-medium">{ar ? r.titleAr || r.titleEn : r.titleEn}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                    <Link href={`/courses/${c.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                      {tr("View programme", "تفاصيل البرنامج")}
                      <ArrowRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Career guides from the blog */}
      {guides.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{tr("Career guides", "أدلة مهنية")}</p>
              <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight">{tr("Plan your next move", "خطّط لخطوتك القادمة")}</h2>
            </div>
            <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
              {tr("All articles", "كل المقالات")}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col rounded-2xl border border-border/70 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
              >
                <BookOpen className="size-5 text-primary" />
                <h3 className="mt-3 font-heading text-sm font-bold leading-snug group-hover:text-primary">{p.title}</h3>
                {p.excerpt && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{p.excerpt}</p>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Employers */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-sky-600 p-8 text-primary-foreground shadow-xl shadow-primary/10 sm:p-10">
          <div aria-hidden="true" className="absolute -end-16 -top-20 -z-10 size-72 rounded-full bg-white/10 blur-2xl" />
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <Building2 className="size-7" />
              <h2 className="mt-3 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                {tr("Hiring healthcare professionals?", "تبحث عن كوادر صحية؟")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/85">
                {tr(
                  "Tell us about the role. Once verified, we list it here and match it to IMETS graduates with the right profession and training.",
                  "أخبرنا عن الوظيفة. بعد التحقق ننشرها هنا ونطابقها مع خريجي IMETS أصحاب المهنة والتدريب المناسبين.",
                )}
              </p>
            </div>
            <Button size="lg" variant="secondary" className="gap-2" asChild>
              <Link href="/careers/post-a-job">
                {tr("Share a vacancy", "أرسل وظيفة")}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Empty({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mt-6 grid place-items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10">
        <Icon className="size-6 text-primary" />
      </span>
      <p className="mt-4 font-heading text-lg font-bold">{title}</p>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && (
        <Button className="mt-5 gap-1.5" asChild>
          <Link href={action.href}>
            {action.label}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      )}
    </div>
  );
}
