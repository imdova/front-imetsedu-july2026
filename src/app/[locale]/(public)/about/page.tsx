import type { Metadata } from "next";
import {
  ArrowRight, Award, ShieldCheck, Lightbulb, Target, GraduationCap, Users,
  Stethoscope, Globe2, Briefcase, MonitorPlay, ClipboardCheck, UsersRound, Building2,
  BadgeCheck, BookOpen, TrendingUp, Rocket, Quote, MapPin, FlaskConical, Landmark,
  CalendarClock, Sparkles, Handshake, Trophy, type LucideIcon,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { staticPageMeta } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { CountUp } from "@/features/marketing/components/count-up";
import { HealthcareFacultySection } from "@/features/marketing/components/healthcare-faculty-section";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return staticPageMeta({ title: t("metaTitle"), description: t("metaDesc"), path: "/about", locale });
}

const BLUE_GRAD = "bg-[radial-gradient(130%_130%_at_15%_0%,#1e5fd0_0%,#0b3fa8_45%,#071d4a_100%)]";

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const values: { icon: LucideIcon; key: string }[] = [
    { icon: Award, key: "valExcellence" }, { icon: ShieldCheck, key: "valIntegrity" },
    { icon: Lightbulb, key: "valInnovation" }, { icon: Target, key: "valImpact" },
    { icon: GraduationCap, key: "valLifelong" }, { icon: Users, key: "valCommunity" },
  ];
  const why: { icon: LucideIcon; key: string }[] = [
    { icon: Stethoscope, key: "whyExperts" }, { icon: Globe2, key: "whyStandards" },
    { icon: Briefcase, key: "whyCareer" }, { icon: MonitorPlay, key: "whyFlexible" },
    { icon: ClipboardCheck, key: "whyPractical" }, { icon: UsersRound, key: "whyCommunity" },
  ];
  const numbers = [
    { value: "18,000+", key: "numPros" }, { value: "64+", key: "numPrograms" },
    { value: "38+", key: "numFaculty" }, { value: "15+", key: "numCountries" },
    { value: "250+", key: "numSessions" }, { value: "4.9★", key: "numSatisfaction" },
  ];
  const timeline = [
    { year: "2018", key: "tl2018" }, { year: "2020", key: "tl2020" }, { year: "2022", key: "tl2022" },
    { year: "2024", key: "tl2024" }, { year: "2026", key: "tl2026" }, { year: "2030", key: "tl2030" },
  ];
  const approach: { icon: LucideIcon; key: string }[] = [
    { icon: BookOpen, key: "appLearn" }, { icon: FlaskConical, key: "appPractice" },
    { icon: Users, key: "appLead" }, { icon: TrendingUp, key: "appTransform" },
  ];
  const leadership = ["leadCeo", "leadAcademic", "leadMedical", "leadEducation", "leadSuccess"];
  const partners: { icon: LucideIcon; key: string }[] = [
    { icon: Building2, key: "partHospitals" }, { icon: GraduationCap, key: "partUniversities" },
    { icon: BadgeCheck, key: "partOrgs" }, { icon: Briefcase, key: "partCompanies" },
    { icon: Award, key: "partAccreditation" },
  ];
  const future: { icon: LucideIcon; key: string }[] = [
    { icon: FlaskConical, key: "futResearch" }, { icon: Landmark, key: "futConferences" },
    { icon: Briefcase, key: "futCareer" }, { icon: Users, key: "futCommunity" },
    { icon: Sparkles, key: "futDigital" }, { icon: Handshake, key: "futPartnerships" },
    { icon: GraduationCap, key: "futScholarships" }, { icon: Trophy, key: "futLeadership" },
  ];
  const countries = ["Egypt", "Saudi Arabia", "UAE", "Qatar", "Kuwait", "Oman", "Jordan", "Iraq", "Libya", "Sudan"];

  return (
    <div className="bg-white text-slate-800">
      {/* 1. Hero */}
      <section className={cn("relative overflow-hidden text-white", BLUE_GRAD)}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4c430]">{t("heroLabel")}</p>
          <h1 className="mt-3 text-balance font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{t("heroTitle")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-white/80">{t("heroSubtitle")}</p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-1.5 bg-[#f4c430] text-[#051a4a] hover:bg-[#e0b020]">
              <Link href="/courses">{t("ctaPrograms")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1.5 border-white/40 bg-white/5 text-white hover:bg-white/15">
              <Link href="/instructors">{t("ctaFaculty")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Our Story */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">{t("storyTitle")}</h2>
        <div className="mt-5 space-y-4 text-lg leading-relaxed text-slate-600">
          <p>{t("storyP1")}</p>
          <p className="font-semibold text-[#0a2f7a]">{t("storyP2")}</p>
          <p><span className="font-semibold text-[#0a2f7a]">{t("storyMissionLead")} </span>{t("storyMission")}</p>
          <p>{t("storyP3")}</p>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="border-y border-blue-100 bg-blue-50/50">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          {[
            { label: t("missionLabel"), text: t("mission"), icon: Target },
            { label: t("visionLabel"), text: t("vision"), icon: Rocket },
          ].map((b) => (
            <div key={b.label} className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
              <span className="grid size-12 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8]"><b.icon className="size-6" /></span>
              <h2 className="mt-4 font-heading text-xl font-bold text-[#0a2f7a]">{b.label}</h2>
              <p className="mt-2 text-base leading-relaxed text-slate-600">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline — Our Journey */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">{t("journeyTitle")}</h2>
          <p className="mt-3 text-muted-foreground">{t("journeySubtitle")}</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {timeline.map((m) => (
            <li key={m.year} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[#0b3fa8]"><CalendarClock className="size-4" /><span className="font-heading text-xl font-extrabold tabular-nums">{m.year}</span></div>
              <p className="mt-1.5 text-sm font-medium text-slate-600">{t(m.key)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Values */}
      <section className="border-y border-blue-100 bg-blue-50/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Heading center title={t("valuesTitle")} subtitle={t("valuesSubtitle")} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <Card key={v.key} icon={v.icon} title={t(`${v.key}Title`)} text={t(`${v.key}Text`)} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Why IMETS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Heading center title={t("whyTitle")} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {why.map((w) => (
            <Card key={w.key} icon={w.icon} title={t(`${w.key}Title`)} text={t(`${w.key}Text`)} />
          ))}
        </div>
      </section>

      {/* 6. By the Numbers */}
      <section className={cn("text-white", BLUE_GRAD)}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-bold tracking-tight sm:text-3xl">{t("numbersTitle")}</h2>
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {numbers.map((n) => (
              <div key={n.key} className="text-center">
                <p className="font-heading text-3xl font-extrabold tabular-nums text-[#f4c430] sm:text-4xl"><CountUp value={n.value} /></p>
                <p className="mt-1 text-sm text-white/70">{t(n.key)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Educational Approach */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Heading center title={t("approachTitle")} subtitle={t("approachSubtitle")} />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {approach.map((a, i) => (
            <div key={a.key} className="relative flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl bg-[#0b3fa8] text-white"><a.icon className="size-5" /></span>
                <span className="font-heading text-2xl font-extrabold text-[#0b3fa8]/25">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-[#0a2f7a]">{t(`${a.key}Title`)}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t(`${a.key}Text`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Leadership */}
      <section className="border-y border-blue-100 bg-blue-50/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Heading center title={t("leadershipTitle")} subtitle={t("leadershipSubtitle")} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {leadership.map((key) => (
              <div key={key} className="rounded-2xl border border-blue-100 bg-white p-5 text-center shadow-sm">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#0b3fa8]/10 text-[#0b3fa8]"><Users className="size-7" /></span>
                <p className="mt-3 font-heading text-sm font-bold text-[#0a2f7a]">{t(`${key}Name`)}</p>
                <p className="text-xs font-semibold text-[#0b3fa8]">{t(`${key}Role`)}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">{t("leadershipNote")}</p>
        </div>
      </section>

      {/* 8. Faculty (reused) */}
      <HealthcareFacultySection />

      {/* 11. Partners */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Heading center title={t("partnersTitle")} subtitle={t("partnersSubtitle")} />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {partners.map((p) => (
            <Card key={p.key} icon={p.icon} title={t(`${p.key}Title`)} text={t(`${p.key}Text`)} />
          ))}
        </div>
      </section>

      {/* Countries / reach */}
      <section className="border-y border-blue-100 bg-blue-50/50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <Heading center title={t("reachTitle")} subtitle={t("reachSubtitle")} />
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {countries.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-[#0a2f7a] shadow-sm">
                <MapPin className="size-4 text-[#0b3fa8]" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Corporate Training */}
      <section className="mx-auto w-full max-w-[100rem] px-4 py-10 sm:px-6 lg:px-8">
        <div className={cn("mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-12 text-center text-white sm:px-10 sm:py-14 lg:px-14", BLUE_GRAD)}>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{t("corporateTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75">{t("corporateText")}</p>
          <Button asChild size="lg" className="mt-8 gap-1.5 bg-[#f4c430] text-[#051a4a] hover:bg-[#e0b020]">
            <Link href="/contact">{t("corporateCta")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
          </Button>
        </div>
      </section>

      {/* 13. The Future of IMETS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Heading center title={t("futureTitle")} subtitle={t("futureSubtitle")} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {future.map((f) => (
            <div key={f.key} className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8]"><f.icon className="size-5" /></span>
              <span className="font-heading text-sm font-bold text-[#0a2f7a]">{t(f.key)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 14. Letter from the Founder */}
      <section className="border-y border-blue-100 bg-blue-50/50">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
          <div className="mx-auto text-center">
            <span className="mx-auto grid size-28 place-items-center rounded-2xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15"><Users className="size-12" /></span>
            <p className="mt-3 font-heading text-sm font-bold text-[#0a2f7a]">{t("founderName")}</p>
            <p className="text-xs font-semibold text-[#0b3fa8]">{t("founderRole")}</p>
          </div>
          <div>
            <Quote className="size-8 text-[#0b3fa8]/25" />
            <h2 className="mt-2 font-heading text-xl font-bold text-[#0a2f7a]">{t("founderTitle")}</h2>
            <p className="mt-3 text-lg italic leading-relaxed text-slate-600">“{t("founderQuote")}”</p>
          </div>
        </div>
      </section>

      {/* Our Impact on Healthcare */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <span className="inline-grid size-12 place-items-center rounded-2xl bg-[#f4c430]/20 text-[#b8860b]"><Sparkles className="size-6" /></span>
        <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">{t("impactTitle")}</h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{t("impactText")}</p>
      </section>

      {/* 15. Final CTA */}
      <section className="mx-auto w-full max-w-[100rem] px-4 pb-16 pt-2 sm:px-6 lg:px-8">
        <div className={cn("mx-auto max-w-7xl overflow-hidden rounded-[2rem] px-6 py-14 text-center text-white sm:px-10 sm:py-16 lg:px-14", BLUE_GRAD)}>
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{t("finalTitle")}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/75">{t("finalText")}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-1.5 bg-[#f4c430] text-[#051a4a] hover:bg-[#e0b020]">
              <Link href="/courses">{t("ctaPrograms")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/5 text-white hover:bg-white/15">
              <Link href="/contact">{t("ctaAdvisor")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Heading({ title, subtitle, center }: { title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{title}</h2>
      {subtitle && <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Card({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-md">
      <span className="grid size-11 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15"><Icon className="size-5" /></span>
      <h3 className="mt-4 font-heading text-base font-bold text-[#0a2f7a]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
    </div>
  );
}
