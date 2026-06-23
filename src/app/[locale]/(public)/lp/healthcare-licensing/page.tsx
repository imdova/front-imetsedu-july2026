import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight, Stethoscope, ClipboardCheck, FileText, Briefcase, BadgeCheck, Award,
  Users, Star, CheckCircle2, Clock, Globe, ShieldCheck, MessageCircle, Sparkles, GraduationCap, Quote,
} from "lucide-react";

import { resolveSeoMetadata } from "@/lib/public-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CourseApplyForm } from "@/features/marketing/components/course-apply-form";

const PATH = "/lp/healthcare-licensing";
const COURSE = "Gulf Healthcare Licensing & Placement Program";

const STAT_ICONS = [Users, BadgeCheck, Briefcase, Star];
const OUTCOME_ICONS = [ClipboardCheck, FileText, GraduationCap, Briefcase];
const WHY_ICONS = [Globe, Clock, ShieldCheck, MessageCircle];

type Copy = {
  badge: string; h1a: string; h1b: string; sub: string; ctaApply: string; ctaLearn: string;
  facts: string[]; formEyebrow: string; authLabel: string; auth: string[];
  stats: { value: string; label: string }[];
  outcomesTitle: string; outcomesSub: string; outcomes: { title: string; body: string }[];
  curriculumTitle: string; modules: string[];
  audienceTitle: string; audience: string[]; finishTitle: string; finishBody: string;
  stepsTitle: string; steps: { title: string; body: string }[];
  instructor: { eyebrow: string; name: string; role: string; bio: string; points: string[] };
  whyTitle: string; why: { title: string; body: string }[];
  pricingTitle: string; pricingSub: string; plans: { name: string; price: string; tagline: string; features: string[]; cta: string; highlight: boolean }[];
  testimonialsTitle: string; testimonials: { quote: string; name: string; role: string }[];
  faqTitle: string; faqs: { q: string; a: string }[];
  applyTitle: string; applySub: string; applyBullets: string[]; sticky: string;
};

