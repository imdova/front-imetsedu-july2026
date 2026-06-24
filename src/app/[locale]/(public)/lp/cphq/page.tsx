import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight, Stethoscope, Sparkles, CheckCircle2, Users, Star, Clock,
  ShieldCheck, MessageCircle, GraduationCap, ClipboardCheck, BookOpen,
  BadgeCheck, CreditCard, Briefcase,
} from "lucide-react";

import { resolveSeoMetadata } from "@/lib/public-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CourseApplyForm } from "@/features/marketing/components/course-apply-form";

const PATH = "/lp/cphq";
const COURSE = "CPHQ Exam Prep";

const STAT_ICONS = [BadgeCheck, Users, Clock, Star];
const FEATURE_ICONS = [ClipboardCheck, BookOpen, GraduationCap, Clock, MessageCircle, Users, ShieldCheck];

type Copy = {
  badge: string; h1a: string; h1b: string; sub: string; ctaApply: string; ctaLearn: string;
  facts: string[]; formEyebrow: string; authLabel: string; auth: string[];
  featuresTitle: string; featuresSub: string; features: { title: string; body: string }[];
  stats: { value: string; label: string }[];
  curriculumTitle: string; curriculumNote: string; modules: string[];
  instructor: { eyebrow: string; name: string; role: string; bio: string; points: string[] };
  stepsTitle: string; steps: { title: string; body: string }[];
  pricingTitle: string; pricingSub: string; plans: { name: string; price: string; tagline: string; features: string[]; cta: string; highlight: boolean }[];
  paymentsTitle: string; payments: string[];
  testimonialsTitle: string; testimonials: { quote: string; name: string; role: string }[];
  faqTitle: string; faqs: { q: string; a: string }[];
  applyTitle: string; applySub: string; applyBullets: string[]; sticky: string; popular: string;
};

