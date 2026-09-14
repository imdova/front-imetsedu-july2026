import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Banknote,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Compass,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  ShieldCheck,
  Stethoscope,
  Timer,
} from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { CareerJobDto } from "@/lib/dal/career-hub";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, localeUrl, staticPageMeta } from "@/lib/seo";
import {
  SCHEMA_EMPLOYMENT,
  countryOf,
  educationOf,
  employmentOf,
  formatDate,
  formatSalary,
  pick,
  professionOf,
  trackOf,
} from "@/features/career-hub/lib/career-taxonomy";

type Params = Promise<{ locale: string; slug: string }>;

const plain = (s: string, max: number) => {
  const flat = s.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
};

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await dal.careerHub.fetchJob(slug);
  if (!res.ok) return { robots: { index: false } };
  const job = res.data;
  const where = [job.city, countryOf(job.country)?.en].filter(Boolean).join(", ");
  const path = `/careers/${job.slug}`;
  const meta = await staticPageMeta({
    title: `${job.title} — ${job.employer}${where ? `, ${where}` : ""}`,
    description: plain(job.description, 155),
    path,
    locale,
  });
  /*
   * A listing exists in one language. The other locale renders the same text
   * under a translated shell, so it points its canonical at the real one and
   * stays out of the index.
   */
  return {
    ...meta,
    alternates: { canonical: localeUrl(path, job.language) },
    ...(locale !== job.language && { robots: { index: false, follow: true } }),
  };
}

function jobPostingLd(job: CareerJobDto, url: string) {
  const description = [job.description, ...(job.requirements.length ? ["Requirements:", ...job.requirements.map((r) => `• ${r}`)] : [])]
    .join("\n")
    .replace(/\n/g, "<br>");
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    url,
    datePosted: job.postedAt,
    ...(job.expiresAt && { validThrough: job.expiresAt }),
    employmentType: SCHEMA_EMPLOYMENT[job.employmentType] ?? "FULL_TIME",
    hiringOrganization: { "@type": "Organization", name: job.employer },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        ...(job.city && { addressLocality: job.city }),
        addressCountry: job.country,
      },
    },
    ...(job.employmentType === "remote" && {
      jobLocationType: "TELECOMMUTE",
      applicantLocationRequirements: { "@type": "Country", name: countryOf(job.country)?.en },
    }),
    ...(job.salaryCurrency &&
      (job.salaryMin != null || job.salaryMax != null) && {
        baseSalary: {
          "@type": "MonetaryAmount",
          currency: job.salaryCurrency,
          value: {
            "@type": "QuantitativeValue",
            ...(job.salaryMin != null && { minValue: job.salaryMin }),
            ...(job.salaryMax != null && { maxValue: job.salaryMax }),
            unitText: job.salaryPeriod === "year" ? "YEAR" : "MONTH",
          },
        },
      }),
    ...(job.experienceMin != null && {
      experienceRequirements: { "@type": "OccupationalExperienceRequirements", monthsOfExperience: job.experienceMin * 12 },
    }),
    // Applications happen on the employer's side, never on this page.
    directApply: false,
  };
}

/**
 * One Career Hub listing. Shows where it was found and sends the applicant to
 * the employer — IMETS is not a party to the application.
 */