const EN: Copy = {
  badge: "For nurses, doctors, pharmacists & allied health",
  h1a: "Get licensed to work in the Gulf —", h1b: "and land the job.",
  sub: "One program takes you from exam prep to a signed offer: SCFHS / DHA / DOH / MOH / QCHP preparation, DataFlow and portal help, a recruiter-ready CV, and direct introductions to hiring hospitals.",
  ctaApply: "Apply now — free", ctaLearn: "See what you'll learn",
  facts: ["100% online", "8–12 weeks", "Pass guarantee", "1:1 mentor"],
  formEyebrow: "Free profile review & licensing roadmap",
  authLabel: "Exam preparation accepted by",
  auth: ["SCFHS", "DHA", "DOH / HAAD", "MOH", "QCHP", "Prometric"],
  stats: [
    { value: "12,000+", label: "Professionals trained" }, { value: "92%", label: "First-attempt pass rate" },
    { value: "30+", label: "Hiring hospital partners" }, { value: "4.9/5", label: "Average learner rating" },
  ],
  outcomesTitle: "Everything you need to make the move",
  outcomesSub: "From the first practice question to your first day on the ward.",
  outcomes: [
    { title: "Pass your licensing exam", body: "Targeted prep for SCFHS, DHA, DOH, MOH & QCHP — built around the real Prometric blueprint." },
    { title: "Clear DataFlow & registration", body: "Step-by-step help with DataFlow verification, Mumaris+ and Sheryan portal applications." },
    { title: "Be exam-ready fast", body: "Question banks, timed mock exams and weekly mentor sessions get you confident in weeks." },
    { title: "Land the job", body: "A Gulf-ready CV, interview coaching and direct introductions to our hiring hospital partners." },
  ],
  curriculumTitle: "What's inside the program",
  modules: [
    "Exam blueprint & study plan tailored to your profession and target authority",
    "1,500+ practice questions with detailed rationales + full-length timed mock exams",
    "DataFlow primary-source verification — documents, timelines and common rejections",
    "Mumaris+ (SCFHS), Sheryan (DHA) and DOH portal walkthroughs, step by step",
    "Gulf-ready CV rebuild + LinkedIn optimization for healthcare recruiters",
    "Interview preparation: clinical scenarios, OSCE tips and English fluency drills",
    "Job placement support: curated openings and warm introductions to partner hospitals",
  ],
  audienceTitle: "Who it's for",
  audience: ["Nurses", "Doctors & physicians", "Pharmacists", "Dentists", "Lab technologists", "Radiographers", "Physiotherapists", "Allied health"],
  finishTitle: "You'll finish with",
  finishBody: "A passed (or exam-ready) license, a verified DataFlow file, a recruiter-ready CV — and a shortlist of hospitals that want to interview you.",
  stepsTitle: "4 steps to start your journey",
  steps: [
    { title: "Apply free", body: "Tell us your profession and target country." },
    { title: "Get your roadmap", body: "An advisor builds your personalized licensing plan." },
    { title: "Study & pass", body: "Question banks, mocks and mentor sessions until you're ready." },
    { title: "Get hired", body: "We polish your CV and introduce you to hiring hospitals." },
  ],
  instructor: {
    eyebrow: "Learn from a real expert", name: "Dr. Mohamed Ahmed",
    role: "Consultant & licensing mentor · 15+ years",
    bio: "Mohamed has guided thousands of nurses, pharmacists and physicians through the SCFHS, DHA and QCHP exams — and into jobs across the Gulf. Every lesson reflects what the real exams test today.",
    points: ["Passed and now coaches all 5 Gulf authority exams", "Mentored 12,000+ healthcare professionals", "Direct line to 30+ hiring hospitals"],
  },
  whyTitle: "Why healthcare professionals choose IMETS",
  why: [
    { title: "Built for the Gulf", body: "Content maintained by clinicians who passed these exams and now hire in KSA, UAE & Qatar." },
    { title: "Learn around your shifts", body: "100% online, self-paced lessons plus live evening clinics for working professionals." },
    { title: "Pass guarantee", body: "Didn't pass on your first attempt? Keep your access free until you do." },
    { title: "1:1 mentor support", body: "A dedicated advisor guides you from application to job offer — on WhatsApp." },
  ],
  pricingTitle: "Choose the plan that fits you",
  pricingSub: "Start free — upgrade when you're ready to get licensed.",
  plans: [
    { name: "Free plan", price: "Free", tagline: "Test the waters", cta: "Start free", highlight: false,
      features: ["Free profile & exam-readiness check", "Sample question bank", "Licensing roadmap PDF"] },
    { name: "Full program", price: "Get a quote", tagline: "Everything to get licensed & hired", cta: "Apply now", highlight: true,
      features: ["1,500+ questions + timed mock exams", "DataFlow & portal guidance", "CV rebuild + interview coaching", "Job placement introductions", "Pass guarantee"] },
  ],
  testimonialsTitle: "Professionals already working in the Gulf",
  testimonials: [
    { quote: "I passed my SCFHS exam on the first try and had two hospital interviews within a month. The mock exams were almost identical to the real thing.", name: "Mariam A.", role: "Staff Nurse · now in Riyadh" },
    { quote: "DataFlow was the part I dreaded most. My advisor walked me through every document — approved with zero rejections.", name: "Dr. Omar K.", role: "GP · now in Dubai" },
    { quote: "The CV rebuild alone was worth it. Recruiters finally started replying. Landed a pharmacist role in Doha.", name: "Hala S.", role: "Pharmacist · now in Qatar" },
  ],
  faqTitle: "Questions, answered",
  faqs: [
    { q: "Which licensing exams does the program cover?", a: "All major Gulf authorities: SCFHS (Saudi Arabia), DHA (Dubai), DOH/HAAD (Abu Dhabi), MOH (UAE) and QCHP (Qatar). Your study plan is tailored to the one you choose." },
    { q: "How long does it take?", a: "Most professionals are exam-ready in 8–12 weeks studying part-time. The program is self-paced." },
    { q: "Do you help with DataFlow and the portals?", a: "Yes — DataFlow primary-source verification and the Mumaris+, Sheryan and DOH portal applications, including the documents that most often cause delays." },
    { q: "Is there really job placement?", a: "We partner with 30+ hospitals across the Gulf. Once you're licensed (or close to it), we share curated openings and make warm introductions." },
    { q: "What does it cost to apply?", a: "Applying is completely free. An advisor reviews your profile, recommends the right track and explains fees — with no obligation." },
  ],
  applyTitle: "Start your Gulf career today",
  applySub: "Apply in 60 seconds. An admissions advisor will review your profile and send a personalized licensing roadmap within 24 hours — free, no obligation.",
  applyBullets: ["Free profile & exam-readiness check", "Personalized SCFHS/DHA/DOH/MOH/QCHP plan", "Clear fees and timeline — no surprises"],
  sticky: "Apply now — free",
};