const EN: Copy = {
  badge: "Certified Professional in Healthcare Quality",
  h1a: "Pass the CPHQ exam —", h1b: "on your first attempt.",
  sub: "A focused Arabic + English program built on the official CPHQ Exam Content Outline: question banks, full mock exams, weekly live review and 1:1 mentoring — until you pass.",
  ctaApply: "Reserve my seat", ctaLearn: "See the curriculum",
  facts: ["100% online", "10 weeks", "Pass guarantee", "Bilingual (AR + EN)"],
  formEyebrow: "Free assessment & study plan",
  authLabel: "Aligned with",
  auth: ["NAHQ CPHQ", "SCFHS", "DHA", "DOH", "QCHP"],
  featuresTitle: "Everything the diploma gives you",
  featuresSub: "Built end-to-end to get you certified — nothing left to chance.",
  features: [
    { title: "Built on the CPHQ outline", body: "Every lesson maps to the official Exam Content Outline domains." },
    { title: "1,000+ practice questions", body: "Updated question bank with detailed rationales for each answer." },
    { title: "Full timed mock exams", body: "Sit realistic, full-length mocks that mirror the real test." },
    { title: "Weekly live review", body: "Join live sessions to work through the hardest topics with a coach." },
    { title: "Bilingual explanations", body: "Study in Arabic and English — whichever makes the concept click." },
    { title: "1:1 expert mentoring", body: "A dedicated CPHQ-certified mentor guides you to exam day." },
    { title: "Pass guarantee", body: "Didn't pass first time? Keep your access free until you do." },
  ],
  stats: [
    { value: "92%", label: "First-attempt pass rate" }, { value: "3,200+", label: "Professionals certified" },
    { value: "10 wks", label: "To exam-ready" }, { value: "4.9/5", label: "Average rating" },
  ],
  curriculumTitle: "What you'll study",
  curriculumNote: "10 weeks · 8 units built on the CPHQ Exam Content Outline",
  modules: [
    "Organizational leadership in healthcare quality",
    "Health data analytics & measurement",
    "Performance & process improvement",
    "Patient safety & risk management",
    "Quality review, accountability & external reporting",
    "Regulatory, accreditation & standards",
    "Population health & care transitions",
    "Exam strategy + full-length timed mock exams",
  ],
  instructor: {
    eyebrow: "Learn from a real expert", name: "Dr. Mohamed Ahmed",
    role: "Healthcare Quality Consultant · CPHQ · 15+ years",
    bio: "Mohamed has helped thousands of professionals pass the CPHQ and lead quality programs across Egypt and the Gulf. Every lesson reflects what the exam actually tests today.",
    points: ["CPHQ-certified and an active quality consultant", "Coached 3,200+ professionals to certification", "Knows the Exam Content Outline inside out"],
  },
  stepsTitle: "4 steps to get certified",
  steps: [
    { title: "Reserve free", body: "Tell us your background — we confirm CPHQ eligibility." },
    { title: "Get your plan", body: "A mentor builds your 10-week study roadmap." },
    { title: "Study & mock", body: "Question banks, live review and full mock exams." },
    { title: "Pass & certify", body: "Sit the exam with confidence and earn your CPHQ." },
  ],
  pricingTitle: "Choose the plan that fits you",
  pricingSub: "Start free — upgrade when you're ready to certify.",
  plans: [
    { name: "Free plan", price: "Free", tagline: "Try before you commit", cta: "Start free", highlight: false,
      features: ["Free eligibility & readiness check", "Sample question bank", "1 demo live session"] },
    { name: "Full program", price: "EGP 450", tagline: "Everything to pass the CPHQ", cta: "Reserve my seat", highlight: true,
      features: ["1,000+ questions + timed mock exams", "Weekly live review sessions", "1:1 CPHQ mentor", "Bilingual content (AR + EN)", "Pass guarantee"] },
  ],
  paymentsTitle: "Available payment methods",
  payments: ["Visa", "Mastercard", "Meeza", "Fawry", "Vodafone Cash", "InstaPay", "Bank transfer"],
  testimonialsTitle: "From people who actually passed",
  testimonials: [
    { quote: "The mock exams were almost identical to the real CPHQ. I passed on my first attempt.", name: "Mariam A.", role: "Quality Specialist · Riyadh" },
    { quote: "Studying in Arabic and English made the analytics domain finally click. Worth every pound.", name: "Dr. Omar K.", role: "Quality Manager · Cairo" },
    { quote: "My mentor kept me on track for 10 weeks straight. Certified — and promoted soon after.", name: "Hala S.", role: "Patient Safety Officer · Doha" },
  ],
  faqTitle: "Comfortable answers to everything you ask",
  faqs: [
    { q: "Am I eligible for the CPHQ?", a: "CPHQ has no strict prerequisite, but healthcare quality experience helps. We review your background for free and advise you before you book." },
    { q: "Is the program in Arabic or English?", a: "Both. Lessons, question banks and live sessions are delivered bilingually so you can study in whichever language is clearer for you." },
    { q: "Where do I sit the exam?", a: "The CPHQ is delivered by NAHQ via Prometric — online or at a test center. We help you register and schedule." },
    { q: "How long does it take?", a: "Most learners are exam-ready in about 10 weeks studying part-time. The program is self-paced with weekly live support." },
    { q: "What does it cost?", a: "Reviewing your profile and the demo session are free. The full program is EGP 450; an advisor explains everything before you decide." },
  ],
  applyTitle: "Reserve your seat in the next cohort",
  applySub: "Apply in 60 seconds. A mentor will confirm your CPHQ eligibility and send a personalized study plan within 24 hours — free, no obligation.",
  applyBullets: ["Free eligibility & readiness check", "Personalized 10-week study plan", "Clear cost and exam timeline"],
  sticky: "Reserve my seat",
  popular: "Most popular",
};

