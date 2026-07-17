import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import {
  UserPlus,
  Compass,
  MonitorPlay,
  ClipboardCheck,
  Target,
  Award,
  Users,
  type LucideIcon,
} from "lucide-react";

const STEPS: { icon: LucideIcon; key: string }[] = [
  { icon: UserPlus, key: "lj1" },
  { icon: Compass, key: "lj2" },
  { icon: MonitorPlay, key: "lj3" },
  { icon: ClipboardCheck, key: "lj4" },
  { icon: Target, key: "lj5" },
  { icon: Award, key: "lj6" },
  { icon: Users, key: "lj7" },
];

/**
 * Home "Your Learning Journey" — English uses the finished marketing
 * infographic; Arabic uses localized step cards.
 */
export async function LearningJourneySection() {
  const t = await getTranslations("Marketing");
  const locale = await getLocale();
  const useDesignArt = locale !== "ar";

  return (
    <section className="overflow-hidden border-y border-blue-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
        {useDesignArt ? (
          <>
            <div className="relative mx-auto w-full max-w-6xl">
              <Image
                src="/learning-journey/learning-journey-v2.png"
                alt={t("ljTitle")}
                width={1536}
                height={768}
                priority
                sizes="(max-width:1024px) 100vw, 1152px"
                className="h-auto w-full object-contain"
              />
            </div>
            <div className="sr-only">
              <h2>{t("ljTitle")}</h2>
              <p>{t("ljSubtitle")}</p>
              <ol>
                {STEPS.map((s) => (
                  <li key={s.key}>
                    <strong>{t(`${s.key}Title`)}</strong> — {t(`${s.key}Desc`)}
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto max-w-xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3fa8]">
                {t("ljLabel")}
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">
                {t("ljTitle")}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {t("ljSubtitle")}
              </p>
            </div>
            <ol className="mx-auto mt-10 max-w-xl space-y-3.5" dir="rtl">
              {STEPS.map((s, i) => (
                <li
                  key={s.key}
                  className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"
                >
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-full border-2 border-sky-300 bg-sky-50 text-[#0b3fa8]">
                    <s.icon className="size-5" strokeWidth={1.75} />
                    <span className="absolute -end-1 -top-1 grid size-5 place-items-center rounded-full bg-[#0a2f7a] text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <div className="min-w-0 pt-0.5 text-start">
                    <h3 className="font-heading text-base font-bold text-[#0a2f7a]">
                      {t(`${s.key}Title`)}
                    </h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      {t(`${s.key}Desc`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
