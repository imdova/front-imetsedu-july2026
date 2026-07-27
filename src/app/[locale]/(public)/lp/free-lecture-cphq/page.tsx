import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowLeft, Sparkles, CheckCircle2, Users, Star, Clock, Video, Award,
  ShieldCheck, MessageCircle, GraduationCap, ClipboardCheck, BookOpen,
  BadgeCheck, Stethoscope, Globe2, TrendingUp, CalendarClock, HelpCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SimpleLeadForm } from "@/features/marketing/components/simple-lead-form";
import { LandingHeroVideo } from "@/features/marketing/components/landing-hero-video";

const PATH = "/lp/free-lecture-cphq";
const COURSE = "CPHQ Free Lecture";

export const metadata: Metadata = {
  title: "محاضرة CPHQ المجانية | Free CPHQ Lecture — IMETS",
  description:
    "احجز مكانك في محاضرة CPHQ المجانية أونلاين — مخصوص للـ Healthcare Professionals في مصر. اعرف يعني إيه Certified Professional in Healthcare Quality وإزاي تنجح من أول مرة.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "محاضرة CPHQ المجانية · Free Live Session",
    description: "دخولك لمجال Healthcare Quality بيبدأ من هنا. محاضرة مجانية أونلاين للأطباء والصيادلة والتمريض.",
    type: "website",
  },
};

/* ── Content (Egyptian Arabic × English, healthcare-professional tone) ── */
const FACTS = [
  { icon: Video, label: "أونلاين على Zoom" },
  { icon: BadgeCheck, label: "مجانية 100%" },
  { icon: Award, label: "شهادة حضور" },
  { icon: Clock, label: "ساعة ونص + Q&A" },
];

const GAINS = [
  { icon: Globe2, title: "يعني إيه CPHQ؟", body: "نظرة كاملة على الشهادة، مين اللي بيصدرها (NAHQ – أمريكا)، وليه بقت من أكتر الشهادات المطلوبة في مجال الجودة." },
  { icon: ClipboardCheck, title: "خريطة الامتحان", body: "محتوى الـ exam، توزيع الدرجات، والمهارات اللي بتتقاس — عشان تعرف تركّز فين بالظبط." },
  { icon: BookOpen, title: "خطة مذاكرة عملية", body: "Roadmap واضح توصّلك للنجاح في 8–12 أسبوع، حتى لو شغلك full-time." },
  { icon: TrendingUp, title: "فرص الشغل والرواتب", body: "إزاي الشهادة بتفتحلك أبواب في مستشفيات مصر والخليج (JCI-accredited) وبتزوّد دخلك." },
  { icon: MessageCircle, title: "جلسة Q&A مباشرة", body: "اسأل خبير جودة معتمد أي سؤال في بالك عن الشهادة والمجال والامتحان." },
  { icon: ShieldCheck, title: "أشهر أخطاء الرسوب", body: "الأخطاء اللي بتخلّي ناس شاطرة ترسب — وإزاي تتجنّبها من أول مرة." },
];

const AGENDA = [
  "What is CPHQ? — الشهادة والجهة المانحة (NAHQ)",
  "أهمية الـ Healthcare Quality في المستشفيات (JCI · CBAHI · GAHAR)",
  "محتوى الامتحان وتوزيع الدرجات — إيه اللي بيتقاس",
  "خطة مذاكرة عملية خطوة بخطوة",
  "الأخطاء الشائعة وإزاي تعديها",
  "الخطوة الجاية: الـ Eligibility والتسجيل للامتحان",
];

const AUDIENCE = [
  "أطباء · صيادلة · تمريض عايزين يدخلوا مجال الجودة",
  "Quality & Patient Safety officers في المستشفيات",
  "خريجين جداد بيدوّروا على تخصص مطلوب ومحترم",
  "أي Healthcare Professional عايز يترقّى أو يسافر الخليج",
];