const AR: Copy = {
  badge: "أخصائي معتمد في جودة الرعاية الصحية (CPHQ)",
  h1a: "اجتَز امتحان CPHQ —", h1b: "من أول مرة.",
  sub: "برنامج مركّز بالعربية والإنجليزية مبني على محتوى امتحان CPHQ الرسمي: بنوك أسئلة، اختبارات محاكية كاملة، مراجعة مباشرة أسبوعية، وإرشاد فردي — حتى تنجح.",
  ctaApply: "احجز مقعدي", ctaLearn: "شاهد المنهج",
  facts: ["أونلاين 100%", "10 أسابيع", "ضمان النجاح", "بالعربية والإنجليزية"],
  formEyebrow: "تقييم مجاني وخطة دراسية",
  authLabel: "متوافق مع",
  auth: ["NAHQ CPHQ", "SCFHS", "DHA", "DOH", "QCHP"],
  featuresTitle: "كل ما تمنحك إياه الدبلومة",
  featuresSub: "مبنية من البداية للنهاية لتجعلك معتمدًا — دون ترك شيء للصدفة.",
  features: [
    { title: "مبنية على مخطط CPHQ", body: "كل درس مرتبط بمجالات محتوى الامتحان الرسمي (Exam Content Outline)." },
    { title: "+1,000 سؤال تدريبي", body: "بنك أسئلة محدّث مع شرح مفصّل لكل إجابة." },
    { title: "اختبارات محاكية كاملة", body: "اختبارات واقعية بوقت محدد تحاكي الامتحان الحقيقي." },
    { title: "مراجعة مباشرة أسبوعية", body: "جلسات مباشرة لمعالجة أصعب المواضيع مع مدرّب." },
    { title: "شرح بالعربية والإنجليزية", body: "ادرس باللغة التي توضّح لك المفهوم أكثر." },
    { title: "إرشاد فردي مع خبير", body: "مرشد معتمد CPHQ يرافقك حتى يوم الامتحان." },
    { title: "ضمان النجاح", body: "لم تنجح من أول مرة؟ يبقى وصولك مجانيًا حتى تنجح." },
  ],
  stats: [
    { value: "92%", label: "نجاح من أول محاولة" }, { value: "+3,200", label: "متخصص حصل على الاعتماد" },
    { value: "10 أسابيع", label: "حتى الجاهزية للامتحان" }, { value: "4.9/5", label: "متوسط التقييم" },
  ],
  curriculumTitle: "ماذا ستدرس",
  curriculumNote: "10 أسابيع · 8 وحدات مبنية على محتوى امتحان CPHQ",
  modules: [
    "القيادة التنظيمية في جودة الرعاية الصحية",
    "تحليل البيانات الصحية والقياس",
    "تحسين الأداء والعمليات",
    "سلامة المرضى وإدارة المخاطر",
    "مراجعة الجودة والمساءلة والتقارير الخارجية",
    "الاعتماد والمتطلبات التنظيمية والمعايير",
    "صحة السكان وانتقالات الرعاية",
    "استراتيجية الامتحان + اختبارات محاكية كاملة بوقت محدد",
  ],
  instructor: {
    eyebrow: "تعلّم مع خبير حقيقي", name: "د. محمد أحمد",
    role: "استشاري جودة رعاية صحية · CPHQ · خبرة +15 سنة",
    bio: "ساعد محمد آلاف المتخصصين على اجتياز CPHQ وقيادة برامج الجودة في مصر والخليج. كل درس يعكس ما يختبره الامتحان فعليًا اليوم.",
    points: ["معتمد CPHQ واستشاري جودة نشط", "درّب +3,200 متخصص حتى الاعتماد", "يعرف محتوى الامتحان عن ظهر قلب"],
  },
  stepsTitle: "4 خطوات للحصول على الاعتماد",
  steps: [
    { title: "احجز مجانًا", body: "أخبرنا بخلفيتك ونؤكّد أهليتك لامتحان CPHQ." },
    { title: "احصل على خطتك", body: "يضع لك المرشد خطة دراسية مدتها 10 أسابيع." },
    { title: "ادرس وتدرّب", body: "بنوك أسئلة ومراجعة مباشرة واختبارات محاكية كاملة." },
    { title: "انجح واعتمد", body: "ادخل الامتحان بثقة واحصل على شهادة CPHQ." },
  ],
  pricingTitle: "اختر الباقة المناسبة لك",
  pricingSub: "ابدأ مجانًا — وترقَّ عندما تكون جاهزًا للاعتماد.",
  plans: [
    { name: "الباقة المجانية", price: "مجانًا", tagline: "جرّب قبل أن تلتزم", cta: "ابدأ مجانًا", highlight: false,
      features: ["فحص مجاني للأهلية والجاهزية", "نموذج من بنك الأسئلة", "جلسة مباشرة تجريبية واحدة"] },
    { name: "الباقة الأساسية", price: "450 ج.م", tagline: "كل ما يلزم لاجتياز CPHQ", cta: "احجز مقعدي", highlight: true,
      features: ["+1,000 سؤال + اختبارات محاكية بوقت محدد", "جلسات مراجعة مباشرة أسبوعية", "مرشد CPHQ فردي", "محتوى بالعربية والإنجليزية", "ضمان النجاح"] },
  ],
  paymentsTitle: "طرق الدفع المتاحة",
  payments: ["Visa", "Mastercard", "Meeza", "فوري", "فودافون كاش", "InstaPay", "تحويل بنكي"],
  testimonialsTitle: "ممن اجتازوا الامتحان فعلاً",
  testimonials: [
    { quote: "الاختبارات المحاكية كانت شبه مطابقة لامتحان CPHQ الحقيقي. نجحت من أول محاولة.", name: "مريم أ.", role: "أخصائية جودة · الرياض" },
    { quote: "الدراسة بالعربية والإنجليزية جعلت مجال التحليلات يتّضح أخيرًا. يستحق كل قرش.", name: "د. عمر ك.", role: "مدير جودة · القاهرة" },
    { quote: "أبقاني مرشدي على المسار 10 أسابيع كاملة. حصلت على الاعتماد — ثم تمت ترقيتي بعدها.", name: "هالة س.", role: "مسؤولة سلامة المرضى · الدوحة" },
  ],
  faqTitle: "إجابات مريحة لكل ما تسأل",
  faqs: [
    { q: "هل أنا مؤهّل لامتحان CPHQ؟", a: "لا يوجد شرط صارم لـ CPHQ، لكن الخبرة في جودة الرعاية تساعد. نراجع خلفيتك مجانًا وننصحك قبل الحجز." },
    { q: "هل البرنامج بالعربية أم الإنجليزية؟", a: "كلاهما. الدروس وبنوك الأسئلة والجلسات المباشرة تُقدَّم بلغتين لتدرس باللغة الأوضح لك." },
    { q: "أين أؤدّي الامتحان؟", a: "يُقدَّم CPHQ من NAHQ عبر Prometric — أونلاين أو في مركز اختبار. نساعدك في التسجيل وتحديد الموعد." },
    { q: "كم يستغرق البرنامج؟", a: "معظم المتعلّمين يصبحون جاهزين خلال 10 أسابيع بالدراسة الجزئية. البرنامج بوتيرتك مع دعم مباشر أسبوعي." },
    { q: "كم التكلفة؟", a: "مراجعة ملفّك والجلسة التجريبية مجانية. البرنامج الكامل بـ 450 ج.م، ويشرح لك المستشار كل شيء قبل أن تقرّر." },
  ],
  applyTitle: "احجز مقعدك في الدفعة القادمة",
  applySub: "قدّم في 60 ثانية. سيؤكّد المرشد أهليتك لامتحان CPHQ ويرسل خطة دراسية مخصّصة خلال 24 ساعة — مجانًا ودون التزام.",
  applyBullets: ["فحص مجاني للأهلية والجاهزية", "خطة دراسية مخصّصة لـ 10 أسابيع", "تكلفة وجدول امتحان واضحان"],
  sticky: "احجز مقعدي",
  popular: "الأكثر اختيارًا",
} as Copy;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  const admin = await resolveSeoMetadata(PATH).catch(() => ({} as Metadata));
  return {
    ...admin,
    title: ar ? "تحضير امتحان CPHQ — اجتزه من أول مرة | IMETS" : "CPHQ Exam Prep — Pass on Your First Attempt | IMETS",
    description: ar
      ? "برنامج CPHQ بالعربية والإنجليزية: بنوك أسئلة، اختبارات محاكية، مراجعة مباشرة وإرشاد فردي مع ضمان النجاح. احجز مقعدك مجانًا."
      : "Bilingual CPHQ exam-prep program: question banks, mock exams, weekly live review and 1:1 mentoring with a pass guarantee. Reserve your seat free.",
  };
}

