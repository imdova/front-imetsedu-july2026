import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowLeft, Sparkles, CheckCircle2, Users, Star, Award,
  ShieldCheck, MessageCircle, GraduationCap, ClipboardCheck, BookOpen,
  Globe2, TrendingUp, CalendarClock, HelpCircle, Target,
  Briefcase, Wallet, Building2, ArrowUpRight, PlayCircle, FileCheck2,
  HeartCrack, Compass, BadgeCheck, UserCheck, Clock3, ArrowLeftRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CphqLectureForm } from "@/features/marketing/components/cphq-lecture-form";
import { RegistrationCountdown } from "@/features/marketing/components/registration-countdown";
import { LandingHeroVideo } from "@/features/marketing/components/landing-hero-video";

const PATH = "/lp/free-lecture-cphq";
const COURSE = "CPHQ Free Lecture";

export const metadata: Metadata = {
  title: "محاضرة CPHQ المجانية | طريقك لقسم الجودة الصحية — IMETS",
  description:
    "عايز تنتقل لقسم الجودة الصحية بس مش عارف تبدأ منين؟ احضر محاضرة CPHQ المجانية (90 دقيقة) واعرف الطريق الصحيح قبل ما تدفع في أي دورة. مخصوصة للـ Healthcare Professionals في مصر.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك لقسم الجودة الصحية يبدأ من محاضرة CPHQ المجانية",
    description: "90 دقيقة تعرّفك الطريق الصحيح قبل ما تدفع في أي دورة. مجانًا وأونلاين.",
    type: "website",
  },
};

const HERO_BULLETS = [
  "من أين تبدأ في مجال الجودة الصحية",
  "هل شهادة CPHQ مناسبة لك أصلًا؟",
  "كم رواتب المجال في مصر والخليج",
  "كيف تستعد للاختبار وتنجح من أول مرة",
];

const TRUST = [
  { icon: Globe2, label: "منهج مبني على NAHQ" },
  { icon: FileCheck2, label: "اعتماد CME / CPD" },
  { icon: ShieldCheck, label: "معايير JCI · CBAHI · GAHAR" },
  { icon: Award, label: "شهادة حضور معتمدة" },
];

const STATS = [
  { value: "17,000+", label: "Healthcare Professionals" },
  { value: "4.9★", label: "Average Rating" },
  { value: "200+", label: "Live Sessions" },
  { value: "12", label: "Years Experience" },
];

/* ── FOMO: last cohort funnel ── */
const LAST_COHORT = [
  { value: "430", label: "شخص سجّلوا", icon: UserCheck },
  { value: "312", label: "حضروا المحاضرة", icon: Users },
  { value: "94", label: "التحقوا بالدبلومة", icon: GraduationCap },
];

/* ── Pain points ── */
const PAINS = [
  { icon: Compass, t: "تايه في البداية", b: "عايز تنتقل لقسم الجودة الصحية بس مش عارف الخطوة الأولى فين." },
  { icon: HelpCircle, t: "مش متأكد من CPHQ", b: "سمعت عن الشهادة بس مش عارف تستاهل الاستثمار ولا لأ." },
  { icon: HeartCrack, t: "خايف تدفع غلط", b: "قلقان تدفع في دورة وتكتشف بعدها إنها مش مناسبة ليك." },
  { icon: ArrowLeftRight, t: "ضايع بين الكورسات", b: "خيارات كتير ومصادر متضاربة ومش عارف الصح فين." },
];