const WHY = [
  { icon: Globe2, title: "معترف بيها دوليًا", body: "شهادة من NAHQ الأمريكية — اسم موثوق في كل مستشفيات الجودة حوالين العالم." },
  { icon: Stethoscope, title: "مطلوبة في الخليج", body: "من أكتر المتطلبات في المستشفيات المعتمدة من JCI في السعودية والإمارات وقطر." },
  { icon: TrendingUp, title: "راتب وفرص أعلى", body: "الشهادة بتفرّقك عن باقي المتقدمين وبتفتحلك مسار مهني أوسع وأعلى دخلًا." },
  { icon: Award, title: "قيمة تدوم", body: "مش كورس بينتهي — دي هوية مهنية بتفضل معاك وبتكبر بيها في مجالك." },
];

const STATS = [
  { icon: Users, value: "+2,000", label: "متدرب في برامج IMETS" },
  { icon: Star, value: "4.9/5", label: "تقييم المتدربين" },
  { icon: GraduationCap, value: "محاضرين", label: "معتمدين CPHQ" },
  { icon: MessageCircle, value: "دعم", label: "مباشر طول الرحلة" },
];

const TESTIMONIALS = [
  { quote: "المحاضرة وضّحتلي الصورة كلها. قررت أكمّل مع IMETS ونجحت في CPHQ من أول مرة.", name: "د. مروة", role: "طبيبة جودة — القاهرة" },
  { quote: "كنت مضيّع بين الكورسات. المحاضرة المجانية دي رتّبتلي دماغي وحطّتني على أول الطريق.", name: "أحمد", role: "صيدلي — الإسكندرية" },
  { quote: "الشرح بالعربي مع الـ terms بالإنجليزي خلّى المعلومة تثبت. تجربة محترمة جدًا.", name: "منى", role: "Nurse — طنطا" },
];

