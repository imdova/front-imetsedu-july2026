import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowLeft, Sparkles, CheckCircle2, Users, Star, Award,
  ShieldCheck, MessageCircle, GraduationCap, ClipboardCheck, BookOpen,
  Globe2, TrendingUp, CalendarClock, HelpCircle, Target,
  Briefcase, Wallet, Building2, ArrowUpRight, PlayCircle, FileCheck2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CphqLectureForm } from "@/features/marketing/components/cphq-lecture-form";
import { LandingHeroVideo } from "@/features/marketing/components/landing-hero-video";

const PATH = "/lp/free-lecture-cphq";
const COURSE = "CPHQ Free Lecture";

export const metadata: Metadata = {
  title: "محاضرة CPHQ المجانية | هل تريد دخول مجال الجودة الصحية؟ — IMETS",
  description:
    "احجز محاضرة CPHQ المجانية (90 دقيقة) أونلاين — تشرح لك كيف تبدأ، هل CPHQ مناسبة لك، كم رواتب المجال، وكيف تستعد للاختبار. مخصوصة للـ Healthcare Professionals في مصر.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "هل تريد دخول مجال الجودة الصحية؟ · محاضرة CPHQ مجانية",
    description: "90 دقيقة تشرح لك كل ما تحتاجه للبدء في مجال Healthcare Quality — مجانًا وأونلاين.",
    type: "website",
  },
};

/* ── Hero promise bullets ── */
const HERO_BULLETS = [
  "كيف تبدأ في مجال الجودة الصحية",
  "هل شهادة CPHQ مناسبة لك؟",
  "كم رواتب المجال في مصر والخليج",
  "كيف تستعد للاختبار وتنجح من أول مرة",
];

/* ── Trust / accreditation badges (swap for real logos when available) ── */
const TRUST = [
  { icon: Globe2, label: "منهج مبني على NAHQ" },
  { icon: FileCheck2, label: "اعتماد CME / CPD" },
  { icon: ShieldCheck, label: "معايير JCI · CBAHI · GAHAR" },
  { icon: Award, label: "شهادة حضور معتمدة" },
];

/* ── Big stats ── */
const STATS = [
  { value: "17,000+", label: "Healthcare Professionals" },
  { value: "4.9★", label: "Average Rating" },
  { value: "200+", label: "Live Sessions" },
  { value: "12", label: "Years Experience" },
];

/* ── Testimonials (moved up, right after hero) ── */
const TESTIMONIALS = [
  { quote: "المحاضرة وضّحتلي الصورة كلها. قررت أكمّل مع IMETS ونجحت في CPHQ من أول مرة.", name: "د. مروة", role: "طبيبة جودة — القاهرة" },
  { quote: "كنت مضيّع بين الكورسات. المحاضرة المجانية دي رتّبتلي دماغي وحطّتني على أول الطريق.", name: "أحمد", role: "صيدلي — الإسكندرية" },
  { quote: "الشرح بالعربي مع الـ terms بالإنجليزي خلّى المعلومة تثبت. تجربة محترمة جدًا.", name: "منى", role: "Nurse — طنطا" },
];

