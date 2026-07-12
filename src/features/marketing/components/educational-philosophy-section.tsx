import { getTranslations } from "next-intl/server";
import { BookOpen, FlaskConical, Users, TrendingUp, ArrowRight, type LucideIcon } from "lucide-react";

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
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3fa8]">{t("philLabel")}</p>
        <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{t("philTitle")}</h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t("philSubtitle")}</p>
      </div>

      <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
        {STEPS.map((s, i) => (
          <div key={s.key} className="contents">
            <div className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-md">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#0b3fa8] text-white shadow-sm"><s.icon className="size-6" /></span>
              <span className="mt-3 font-heading text-2xl font-extrabold text-[#0b3fa8]/20">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 font-heading text-lg font-bold text-[#0a2f7a]">{t(`${s.key}Title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(`${s.key}Text`)}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex items-center justify-center py-1 md:py-0">
                <ArrowRight className="size-5 rotate-90 text-[#0b3fa8]/40 md:rotate-0 rtl:md:rotate-180" />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
