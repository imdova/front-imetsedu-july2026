import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Star, PlayCircle, CheckCircle2, Award, Users, Clock, BookOpen, GraduationCap,
  MessageCircle, BadgeCheck, CalendarDays, Stethoscope, ChevronLeft,
  Layers, ListChecks, ChevronRight, Building2,
  BarChart3, TrendingUp, ShieldCheck, FileCheck, ClipboardList, HeartPulse, Target,
  CreditCard, Wallet, Banknote, Landmark,
} from "lucide-react";

import { resolveSeoMetadata } from "@/lib/public-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";
import { SimpleLeadForm } from "@/features/marketing/components/simple-lead-form";
import { YouTubePlayer } from "@/features/marketing/components/youtube-player";
import { BrandImage } from "@/components/shared/brand-image";
import { BRAND } from "@/constants/navigation";
import { DiscountCountdown } from "@/features/marketing/components/discount-countdown";
import { StudentVideoReviews, type StudentReviewVideo } from "@/features/marketing/components/student-video-reviews";
import { StudentReviewGallery, type ReviewShot } from "@/features/marketing/components/student-review-gallery";
import { GraduationProjects, type GraduationProject } from "@/features/marketing/components/graduation-projects";
import { WhatsAppFab } from "@/features/marketing/components/whatsapp-fab";

const PATH = "/lp/mix/cphq";
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
  { icon: BadgeCheck, value: "92%", label: "First-attempt pass rate" },
  { icon: Clock, value: "10 weeks", label: "Program duration" },
  { icon: BookOpen, value: "8 units", label: "Built on the Exam Blueprint" },
  { icon: GraduationCap, value: "+500", label: "Practice questions" },
  { icon: Users, value: "+3,200", label: "Practitioners trained" },
  { icon: Award, value: "15 years", label: "Training experience" },
];

// Curriculum is always presented in English (per request).
const MODULES = [
  { icon: Users, title: "Organizational Leadership", desc: "Strategy, governance, project & change management, and building a culture of quality." },
  { icon: BarChart3, title: "Health Data Analytics", desc: "Collecting, measuring and interpreting data to drive quality decisions." },
  { icon: TrendingUp, title: "Performance & Process Improvement", desc: "Lean, Six Sigma and PDSA tools to design and improve care processes." },
  { icon: ShieldCheck, title: "Patient Safety", desc: "Risk management, error reduction and a proactive culture of safety." },
  { icon: FileCheck, title: "Regulatory & Accreditation Compliance", desc: "Standards, surveys and readiness for JCI, CBAHI and accreditation bodies." },
  { icon: ClipboardList, title: "Quality Review & Accountability", desc: "Peer review, credentialing and performance accountability." },
  { icon: HeartPulse, title: "Population Health & Care Transitions", desc: "Care coordination, safe transitions and population-level outcomes." },
  { icon: Target, title: "Exam Strategy & Full Mock Exams", desc: "Question-bank practice, timed mock exams and exam-day tactics." },
];

const STEPS = [
  { title: "سجّل بياناتك", body: "احجز مقعدك مجانًا في الدفعة القادمة خلال 60 ثانية." },
  { title: "تأكيد المقعد", body: "يتواصل معك المستشار لتأكيد الأهلية والإجابة عن أسئلتك." },
  { title: "ابدأ التعلّم", body: "محاضرات مباشرة على Zoom + تسجيلات ومراجعة أسبوعية." },
  { title: "اجتَز الامتحان", body: "مع دعم متواصل واختبارات محاكية حتى النجاح." },
];

const PAY_METHODS = [
  { icon: CreditCard, title: "بطاقات الائتمان", body: "Visa و Mastercard و مدى — دفع فوري وآمن." },
  { icon: Landmark, title: "تحويل بنكي", body: "حوّل الرسوم مباشرة إلى الحساب البنكي للمعهد." },
  { icon: Wallet, title: "محافظ إلكترونية", body: "فودافون كاش و InstaPay وغيرها من المحافظ." },
  { icon: Banknote, title: "الدفع النقدي", body: "ادفع نقدًا في مقر المعهد عند التسجيل." },
];

