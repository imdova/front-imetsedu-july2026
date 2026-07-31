import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import {
  ArrowLeft, Sparkles, CheckCircle2, Users, Star,
  MessageCircle, GraduationCap, HelpCircle,
  PlayCircle, BadgeCheck, UserCheck, Clock3, CalendarClock,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CphqLectureForm } from "@/features/marketing/components/cphq-lecture-form";
import { CphqAnalytics } from "@/features/marketing/components/cphq-analytics";
import { RegistrationCountdown } from "@/features/marketing/components/registration-countdown";
import { LandingHeroVideo } from "@/features/marketing/components/landing-hero-video";

/**
 * Shared presentation for the Arabic free-lecture landing pages. Each course has
 * its OWN route + bespoke `content` (copy, agenda, audience, FAQ, speaker role);
 * this component only carries the funnel chrome + generic IMETS-level social
 * proof that is genuinely the same across courses. Same design/layout/funnel as
 * the original /lp/free-lecture-cphq-arab.
 */
export interface ArabLandingContent {
  /** Tracking + form config */
  path: string;
  courseName: string;
  countdownKey: string;
  whatsappNumber: string;
  thankYouPath: string;
  /** Speaker portrait (role-labelled, not name-labelled). */
  portrait: string;

  /** Hero */
  heroTitle: ReactNode;            // full styled <h1> content
  heroLead: string;                // "احضر محاضرة مجانية تساعدك على معرفة:"
  heroBullets: string[];

  /** Trust / accreditation badges (course-specific) */
  trust: { icon: LucideIcon; label: string }[];

  /** FOMO "last free lecture" funnel (defaults provided) */
  lastCohort?: { value: string; label: string; icon: LucideIcon }[];
  lastCohortNote?: string;

  /** Pain points */
  painsEyebrow: string; painsTitle: string;
  pains: { icon: LucideIcon; t: string; b: string }[];
  painsFooter: string;

  /** Outcomes */
  outcomesTitle: string; outcomesSub: string;
  outcomes: { icon: LucideIcon; t: string; b: string }[];

  /** Agenda */
  agendaTitle: string;
  agenda: { icon: LucideIcon; t: string; b: string }[];

  /** Audience */
  audienceTitle: string;
  audience: { emoji: string; label: string }[];

  /** Career benefits */
  benefitsEyebrow: string; benefitsTitle: string; benefitsSub: string;
  benefits: { icon: LucideIcon; ar: string; en: string }[];

  /** Speaker */
  speakerBadge: string;            // "محاضرك · CPHQ Certified"
  speakerRole: string;             // portrait caption top
  speakerFaculty: string;          // portrait caption bottom
  speakerTitle: string;
  speakerBio: string;
  speakerTrainedLine: string;
  speakerPoints: string[];

  /** Testimonials (site's first-name + city style) */
  testimonials: { quote: string; name: string; role: string }[];

  /** FAQ */
  faqs: { q: string; a: string }[];

  /** Final CTA + sticky bar */
  finalTitle: string; finalSub: string; finalCtaLabel: string;
  heroCtaLabel: string;
  stickyLabel: string;
}

/* ── Reusable content the pages can spread + lightly customise ── */

/** Generic logistics FAQ — identical intent across every free lecture. */
export const COMMON_ARAB_FAQS = [
  { q: "هل سيتم إرسال رابط المحاضرة عبر الواتساب؟", a: "نعم — يصلك رابط المحاضرة والتذكيرات على الواتساب والبريد الإلكتروني قبل موعدها، فلا تقلق بشأن نسيان الموعد." },
  { q: "هل المحاضرة مجانية فعلًا؟", a: "نعم، مجانية 100% — لكن الأماكن محدودة لضمان جودة التفاعل وجلسة الأسئلة." },
  { q: "هل يوجد بث مباشر؟", a: "نعم، المحاضرة مباشرة عبر الإنترنت على Zoom في موعد محدد — وليست فيديو مسجّلًا." },
  { q: "هل المحاضرة مسجّلة؟ وهل يمكن الرجوع إليها؟", a: "نعم، نسجّل المحاضرة ويصل المشتركين رابط التسجيل بعدها للمراجعة." },
  { q: "هل يمكنني طرح الأسئلة؟", a: "بالتأكيد — هناك جلسة أسئلة مباشرة تطرح فيها على الخبير أي سؤال." },
  { q: "هل توجد شهادة حضور؟", a: "نعم، كل مشترك يحصل على Certificate of Attendance من IMETS." },
  { q: "بأي لغة تُقدَّم المحاضرة؟", a: "الشرح بالعربية الميسّرة مع المصطلحات المتخصّصة بالإنجليزية كما تُستخدم في المجال." },
  { q: "هل أحتاج خبرة سابقة؟", a: "لا. مناسبة للمبتدئين ولأصحاب الخبرة الراغبين في تطوير مهاراتهم وتوثيقها بشهادة." },
];

