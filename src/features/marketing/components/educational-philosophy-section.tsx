import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  BookOpen,
  FlaskConical,
  Users,
  TrendingUp,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

const PHILOSOPHY_IMAGE =
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=900&h=700&fit=crop&q=80";

/** Our Educational Philosophy — Learn → Practice → Lead → Transform. */
const STEPS: { icon: LucideIcon; key: string }[] = [
  { icon: BookOpen, key: "philLearn" },
  { icon: FlaskConical, key: "philPractice" },
  { icon: Users, key: "philLead" },
  { icon: TrendingUp, key: "philTransform" },
];

export async function EducationalPhilosophySection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="relative overflow-hidden border-y border-white/10 marketing-gradient-bg">
      <div
        className="pointer-events-none absolute inset-0 marketing-hero-grid opacity-35"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/4 size-80 rounded-full bg-sky-400/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 size-96 rounded-full bg-[#1e6ef0]/30 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_min(100%,320px)] lg:gap-12">
          <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4c430]">
              {t("philLabel")}
            </p>
            <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[2rem]">
              {t("philTitle")}
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-white/75">
              {t("philSubtitle")}
            </p>
          </div>

          <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-black/30 ring-1 ring-white/10 lg:block">
            <Image
              src={PHILOSOPHY_IMAGE}
              alt={t("philImageAlt")}
              fill
              sizes="320px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#051a4a]/80 via-transparent to-transparent" />
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:gap-3">
          {STEPS.map((s, i) => (
            <div key={s.key} className="contents">
              <article className="flex flex-col rounded-2xl border border-white/15 bg-white/10 p-6 text-center shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:-translate-y-1 hover:border-[#f4c430]/40 hover:bg-white/15 sm:p-7">
                <span className="font-heading text-3xl font-extrabold tabular-nums text-[#f4c430]/90">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mx-auto mt-4 grid size-16 place-items-center rounded-2xl bg-[#f4c430] text-[#051a4a] shadow-lg shadow-black/25 ring-2 ring-white/20">
                  <s.icon className="size-8" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-white sm:text-xl">
                  {t(`${s.key}Title`)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">
                  {t(`${s.key}Text`)}
                </p>
              </article>
              {i < STEPS.length - 1 && (
                <div className="flex items-center justify-center py-1 lg:py-0">
                  <ArrowRight className="size-6 rotate-90 text-[#f4c430]/70 lg:rotate-0 rtl:lg:rotate-180" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