// Review screenshots. Default: one composite "reviews board" image saved at
// public/reviews/reviews-board.png. To switch to individual screenshots later,
// list them here as { src, alt } and the gallery renders a masonry grid.
const REVIEW_SHOTS: ReviewShot[] = [
  { src: "/reviews/reviews-board.png", alt: "IMETS Medical School student reviews — 96% recommend" },
];

// Student video testimonials. Each keeps its natural orientation — set
// `orientation: "portrait"` for Shorts/vertical clips, "landscape" for normal
// videos. One video → centered; multiple → centered wrap.
const STUDENT_VIDEOS: StudentReviewVideo[] = [
  { id: "dP_Mdn8VJGQ", name: "مراجعة طالب IMETS", role: "تجربة حقيقية", orientation: "portrait" },
  { id: "ZxFvcJidtII", name: "مراجعة طالب IMETS", role: "تجربة حقيقية", orientation: "portrait" },
  { id: "vHWOcdf88y4", name: "مراجعة طالب IMETS", role: "تجربة حقيقية", orientation: "landscape" },
  { id: "aPdec-1kBnQ", name: "مراجعة طالب IMETS", role: "تجربة حقيقية", orientation: "landscape" },
];

// Student graduation projects. Replace ids/titles/names with the real ones.
const GRADUATION_PROJECTS: GraduationProject[] = [
  { id: "vHWOcdf88y4", title: "Reducing Hospital-Acquired Infections by 30%", student: "اسم الطالب", jobTitle: "Quality Specialist", orientation: "landscape" },
  { id: "aPdec-1kBnQ", title: "Improving OR Turnaround Time with Lean", student: "اسم الطالب", jobTitle: "Quality Manager", orientation: "landscape" },
  { id: "dP_Mdn8VJGQ", title: "Medication Safety Improvement Project", student: "اسم الطالب", jobTitle: "Senior Nurse", orientation: "portrait" },
];

const FAQS = [
  { q: "ما هي شهادة CPHQ ومن يصدرها؟", a: "هي شهادة Certified Professional in Healthcare Quality الصادرة عن الرابطة الوطنية لجودة الرعاية الصحية (NAHQ) في الولايات المتحدة، وتُعدّ المعيار الذهبي عالميًا لمتخصصي جودة الرعاية الصحية." },
  { q: "هل أحتاج خبرة سابقة؟", a: "لا يوجد شرط صارم، لكن الخبرة في جودة الرعاية الصحية تفيد. نراجع ملفّك مجانًا وننصحك بجاهزيتك قبل الحجز." },
  { q: "ما شكل الامتحان وكم مدته؟", a: "امتحان إلكتروني من ١٤٠ سؤال اختيار من متعدد (تتضمن أسئلة تجريبية غير محتسبة) يُؤدّى خلال ٣ ساعات عبر Prometric." },
  { q: "بأي لغة يُعقد امتحان CPHQ؟", a: "يُعقد الامتحان باللغة الإنجليزية، ولهذا نُقدّم الشرح وبنوك الأسئلة بالعربية والإنجليزية معًا لنجهّزك تمامًا للمصطلحات الإنجليزية." },
  { q: "بأي لغة يُقدَّم البرنامج؟", a: "بالعربية والإنجليزية — الدروس وبنوك الأسئلة والدعم ثنائية اللغة." },
  { q: "هل المحاضرات مباشرة أم مسجّلة؟", a: "مباشرة على Zoom أسبوعيًا، مع تسجيلات متاحة لمدة ١٢ شهرًا لمراجعتها وقتما تشاء." },
  { q: "أين أؤدّي امتحان CPHQ؟", a: "يُقدَّم من NAHQ عبر Prometric، أونلاين أو في مركز اختبار، ونساعدك في التسجيل وتحديد الموعد." },
  { q: "ما مدة صلاحية الشهادة وكيف أُجدّدها؟", a: "شهادة CPHQ صالحة لمدة سنتين، وتُجدَّد عبر استيفاء ساعات التعليم المستمر المعتمدة (CE) التي تحددها NAHQ." },
  { q: "ماذا لو لم أجتز الامتحان؟", a: "نوفّر دعمًا متواصلًا واختبارات محاكية حتى تجتاز؛ ويتابع معك المدرّب نقاط ضعفك ويعيد تأهيلك للمحاولة التالية بثقة." },
  { q: "هل البرنامج مناسب لكل التخصصات الصحية؟", a: "نعم — للأطباء وأطباء الأسنان والصيادلة والممرضين ومتخصصي الجودة وكل العاملين في الرعاية الصحية الراغبين في احتراف الجودة." },
  { q: "متى تبدأ الدفعة القادمة؟", a: "تنطلق الدفعة القادمة قريبًا والمقاعد محدودة — سجّل بياناتك ليتواصل معك المستشار بموعد البدء وتفاصيل الجدول." },
  { q: "هل يوجد تقسيط؟", a: "نعم — تقسيط بدون فوائد على ٣ أقساط شهرية متساوية، وتبدأ الدراسة فور دفع القسط الأول." },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  await params;
  const admin = await resolveSeoMetadata(PATH).catch(() => ({} as Metadata));
  return {
    ...admin,
    title: "كورس تحضير امتحان CPHQ — اجتزه من أول مرة | IMETS",
    description: "كورس CPHQ تحضيري مباشر على Zoom لمدة ١٠ أسابيع: الدومينز السبعة، +٥٠٠ سؤال محاكاة، وامتحان تجريبي شامل. احجز مقعدك.",
  };
}