const OUTCOMES = [
  { icon: Globe2, t: "تفهم CPHQ بوضوح", b: "تعرف يعني إيه الشهادة، مين بيصدرها، وليه بقت مطلوبة." },
  { icon: Briefcase, t: "تعرف فرص العمل", b: "أماكن الشغل والمسارات المهنية المتاحة قدامك في مصر والخليج." },
  { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف إنت جاهز للامتحان لأي درجة، وإيه اللي ناقصك." },
  { icon: BookOpen, t: "تختار خطة الدراسة", b: "تحدد أفضل خطة مذاكرة تناسب وقتك وخبرتك." },
];

const AGENDA = [
  { icon: Globe2, t: "ما هي CPHQ؟", b: "الشهادة والجهة المانحة (NAHQ) ومكانتها في السوق." },
  { icon: ShieldCheck, t: "أهمية الجودة", b: "دور Healthcare Quality في المستشفيات (JCI · CBAHI · GAHAR)." },
  { icon: ClipboardCheck, t: "محتوى الامتحان", b: "توزيع الدرجات والمهارات اللي بتتقاس بالظبط." },
  { icon: BookOpen, t: "خطة مذاكرة", b: "خطوات عملية توصّلك للنجاح حتى لو شغلك full-time." },
  { icon: Target, t: "أخطاء الرسوب", b: "الأخطاء الشائعة وإزاي تعديها من أول مرة." },
  { icon: ArrowUpRight, t: "الخطوة الجاية", b: "الـ Eligibility وطريقة التسجيل للامتحان." },
];

const AUDIENCE = [
  { emoji: "👨‍⚕️", label: "الأطباء / Physicians" },
  { emoji: "💊", label: "الصيادلة / Pharmacists" },
  { emoji: "🩺", label: "التمريض / Nurses" },
  { emoji: "📋", label: "أخصائيو الجودة / Quality" },
  { emoji: "🎓", label: "الخريجون الجدد / Fresh Grads" },
  { emoji: "🏥", label: "العاملون بالمستشفيات" },
];

const BENEFITS = [
  { icon: Briefcase, label: "زيادة فرص التوظيف" },
  { icon: TrendingUp, label: "الترقية داخل المستشفى" },
  { icon: ClipboardCheck, label: "دخول قسم الجودة" },
  { icon: Wallet, label: "زيادة الراتب" },
  { icon: Building2, label: "الانتقال للإدارة الصحية" },
  { icon: Globe2, label: "فرص عمل في الخليج" },
];

const SPEAKER_POINTS = [
  "استشاري جودة معتمد CPHQ بخبرة عملية في المستشفيات",
  "درّب آلاف المتخصصين الصحيين في مصر والخليج",
  "خبرة في معايير JCI · CBAHI · GAHAR",
  "أسلوب شرح بالعربي يبسّط المفاهيم الصعبة",
];

const FAQS = [
  { q: "المحاضرة مجانية فعلاً؟", a: "أيوه، 100% مجانية — بس الأماكن محدودة عشان نضمن جودة التفاعل والـ Q&A." },
  { q: "هل يوجد بث مباشر؟", a: "أيوه، المحاضرة Live أونلاين على Zoom في موعد محدد — مش فيديو مسجّل." },
  { q: "هل المحاضرة مسجلة؟ وهنقدر نرجعلها؟", a: "بنسجّل المحاضرة، والمشتركون بيوصلهم رابط التسجيل بعدها للمراجعة." },
  { q: "هل يمكنني طرح الأسئلة؟", a: "طبعًا — فيه جلسة Q&A مباشرة تقدر تسأل فيها الخبير أي سؤال." },
  { q: "هل يوجد شهادة حضور؟", a: "أيوه، كل مشترك بياخد Certificate of Attendance من IMETS." },
  { q: "المحاضرة بأي لغة؟", a: "الشرح بالعربي المصري السهل مع المصطلحات الطبية بالإنجليزي زي ما بتتقال في المجال." },
  { q: "محتاج خبرة قبلها؟", a: "لأ. مناسبة للمبتدئين وكمان للي عندهم خبرة وعايزين يوثّقوها بشهادة." },
];

export default async function FreeLectureCphqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div dir="rtl" className="bg-background text-foreground">
      {/* ── 1 · Hero (pain headline + countdown + form) ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-[#082a6b] text-primary-foreground">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 size-72 rounded-full bg-[#f4c430]/20 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles className="size-3.5" /> 🎓 محاضرة مجانية أونلاين · Live Session
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.6rem]">
              عايز تنتقل لقسم <span className="text-[#f4c430]">الجودة الصحية</span>…
              <br />
              بس مش عارف تبدأ منين؟
            </h1>
            <p className="text-base leading-relaxed text-white/85 sm:text-lg">
              سمعت عن <strong className="text-white">CPHQ</strong> بس مش متأكد إذا كانت تستاهل الاستثمار؟
              احضر المحاضرة المجانية دي وتعرف <strong className="text-white">الطريق الصحيح</strong> قبل ما تدفع في أي دورة.
              <span className="mt-2 block font-medium text-white">90 دقيقة تشرح لك:</span>
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {HERO_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm font-medium sm:text-[0.95rem]">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" /> {b}
                </li>
              ))}
            </ul>
            <div className="pt-1"><RegistrationCountdown /></div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="secondary" className="gap-2 bg-[#f4c430] text-[#0a1424] hover:bg-[#f4c430]/90">
                <a href="#register">احجز مقعدي المجاني <ArrowLeft className="size-4" /></a>
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm text-white/80">
                <CalendarClock className="size-4 text-[#f4c430]" /> الأماكن محدودة
              </span>
            </div>
            <LandingHeroVideo path={PATH} />
          </div>

          {/* Registration form (2-step) */}
          <div id="register" className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border/70 bg-card p-1 shadow-xl shadow-primary/5">
              <div className="rounded-xl bg-gradient-to-b from-primary/[0.05] to-transparent p-4 sm:p-5">
                <p className="mb-1 text-center text-base font-bold text-primary">احجز مقعدك المجاني الآن</p>
                <p className="mb-4 text-center text-xs text-muted-foreground">خطوتان فقط — ويوصلك رابط الحضور على الإيميل والواتساب</p>
                <CphqLectureForm path={PATH} courseName={COURSE} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 · Trust / accreditation ── */}
      <section className="border-y border-border/60 bg-muted/30 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-wide text-muted-foreground">موثوقون ومعتمدون</p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {TRUST.map((tb) => (
              <span key={tb.label} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-2 text-sm font-medium shadow-sm">
                <tb.icon className="size-4 text-primary" /> {tb.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 · Social proof (ratings + stats + FOMO funnel) ── */}
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
              <div className="text-3xl font-extrabold sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs opacity-85 sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOMO — last cohort funnel */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl border border-[#f4c430]/40 bg-[#f4c430]/[0.06] p-6">
            <p className="mb-5 text-center text-sm font-bold text-[#8a6d00]">📊 نتائج آخر دفعة من المحاضرة</p>
            <div className="grid grid-cols-3 gap-3">
              {LAST_COHORT.map((c, i) => (
                <div key={c.label} className="relative text-center">
                  <c.icon className="mx-auto mb-1 size-5 text-primary" />
                  <div className="text-2xl font-extrabold sm:text-3xl">{c.value}</div>
                  <div className="text-xs text-muted-foreground">{c.label}</div>
                  {i < LAST_COHORT.length - 1 && (
                    <ArrowLeft className="absolute -left-2 top-6 hidden size-4 text-muted-foreground/50 sm:block" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-sm font-medium">المقاعد بتخلص بسرعة — احجز قبل ما الدفعة دي تكمل.</p>
          </div>
        </div>
      </section>

      {/* ── 4 · Pain points ── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow="لو ده بيحصلك…" title="بتواجه واحدة من دي؟" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PAINS.map((p) => (
              <Card key={p.t} className="border-border/70">
                <CardContent className="space-y-2 p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-rose-500"><p.icon className="size-5" /></span>
                  <h3 className="text-base font-bold">{p.t}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{p.b}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-2xl rounded-xl bg-primary/5 p-4 text-center text-sm font-semibold text-primary sm:text-base">
            المحاضرة دي اتعملت عشانك بالظبط — تخرج منها وإنت عارف الطريق الصحيح قبل ما تصرف جنيه واحد.
          </p>
        </div>
      </section>

      {/* ── 5 · Benefits — outcomes ── */}
      <Section eyebrow="النتيجة" title="بعد المحاضرة ستكون قادرًا على:" sub="نتائج ملموسة تخرج بيها — مش مجرد معلومات.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((o) => (
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

      {/* Agenda (cards) */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow="أجندة المحاضرة" title="المحاور اللي هنغطّيها" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AGENDA.map((a, i) => (
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
      <Section eyebrow="لمن هذه المحاضرة؟" title="مناسبة ليك لو إنت واحد من دول">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AUDIENCE.map((a) => (
            <div key={a.label} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-2xl">{a.emoji}</span>
              <span className="text-sm font-semibold">{a.label}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Career benefits */}
      <section className="bg-gradient-to-b from-primary/[0.04] to-background py-14">
        <div className="mx-auto max-w-4xl px-4">
          <Heading eyebrow="ليه CPHQ بالذات؟" title="أكثر من مجرد شهادة" sub="استثمار مباشر في مستقبلك المهني." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.label} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4">
                <span className="grid size-10 place-items-center rounded-lg bg-[#f4c430]/15 text-[#b8860b]"><b.icon className="size-5" /></span>
                <span className="text-sm font-bold">{b.label}</span>
                <CheckCircle2 className="ms-auto size-5 text-emerald-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6 · Speaker ── */}
      <Section eyebrow="محاضرك" title="ليه تثق باللي هيشرحلك؟">
        <div className="mx-auto max-w-3xl">
          <Card className="border-border/70">
            <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:items-start">
              <div className="grid size-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#082a6b] text-primary-foreground">
                <GraduationCap className="size-11" />
              </div>
              <div className="flex-1 text-center sm:text-right">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <BadgeCheck className="size-3.5" /> CPHQ Certified
                </div>
                <h3 className="mt-2 text-lg font-extrabold">استشاري الجودة الصحية — فريق IMETS</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {SPEAKER_POINTS.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: PlayCircle, t: "شرح تطبيقي", b: "من واقع المستشفيات، مش تنظير." },
              { icon: MessageCircle, t: "بالعربي", b: "مع المصطلحات الإنجليزي المعتمدة." },
              { icon: Clock3, t: "مركّز", b: "90 دقيقة من غير حشو." },
            ].map((x) => (
              <div key={x.t} className="rounded-xl border border-border/70 bg-card p-4 text-center">
                <x.icon className="mx-auto mb-1.5 size-5 text-primary" />
                <div className="text-sm font-bold">{x.t}</div>
                <div className="text-xs text-muted-foreground">{x.b}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 7 · Testimonials ── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow="آراء المتدربين" title="ناس بدأت من نفس المحاضرة" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              { quote: "المحاضرة وضّحتلي الصورة كلها. قررت أكمّل مع IMETS ونجحت في CPHQ من أول مرة.", name: "د. مروة", role: "طبيبة جودة — القاهرة" },
              { quote: "كنت مضيّع بين الكورسات. المحاضرة المجانية دي رتّبتلي دماغي وحطّتني على أول الطريق.", name: "أحمد", role: "صيدلي — الإسكندرية" },
              { quote: "الشرح بالعربي مع الـ terms بالإنجليزي خلّى المعلومة تثبت. تجربة محترمة جدًا.", name: "منى", role: "Nurse — طنطا" },
            ].map((t) => (
              <Card key={t.name} className="border-border/70">
                <CardContent className="space-y-3 p-5">
                  <div className="flex gap-0.5 text-[#f4c430]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                  <p className="text-sm leading-relaxed">“{t.quote}”</p>
                  <div className="pt-1">
                    <div className="text-sm font-bold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8 · FAQ ── */}
      <Section eyebrow="أسئلة متكررة" title="أي حاجة في بالك؟">
        <div className="mx-auto max-w-3xl space-y-3">
          {FAQS.map((f) => (
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
          <h2 className="text-2xl font-extrabold sm:text-3xl">ابدأ رحلتك في الجودة الصحية اليوم</h2>
          <p className="text-sm opacity-90 sm:text-base">
            احجز مقعدك المجاني قبل اكتمال العدد — محاضرة Live أونلاين، 90 دقيقة، وبشهادة حضور.
          </p>
          <div className="flex justify-center"><RegistrationCountdown /></div>
          <Button asChild size="lg" variant="secondary" className="gap-2 bg-[#f4c430] text-[#0a1424] hover:bg-[#f4c430]/90">
            <a href="#register">احجز مقعدي المجاني الآن <ArrowLeft className="size-4" /></a>
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ── Layout helpers ── */
function Section({ eyebrow, title, sub, children }: { eyebrow: string; title: string; sub?: string; children: React.ReactNode }) {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-6xl px-4">
        <Heading eyebrow={eyebrow} title={title} sub={sub} />
        <div className="mt-8">{children}</div>
      </div>
    </section>
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
