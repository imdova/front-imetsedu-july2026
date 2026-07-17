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
    <section className="relative overflow-hidden border-y border-[#8a6a12]/50">
      {/* Darker premium gold — bronze → antique gold → deep champagne */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#3d2e0a] via-[#5c4512] to-[#2a1f08]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 55% at 15% 10%, rgba(212,160,18,0.45), transparent 55%), radial-gradient(ellipse 55% 45% at 85% 90%, rgba(244,196,48,0.22), transparent 50%), radial-gradient(ellipse 40% 30% at 50% 50%, rgba(139,105,20,0.35), transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-0 size-80 rounded-full bg-[#d4a012]/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 size-72 rounded-full bg-[#f4c430]/15 blur-3xl"
        aria-hidden
      />
      {/* Subtle premium grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,220,140,0.5) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f4c430]">
            {t("specialtiesLabel")}
          </p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#fff8e7] sm:text-3xl lg:text-[2rem]">
            {t("specialtiesTitle")}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-[#e8d5a3]/90">
            {t("specialtiesSubtitle")}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SPECIALTIES.map((item) => (
            <Link
              key={item.key}
              href="/courses"
              className="group flex min-h-[88px] items-center gap-3 rounded-2xl border border-[#0b3fa8]/15 bg-gradient-to-br from-white via-white to-[#fef6e4]/90 p-4 shadow-md shadow-[#0a2f7a]/15 ring-1 ring-[#f4c430]/20 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/35 hover:from-white hover:to-[#fef3d4] hover:shadow-lg hover:shadow-[#0a2f7a]/20 hover:ring-[#f4c430]/45 sm:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#0b3fa8] to-[#0a2f7a] text-[#f4c430] shadow-sm ring-1 ring-[#f4c430]/35 transition-all group-hover:from-[#0a2f7a] group-hover:to-[#051a4a] group-hover:text-[#ffe08a] group-hover:ring-[#f4c430]/60">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1 font-heading text-sm font-bold leading-snug text-[#0a2f7a] sm:text-[15px]">
                {t(item.key)}
              </span>
              <ArrowRight className="size-4 shrink-0 text-[#0b3fa8]/45 transition-transform group-hover:translate-x-0.5 group-hover:text-[#d4a012] rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