export default async function CphCloneePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const trackPath = locale === "ar" ? "/ar/lp/mix/cphq" : PATH;

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
              كورس تحضيري مباشر على Zoom لمدة ١٠ أسابيع، يغطّي الدومينز السبعة كاملة — بالعربية والإنجليزية.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#apply" className={cn(BTN, ORANGE)}>احجز مقعدك الآن <ChevronLeft className="size-4" /></a>
              <a href="#curriculum" className={cn(BTN, "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90")}>تعرّف على المنهج</a>
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
              {[
                { icon: CalendarDays, v: "10", l: "Weeks" },
                { icon: Layers, v: "7", l: "Domains" },
                { icon: ListChecks, v: "+500", l: "Questions" },
              ].map((s) => (
                <div key={s.l} className="flex flex-col items-center rounded-lg bg-white/5 py-3">
                  <s.icon className="mb-1 size-5 text-[#e8c14d]" />
                  <p className="text-lg font-bold">{s.v}</p>
                  <p className="text-white/70">{s.l}</p>
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

      {/* Limited-time 50% discount + countdown */}
      <div className="bg-white py-10 sm:py-14">
        <DiscountCountdown lang="en" hours={7} storageKey="cph_offer_deadline" showPrice={false} ctaHref="#apply" />
      </div>

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

      {/* About IMETS Medical School */}
      <section dir="ltr" className="border-y border-slate-200 bg-slate-50 text-left">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-5">
            <BrandImage
              kind="navbar"
              alt={BRAND.fullName}
              className="h-12 w-auto max-w-[200px] object-contain"
              fallback={
                <span className="inline-flex items-center gap-2 text-xl font-extrabold text-[#0b2545]">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#0b2545] text-white"><Building2 className="size-5" /></span>
                  {BRAND.fullName}
                </span>
              }
            />
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0b2545]">
              About IMETS Medical School
            </h2>
            <p className="leading-relaxed text-slate-600">
              IMETS Medical School is a specialized healthcare-education institute helping doctors, dentists,
              pharmacists, nurses and quality professionals earn internationally recognized certifications and
              advance their careers. For over 15 years we&apos;ve trained more than 3,200 practitioners across the
              region — combining expert faculty, exam-focused curricula, and bilingual (Arabic &amp; English) support.
            </p>
            <a href="#apply" className={cn(BTN, ORANGE)}>Join the next cohort <ChevronRight className="size-4" /></a>
          </div>
          <div className="overflow-hidden rounded-2xl bg-[#0b2545] shadow-xl ring-1 ring-black/5">
            <YouTubePlayer videoId="SSlmmUH2Ado" autoPlay={false} />
          </div>
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
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0b2545]">What you&apos;ll master</h2>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#B8860B]/10 px-3 py-1 text-sm font-semibold text-[#8a6508]">
            <BookOpen className="size-4" /> 10 weeks · 8 units built on the Exam Blueprint
          </p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {MODULES.map((m, i) => (
            <li
              key={i}
              className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#B8860B]/40 hover:shadow-md"
            >
              <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-[#0b2545] text-white transition group-hover:bg-[#B8860B]">
                <m.icon className="size-5" />
                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#B8860B] text-[10px] font-bold text-white ring-2 ring-white">
                  {i + 1}
                </span>
              </span>
              <div>
                <h3 className="font-bold text-[#0b2545]">{m.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{m.desc}</p>
              </div>
            </li>
          ))}
        </ol>
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

      {/* Student video testimonials */}
      <div className="border-y border-slate-200 bg-slate-50">
        <StudentVideoReviews videos={STUDENT_VIDEOS} />
      </div>

      {/* Student review screenshots (gallery) */}
      <StudentReviewGallery shots={REVIEW_SHOTS} recommendPct={96} reviewCount={52} />

      {/* Graduation projects */}
      <div className="border-t border-slate-200 bg-slate-50">
        <GraduationProjects projects={GRADUATION_PROJECTS} />
      </div>

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

      {/* Payment & installment */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#B8860B]">
              <CreditCard className="size-4" /> طرق الدفع المتاحة
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b2545]">الدفع والتقسيط</h2>
            <p className="mt-3 text-slate-600">ادفع بالطريقة الأنسب لك — مع خيار التقسيط بدون فوائد.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {PAY_METHODS.map((m) => (
                <div key={m.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#B8860B]/10 text-[#B8860B]"><m.icon className="size-5" /></span>
                  <div>
                    <h3 className="font-bold text-[#0b2545]">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-center rounded-2xl bg-[#0b2545] p-6 text-white shadow-xl ring-1 ring-black/5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#B8860B] px-3 py-1 text-xs font-bold">
                <CalendarDays className="size-3.5" /> الأكثر مرونة
              </span>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight">تقسيط بدون فوائد</h3>
              <p className="mt-2 text-white/80">قسّم رسوم الكورس على ٣ دفعات شهرية متساوية — بدون أي فوائد أو رسوم إضافية.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {["٣ أقساط شهرية متساوية", "بدون فوائد أو رسوم خفية", "تبدأ الدراسة فور دفع القسط الأول"].map((b) => (
                  <li key={b} className="inline-flex items-center gap-2 text-white/90"><CheckCircle2 className="size-4 text-[#e8c14d]" /> {b}</li>
                ))}
              </ul>
              <a href="#apply" className={cn(BTN, ORANGE, "mt-5 w-fit")}>اطلب خطة التقسيط <ChevronLeft className="size-4" /></a>
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
            <ShieldCheck className="size-4 text-emerald-600" /> جميع المدفوعات آمنة ومشفّرة.
          </p>
        </div>
      </section>

      {/* Apply (navy) — English lead capture */}
      <section id="apply" dir="ltr" style={{ backgroundColor: NAVY }} className="text-left text-white">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">Book your seat in the next cohort</h2>
            <p className="text-white/80">Apply in 60 seconds and an admissions advisor will reach out to confirm your seat and study plan — free, no obligation.</p>
            <ul className="space-y-2 text-sm">
              {["Seats are limited — next cohort starts soon", "Free eligibility review & personalized study plan", "Support guaranteed until you pass"].map((b) => (
                <li key={b} className="inline-flex items-center gap-2 text-white/90"><CheckCircle2 className="size-4 text-[#e8c14d]" /> {b}</li>
              ))}
            </ul>
            <p className="inline-flex items-center gap-2 text-sm text-white/70"><Stethoscope className="size-4" /> For doctors, dentists, pharmacists, nurses & quality professionals</p>
          </div>
          <SimpleLeadForm path={trackPath} courseName={COURSE} webhookUrl="https://aut.jobova.net/webhook/cphq" />
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <a href="#apply" className={cn(BTN, ORANGE, "flex-1")}>احجز مقعدك <ChevronLeft className="size-4" /></a>
      </div>

      {/* Floating WhatsApp */}
      <WhatsAppFab phone="201115782721" message="مرحبًا، أريد الاستفسار عن كورس CPHQ" />
    </div>
  );
}

/* lucide doesn't export a distinct icon name we need above; alias ClipboardCheck. */
function ClipboardCheckIcon(props: { className?: string }) {
  return <CheckCircle2 {...props} />;
}