/* ── Outcomes (results, not content) ── */
const OUTCOMES = [
  { icon: Globe2, t: "تفهم CPHQ بوضوح", b: "تعرف يعني إيه الشهادة، مين بيصدرها، وليه بقت مطلوبة." },
  { icon: Briefcase, t: "تعرف فرص العمل", b: "أماكن الشغل والمسارات المهنية المتاحة قدامك في مصر والخليج." },
  { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف إنت جاهز للامتحان لأي درجة، وإيه اللي ناقصك." },
  { icon: BookOpen, t: "تختار خطة الدراسة", b: "تحدد أفضل خطة مذاكرة تناسب وقتك وخبرتك." },
];

/* ── Agenda as cards ── */
const AGENDA = [
  { icon: Globe2, t: "ما هي CPHQ؟", b: "الشهادة والجهة المانحة (NAHQ) ومكانتها في السوق." },
  { icon: ShieldCheck, t: "أهمية الجودة", b: "دور Healthcare Quality في المستشفيات (JCI · CBAHI · GAHAR)." },
  { icon: ClipboardCheck, t: "محتوى الامتحان", b: "توزيع الدرجات والمهارات اللي بتتقاس بالظبط." },
  { icon: BookOpen, t: "خطة مذاكرة", b: "خطوات عملية توصّلك للنجاح حتى لو شغلك full-time." },
  { icon: Target, t: "أخطاء الرسوب", b: "الأخطاء الشائعة وإزاي تعديها من أول مرة." },
  { icon: ArrowUpRight, t: "الخطوة الجاية", b: "الـ Eligibility وطريقة التسجيل للامتحان." },
];

/* ── Audience with person emojis ── */
const AUDIENCE = [
  { emoji: "👨‍⚕️", label: "الأطباء / Physicians" },
  { emoji: "💊", label: "الصيادلة / Pharmacists" },
  { emoji: "🩺", label: "التمريض / Nurses" },
  { emoji: "📋", label: "أخصائيو الجودة / Quality" },
  { emoji: "🎓", label: "الخريجون الجدد / Fresh Grads" },
  { emoji: "🏥", label: "العاملون بالمستشفيات" },
];

/* ── Concrete career benefits ── */
const BENEFITS = [
  { icon: Briefcase, label: "زيادة فرص التوظيف" },
  { icon: TrendingUp, label: "الترقية داخل المستشفى" },
  { icon: ClipboardCheck, label: "دخول قسم الجودة" },
  { icon: Wallet, label: "زيادة الراتب" },
  { icon: Building2, label: "الانتقال للإدارة الصحية" },
  { icon: Globe2, label: "فرص عمل في الخليج" },
];

const FAQS = [
  { q: "المحاضرة مجانية فعلاً؟", a: "أيوه، 100% مجانية — بس الأماكن محدودة عشان نضمن جودة التفاعل والـ Q&A." },
  { q: "هل يوجد بث مباشر؟", a: "أيوه، المحاضرة Live أونلاين على Zoom في موعد محدد — مش فيديو مسجّل." },
  { q: "هل المحاضرة مسجلة؟ وهنقدر نرجعلها؟", a: "بنسجّل المحاضرة، والمشتركين بيوصلهم رابط التسجيل بعدها للمراجعة." },
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
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/[0.06] to-background">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-40 size-72 rounded-full bg-[#f4c430]/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> 🎓 محاضرة مجانية أونلاين · Live Session
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.7rem]">
              هل تريد دخول مجال <span className="text-primary">الجودة الصحية؟</span>
            </h1>
            <p className="text-base font-medium text-foreground sm:text-lg">
              احجز محاضرة مجانية لمدة <span className="text-primary">90 دقيقة</span> تشرح لك:
            </p>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {HERO_BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm font-medium sm:text-[0.95rem]">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                  {b}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild size="lg" className="gap-2">
                <a href="#register">احجز مقعدي المجاني <ArrowLeft className="size-4" /></a>
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-4 text-primary" /> الأماكن محدودة — سجّل قبل اكتمال العدد
              </span>
            </div>
            <LandingHeroVideo path={PATH} />
          </div>

          {/* Registration form (2-step, minimal) */}
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

      {/* ── Social proof strip (immediately after hero) ── */}
      <section className="border-y border-border/60 bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <span className="flex text-[#f4c430]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</span>
            4.9/5 من أكثر من 500 تقييم
          </span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="inline-flex items-center gap-2 text-sm font-semibold"><Users className="size-4 text-primary" /> أكثر من 2,000 متخصص صحي حضروا محاضرات IMETS</span>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="inline-flex items-center gap-2 text-sm font-semibold"><GraduationCap className="size-4 text-primary" /> +17,000 متدرب في برامج IMETS</span>
        </div>
      </section>

      {/* ── Trust / accreditation ── */}
      <section className="bg-muted/30 py-6">
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

      {/* ── Testimonials (moved up) ── */}
      <Section eyebrow="آراء المتدربين" title="ناس بدأت من نفس المحاضرة">
        <div className="grid gap-4 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
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
      </Section>

      {/* ── Big statistics ── */}
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

      {/* ── Outcomes ── */}
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

      {/* ── Agenda (cards) ── */}
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

      {/* ── Audience (with person emojis) ── */}
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

      {/* ── More than a certificate (concrete benefits) ── */}
      <section className="bg-gradient-to-b from-primary/[0.04] to-background py-14">
        <div className="mx-auto max-w-4xl px-4">
          <Heading eyebrow="ليه CPHQ بالذات؟" title="أكثر من مجرد شهادة" sub="Certified Professional in Healthcare Quality — استثمار مباشر في مستقبلك المهني." />
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

      {/* ── Why IMETS ── */}
      <Section eyebrow="ليه IMETS؟" title="تعليم طبي بجودة عالمية… بلمسة مصرية">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { icon: GraduationCap, t: "محاضرون ممارسون", b: "خبراء جودة معتمدون CPHQ بيشتغلوا في المجال فعليًا — مش تنظير." },
            { icon: MessageCircle, t: "شرح بالعربي", b: "المفاهيم الصعبة بتتشرح ببساطة بالعربي مع المصطلحات الإنجليزي المعتمدة." },
            { icon: PlayCircle, t: "تركيز على الامتحان", b: "كل حاجة مبنية عشان تعدّي الامتحان وتطبّق في شغلك من اليوم الأول." },
          ].map((x) => (
            <Card key={x.t} className="border-border/70">
              <CardContent className="space-y-2 p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><x.icon className="size-5" /></span>
                <h3 className="text-base font-bold">{x.t}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{x.b}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── FAQ ── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <Heading eyebrow="أسئلة متكررة" title="أي حاجة في بالك؟" />
          <div className="mt-8 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border/70 bg-card p-4">
                <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold marker:content-['']">
                  <HelpCircle className="size-4 shrink-0 text-primary" />
                  {f.q}
                </summary>
                <p className="mt-2 pr-6 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-primary to-[#082a6b] py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-2xl space-y-5 px-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl">ابدأ رحلتك في الجودة الصحية اليوم</h2>
          <p className="text-sm opacity-90 sm:text-base">
            احجز مقعدك المجاني قبل اكتمال العدد — محاضرة Live أونلاين، 90 دقيقة، وبشهادة حضور.
          </p>
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
