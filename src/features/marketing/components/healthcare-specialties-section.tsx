import { getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  Building2,
  HeartPulse,
  UsersRound,
  Users,
  Megaphone,
  Smartphone,
  Scale,
  Award,
  ShieldAlert,
  Cpu,
  Database,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";

/** Explore Healthcare Specialties — SEO-friendly specialty grid. */
const SPECIALTIES: { icon: LucideIcon; key: string }[] = [
  { icon: BadgeCheck, key: "specQuality" },
  { icon: Building2, key: "specHospitalMgmt" },
  { icon: HeartPulse, key: "specPatientSafety" },
  { icon: Users, key: "specLeadership" },
  { icon: UsersRound, key: "specHr" },
  { icon: Megaphone, key: "specMarketing" },
  { icon: Smartphone, key: "specDigital" },
  { icon: Scale, key: "specGovernance" },
  { icon: Award, key: "specAccreditation" },
  { icon: ShieldAlert, key: "specRisk" },
  { icon: Cpu, key: "specAi" },
  { icon: Database, key: "specInformatics" },
];

export async function HealthcareSpecialtiesSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-blue-50/70 to-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
            {t("specialtiesTitle")}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {t("specialtiesSubtitle")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SPECIALTIES.map((item) => (
            <Link
              key={item.key}
              href="/courses"
              className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-md sm:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15 transition-colors group-hover:bg-[#0b3fa8] group-hover:text-white">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 font-heading text-sm font-bold leading-snug text-[#0a2f7a] sm:text-[15px]">
                {t(item.key)}
              </span>
              <ArrowRight className="size-4 shrink-0 text-[#0b3fa8]/40 transition-transform group-hover:translate-x-0.5 group-hover:text-[#0b3fa8] rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