export default async function CphqLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = locale === "ar" ? AR : EN;
  const trackPath = locale === "ar" ? "/ar/lp/cphq" : PATH;
  const lang = locale === "ar" ? "ar" : "en";

  const courseLd = {
    "@context": "https://schema.org", "@type": "Course", name: "CPHQ Exam Preparation",
    description: "Bilingual CPHQ exam preparation: question banks, mock exams, live review and mentoring for healthcare quality professionals.",
    provider: { "@type": "Organization", name: "IMETS", sameAs: process.env.NEXT_PUBLIC_SITE_URL || "https://imetsedu.com" },
  };
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={[courseLd, faqLd]} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Stethoscope className="size-3.5" /> {c.badge}
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {c.h1a} <span className="text-primary">{c.h1b}</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{c.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-1.5"><a href="#apply">{c.ctaApply} <ArrowRight className="size-4 rtl:rotate-180" /></a></Button>
              <Button asChild size="lg" variant="outline"><a href="#curriculum">{c.ctaLearn}</a></Button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {c.facts.map((f) => <li key={f} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> {f}</li>)}
            </ul>
          </div>
          <div className="lg:ps-4">
            <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"><Sparkles className="size-4" /> {c.formEyebrow}</p>
            <CourseApplyForm path={trackPath} courseName={COURSE} lang={lang} />
          </div>
        </div>
      </section>

      {/* Authorities */}
      <section className="border-b border-border/60 bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 sm:px-6 lg:px-8">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{c.authLabel}</span>
          {c.auth.map((a) => <span key={a} className="rounded-md bg-muted px-3 py-1 text-sm font-semibold text-foreground/70">{a}</span>)}
        </div>
      </section>

      {/* Features (diploma advantages) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{c.featuresTitle}</h2>
          <p className="mt-3 text-muted-foreground">{c.featuresSub}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? CheckCircle2;
            return (
              <Card key={f.title} className="h-full">
                <CardContent className="space-y-2 py-6">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {c.stats.map((s, i) => {
            const Icon = STAT_ICONS[i];
            return (
              <div key={s.label} className="text-center">
                <Icon className="mx-auto mb-2 size-6 opacity-90" />
                <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="text-sm opacity-90">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight">{c.curriculumTitle}</h2>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"><BookOpen className="size-4" /> {c.curriculumNote}</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {c.modules.map((m, i) => (
            <li key={i} className="flex gap-4 rounded-xl border border-border/70 bg-card p-4">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
              <p className="pt-1 text-sm leading-relaxed text-foreground/90">{m}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Instructor */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div className="mx-auto grid aspect-square w-full max-w-xs place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5">
            <GraduationCap className="size-20 text-primary/50" />
          </div>
          <div className="space-y-4">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary"><Sparkles className="size-4" /> {c.instructor.eyebrow}</p>
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{c.instructor.name}</h2>
              <p className="text-sm text-muted-foreground">{c.instructor.role}</p>
            </div>
            <p className="text-muted-foreground">{c.instructor.bio}</p>
            <ul className="space-y-2 text-sm">
              {c.instructor.points.map((p) => <li key={p} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> {p}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{c.stepsTitle}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.map((s, i) => (
            <div key={s.title} className="rounded-xl border border-border/70 bg-card p-5">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{c.pricingTitle}</h2>
            <p className="mt-3 text-muted-foreground">{c.pricingSub}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {c.plans.map((p) => (
              <Card key={p.name} className={cn("h-full", p.highlight && "border-primary shadow-lg shadow-primary/10")}>
                <CardContent className="flex h-full flex-col gap-4 py-6">
                  {p.highlight && <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{c.popular}</span>}
                  <div><h3 className="text-lg font-semibold">{p.name}</h3><p className="text-sm text-muted-foreground">{p.tagline}</p></div>
                  <p className="text-2xl font-bold">{p.price}</p>
                  <ul className="flex-1 space-y-2 text-sm">
                    {p.features.map((f) => <li key={f} className="inline-flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {f}</li>)}
                  </ul>
                  <Button asChild variant={p.highlight ? "default" : "outline"} className="w-full"><a href="#apply">{p.cta}</a></Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Payment methods */}
          <div className="mt-10 text-center">
            <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground"><CreditCard className="size-4" /> {c.paymentsTitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {c.payments.map((m) => <span key={m} className="rounded-md border border-border/70 bg-card px-3 py-1.5 text-xs font-medium">{m}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{c.testimonialsTitle}</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {c.testimonials.map((t) => (
            <Card key={t.name} className="h-full">
              <CardContent className="flex h-full flex-col gap-4 py-6">
                <div className="flex gap-0.5 text-warning">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div>
                <p className="flex-1 text-sm leading-relaxed text-foreground/90">{t.quote}</p>
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{t.name.charAt(0)}</span>
                  <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">{c.faqTitle}</h2>
        <div className="space-y-3">
          {c.faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border/70 bg-card px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="border-t border-border/60 bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">{c.applyTitle}</h2>
            <p className="text-muted-foreground">{c.applySub}</p>
            <ul className="space-y-2 text-sm">
              {c.applyBullets.map((b) => <li key={b} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> {b}</li>)}
            </ul>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="size-4" /> {c.badge}</p>
          </div>
          <CourseApplyForm path={trackPath} courseName={COURSE} lang={lang} />
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border/70 bg-background/95 p-3 backdrop-blur lg:hidden">
        <span className="shrink-0 text-sm font-semibold text-primary">{c.plans[1]?.price}</span>
        <Button asChild size="lg" className="w-full gap-1.5"><a href="#apply">{c.sticky} <ArrowRight className="size-4 rtl:rotate-180" /></a></Button>
      </div>
    </div>
  );
}
