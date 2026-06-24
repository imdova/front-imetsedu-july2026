import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Star, PlayCircle, CheckCircle2, Award, Users, Clock, BookOpen, GraduationCap,
  MessageCircle, CreditCard, BadgeCheck, CalendarDays, Sparkles, Stethoscope, ChevronLeft,
} from "lucide-react";

import { resolveSeoMetadata } from "@/lib/public-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";
import { CourseApplyForm } from "@/features/marketing/components/course-apply-form";
import { YouTubePlayer } from "@/features/marketing/components/youtube-player";

const PATH = "/cph";
const COURSE = "CPHQ Course";

/* Source palette: deep navy + orange accent */
const NAVY = "#0b2545";
const BTN = "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition";
const ORANGE = "bg-[#B8860B] text-white shadow-sm hover:bg-[#9a7209]";

const AUTH = ["NAHQ · CPHQ", "SCFHS", "DHA", "DOH", "QCHP", "Prometric"];

const FEATURES = [
  { icon: PlayCircle, title: "محاضرات مباشرة على Zoom", body: "بثّ مباشر أسبوعي مع تسجيلات متاحة لمدة ١٢ شهرًا تراجعها وقتما تشاء." },
  { icon: MessageCircle, title: "دعم بالعربية والإنجليزية", body: "شرح ثنائي اللغة لكل مفهوم — باللغة التي تفهمها بوضوح أكبر." },
  { icon: BookOpen, title: "+٥٠٠ سؤال محاكاة", body: "بنك أسئلة اختيار من متعدد مع شروح مفصّلة لكل إجابة." },
  { icon: ClipboardCheckIcon, title: "امتحان محاكاة شامل", body: "اختبار كامل بوقت محدد يحاكي تجربة امتحان CPHQ الحقيقي." },
  { icon: Users, title: "مجموعة دراسة على واتساب", body: "مجتمع داعم للأسئلة والمتابعة اليومية مع الزملاء والمدرّب." },
  { icon: Award, title: "شهادة دولية معتمدة", body: "استعداد كامل لاجتياز CPHQ المعتمدة من NAHQ عالميًا." },
];

const STATS = [
  { icon: BadgeCheck, value: "٩٢٪", label: "نجاح من أول محاولة" },
  { icon: Clock, value: "١٠ أسابيع", label: "مدة البرنامج" },
  { icon: BookOpen, value: "٨ وحدات", label: "مبنية على Exam Blueprint" },
  { icon: GraduationCap, value: "+٥٠٠", label: "سؤال محاكاة" },
  { icon: Users, value: "+٣٬٢٠٠", label: "ممارس تم تدريبه" },
  { icon: Award, value: "١٥ سنة", label: "خبرة في التدريب" },
];

// Curriculum is always presented in English (per request).
const MODULES = [
  "Organizational Leadership",
  "Health Data Analytics",
  "Performance & Process Improvement",
  "Patient Safety",
  "Regulatory & Accreditation Compliance",
  "Quality Review & Accountability",
  "Population Health & Care Transitions",
  "Exam Strategy & Full Mock Exams",
];

const STEPS = [
  { title: "سجّل بياناتك", body: "احجز مقعدك مجانًا في الدفعة القادمة خلال 60 ثانية." },
  { title: "تأكيد المقعد", body: "يتواصل معك المستشار لتأكيد الأهلية والإجابة عن أسئلتك." },
  { title: "ابدأ التعلّم", body: "محاضرات مباشرة على Zoom + تسجيلات ومراجعة أسبوعية." },
  { title: "اجتَز الامتحان", body: "مع دعم متواصل واختبارات محاكية حتى النجاح." },
];