const AR: Copy = {
  badge: "للممرضين والأطباء والصيادلة والمهن الصحية",
  h1a: "اجتَز امتحان الترخيص من أول مرة —", h1b: "واعمل في الخليج.",
  sub: "برنامج واحد ينقلك من التحضير للامتحان إلى عقد عمل: تحضير امتحانات SCFHS / DHA / DOH / MOH / QCHP، ومساعدة في DataFlow والبوابات، وسيرة ذاتية جاهزة للتوظيف، وترشيحات مباشرة لمستشفيات توظّف الآن.",
  ctaApply: "قدّم الآن — مجانًا", ctaLearn: "تعرّف على المنهج",
  facts: ["أونلاين 100%", "8–12 أسبوعًا", "ضمان النجاح", "مرشد شخصي"],
  formEyebrow: "مراجعة مجانية لملفك وخريطة طريق للترخيص",
  authLabel: "تحضير معتمد لامتحانات",
  auth: ["SCFHS", "DHA", "DOH / HAAD", "MOH", "QCHP", "Prometric"],
  stats: [
    { value: "+12,000", label: "متخصص تم تدريبه" }, { value: "92%", label: "نجاح من أول محاولة" },
    { value: "+30", label: "مستشفى شريك للتوظيف" }, { value: "4.9/5", label: "تقييم المتدربين" },
  ],
  outcomesTitle: "كل ما تحتاجه لإتمام الانتقال",
  outcomesSub: "من أول سؤال تدريبي حتى أول يوم لك في المستشفى.",
  outcomes: [
    { title: "اجتَز امتحان الترخيص", body: "تحضير مركّز لامتحانات SCFHS وDHA وDOH وMOH وQCHP مبني على مخطط Prometric الفعلي." },
    { title: "أنهِ DataFlow والتسجيل", body: "مساعدة خطوة بخطوة في توثيق DataFlow وتقديمات بوابتَي Mumaris+ وSheryan." },
    { title: "كن جاهزًا للامتحان سريعًا", body: "بنوك أسئلة واختبارات محاكية بوقت محدد وجلسات إرشاد أسبوعية تمنحك الثقة خلال أسابيع." },
    { title: "احصل على الوظيفة", body: "سيرة ذاتية جاهزة للخليج، وتدريب على المقابلات، وترشيحات مباشرة لمستشفياتنا الشريكة." },
  ],
  curriculumTitle: "ماذا يتضمّن البرنامج",
  modules: [
    "مخطط الامتحان وخطة دراسية مخصّصة حسب تخصصك والجهة المستهدفة",
    "+1,500 سؤال تدريبي مع شروح مفصّلة + اختبارات محاكية كاملة بوقت محدد",
    "توثيق DataFlow من المصدر — المستندات والجداول الزمنية وأسباب الرفض الشائعة",
    "شرح بوابات Mumaris+ (SCFHS) وSheryan (DHA) وDOH خطوة بخطوة",
    "إعادة بناء السيرة الذاتية وتحسين LinkedIn لمسؤولي التوظيف الصحي",
    "التحضير للمقابلات: سيناريوهات سريرية ونصائح OSCE وتدريب على الطلاقة بالإنجليزية",
    "دعم التوظيف: وظائف مختارة وترشيحات مباشرة للمستشفيات الشريكة",
  ],
  audienceTitle: "لمن هذا البرنامج",
  audience: ["الممرضون", "الأطباء", "الصيادلة", "أطباء الأسنان", "أخصائيو المختبرات", "أخصائيو الأشعة", "أخصائيو العلاج الطبيعي", "المهن الصحية"],
  finishTitle: "ستنتهي ومعك",
  finishBody: "ترخيص مُجتاز (أو جاهز للامتحان)، وملف DataFlow موثّق، وسيرة ذاتية جاهزة للتوظيف — وقائمة مستشفيات ترغب في مقابلتك.",
  stepsTitle: "4 خطوات لتبدأ رحلتك",
  steps: [
    { title: "قدّم مجانًا", body: "أخبرنا بتخصصك والدولة المستهدفة." },
    { title: "احصل على خريطتك", body: "يضع لك المستشار خطة ترخيص مخصّصة." },
    { title: "ادرس وانجح", body: "بنوك أسئلة واختبارات محاكية وجلسات إرشاد حتى الجاهزية." },
    { title: "احصل على وظيفة", body: "نحسّن سيرتك الذاتية ونرشّحك لمستشفيات توظّف الآن." },
  ],
  instructor: {
    eyebrow: "تعلّم مع خبير حقيقي", name: "د. محمد أحمد",
    role: "استشاري ومرشد ترخيص · خبرة +15 سنة",
    bio: "أرشد محمد آلاف الممرضين والصيادلة والأطباء لاجتياز امتحانات SCFHS وDHA وQCHP — والحصول على وظائف في الخليج. كل درس يعكس ما تختبره الامتحانات فعليًا اليوم.",
    points: ["اجتاز ويُدرّب على امتحانات الجهات الخليجية الخمس", "أرشد +12,000 متخصص صحي", "تواصل مباشر مع +30 مستشفى توظّف"],
  },
  whyTitle: "لماذا يختار المتخصصون الصحيون IMETS",
  why: [
    { title: "مصمَّم للخليج", body: "محتوى يحدّثه أطباء اجتازوا هذه الامتحانات ويوظّفون الآن في السعودية والإمارات وقطر." },
    { title: "تعلّم حول مواعيد عملك", body: "أونلاين 100% بوتيرتك الخاصة مع جلسات مسائية مباشرة للمهنيين العاملين." },
    { title: "ضمان النجاح", body: "لم تنجح من أول محاولة؟ يبقى وصولك مجانيًا حتى تنجح." },
    { title: "دعم مرشد شخصي", body: "مستشار مخصّص يرافقك من التقديم حتى عرض العمل — عبر واتساب." },
  ],
  pricingTitle: "اختر الباقة المناسبة لك",
  pricingSub: "ابدأ مجانًا — وترقَّ عندما تكون جاهزًا للترخيص.",
  plans: [
    { name: "الباقة المجانية", price: "مجانًا", tagline: "جرّب قبل أن تلتزم", cta: "ابدأ مجانًا", highlight: false,
      features: ["مراجعة مجانية لملفك وجاهزيتك للامتحان", "نموذج من بنك الأسئلة", "خريطة طريق الترخيص PDF"] },
    { name: "البرنامج الكامل", price: "اطلب عرض السعر", tagline: "كل ما يلزم للترخيص والتوظيف", cta: "قدّم الآن", highlight: true,
      features: ["+1,500 سؤال + اختبارات محاكية بوقت محدد", "إرشاد DataFlow والبوابات", "إعادة بناء السيرة + تدريب المقابلات", "ترشيحات توظيف", "ضمان النجاح"] },
  ],
  testimonialsTitle: "متخصصون يعملون بالفعل في الخليج",
  testimonials: [
    { quote: "اجتزت امتحان SCFHS من أول محاولة وحصلت على مقابلتين خلال شهر. الاختبارات المحاكية كانت شبه مطابقة للحقيقي.", name: "مريم أ.", role: "ممرضة · الآن في الرياض" },
    { quote: "كان DataFlow أكثر ما أخشاه. أرشدني المستشار في كل مستند — اعتُمد دون أي رفض.", name: "د. عمر ك.", role: "طبيب عام · الآن في دبي" },
    { quote: "إعادة بناء السيرة الذاتية وحدها كانت تستحق. بدأ مسؤولو التوظيف بالرد. حصلت على وظيفة صيدلي في الدوحة.", name: "هالة س.", role: "صيدلانية · الآن في قطر" },
  ],
  faqTitle: "إجابات مريحة لكل ما تسأل",
  faqs: [
    { q: "ما الامتحانات التي يغطّيها البرنامج؟", a: "كل الجهات الخليجية الكبرى: SCFHS (السعودية)، DHA (دبي)، DOH/HAAD (أبوظبي)، MOH (الإمارات)، QCHP (قطر). خطتك مخصّصة للجهة التي تختارها." },
    { q: "كم يستغرق البرنامج؟", a: "معظم المتخصصين يصبحون جاهزين للامتحان خلال 8–12 أسبوعًا بالدراسة الجزئية. البرنامج بوتيرتك الخاصة." },
    { q: "هل تساعدون في DataFlow والبوابات؟", a: "نعم — توثيق DataFlow من المصدر وتقديمات بوابات Mumaris+ وSheryan وDOH، بما في ذلك المستندات التي تسبّب التأخير غالبًا." },
    { q: "هل هناك توظيف فعلي؟", a: "نتعاون مع +30 مستشفى في الخليج. بمجرد ترخيصك (أو اقترابك منه) نشارك وظائف مختارة ونرشّحك مباشرة." },
    { q: "كم تكلفة التقديم؟", a: "التقديم مجاني تمامًا. يراجع المستشار ملفك ويقترح المسار المناسب ويشرح الرسوم — دون أي التزام." },
  ],
  applyTitle: "ابدأ مسيرتك في الخليج اليوم",
  applySub: "قدّم في 60 ثانية. سيراجع مستشار القبول ملفك ويرسل خريطة طريق ترخيص مخصّصة خلال 24 ساعة — مجانًا ودون التزام.",
  applyBullets: ["مراجعة مجانية لملفك وجاهزيتك للامتحان", "خطة مخصّصة SCFHS/DHA/DOH/MOH/QCHP", "رسوم وجدول زمني واضحان — دون مفاجآت"],
  sticky: "قدّم الآن — مجانًا",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  const admin = await resolveSeoMetadata(PATH).catch(() => ({} as Metadata));
  return {
    ...admin,
    title: ar
      ? "اعمل في الخليج — ترخيص ووظائف للمهن الصحية | IMETS"
      : "Get Licensed to Work in the Gulf — Healthcare Licensing & Placement | IMETS",
    description: ar
      ? "تحضير امتحانات SCFHS وDHA وDOH وMOH وQCHP، ومساعدة DataFlow، وسيرة ذاتية جاهزة، ودعم التوظيف للممرضين والأطباء والصيادلة والمهن الصحية. قدّم مجانًا."
      : "Exam prep for SCFHS, DHA, DOH, MOH & QCHP, DataFlow help, a Gulf-ready CV and job placement support for nurses, doctors, pharmacists and allied health. Apply free.",
  };
}

