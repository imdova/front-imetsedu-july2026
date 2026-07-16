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
    <section className="relative overflow-hidden border-y border-[#e8c14d]/30">
      {/* Modern golden wash — warm cream → champagne → soft amber */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fffdf7] via-[#fef6e4] to-[#f5e6c8]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(244,196,48,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, rgba(212,160,18,0.2), transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-8 size-72 rounded-full bg-[#f4c430]/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-4 size-64 rounded-full bg-amber-400/20 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9a7209]">
            {t("specialtiesLabel")}
          </p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
            {t("specialtiesTitle")}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-[#3d4f6f]">
            {t("specialtiesSubtitle")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SPECIALTIES.map((item) => (
            <Link
              key={item.key}
              href="/courses"
              className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-[#f4c430]/25 bg-white/85 p-4 shadow-sm shadow-amber-900/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#d4a012]/55 hover:bg-white hover:shadow-lg hover:shadow-amber-900/10 sm:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#fef3d4] to-[#f4c430]/30 text-[#9a7209] ring-1 ring-[#f4c430]/35 transition-all group-hover:from-[#f4c430] group-hover:to-[#e0b020] group-hover:text-[#051a4a] group-hover:ring-[#d4a012]/50">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 font-heading text-sm font-bold leading-snug text-[#0a2f7a] sm:text-[15px]">
                {t(item.key)}
              </span>
              <ArrowRight className="size-4 shrink-0 text-[#c9a227]/60 transition-transform group-hover:translate-x-0.5 group-hover:text-[#9a7209] rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