const PLANS = [
  {
    name: "الباقة الأساسية", price: "٤٬٥٠٠ جنيه", installments: "أو ٣ أقساط × ١٬٥٥٠ جنيه", highlight: false, cta: "احجز الباقة الأساسية",
    features: ["١٠ جلسات Zoom مباشرة", "تسجيلات متاحة ١٢ شهرًا", "+٥٠٠ سؤال محاكاة", "امتحان محاكاة واحد", "مجموعة واتساب للدراسة"],
  },
  {
    name: "الباقة المميزة", price: "٦٬٥٠٠ جنيه", installments: "أو ٣ أقساط × ٢٬٢٥٠ جنيه", highlight: true, cta: "احجز الباقة المميزة",
    features: ["كل مزايا الباقة الأساسية", "٣ استشارات فردية مع المدرّب", "٣ محاولات امتحان محاكاة", "خطة دراسية أسبوعية", "دعم التوظيف بعد الاجتياز"],
  },
];

const PAYMENTS = ["بطاقات ائتمان (Visa / Mastercard)", "تحويل بنكي", "InstaPay والمحافظ الإلكترونية", "الدفع النقدي (مكتب القاهرة)", "تقسيط بدون فوائد"];

const TESTIMONIALS = [
  { quote: "اجتزت CPHQ من أول مرة بفضل الاختبارات المحاكية، والشرح بالعربية سهّل الدومينز كلها.", name: "مريم أ.", role: "أخصائية جودة" },
  { quote: "د. محمد شرح كل دومين بوضوح، والتسجيلات ساعدتني أراجع في أي وقت يناسبني.", name: "عمر ك.", role: "مدير جودة" },
  { quote: "الباقة المميزة بالاستشارات الفردية فرق كبير — حصلت على الشهادة ثم تمت ترقيتي.", name: "هالة س.", role: "مسؤولة سلامة المرضى" },
];

const FAQS = [
  { q: "هل أحتاج خبرة سابقة؟", a: "لا يوجد شرط صارم، لكن الخبرة في جودة الرعاية الصحية تفيد. نراجع ملفّك مجانًا وننصحك قبل الحجز." },
  { q: "هل المحاضرات مباشرة أم مسجّلة؟", a: "مباشرة على Zoom أسبوعيًا، مع تسجيلات متاحة لمدة ١٢ شهرًا لمراجعتها وقتما تشاء." },
  { q: "بأي لغة يُقدَّم البرنامج؟", a: "بالعربية والإنجليزية — الدروس وبنوك الأسئلة والدعم ثنائية اللغة." },
  { q: "أين أؤدّي امتحان CPHQ؟", a: "يُقدَّم من NAHQ عبر Prometric، أونلاين أو في مركز اختبار، ونساعدك في التسجيل وتحديد الموعد." },
  { q: "هل يوجد تقسيط؟", a: "نعم — تقسيط بدون فوائد على ٣ أقساط لكلتا الباقتين." },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  await params;
  const admin = await resolveSeoMetadata(PATH).catch(() => ({} as Metadata));
  return {
    ...admin,
    title: "كورس تحضير امتحان CPHQ — اجتزه من أول مرة | IMETS",
    description: "كورس CPHQ تحضيري مباشر على Zoom لمدة ١٠ أسابيع مع د. محمد أحمد: الدومينز السبعة، +٥٠٠ سؤال محاكاة، وامتحان تجريبي شامل. احجز مقعدك.",
  };
}

