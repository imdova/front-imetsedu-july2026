import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  Stethoscope,
  Globe2,
  MonitorPlay,
  Briefcase,
  Languages,
  Award,
  type LucideIcon,
} from "lucide-react";

const FACULTY_IMAGE =
  "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&h=1400&fit=crop&q=80";

const VALUE_ITEMS: { icon: LucideIcon; titleKey: string; descKey: string }[] = [
  { icon: Stethoscope, titleKey: "feature1Title", descKey: "feature1Desc" },
  { icon: Globe2, titleKey: "feature2Title", descKey: "feature2Desc" },
  { icon: MonitorPlay, titleKey: "feature3Title", descKey: "feature3Desc" },
  { icon: Briefcase, titleKey: "feature4Title", descKey: "feature4Desc" },
  { icon: Languages, titleKey: "feature5Title", descKey: "feature5Desc" },
  { icon: Award, titleKey: "feature6Title", descKey: "feature6Desc" },
];

/**
 * Why Choose IMETS — large split layout: real faculty photography on one side,
 * value-proposition cards on the other.
 */
export async function WhyChooseImetsSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-white to-blue-50/50">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:max-w-xl lg:text-start">
          <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
            {t("whyTitle")}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {t("whySubtitle")}
          </p>
        </div>

        <div className="mt-10 grid items-stretch gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
          {/* Left — real faculty illustration / photo */}
          <div className="relative min-h-[360px] overflow-hidden rounded-3xl shadow-xl ring-1 ring-[#0b3fa8]/15 sm:min-h-[440px] lg:min-h-full">
            <Image
              src={FACULTY_IMAGE}
              alt={t("whyFacultyAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051a4a]/90 via-[#0b3fa8]/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f4c430]">
                {t("whyFacultyLabel")}
              </p>
              <p className="mt-2 max-w-sm font-heading text-xl font-bold leading-snug text-white sm:text-2xl">
                {t("whyFacultyCaption")}
              </p>
            </div>
          </div>

          {/* Right — value cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {VALUE_ITEMS.map((item) => (
              <article
                key={item.titleKey}
                className="group flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0b3fa8]/35 hover:shadow-md sm:p-6"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15 transition-transform group-hover:scale-105">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-heading text-base font-bold text-[#0a2f7a]">
                  {t(item.titleKey)}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-600">
                  {t(item.descKey)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
