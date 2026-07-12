import { getTranslations } from "next-intl/server";
import {
  UserPlus, Compass, MonitorPlay, FileText, Target, Award, Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/** "What happens after you enroll?" — a single, big learning-journey timeline. */
const STEPS: { icon: LucideIcon; key: string }[] = [
  { icon: UserPlus, key: "lj1" },
  { icon: Compass, key: "lj2" },
  { icon: MonitorPlay, key: "lj3" },
  { icon: FileText, key: "lj4" },
  { icon: Target, key: "lj5" },
  { icon: Award, key: "lj6" },
  { icon: Users, key: "lj7" },
];

export async function LearningJourneySection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-blue-50/80 to-white">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3fa8]">{t("ljLabel")}</p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{t("ljTitle")}</h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t("ljSubtitle")}</p>
        </div>

        <ol>
          {STEPS.map((s, i) => {
            const last = i === STEPS.length - 1;
            return (
              <li key={s.key} className="flex gap-4 sm:gap-5">
                {/* Node + connector rail */}
                <div className="flex flex-col items-center">
                  <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-[#0b3fa8] text-white shadow-sm ring-4 ring-blue-50">
                    <s.icon className="size-5" />
                    <span className="absolute -end-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#f4c430] text-[10px] font-bold text-[#051a4a] ring-2 ring-white">
                      {i + 1}
                    </span>
                  </span>
                  {!last && <span className="my-1 w-0.5 flex-1 rounded-full bg-[#0b3fa8]/15" />}
                </div>

                {/* Content card */}
                <div className={cn("flex-1", last ? "pb-0" : "pb-6")}>
                  <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0b3fa8]/40 hover:shadow-md">
                    <h3 className="font-heading text-base font-bold text-[#0a2f7a]">{t(`${s.key}Title`)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{t(`${s.key}Desc`)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