/** Audience chips for clinical / healthcare programs. */
export const MEDICAL_AUDIENCE = [
  { emoji: "👨‍⚕️", label: "الأطباء / Physicians" },
  { emoji: "💊", label: "الصيادلة / Pharmacists" },
  { emoji: "🩺", label: "هيئة التمريض / Nurses" },
  { emoji: "📋", label: "أخصائيو الجودة / Quality" },
  { emoji: "🎓", label: "الخريجون الجدد / Fresh Grads" },
  { emoji: "🏥", label: "العاملون في المستشفيات" },
];

/** Audience chips for management / administrative programs. */
export const MGMT_AUDIENCE = [
  { emoji: "🏥", label: "مدراء المستشفيات والمراكز" },
  { emoji: "📊", label: "الإداريون / Administrators" },
  { emoji: "🧑‍💼", label: "رؤساء الأقسام والوحدات" },
  { emoji: "🎓", label: "الخريجون الجدد / Fresh Grads" },
  { emoji: "🚀", label: "الطامحون للترقّي الإداري" },
  { emoji: "🩺", label: "الكوادر الصحية المتجهة للإدارة" },
];

/* Generic IMETS-level social proof — genuinely shared across every course. */
const STATS = [
  { value: "17,000+", label: "Healthcare Professionals" },
  { value: "4.9★", label: "Average Rating" },
  { value: "200+", label: "Live Sessions" },
  { value: "12+", label: "Years Experience" },
];
const DEFAULT_LAST_COHORT = [
  { value: "430", label: "شخصًا سجّلوا", icon: UserCheck },
  { value: "312", label: "حضروا المحاضرة", icon: Users },
  { value: "94", label: "التحقوا بالبرنامج", icon: GraduationCap },
];
const SPEAKER_CHIPS = [
  { icon: PlayCircle, t: "شرح تطبيقي" },
  { icon: MessageCircle, t: "بالعربية" },
  { icon: Clock3, t: "90 دقيقة مركّزة" },
];