export default async function HealthcareLicensingLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = locale === "ar" ? AR : EN;
  const trackPath = locale === "ar" ? "/ar/lp/healthcare-licensing" : PATH;
  const lang = locale === "ar" ? "ar" : "en";

  const courseLd = {
    "@context": "https://schema.org", "@type": "Course", name: COURSE,
    description: "Licensing exam preparation (SCFHS, DHA, DOH, MOH, QCHP), DataFlow guidance, CV building and job placement for healthcare professionals seeking to work in the Gulf.",
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
          {c.auth.map((a) => (
            <span key={a} className="rounded-md bg-muted px-3 py-1 text-sm font-semibold text-foreground/70">{a}</span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/60 bg-primary text-primary-foreground">
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

      {/* Outcomes */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{c.outcomesTitle}</h2>
          <p className="mt-3 text-muted-foreground">{c.outcomesSub}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.outcomes.map((o, i) => {
            const Icon = OUTCOME_ICONS[i];
            return (
              <Card key={o.title} className="h-full">
                <CardContent className="space-y-2 py-6">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
                  <h3 className="font-semibold">{o.title}</h3>
                  <p className="text-sm text-muted-foreground">{o.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Curriculum + audience */}
      <section id="curriculum" className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:px-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{c.curriculumTitle}</h2>
            <ol className="mt-6 space-y-4">
              {c.modules.map((m, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{i + 1}</span>
                  <p className="pt-1 text-sm leading-relaxed text-foreground/90">{m}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-3 py-6">
                <h3 className="flex items-center gap-2 font-semibold"><Users className="size-5 text-primary" /> {c.audienceTitle}</h3>
                <ul className="grid grid-cols-1 gap-1.5 text-sm text-muted-foreground">
                  {c.audience.map((a) => <li key={a} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> {a}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="space-y-2 py-6">
                <h3 className="flex items-center gap-2 font-semibold"><Award className="size-5 text-primary" /> {c.finishTitle}</h3>
                <p className="text-sm text-muted-foreground">{c.finishBody}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{c.stepsTitle}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.steps.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border border-border/70 bg-card p-5">
              <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
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

      {/* Why */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold tracking-tight">{c.whyTitle}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.why.map((w, i) => {
            const Icon = WHY_ICONS[i];
            return (
              <div key={w.title} className="space-y-2">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
                <h3 className="font-semibold">{w.title}</h3>
                <p className="text-sm text-muted-foreground">{w.body}</p>
              </div>
            );
          })}
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
                  {p.highlight && <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{lang === "ar" ? "الأكثر اختيارًا" : "Most popular"}</span>}
                  <div>
                    <h3 className="text-lg font-semibold">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.tagline}</p>
                  </div>
                  <p className="text-2xl font-bold">{p.price}</p>
                  <ul className="flex-1 space-y-2 text-sm">
                    {p.features.map((f) => <li key={f} className="inline-flex items-start gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {f}</li>)}
                  </ul>
                  <Button asChild variant={p.highlight ? "default" : "outline"} className="w-full"><a href="#apply">{p.cta}</a></Button>
                </CardContent>
              </Card>
            ))}
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
                <Quote className="size-6 text-primary/40" />
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
          </div>
          <CourseApplyForm path={trackPath} courseName={COURSE} lang={lang} />
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 p-3 backdrop-blur lg:hidden">
        <Button asChild size="lg" className="w-full gap-1.5"><a href="#apply">{c.sticky} <ArrowRight className="size-4 rtl:rotate-180" /></a></Button>
      </div>
    </div>
  );
}