export default async function CphCloneePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const trackPath = locale === "ar" ? "/ar/cph" : PATH;

  const courseLd = {
    "@context": "https://schema.org", "@type": "Course", name: "CPHQ Preparation Course",
    description: "CPHQ exam preparation — 10-week live program covering the seven domains, 500+ practice questions and a full mock exam.",
    provider: { "@type": "Organization", name: "IMETS", sameAs: process.env.NEXT_PUBLIC_SITE_URL || "https://imetsedu.com" },
  };
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div dir="rtl" className="bg-white pb-24 text-slate-800 lg:pb-0">
      <JsonLd data={[courseLd, faqLd]} />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16 lg:px-8">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#B8860B]/10 px-3 py-1 text-xs font-semibold text-[#8a6508]">
              <CalendarDays className="size-3.5" /> الدفعة القادمة تبدأ ١٥ يونيو ٢٠٢٦ · المقاعد المتاحة 7 من 30
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0b2545] sm:text-4xl lg:text-5xl">
              اجتَز امتحان CPHQ <span className="text-[#B8860B]">من أول مرة</span>
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-slate-600">
              كورس تحضيري مباشر على Zoom لمدة ١٠ أسابيع مع د. محمد أحمد، يغطّي الدومينز السبعة كاملة — بالعربية والإنجليزية.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#apply" className={cn(BTN, ORANGE)}>احجز مقعدك الآن <ChevronLeft className="size-4" /></a>
              <a href="#curriculum" className={cn(BTN, "border border-[#0b2545]/20 text-[#0b2545] hover:bg-[#0b2545]/5")}>تعرّف على المنهج</a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</span>
                <strong className="text-[#0b2545]">٤٫٨</strong> (١٬٣٤٠ تقييم)
              </span>
            </div>
          </div>

          {/* video / preview card */}
          <div className="overflow-hidden rounded-2xl bg-[#0b2545] text-white shadow-xl ring-1 ring-black/5">
            <YouTubePlayer videoId="R9-6cBqzczo" unmuteLabel="اضغط لتشغيل الصوت" />
            <div className="grid grid-cols-3 gap-2 p-4 text-center text-xs">
              {[["١٠", "أسابيع"], ["٧", "دومينز"], ["+٥٠٠", "سؤال"]].map(([v, l]) => (
                <div key={l} className="rounded-lg bg-white/5 py-3">
                  <p className="text-lg font-bold">{v}</p>
                  <p className="text-white/70">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Authorities */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 sm:px-6 lg:px-8">
          <span className="text-xs font-medium text-slate-500">معتمد ومتوافق مع</span>
          {AUTH.map((a) => <span key={a} className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">{a}</span>)}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0b2545]">مميزات الدبلومة كاملة</h2>
          <p className="mt-3 text-slate-600">كل ما تحتاجه لاجتياز CPHQ بثقة — في برنامج واحد.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="grid size-12 place-items-center rounded-xl bg-[#B8860B]/10 text-[#B8860B]"><f.icon className="size-6" /></div>
              <h3 className="mt-4 font-bold text-[#0b2545]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats band (navy) */}
      <section style={{ backgroundColor: NAVY }} className="text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-[#e8c14d]"><s.icon className="size-6" /></span>
              <div>
                <p className="text-2xl font-extrabold tracking-tight">{s.value}</p>
                <p className="text-sm text-white/70">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Curriculum */}
      <section id="curriculum" dir="ltr" className="mx-auto max-w-5xl px-4 py-16 text-left sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0b2545]">The seven domains — in full</h2>
          <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#B8860B]/10 px-3 py-1 text-sm font-semibold text-[#8a6508]">
            <BookOpen className="size-4" /> 10 weeks · 8 units built on the Exam Blueprint
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {MODULES.map((m, i) => (
            <li key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#0b2545] text-sm font-bold text-white">{i + 1}</span>
              <p className="text-sm font-medium leading-relaxed text-[#0b2545]">{m}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Instructor */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <div className="mx-auto grid aspect-square w-full max-w-xs place-items-center rounded-2xl bg-gradient-to-br from-[#13315c] to-[#0b2545] text-white/40">
            <GraduationCap className="size-24" />
          </div>
          <div className="space-y-4">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B8860B]"><Sparkles className="size-4" /> تعلّم مع خبير حقيقي</p>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#0b2545]">د. محمد أحمد</h2>
              <p className="text-sm text-slate-600">استشاري إدارة جودة الرعاية الصحية · خبرة +١٥ سنة</p>
            </div>
            <p className="leading-relaxed text-slate-600">
              حاصل على شهادات CPHQ و CSSBB و LSSBB، ومستشار اعتماد JCI لأكثر من ١٢ مستشفى. درّب أكثر من ٢٢٬٠٠٠ ممارس صحي — وكل درس يعكس ما يختبره امتحان CPHQ فعليًا اليوم.
            </p>
            <ul className="grid gap-2 text-sm sm:grid-cols-2">
              {["CPHQ · CSSBB · LSSBB", "مستشار اعتماد JCI لـ +١٢ مستشفى", "+٢٢٬٠٠٠ ممارس مدرّب", "خبرة +١٥ سنة"].map((p) => (
                <li key={p} className="inline-flex items-center gap-2 text-slate-700"><CheckCircle2 className="size-4 text-[#B8860B]" /> {p}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0b2545]">خطوات الالتحاق</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="grid size-10 place-items-center rounded-full bg-[#B8860B] text-base font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-bold text-[#0b2545]">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0b2545]">اختر الباقة المناسبة لك</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {PLANS.map((p) => (
              <div key={p.name} className={cn("flex flex-col rounded-2xl bg-white p-6 shadow-sm", p.highlight ? "ring-2 ring-[#B8860B]" : "ring-1 ring-slate-200")}>
                {p.highlight && <span className="mb-2 w-fit rounded-full bg-[#B8860B] px-2.5 py-0.5 text-xs font-bold text-white">الأكثر اختيارًا</span>}
                <h3 className="text-lg font-bold text-[#0b2545]">{p.name}</h3>
                <p className="mt-2 text-3xl font-extrabold text-[#0b2545]">{p.price}</p>
                <p className="text-sm text-slate-500">{p.installments}</p>
                <ul className="mt-4 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => <li key={f} className="flex items-start gap-2 text-slate-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#B8860B]" /> {f}</li>)}
                </ul>
                <a href="#apply" className={cn(BTN, "mt-5", p.highlight ? ORANGE : "border border-[#0b2545]/20 text-[#0b2545] hover:bg-[#0b2545]/5")}>{p.cta}</a>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500"><CreditCard className="size-4" /> طرق الدفع المتاحة</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PAYMENTS.map((m) => <span key={m} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">{m}</span>)}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0b2545]">ممن اجتازوا الامتحان فعلاً</h2>
        <div className="grid gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</span>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-700">{t.quote}</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-[#0b2545]/10 font-bold text-[#0b2545]">{t.name.charAt(0)}</span>
                <div><p className="text-sm font-bold text-[#0b2545]">{t.name}</p><p className="text-xs text-slate-500">{t.role}</p></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-[#0b2545]">إجابات مريحة لكل ما تسأل</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#0b2545]">
                {f.q}
                <ChevronLeft className="size-4 shrink-0 text-slate-400 transition-transform group-open:-rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Apply (navy) */}
      <section id="apply" style={{ backgroundColor: NAVY }} className="text-white">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">احجز مقعدك في الدفعة القادمة</h2>
            <p className="text-white/80">قدّم في 60 ثانية وسيتواصل معك مستشار القبول لتأكيد مقعدك وخطتك الدراسية — مجانًا ودون التزام.</p>
            <ul className="space-y-2 text-sm">
              {["المقاعد المتاحة 7 من 30 — تبدأ ١٥ يونيو ٢٠٢٦", "تقسيط بدون فوائد على ٣ أقساط", "ضمان الدعم حتى النجاح"].map((b) => (
                <li key={b} className="inline-flex items-center gap-2 text-white/90"><CheckCircle2 className="size-4 text-[#e8c14d]" /> {b}</li>
              ))}
            </ul>
            <p className="inline-flex items-center gap-2 text-sm text-white/70"><Stethoscope className="size-4" /> للممرضين والأطباء والصيادلة ومتخصصي الجودة</p>
          </div>
          <CourseApplyForm path={trackPath} courseName={COURSE} lang="ar" />
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <span className="shrink-0 text-sm font-bold text-[#0b2545]">٤٬٥٠٠ جنيه</span>
        <a href="#apply" className={cn(BTN, ORANGE, "flex-1")}>احجز مقعدك <ChevronLeft className="size-4" /></a>
      </div>
    </div>
  );
}

/* lucide doesn't export a distinct icon name we need above; alias ClipboardCheck. */
function ClipboardCheckIcon(props: { className?: string }) {
  return <CheckCircle2 {...props} />;
}