export function FreeLectureArabLanding({ content: c }: { content: ArabLandingContent }) {
  const lastCohort = c.lastCohort ?? DEFAULT_LAST_COHORT;
  return (
    <div dir="rtl" className="bg-background text-foreground">
      <CphqAnalytics contentName={c.courseName} />

      {/* ── 1 · Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[#082a6b] text-primary-foreground">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 size-72 rounded-full bg-[#f4c430]/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="size-3.5" /> 🎓 محاضرة مجانية عبر الإنترنت · Live Session
            </span>
            <h1 className="text-2xl font-extrabold leading-snug sm:text-[1.75rem] lg:text-[2rem]">{c.heroTitle}</h1>
            <p className="text-base font-medium text-white/90">{c.heroLead}</p>
            <ul className="space-y-2">
              {c.heroBullets.map((b) => (
                <li key={b} className="flex items-center gap-2 text-[0.95rem] font-medium">
                  <CheckCircle2 className="size-5 shrink-0 text-[#f4c430]" /> {b}
                </li>
              ))}
            </ul>
            <div className="space-y-2.5 pt-1">
              <RegistrationCountdown storageKey={c.countdownKey} />
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" variant="secondary" className="gap-2 bg-[#f4c430] text-[#0a1424] hover:bg-[#f4c430]/90">
                  <a href="#register">{c.heroCtaLabel} <ArrowLeft className="size-4" /></a>
                </Button>
                <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
                  <CalendarClock className="size-4 text-[#f4c430]" /> الأماكن محدودة
                </span>
              </div>
            </div>
            <LandingHeroVideo path={c.path} />
          </div>

          {/* Registration form */}
          <div id="register" className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border/70 bg-card p-1 text-foreground shadow-xl shadow-primary/5">
              <div className="rounded-xl bg-gradient-to-b from-primary/[0.05] to-transparent p-4 sm:p-5">
                <p className="mb-1 text-center text-base font-bold text-primary">احجز مقعدي المجاني الآن</p>
                <p className="mb-4 text-center text-xs text-muted-foreground">خطوتان فقط — ويصلك رابط الحضور على البريد والواتساب</p>
                <CphqLectureForm
                  path={c.path}
                  courseName={c.courseName}
                  whatsappNumber={c.whatsappNumber}
                  thankYouPath={c.thankYouPath}
                  region="Arab"
                  defaultCode="+966"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · Trust ── */}
      <section className="border-y border-border/60 bg-muted/30 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">موثوقون ومعتمدون</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {c.trust.map((tb) => (
              <span key={tb.label} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 text-sm font-medium shadow-sm">
                <tb.icon className="size-4 text-primary" /> {tb.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 · Social proof ── */}
      <section className="bg-card py-4">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="flex text-[#f4c430]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</span>
            4.9/5 من أكثر من 500 تقييم
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="inline-flex items-center gap-2 text-sm font-semibold"><Users className="size-4 text-primary" /> أكثر من 2,000 متخصص صحي حضروا محاضرات IMETS</span>
        </div>
      </section>

      <section className="bg-gradient-to-br from-primary to-[#082a6b] text-primary-foreground">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-extrabold leading-none text-[#f4c430] sm:text-5xl">{s.value}</div>
              <div className="mt-2 text-[11px] font-medium uppercase tracking-wide opacity-80 sm:text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOMO */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl border border-[#f4c430]/40 bg-[#f4c430]/[0.06] p-6">
            <p className="mb-5 text-center text-base font-extrabold text-[#8a6d00]">🔥 نتائج آخر محاضرة مجانية</p>
            <div className="grid grid-cols-3 gap-3">
              {lastCohort.map((cc, i) => (
                <div key={cc.label} className="relative text-center">
                  <cc.icon className="mx-auto mb-1 size-5 text-primary" />
                  <div className="text-2xl font-extrabold sm:text-3xl">{cc.value}</div>
                  <div className="text-xs text-muted-foreground">{cc.label}</div>
                  {i < lastCohort.length - 1 && (
                    <ArrowLeft className="absolute -left-2 top-6 hidden size-4 text-muted-foreground/50 sm:block" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-sm font-medium">{c.lastCohortNote ?? "المقاعد تنفد بسرعة — احجز قبل اكتمال هذه الدفعة."}</p>
          </div>
        </div>
      </section>

      {/* ── 4 · Pains ── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow={c.painsEyebrow} title={c.painsTitle} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.pains.map((p) => (
              <Card key={p.t} className="border-border/70">
                <CardContent className="space-y-2.5 p-5">
                  <span className="grid size-14 place-items-center rounded-2xl bg-rose-50 text-rose-500"><p.icon className="size-7" /></span>
                  <h3 className="text-base font-bold">{p.t}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.b}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl rounded-xl bg-primary/5 p-4 text-center text-sm font-semibold text-primary sm:text-base">{c.painsFooter}</p>
        </div>
      </section>

      {/* ── 5 · Outcomes ── */}
      <Section eyebrow="النتيجة" title={c.outcomesTitle} sub={c.outcomesSub}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {c.outcomes.map((o) => (
            <Card key={o.t} className="border-border/70 transition-shadow hover:shadow-md">
              <CardContent className="space-y-2 p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><o.icon className="size-5" /></span>
                <h3 className="text-base font-bold">{o.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{o.b}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Agenda */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow="أجندة المحاضرة" title={c.agendaTitle} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.agenda.map((a, i) => (
              <Card key={a.t} className="border-border/70">
                <CardContent className="flex gap-3 p-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><a.icon className="size-5" /></span>
                  <div>
                    <div className="text-xs font-bold text-primary">المحور {String(i + 1).padStart(2, "0")}</div>
                    <h3 className="text-base font-bold">{a.t}</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{a.b}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <Section eyebrow="لمن هذه المحاضرة؟" title={c.audienceTitle}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.audience.map((a) => (
            <div key={a.label} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 text-3xl ring-2 ring-primary/10">{a.emoji}</span>
              <span className="text-sm font-semibold">{a.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Career benefits */}
      <section className="bg-gradient-to-b from-primary/[0.04] to-background py-14">
        <div className="mx-auto max-w-4xl px-4">
          <Heading eyebrow={c.benefitsEyebrow} title={c.benefitsTitle} sub={c.benefitsSub} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {c.benefits.map((b) => (
              <div key={b.en} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4">
                <span className="grid size-11 place-items-center rounded-lg bg-[#f4c430]/15 text-[#b8860b]"><b.icon className="size-5" /></span>
                <span>
                  <span className="block text-sm font-bold">{b.ar}</span>
                  <span className="block text-xs font-medium uppercase tracking-wide text-muted-foreground">{b.en}</span>
                </span>
                <CheckCircle2 className="ms-auto size-5 text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 · Speaker ── */}
      <section className="bg-gradient-to-br from-primary to-[#082a6b] py-16 text-primary-foreground">
        <div className="mx-auto max-w-5xl px-4">
          <div className="grid items-center gap-8 lg:grid-cols-[290px_1fr]">
            <div className="mx-auto w-full max-w-[280px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/15 shadow-2xl">
                <Image src={c.portrait} alt={c.speakerRole} fill sizes="280px" loading="lazy" className="object-cover object-top" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-center">
                  <div className="text-sm font-bold text-white">{c.speakerRole}</div>
                  <div className="text-xs text-white/75">{c.speakerFaculty}</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4c430] px-3 py-1 text-xs font-bold text-[#0a1424]"><BadgeCheck className="size-3.5" /> {c.speakerBadge}</span>
              <h2 className="text-2xl font-extrabold sm:text-3xl">{c.speakerTitle}</h2>
              <p className="leading-relaxed text-white/85">{c.speakerBio}</p>
              <p className="flex items-center gap-2 rounded-xl border border-[#f4c430]/40 bg-[#f4c430]/10 px-4 py-2.5 text-sm font-bold text-white">
                <Users className="size-4 shrink-0 text-[#f4c430]" /> {c.speakerTrainedLine}
              </p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {c.speakerPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#f4c430]" /> {p}</li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3 pt-1">
                <SpeakerStat value="12+" label="سنوات خبرة" />
                <SpeakerStat value="5,000+" label="متدرب" />
                <SpeakerStat value="4.9★" label="تقييم" />
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {SPEAKER_CHIPS.map((x) => (
                  <span key={x.t} className="inline-flex items-center gap-1.5 text-xs text-white/80"><x.icon className="size-4 text-[#f4c430]" /> {x.t}</span>
                ))}
              </div>
              <div className="pt-1 text-xl font-extrabold"><span className="text-[#f4c430]">IMETS</span> <span className="text-white/90">Medical School</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7 · Testimonials ── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow="آراء المتدربين" title="أشخاص بدأوا من المحاضرة نفسها" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {c.testimonials.map((t) => (
              <Card key={t.name} className="border-border/70">
                <CardContent className="space-y-3 p-5">
                  <div className="flex gap-0.5 text-[#f4c430]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                  <p className="text-sm leading-relaxed">“{t.quote}”</p>
                  <div className="flex items-center gap-3 pt-1">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">{t.name.replace("د. ", "").trim().charAt(0)}</span>
                    <div>
                      <div className="text-sm font-bold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8 · FAQ ── */}
      <Section eyebrow="أسئلة متكررة" title="هل لديك سؤال؟">
        <div className="mx-auto max-w-3xl space-y-3">
          {c.faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border/70 bg-card p-4">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold marker:content-['']">
                <HelpCircle className="size-4 shrink-0 text-primary" /> {f.q}
              </summary>
              <p className="mt-2 pr-6 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* ── 9 · Final CTA ── */}
      <section className="bg-gradient-to-br from-primary to-[#082a6b] py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-2xl space-y-5 px-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{c.finalTitle}</h2>
          <p className="text-sm opacity-90 sm:text-base">{c.finalSub}</p>
          <div className="flex justify-center"><RegistrationCountdown storageKey={c.countdownKey} /></div>
          <Button asChild size="lg" variant="secondary" className="gap-2 bg-[#f4c430] text-[#0a1424] hover:bg-[#f4c430]/90">
            <a href="#register">{c.finalCtaLabel} <ArrowLeft className="size-4" /></a>
          </Button>
          <div className="flex flex-col items-center gap-1.5 pt-1">
            <span className="flex text-[#f4c430]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-5 fill-current" />)}</span>
            <span className="text-sm font-semibold">انضم إلى أكثر من 17,000 متخصص صحي بدأوا رحلتهم مع IMETS</span>
          </div>
          <p className="inline-flex items-center justify-center gap-1.5 text-xs text-white/80">
            🔒 بياناتك آمنة ولن تتم مشاركتها مع أي جهة.
          </p>
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="h-20 lg:hidden" />
      <div
        dir="rtl"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 shadow-[0_-4px_20px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{c.stickyLabel}</p>
            <p className="flex items-center gap-1.5 text-base font-extrabold text-primary">
              مجانية بالكامل
              <span className="rounded-md bg-[#f4c430]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#8a6d00]">FREE</span>
            </p>
          </div>
          <Button asChild size="lg" className="h-12 shrink-0 gap-1.5 px-6 text-base font-semibold">
            <a href="#register">احجز مقعدي</a>
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Layout helpers ── */
function Section({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children: ReactNode }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Heading eyebrow={eyebrow} title={title} sub={sub} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

function SpeakerStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-center">
      <div className="text-xl font-extrabold text-[#f4c430]">{value}</div>
      <div className="text-[11px] text-white/75">{label}</div>
    </div>
  );
}

function Heading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="text-center">
      <span className="text-sm font-bold uppercase tracking-wide text-primary">{eyebrow}</span>
      <h2 className={cn("mt-1 text-2xl font-extrabold sm:text-3xl")}>{title}</h2>
      {sub && <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{sub}</p>}
    </div>
  );
}
