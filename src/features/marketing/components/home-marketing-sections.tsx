import { Check, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const STEPS = ["step1", "step2", "step3", "step4"] as const;
const ORG_FEATURES = ["orgsFeature1", "orgsFeature2", "orgsFeature3"] as const;
const PARTNERS = ["NAHQ", "SCFHS", "DHA", "DOH", "QCHP", "Prometric", "PMI", "JCI"] as const;

export async function PartnersSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-border/70 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-warning">
            {t("partnersLabel")}
          </p>
          <h2 className="mt-3 text-balance font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t("partnersTitle")}
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">{t("partnersSubtitle")}</p>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="inline-flex items-center rounded-xl border border-border/60 bg-card px-5 py-3 font-heading text-base font-bold tracking-tight text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-md"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function HowItWorksSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="mx-auto w-full max-w-[100rem] px-4 py-10 sm:px-6 lg:px-8">
      <div className="marketing-dark-section mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] px-6 py-12 sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c14d]">
            {t("howItWorksLabel")}
          </p>
          <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {t("howItWorksTitle")}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/65">
            {t("howItWorksSubtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {STEPS.map((key, index) => (
            <article key={key} className="group flex flex-col">
              <span className="step-number-badge inline-flex h-10 w-11 items-center justify-center rounded-lg text-sm font-bold text-[#0a1424] shadow-sm transition-transform group-hover:scale-110">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold text-white">
                {t(`${key}Title`)}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-white/60">
                {t(`${key}Desc`)}
              </p>
              <div className="step-accent-bar mt-6 h-0.5 w-full rounded-full transition-all group-hover:h-1" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function OrganizationsSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="mx-auto w-full max-w-[100rem] px-4 py-6 sm:px-6 lg:px-8">
      <div className="marketing-dark-section mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] px-6 py-12 sm:rounded-[2rem] sm:px-10 sm:py-14 lg:px-14">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_min(100%,340px)] lg:gap-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8c14d]">
              {t("orgsLabel")}
            </p>
            <h2 className="mt-3 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {t("orgsTitle")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/65">
              {t("orgsDesc")}
            </p>
            <ul className="mt-8 space-y-4">
              {ORG_FEATURES.map((key) => (
                <li key={key} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e8c14d]/15 text-[#e8c14d]">
                    <Check className="size-3.5" strokeWidth={2.5} />
                  </span>
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-sm transition-colors hover:border-white/20">
            <p className="font-heading text-5xl font-bold tracking-tight text-white">
              {t("orgsStat")}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {t("orgsStatDesc")}
            </p>
            <Link
              href="/contact"
              className="brand-cta-gradient group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-[#0a1424] shadow-lg transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              {t("orgsCta")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function CareerCtaSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="mx-auto w-full max-w-[100rem] px-4 pb-20 pt-2 sm:px-6 lg:px-8">
      <div className="marketing-dark-section mx-auto max-w-7xl overflow-hidden rounded-[1.75rem] px-6 py-14 text-center sm:rounded-[2rem] sm:px-10 sm:py-16 lg:px-14">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("careerCtaTitle")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/65">
          {t("careerCtaSubtitle")}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/courses"
            className="group inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-full bg-[#e8c14d] px-8 py-3.5 text-sm font-semibold text-[#0a1424] shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#edcb66]"
          >
            {t("careerCtaBusiness")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
          <Link
            href="/courses"
            className="group inline-flex min-w-[11rem] items-center justify-center gap-2 rounded-full bg-[#2f6fe8] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-[#3d7bf2]"
          >
            {t("careerCtaHealthcare")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
