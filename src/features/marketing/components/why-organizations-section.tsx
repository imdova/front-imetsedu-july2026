import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  SlidersHorizontal,
  ShieldCheck,
  BarChart3,
  Stethoscope,
  MonitorPlay,
  Languages,
  Building2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { PARTNER_IMAGES } from "@/features/marketing/lib/partner-images";

/** B2B trust section — why hospitals & healthcare organizations partner with IMETS. */
const REASONS: { icon: LucideIcon; key: string }[] = [
  { icon: SlidersHorizontal, key: "orgWhyCustom" },
  { icon: ShieldCheck, key: "orgWhyAccredit" },
  { icon: BarChart3, key: "orgWhyMeasure" },
  { icon: Stethoscope, key: "orgWhyFaculty" },
  { icon: MonitorPlay, key: "orgWhyFlexible" },
  { icon: Languages, key: "orgWhyBilingual" },
];

const HOSPITALS = [
  "King Faisal Specialist Hospital",
  "Cleveland Clinic Abu Dhabi",
  "Jordan University Hospital",
  "Mediclinic Middle East",
];

export async function WhyOrganizationsSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-t border-blue-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3fa8]">
            {t("orgWhyLabel")}
          </p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
            {t("orgWhyTitle")}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {t("orgWhySubtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r) => (
            <div
              key={r.key}
              className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-md"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15">
                <r.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold text-[#0a2f7a]">
                {t(`${r.key}Title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {t(`${r.key}Text`)}
              </p>
            </div>
          ))}
        </div>

        {/* Hospitals trust strip */}
        <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 sm:p-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-[#0b3fa8]">
            {t("orgWhyTrust")}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HOSPITALS.map((h) => {
              const image = PARTNER_IMAGES[h];

              return (
                <article
                  key={h}
                  className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {image ? (
                    <div className="relative aspect-[16/10] w-full bg-slate-50">
                      <Image
                        src={image.src}
                        alt={h}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
                        className={
                          image.objectFit === "contain"
                            ? "object-contain p-4"
                            : "object-cover"
                        }
                        style={
                          image.objectPosition
                            ? { objectPosition: image.objectPosition }
                            : undefined
                        }
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                      <Building2 className="size-10 text-[#0b3fa8]/30" aria-hidden />
                    </div>
                  )}
                  <p className="border-t border-blue-50 px-3 py-3 text-center text-xs font-semibold leading-snug text-[#0a2f7a] sm:text-sm">
                    {h}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0b3fa8] px-7 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#0a327f]"
          >
            {t("orgsCta")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