export default async function CareerJobPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);

  const [res, coursesRes] = await Promise.all([dal.careerHub.fetchJob(slug), dal.courses.fetchPublishedCourses()]);
  if (!res.ok) notFound();
  const job = res.data;

  const country = countryOf(job.country);
  const salary = formatSalary(job, locale);
  const where = [job.city, pick(country, locale)].filter(Boolean).join(ar ? "، " : ", ");
  const url = localeUrl(`/careers/${job.slug}`, job.language);
  const courseBySlug = new Map((coursesRes.ok ? coursesRes.data : []).map((c) => [c.slug, c]));
  const related = job.relatedCourseSlugs.map((s) => courseBySlug.get(s)).filter((c) => !!c);

  const facts = [
    { icon: MapPin, label: tr("Location", "الموقع"), value: where },
    { icon: BriefcaseBusiness, label: tr("Type", "نوع الوظيفة"), value: pick(employmentOf(job.employmentType), locale, job.employmentType) },
    salary ? { icon: Banknote, label: tr("Salary", "الراتب"), value: salary, ltr: true } : null,
    job.experienceMin != null
      ? { icon: Timer, label: tr("Experience", "الخبرة"), value: tr(`${job.experienceMin}+ years`, `${job.experienceMin}+ سنوات`) }
      : null,
    job.minEducation
      ? { icon: GraduationCap, label: tr("Education", "المؤهل"), value: pick(educationOf(job.minEducation), locale) }
      : null,
    job.expiresAt ? { icon: CalendarClock, label: tr("Apply by", "آخر موعد"), value: formatDate(job.expiresAt, locale) } : null,
  ].filter((x): x is { icon: typeof MapPin; label: string; value: string; ltr?: boolean } => !!x && !!x.value);

  const applyButtons = (
    <div className="flex flex-col gap-2">
      {job.applyUrl && (
        <Button size="lg" className="w-full gap-2 shadow-lg shadow-primary/20" asChild>
          <a href={job.applyUrl} target="_blank" rel="nofollow noopener noreferrer">
            {tr("Apply on employer site", "قدّم عبر موقع جهة العمل")}
            <ExternalLink className="size-4" />
          </a>
        </Button>
      )}
      {job.applyEmail && (
        <Button size="lg" variant={job.applyUrl ? "outline" : "default"} className="w-full gap-2" asChild>
          <a href={`mailto:${job.applyEmail}?subject=${encodeURIComponent(job.title)}`}>
            <Mail className="size-4" />
            {tr("Apply by email", "قدّم عبر البريد")}
          </a>
        </Button>
      )}
    </div>
  );

  return (
    <>
      <JsonLd
        data={[
          jobPostingLd(job, url),
          breadcrumbLd([
            { name: tr("Home", "الرئيسية"), url: localeUrl("/", locale) },
            { name: tr("Career Hub", "مركز الوظائف"), url: localeUrl("/careers", locale) },
            { name: job.title, url: localeUrl(`/careers/${job.slug}`, locale) },
          ]),
        ]}
      />

      <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.07] to-background">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link href="/careers" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {tr("All openings", "كل الوظائف")}
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <span aria-hidden="true" className="grid size-16 shrink-0 place-items-center rounded-2xl bg-card text-4xl shadow-sm ring-1 ring-border/70">
              {country?.flag}
            </span>
            <div className="min-w-0" dir={job.language === "ar" ? "rtl" : "ltr"}>
              <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl">{job.title}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{job.employer}</p>
            </div>
          </div>
          {job.tracks.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {job.tracks.map((t) => (
                <span key={t} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {pick(trackOf(t), locale, t)}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <div className="min-w-0 space-y-8">
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {facts.map((x) => (
              <div key={x.label} className="rounded-2xl border border-border/60 bg-card p-4">
                <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <x.icon className="size-3.5" />
                  {x.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold" dir={x.ltr ? "ltr" : undefined}>
                  {x.value}
                </dd>
              </div>
            ))}
          </dl>

          <section dir={job.language === "ar" ? "rtl" : "ltr"}>
            <h2 className="font-heading text-xl font-bold">{tr("About the role", "عن الوظيفة")}</h2>
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">{job.description}</p>
          </section>

          {job.requirements.length > 0 && (
            <section dir={job.language === "ar" ? "rtl" : "ltr"}>
              <h2 className="font-heading text-xl font-bold">{tr("Requirements", "المتطلبات")}</h2>
              <ul className="mt-3 space-y-2.5">
                {job.requirements.map((r, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-600" />
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="lg:hidden">{applyButtons}</div>

          <p className="flex items-start gap-2 rounded-2xl bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>
              {tr("Listed by IMETS from: ", "نشرته IMETS نقلًا عن: ")}
              {job.sourceUrl ? (
                <a href={job.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="font-semibold text-foreground underline-offset-2 hover:underline">
                  {job.sourceName}
                </a>
              ) : (
                <span className="font-semibold text-foreground">{job.sourceName}</span>
              )}
              {" · "}
              {tr("posted ", "نُشرت ")}
              {formatDate(job.postedAt, locale)}.{" "}
              {tr(
                "IMETS is not the employer and takes no part in hiring. Genuine employers never ask for a fee to apply.",
                "IMETS ليست جهة التوظيف ولا تشارك في التعيين. جهات التوظيف الحقيقية لا تطلب رسومًا للتقديم.",
              )}
            </span>
          </p>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="hidden rounded-3xl border border-border/70 bg-card p-5 shadow-sm lg:block">{applyButtons}</div>

          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="flex items-center gap-2 font-heading text-sm font-bold">
              <Stethoscope className="size-4 text-primary" />
              {tr("Who it's for", "لمن هذه الوظيفة")}
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.professions.length ? (
                job.professions.map((p) => (
                  <span key={p} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
                    {pick(professionOf(p), locale, p)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">{tr("Open to all healthcare professions", "متاحة لكل المهن الصحية")}</span>
              )}
            </div>
          </div>

          {related.length > 0 && (
            <div className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-5">
              <h2 className="flex items-center gap-2 font-heading text-sm font-bold">
                <GraduationCap className="size-4 text-primary" />
                {tr("Prepare for this role", "استعد لهذه الوظيفة")}
              </h2>
              <ul className="mt-3 space-y-2">
                {related.map((c) => (
                  <li key={c!.slug}>
                    <Link href={`/courses/${c!.slug}`} className="text-sm font-semibold text-primary hover:underline">
                      {ar ? c!.titleAr || c!.titleEn : c!.titleEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href="/student/career-hub"
            className="group flex items-center gap-3 rounded-3xl bg-gradient-to-br from-primary to-sky-600 p-5 text-primary-foreground shadow-lg shadow-primary/10"
          >
            <Compass className="size-6 shrink-0" />
            <span className="text-sm">
              <span className="block font-bold">{tr("Get matched to roles like this", "اعرض وظائف مشابهة تناسبك")}</span>
              <span className="text-primary-foreground/80">{tr("For IMETS graduates", "لخريجي IMETS")}</span>
            </span>
          </Link>
        </aside>
      </div>
    </>
  );
}