const FAQS = [
  { q: "المحاضرة مجانية فعلاً؟", a: "أيوه، 100% مجانية — بس الأماكن محدودة عشان نضمن جودة التفاعل و الـ Q&A." },
  { q: "المحاضرة بأي لغة؟", a: "الشرح بالعربي المصري السهل مع المصطلحات الطبية بالإنجليزي زي ما بتتقال في المجال." },
  { q: "محتاج خبرة قبلها؟", a: "لأ. المحاضرة مناسبة للمبتدئين وكمان للي عندهم خبرة وعايزين يوثّقوها بشهادة." },
  { q: "هيوصلني لينك الحضور إزاي؟", a: "بعد التسجيل هنبعتلك رابط الـ Zoom على الإيميل والواتساب، مع تذكير قبل المحاضرة." },
  { q: "فيه شهادة حضور؟", a: "أيوه، كل مشترك بياخد Certificate of Attendance من IMETS." },
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
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" /> 🎓 محاضرة مجانية أونلاين · Free Live Session
            </span>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem]">
              دخولك لمجال <span className="text-primary">Healthcare Quality</span>
              <br />
              بيبدأ من محاضرة <span className="text-primary">CPHQ</span> المجانية
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              محاضرة أونلاين مخصوص للـ Healthcare Professionals في مصر — هتعرف يعني إيه شهادة
              {" "}<strong className="text-foreground">CPHQ</strong>، وإزاي بتفتحلك أبواب شغل في مصر والخليج،
              وخطة مذاكرة عملية توصّلك للنجاح من أول مرة.
            </p>
            <div className="flex flex-wrap gap-2">
              {FACTS.map((f) => (
                <span key={f.label} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm font-medium">
                  <f.icon className="size-4 text-primary" /> {f.label}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild size="lg" className="gap-2">
                <a href="#register">احجز مكاني دلوقتي <ArrowLeft className="size-4" /></a>
              </Button>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="size-4 text-primary" /> الأماكن محدودة — سجّل بدري
              </span>
            </div>
            <LandingHeroVideo path={PATH} />
          </div>

          {/* Registration form */}
          <div id="register" className="lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border/70 bg-card p-1 shadow-xl shadow-primary/5">
              <div className="rounded-xl bg-gradient-to-b from-primary/[0.04] to-transparent p-4 sm:p-5">
                <p className="mb-1 text-center text-sm font-semibold text-primary">احجز مكانك في المحاضرة المجانية</p>
                <p className="mb-4 text-center text-xs text-muted-foreground">سجّل بياناتك ويوصلك لينك الحضور على الإيميل والواتساب</p>
                <SimpleLeadForm path={PATH} courseName={COURSE} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── What you'll gain ── */}
      <Section eyebrow="اللي هتكسبه" title="هتطلع من المحاضرة بإيه؟" sub="محتوى عملي مركّز — من غير حشو.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAINS.map((g) => (
            <Card key={g.title} className="border-border/70 transition-shadow hover:shadow-md">
              <CardContent className="space-y-2 p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><g.icon className="size-5" /></span>
                <h3 className="text-base font-bold">{g.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{g.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── Agenda ── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-4xl px-4">
          <Heading eyebrow="أجندة المحاضرة" title="المحاور اللي هنغطّيها" />
          <ol className="mt-8 space-y-3">
            {AGENDA.map((item, i) => (
              <li key={item} className="flex items-start gap-4 rounded-xl border border-border/70 bg-card p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="pt-1 text-sm font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Who should attend ── */}
      <Section eyebrow="لمين المحاضرة دي؟" title="مناسبة ليك لو إنت…">
        <div className="grid gap-3 sm:grid-cols-2">
          {AUDIENCE.map((a) => (
            <div key={a} className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
              <span className="text-sm font-medium leading-relaxed">{a}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Why CPHQ ── */}
      <section className="bg-gradient-to-b from-primary/[0.04] to-background py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow="ليه CPHQ بالذات؟" title="أكتر من مجرد شهادة" sub="Certified Professional in Healthcare Quality — استثمار في مستقبلك المهني." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <Card key={w.title} className="border-border/70">
                <CardContent className="space-y-2 p-5">
                  <span className="grid size-11 place-items-center rounded-xl bg-[#f4c430]/15 text-[#b8860b]"><w.icon className="size-5" /></span>
                  <h3 className="text-base font-bold">{w.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{w.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <s.icon className="mx-auto mb-2 size-6 opacity-80" />
              <div className="text-2xl font-extrabold">{s.value}</div>
              <div className="text-xs opacity-85">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why IMETS ── */}
      <Section eyebrow="ليه IMETS؟" title="تعليم طبي بجودة عالمية… بلمسة مصرية">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { icon: GraduationCap, t: "محاضرين ممارسين", b: "خبراء جودة معتمدين CPHQ بيشتغلوا في المجال فعليًا — مش تنظير." },
            { icon: MessageCircle, t: "شرح بالعربي", b: "المفاهيم الصعبة بتتشرح ببساطة بالعربي مع المصطلحات الإنجليزي المعتمدة." },
            { icon: ShieldCheck, t: "تركيز على الامتحان", b: "كل حاجة مبنية عشان تعدّي الامتحان وتطبّق في شغلك من اليوم الأول." },
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

      {/* ── Testimonials ── */}
      <section className="bg-muted/30 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <Heading eyebrow="آراء المتدربين" title="ناس بدأت من نفس المحاضرة" />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
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
        </div>
      </section>

      {/* ── FAQ ── */}
      <Section eyebrow="أسئلة متكررة" title="أي حاجة في بالك؟">
        <div className="mx-auto max-w-3xl space-y-3">
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
      </Section>

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-primary to-[#082a6b] py-16 text-center text-primary-foreground">
        <div className="mx-auto max-w-2xl space-y-5 px-4">
          <h2 className="text-2xl font-extrabold sm:text-3xl">مستني إيه؟ مكانك في المحاضرة مستنيك</h2>
          <p className="text-sm opacity-90 sm:text-base">
            سجّل دلوقتي وابدأ أول خطوة نحو شهادة CPHQ — محاضرة مجانية بالكامل، أونلاين، وبشهادة حضور.
          </p>
          <Button asChild size="lg" variant="secondary" className="gap-2 bg-[#f4c430] text-[#0a1424] hover:bg-[#f4c430]/90">
            <a href="#register">احجز مكاني · Reserve my seat <ArrowLeft className="size-4" /></a>
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
