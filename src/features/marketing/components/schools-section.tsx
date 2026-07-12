import { getTranslations } from "next-intl/server";
import {
  BadgeCheck, Building2, HeartPulse, ShieldPlus, Users, UsersRound,
  Megaphone, Smartphone, Cpu, BarChart3, Award, ShieldAlert, ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";

/** Healthcare-only "schools" (specialties) — each is a future SEO landing page. */
const SCHOOLS: { icon: LucideIcon; key: string }[] = [
  { icon: BadgeCheck, key: "schoolQuality" },
  { icon: Building2, key: "schoolHospitalMgmt" },
  { icon: HeartPulse, key: "schoolPatientSafety" },
  { icon: ShieldPlus, key: "schoolInfection" },
  { icon: Users, key: "schoolLeadership" },
  { icon: UsersRound, key: "schoolHr" },
  { icon: Megaphone, key: "schoolMarketing" },
  { icon: Smartphone, key: "schoolDigital" },
  { icon: Cpu, key: "schoolAi" },
  { icon: BarChart3, key: "schoolData" },
  { icon: Award, key: "schoolAccreditation" },
  { icon: ShieldAlert, key: "schoolRisk" },
];

export async function SchoolsSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{t("schoolsTitle")}</h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t("schoolsSubtitle")}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {SCHOOLS.map((sc) => (
          <Link
            key={sc.key}
            href="/courses"
            className="group flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-md"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15 transition-colors group-hover:bg-[#0b3fa8] group-hover:text-white">
              <sc.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1 font-heading text-sm font-bold leading-snug text-[#0a2f7a]">{t(sc.key)}</span>
            <ArrowRight className="size-4 shrink-0 text-[#0b3fa8]/50 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
