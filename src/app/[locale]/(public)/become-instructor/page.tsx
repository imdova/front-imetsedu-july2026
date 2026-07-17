import type { Metadata } from "next";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Megaphone,
  Users,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { BecomeForm } from "@/features/marketing/components/become-form";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, breadcrumbLd, localeUrl, staticPageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return staticPageMeta({
    title: t("becomeMetaTitle"),
    description: t("becomeMetaDescription"),
    path: "/become-instructor",
    locale,
  });
}

export default async function BecomeInstructorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");
  const tr = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const url = localeUrl("/become-instructor", locale);

  // The fields an applicant can pick are the school's real categories, straight
  // from the catalogue — a hand-written list here would drift from what IMETS
  // actually teaches. The English name is what gets stored, matching how
  // `course.category` is keyed elsewhere.
  //
  // If this fetch fails the form falls back to a free-text field (see
  // BecomeForm): this page is statically generated, so a failed fetch at build
  // time would otherwise bake in a form that never asks what the applicant
  // wants to teach.
  const catsRes = await dal.lookups.fetchCategories();
  const fields = (catsRes.ok ? catsRes.data : [])
    .filter((c) => c.label && c.label !== "—")
    .map((c) => ({
      value: c.label,
      label: locale === "ar" ? c.labelAr || c.label : c.label,
    }));

  // Reasons to teach here. Deliberately about the work — reach, format, support —
  // not earnings: no compensation figure has been shared with me, and inventing
  // one on a recruiting page is a promise the school would have to keep.
  const reasons = [
    { icon: Globe2, title: t("becomeReason1Title"), body: t("becomeReason1Body") },
    { icon: CalendarClock, title: t("becomeReason2Title"), body: t("becomeReason2Body") },
    { icon: Megaphone, title: t("becomeReason3Title"), body: t("becomeReason3Body") },
    { icon: Users, title: t("becomeReason4Title"), body: t("becomeReason4Body") },
  ];

  const looking = [
    t("becomeLooking1"),
    t("becomeLooking2"),
    t("becomeLooking3"),
    t("becomeLooking4"),
  ];

  const steps = [
    { title: t("becomeStep1Title"), body: t("becomeStep1Body") },
    { title: t("becomeStep2Title"), body: t("becomeStep2Body") },
    { title: t("becomeStep3Title"), body: t("becomeStep3Body") },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: tr("Home", "الرئيسية"), url: localeUrl("/", locale) },
            { name: t("becomeTitle"), url },
          ]),
        ]}
      />

      {/* Hero — the ask is above the fold, and the CTA jumps to the form. */}
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/[0.05] to-background">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary">
                <GraduationCap className="size-3.5" />
                {t("becomeEyebrow")}
              </span>
              <h1 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-4xl lg:text-[2.9rem] lg:leading-[1.1]">
                {t("becomeTitle")}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t("becomeSubtitle")}
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="gap-2" asChild>
                  <a href="#apply">
                    {t("becomeCta")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#what-we-look-for">{t("becomeCtaSecondary")}</a>
                </Button>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">{t("becomeCtaNote")}</p>
            </div>

            <BecomeForm fields={fields} />
          </div>
        </div>
      </section>

      {/* Why teach here */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t("becomeWhyTitle")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t("becomeWhyLead")}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <article
              key={r.title}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
                <r.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-[0.95rem] font-bold leading-snug">
                {r.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* What we look for + how it works */}
      <section
        id="what-we-look-for"
        className="scroll-mt-20 border-y border-border/60 bg-slate-50/80 dark:bg-muted/20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:px-8">
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {t("becomeLookingTitle")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("becomeLookingLead")}</p>
            <ul className="mt-6 space-y-3">
              {looking.map((l) => (
                <li key={l} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
              {t("becomeStepsTitle")}
            </h2>
            <ol className="mt-6 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex items-start gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary font-heading text-xs font-bold tabular-nums text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-heading text-sm font-bold">{s.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="marketing-gradient-bg overflow-hidden rounded-[2rem] px-6 py-14 text-center shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:px-12">
          <p className="mx-auto max-w-2xl font-heading text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
            {t("becomeFinalTitle")}
          </p>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/75">
            {t("becomeFinalBody")}
          </p>
          <Button size="lg" variant="secondary" className="mt-8 gap-2" asChild>
            <a href="#apply">
              {t("becomeCta")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </a>
          </Button>
          <p className="mt-4 text-xs text-white/60">{SITE_NAME}</p>
        </div>
      </section>
    </>
  );
}
