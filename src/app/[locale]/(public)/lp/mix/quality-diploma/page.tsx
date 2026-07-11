import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Star, PlayCircle, CheckCircle2, Award, Users, Clock, BookOpen, GraduationCap,
  MessageCircle, BadgeCheck, CalendarDays, Stethoscope, ChevronLeft,
  Layers, ListChecks, ChevronRight, Building2,
  CreditCard, Wallet, Banknote, Landmark, ShieldCheck,
  Phone, Send,
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
import { StudentReviewCards } from "@/features/marketing/components/student-review-cards";
import { GraduationProjects, type GraduationProject } from "@/features/marketing/components/graduation-projects";
import { WhatsAppFab } from "@/features/marketing/components/whatsapp-fab";
import { dal } from "@/lib/dal";
import { MasterCurriculumAccordion } from "@/features/marketing/components/master-curriculum-accordion";
import { LeadFormModal } from "@/features/marketing/components/lead-form-modal";
import { CountUp } from "@/features/marketing/components/count-up";

const PATH = "/lp/mix/quality-diploma";
const COURSE = "Healthcare Quality Diploma (AIHCM)";

/* Palette: royal blue = primary identity · gold = CTA / accent only (matches campaign creative) */
const BLUE_GRAD =
  "bg-[radial-gradient(ellipse_120%_90%_at_50%_-10%,#1e6ef0_0%,#0b3fa8_42%,#051a4a_100%)]";
const BLUE_ICON = "bg-[#0b3fa8]/12 text-[#0b3fa8]";
const BTN = "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition";
const GOLD_CTA = "bg-[#f4c430] text-[#051a4a] shadow-md hover:bg-[#e0b020]";

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

const WEBHOOK = "https://aut.jobova.net/webhook/cphq";

// Realistic, supportable outcomes — deliberately no unguaranteed promises
// (e.g. "you'll travel" / "your salary will rise").
const OUTCOMES = [
  { icon: Building2, title: "فرص أفضل في المستشفيات", body: "مؤهل مطلوب في المستشفيات والمنشآت الساعية لاعتماد الجودة." },
  { icon: GraduationCap, title: "تعزيز فرص الترقية", body: "خطوة معتمدة نحو أدوار قيادة الجودة وسلامة المرضى." },
  { icon: BadgeCheck, title: "شهادة معترف بها دوليًا", body: "CPHQ من NAHQ الأمريكية — معيار عالمي في جودة الرعاية الصحية." },
  { icon: Award, title: "ميزة تنافسية", body: "تميّزك عند التقديم على وظائف الجودة والاعتماد." },
];

// "Is this for you?" — objection handling.
const AUDIENCE = ["طبيب", "صيدلي", "تمريض", "طبيب أسنان", "مدير / أخصائي جودة", "مكافحة عدوى", "إداري مستشفيات", "خريج يستهدف الجودة"];

// Why IMETS vs. other academies / online courses.
const COMPARE = [
  { feature: "حضور أونلاين لايف عن طريق ZOOM", others: "أحيانًا" },
  { feature: "متابعة مستمرة حتى الامتحان", others: "❌" },
  { feature: "محاضرون معتمدون", others: "أحيانًا" },
  { feature: "تسجيلات متاحة ١٢ شهرًا", others: "❌" },
  { feature: "بنك أسئلة شامل ومحدّث", others: "أحيانًا" },
  { feature: "مشاريع عملية وتطبيقية", others: "❌" },
  { feature: "مجتمع خريجين وتواصل مستمر", others: "❌" },
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
  { q: "هل أحتاج خبرة قبل الكورس؟", a: "لا يوجد شرط صارم لسنوات الخبرة، لكن أي خلفية في الرعاية الصحية أو الجودة تساعدك. نراجع ملفّك مجانًا ونحدّد لك نقطة البداية المناسبة قبل التسجيل." },
  { q: "هل الكورس مناسب للأطباء؟", a: "نعم — البرنامج مصمَّم لكل العاملين في الرعاية الصحية، وللأطباء تحديدًا يغطي قيادة الجودة والاعتماد وسلامة المرضى وإدارة البيانات بما يناسب ممارستك السريرية والإدارية." },
  { q: "هل مناسب للتمريض؟", a: "بالتأكيد — كثير من خريجينا من التمريض. المحتوى يربط مباشرة بسلامة المرضى وتحسين العمليات والاعتماد، ومناسب لمسارات مشرف التمريض وضمان الجودة." },
  { q: "هل الشهادة معترف بها؟", a: "نعم — CPHQ صادرة عن NAHQ الأمريكية وهي معترف بها دوليًا في المستشفيات والهيئات الصحية والاعتماد (JCI وCBAHI وغيرها)، وتعزّز مسارك في إدارة الجودة." },
  { q: "هل فيه تقسيط؟", a: "نعم — تقسيط بدون فوائد على ٣ أقساط شهرية متساوية، وتبدأ الدراسة فور دفع القسط الأول." },
  { q: "هل فيه متابعة بعد انتهاء الكورس؟", a: "نعم — نواصل معك بعد انتهاء البرنامج حتى موعد امتحانك: مراجعات، أسئلة محاكية، ودعم من المدرّب حتى تجتاز CPHQ." },
  { q: "ما شكل الامتحان وكم مدته؟", a: "امتحان إلكتروني من ١٤٠ سؤال اختيار من متعدد (تتضمن أسئلة تجريبية غير محتسبة) يُؤدّى خلال ٣ ساعات عبر Prometric." },
  { q: "بأي لغة يُعقد امتحان CPHQ؟", a: "يُعقد الامتحان باللغة الإنجليزية، ولهذا نُقدّم الشرح وبنوك الأسئلة بالعربية والإنجليزية معًا لنجهّزك تمامًا للمصطلحات الإنجليزية." },
  { q: "بأي لغة يُقدَّم البرنامج؟", a: "بالعربية والإنجليزية — الدروس وبنوك الأسئلة والدعم ثنائية اللغة." },
  { q: "هل المحاضرات مباشرة أم مسجّلة؟", a: "مباشرة على Zoom أسبوعيًا، مع تسجيلات متاحة لمدة ١٢ شهرًا لمراجعتها وقتما تشاء." },
  { q: "أين أؤدّي امتحان CPHQ؟", a: "يُقدَّم من NAHQ عبر Prometric، أونلاين أو في مركز اختبار، ونساعدك في التسجيل وتحديد الموعد." },
  { q: "ما مدة صلاحية الشهادة وكيف أُجدّدها؟", a: "شهادة CPHQ صالحة لمدة سنتين، وتُجدَّد عبر استيفاء ساعات التعليم المستمر المعتمدة (CE) التي تحددها NAHQ." },
  { q: "ماذا لو لم أجتز الامتحان؟", a: "نوفّر دعمًا متواصلًا واختبارات محاكية حتى تجتاز؛ ويتابع معك المدرّب نقاط ضعفك ويعيد تأهيلك للمحاولة التالية بثقة." },
  { q: "متى تبدأ الدفعة القادمة؟", a: "تنطلق الدفعة القادمة قريبًا والمقاعد محدودة — سجّل بياناتك ليتواصل معك المستشار بموعد البدء وتفاصيل الجدول." },
  { q: "هل الشهادة من IMETS أم من NAHQ؟", a: "الشهادة نفسها تمنحها NAHQ الأمريكية بعد اجتيازك امتحان CPHQ عبر Prometric. دور IMETS هو تأهيلك وتدريبك لاجتياز الامتحان من أول مرة بثقة." },
  { q: "هل يوجد اختبار تجريبي؟", a: "نعم — امتحانات محاكية كاملة بوقت محدد تحاكي تجربة CPHQ الحقيقية، مع مراجعة تفصيلية لكل إجابة لمعرفة مستواك قبل الامتحان." },
  { q: "هل الكورس مناسب للمبتدئين؟", a: "نعم — لا يشترط عدد سنوات خبرة محدد؛ نبدأ من الأساسيات ونبني حتى إتقان الدومينات، ونراجع مستواك مجانًا وننصحك بنقطة البداية المناسبة قبل التسجيل." },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  await params;
  const admin = await resolveSeoMetadata(PATH).catch(() => ({} as Metadata));
  return {
    ...admin,
    title: "الدبلوم المهني في الجودة الصحية باعتماد AIHCM | IMETS",
    description: "دبلوم مهني في الجودة الصحية معتمد من المعهد الأمريكي للرعاية الصحية وإدارة المستشفيات (AIHCM) — محاضرات مباشرة، بنك أسئلة، ودعم مستمر حتى الاحتراف. احجز مقعدك.",
  };
}

export default async function QualityDiplomaMixPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const trackPath = locale === "ar" ? "/ar/lp/mix/quality-diploma" : PATH;
  // Connected WhatsApp number — editable from Admin → Marketing → Landing; falls back to the default.
  const WA = (await dal.landing.fetchLandingWhatsapp(trackPath)) || "201115782721";

  const courseLd = {
    "@context": "https://schema.org", "@type": "Course", name: "Professional Diploma in Healthcare Quality (AIHCM)",
    description: "Professional Diploma in Healthcare Quality accredited by the American Institute for Healthcare & Hospital Management (AIHCM) — live lectures, question bank and continuous support.",
    provider: { "@type": "Organization", name: "IMETS", sameAs: process.env.NEXT_PUBLIC_SITE_URL || "https://imetsedu.com" },
  };
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div dir="rtl" className="bg-white pb-24 text-slate-800 lg:pb-0">
      <JsonLd data={[courseLd, faqLd]} />

      {/* Hero — royal blue primary identity (campaign look) */}
      <section className={cn("relative overflow-hidden border-b border-white/10 text-white", BLUE_GRAD)}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-[#f4c430]/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 size-80 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-16 lg:px-8">
          <div className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4c430] px-3 py-1 text-xs font-bold text-[#051a4a] shadow">
              <CalendarDays className="size-3.5" /> الدفعة القادمة تبدأ ١٨ يوليو ٢٠٢٦ · المقاعد المتاحة 7 من 30
            </span>
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-[2.35rem] lg:leading-tight">
              احصل علي <span className="text-[#f4c430]">الدبلوم المهني في الجودة الصحية</span> باعتماد المعهد الأمريكي للرعاية الصحية وإدارة المستشفيات — AIHCM
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/80">
              برنامج تدريبي شامل يؤهّلك لاجتياز امتحان CPHQ — الذي تمنح شهادته NAHQ الأمريكية — من أول مرة، مع محاضرين معتمدين ودعم مستمر حتى الامتحان.
            </p>
            <div className="flex flex-wrap gap-3">
              <LeadFormModal
                path={trackPath} courseName={COURSE} webhookUrl={WEBHOOK}
                triggerClassName={cn(BTN, GOLD_CTA)}
                triggerLabel={<>احجز الآن <ChevronLeft className="size-4" /></>}
              />
              <a href="#apply" className={cn(BTN, "border-2 border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20")}>تعرّف على التفاصيل</a>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-sm text-white/75">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex text-[#f4c430]">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</span>
                <strong className="text-white">٤٫٨</strong> (١٬٣٤٠ تقييم)
              </span>
            </div>
          </div>

          {/* video / preview card */}
          <div className="overflow-hidden rounded-2xl border-2 border-[#f4c430]/70 bg-white/5 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
            <YouTubePlayer videoId="R9-6cBqzczo" unmuteLabel="اضغط لتشغيل الصوت" />
            <div className="grid grid-cols-3 gap-2 p-4 text-center text-xs">
              {[
                { icon: CalendarDays, v: "10", l: "Weeks" },
                { icon: Layers, v: "7", l: "Domains" },
                { icon: ListChecks, v: "+500", l: "Questions" },
              ].map((s) => (
                <div key={s.l} className="flex flex-col items-center rounded-lg bg-white/10 py-3 ring-1 ring-white/15">
                  <s.icon className="mb-1 size-5 text-[#f4c430]" />
                  <p className="text-lg font-bold">{s.v}</p>
                  <p className="text-white/70">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes — sell the result, not the course */}
      <section className="border-b border-blue-100 bg-gradient-to-b from-blue-50/80 to-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0a2f7a]">ماذا ستحصل بعد اجتياز CPHQ؟</h2>
            <p className="mt-3 text-slate-600">الكورس وسيلة — والنتيجة هي ما يهمّك. إليك ما تفتحه لك شهادة CPHQ فعليًا.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((o) => (
              <div key={o.title} className="rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm transition hover:border-[#0b3fa8]/30 hover:shadow-md">
                <span className={cn("mx-auto grid size-12 place-items-center rounded-xl", BLUE_ICON)}><o.icon className="size-6" /></span>
                <h3 className="mt-4 font-bold text-[#0a2f7a]">{o.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{o.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-slate-400">فوائد واقعية مبنية على قيمة الشهادة المعتمدة — دون أي وعود غير مضمونة.</p>
        </div>
      </section>

      {/* Authorities */}
      <section className={cn("border-b border-white/10 text-white", BLUE_GRAD)}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-3 px-4 py-6 sm:px-6 lg:px-8">
          <span className="text-xs font-medium text-white/70">معتمد ومتوافق مع</span>
          {AUTH.map((a) => <span key={a} className="rounded-md bg-white/10 px-3 py-1 text-sm font-semibold text-white ring-1 ring-white/20">{a}</span>)}
        </div>
      </section>

      {/* Limited-time 50% discount + countdown */}
      <div className="bg-gradient-to-b from-white to-blue-50/60 py-10 sm:py-14">
        <DiscountCountdown lang="en" hours={7} storageKey="quality_diploma_offer_deadline" showPrice={false} ctaHref="#apply" />
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-[#0a2f7a]">مميزات الدبلومة كاملة</h2>
          <p className="mt-3 text-slate-600">كل ما تحتاجه لاجتياز CPHQ بثقة — في برنامج واحد.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm transition hover:border-[#0b3fa8]/30 hover:shadow-md sm:text-right">
              <div className={cn("mx-auto grid size-16 place-items-center rounded-2xl sm:mx-0", BLUE_ICON)}><f.icon className="size-8" /></div>
              <h3 className="mt-4 text-lg font-bold text-[#0a2f7a]">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Is this course right for you? — objection handling */}
      <section className="border-b border-blue-100 bg-blue-50/50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#0a2f7a]">هل الكورس مناسب لك؟</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">إذا كنت من أيٍّ من هؤلاء، فالبرنامج مصمَّم لك.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {AUDIENCE.map((a) => (
              <div key={a} className="inline-flex items-center gap-2.5 rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-[#0a2f7a]">
                <CheckCircle2 className="size-5 shrink-0 text-[#0b3fa8]" /> {a}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why IMETS — comparison vs competitors */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <BrandImage
              kind="navbar"
              alt={BRAND.fullName}
              className="h-8 w-auto max-w-[110px] object-contain"
              fallback={
                <span className="grid size-8 place-items-center rounded-lg bg-[#0b3fa8] text-white"><Building2 className="size-4" /></span>
              }
            />
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0a2f7a]">لماذا IMETS Medical School؟</h2>
          </div>
          <p className="mt-3 text-slate-600">قبل أن تقرّر، قارن بيننا وبين الكورسات الأونلاين والأكاديميات الأخرى.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
          <table className="w-full">
            <thead>
              <tr className={cn("text-white", BLUE_GRAD)}>
                <th className="p-4 text-right text-sm font-semibold text-white/70"> </th>
                <th className="w-[26%] bg-white/10 p-4 text-center text-lg font-extrabold text-[#f4c430]">IMETS</th>
                <th className="w-[26%] p-4 text-center text-sm font-semibold text-white/70">الآخرون</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r, i) => (
                <tr key={r.feature} className={cn("border-t border-slate-100", i % 2 === 1 && "bg-slate-50/50")}>
                  <td className="px-4 py-5 text-right text-[15px] font-semibold text-[#0a2f7a]">{r.feature}</td>
                  <td className="bg-emerald-50/70 px-4 py-5 text-center">
                    <CheckCircle2 className="mx-auto size-7 text-emerald-600" strokeWidth={2.5} />
                  </td>
                  <td className="px-4 py-5 text-center">
                    {r.others === "❌"
                      ? <span className="inline-grid size-7 place-items-center rounded-full bg-rose-100 text-lg font-black text-rose-500">✕</span>
                      : <span className="text-[15px] font-bold text-amber-600">{r.others}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payment & installment (moved up — price is the biggest objection) */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#0b3fa8]">
              <CreditCard className="size-4" /> طرق الدفع المتاحة
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0a2f7a]">الدفع والتقسيط</h2>
            <p className="mt-3 text-slate-600">ادفع بالطريقة الأنسب لك — مع خيار التقسيط بدون فوائد.</p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {PAY_METHODS.map((m) => (
                <div key={m.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", BLUE_ICON)}><m.icon className="size-5" /></span>
                  <div>
                    <h3 className="font-bold text-[#0a2f7a]">{m.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{m.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={cn("flex flex-col justify-center rounded-2xl p-6 text-white shadow-xl ring-1 ring-white/10", BLUE_GRAD)}>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#f4c430] px-3 py-1 text-xs font-bold text-[#051a4a]">
                <CalendarDays className="size-3.5" /> الأكثر مرونة
              </span>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight">تقسيط بدون فوائد</h3>
              <p className="mt-2 text-white/80">قسّم رسوم الكورس على ٣ دفعات شهرية متساوية — بدون أي فوائد أو رسوم إضافية.</p>
              <ul className="mt-4 space-y-2 text-sm">
                {["٣ أقساط شهرية متساوية", "بدون فوائد أو رسوم خفية", "تبدأ الدراسة فور دفع القسط الأول"].map((b) => (
                  <li key={b} className="inline-flex items-center gap-2 text-white/90"><CheckCircle2 className="size-4 text-[#f4c430]" /> {b}</li>
                ))}
              </ul>
              <LeadFormModal
                path={trackPath} courseName={COURSE} webhookUrl={WEBHOOK}
                triggerClassName={cn(BTN, GOLD_CTA, "mt-5 w-fit")}
                triggerLabel={<>اطلب خطة التقسيط <ChevronLeft className="size-4" /></>}
              />
            </div>
          </div>

          <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
            <ShieldCheck className="size-4 text-emerald-600" /> جميع المدفوعات آمنة ومشفّرة.
          </p>
        </div>
      </section>

      {/* About IMETS Medical School */}
      <section dir="rtl" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-5">
            <BrandImage
              kind="navbar"
              alt={BRAND.fullName}
              className="h-12 w-auto max-w-[200px] object-contain"
              fallback={
                <span className="inline-flex items-center gap-2 text-xl font-extrabold text-[#0a2f7a]">
                  <span className="grid size-10 place-items-center rounded-xl bg-[#0b3fa8] text-white"><Building2 className="size-5" /></span>
                  {BRAND.fullName}
                </span>
              }
            />
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0a2f7a]">عن IMETS Medical School</h2>
            <p className="text-xl font-bold leading-relaxed text-[#0a2f7a]">
              أكثر من 15 سنة من الخبرة في تدريب العاملين بالقطاع الصحي.
            </p>
            <p className="leading-relaxed text-slate-600">
              معهد متخصص في تعليم الرعاية الصحية — درّبنا أكثر من ٣٬٢٠٠ ممارس صحي على شهادات معتمدة دوليًا، بمحاضرين خبراء ومناهج مبنية على الامتحان، ودعم بالعربية والإنجليزية.
            </p>
            <a href="#apply" className={cn(BTN, GOLD_CTA)}>انضم إلى الدفعة القادمة <ChevronLeft className="size-4" /></a>
          </div>
          <div className={cn("overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10", BLUE_GRAD)}>
            <YouTubePlayer videoId="SSlmmUH2Ado" autoPlay={false} />
          </div>
        </div>
      </section>

      {/* Stats band (blue) */}
      <section className={cn("text-white", BLUE_GRAD)}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10 text-[#f4cf5a]"><s.icon className="size-6" /></span>
              <div>
                <p className="text-2xl font-extrabold tracking-tight tabular-nums"><CountUp value={s.value} /></p>
                <p className="text-sm text-white/70">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MasterCurriculumAccordion />

      {/* Steps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-[#0a2f7a]">خطوات الالتحاق</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="grid size-10 place-items-center rounded-full bg-[#0b3fa8] text-base font-bold text-white">{i + 1}</span>
              <h3 className="mt-3 font-bold text-[#0a2f7a]">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Student video testimonials */}
      <div className="border-y border-slate-200 bg-slate-50">
        <StudentVideoReviews videos={STUDENT_VIDEOS} />
      </div>

      <StudentReviewCards recommendPct={96} reviewCount={52} />

      {/* Graduation projects */}
      <div className="border-t border-slate-200 bg-slate-50">
        <GraduationProjects projects={GRADUATION_PROJECTS} />
      </div>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-extrabold tracking-tight text-[#0a2f7a]">إجابات مريحة لكل ما تسأل</h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-slate-200 bg-white px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#0a2f7a]">
                {f.q}
                <ChevronLeft className="size-4 shrink-0 text-slate-400 transition-transform group-open:-rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Urgency + contact — right above the form */}
      <section dir="rtl" className="bg-white">
        <div className="mx-auto max-w-5xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600 ring-1 ring-rose-200">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-2 animate-ping rounded-full bg-rose-500/60" />
              <span className="relative inline-flex size-2 rounded-full bg-rose-500" />
            </span>
            المقاعد محدودة لهذه الدفعة — سجّل قبل انتهاء الأماكن
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
            <p className="font-bold text-[#0a2f7a]">هل لديك أي سؤال قبل التسجيل؟</p>
            <p className="mt-1 text-sm text-slate-500">تواصل معنا مباشرة وسنجيبك فورًا.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105">
                <MessageCircle className="size-4" /> واتساب
              </a>
              <a href={`tel:+${WA}`} className="inline-flex items-center gap-2 rounded-full bg-[#0b3fa8] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0a327f]">
                <Phone className="size-4" /> اتصال
              </a>
              <a href="https://m.me/imetsedu" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#0084FF] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-105">
                <Send className="size-4" /> ماسنجر
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Apply (blue) — English lead capture */}
      <section id="apply" dir="ltr" className={cn("text-left text-white", BLUE_GRAD)}>
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight">Book your seat in the next cohort</h2>
            <p className="text-white/80">Apply in 60 seconds and an admissions advisor will reach out to confirm your seat and study plan — free, no obligation.</p>
            <ul className="space-y-2 text-sm">
              {["Seats are limited — next cohort starts soon", "Free eligibility review & personalized study plan", "Support guaranteed until you pass"].map((b) => (
                <li key={b} className="inline-flex items-center gap-2 text-white/90"><CheckCircle2 className="size-4 text-[#f4cf5a]" /> {b}</li>
              ))}
            </ul>
            <p className="inline-flex items-center gap-2 text-sm text-white/70"><Stethoscope className="size-4" /> For doctors, dentists, pharmacists, nurses & quality professionals</p>
          </div>
          <SimpleLeadForm path={trackPath} courseName={COURSE} webhookUrl="https://aut.jobova.net/webhook/cphq" />
        </div>
      </section>

      {/* Sticky mobile CTA — opens the form modal */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-slate-200 bg-white/95 p-3 backdrop-blur lg:hidden">
        <LeadFormModal
          path={trackPath} courseName={COURSE} webhookUrl={WEBHOOK}
          triggerClassName={cn(BTN, GOLD_CTA, "w-full flex-1")}
          triggerLabel={<>احجز الآن <ChevronLeft className="size-4" /></>}
        />
      </div>

      {/* Floating WhatsApp */}
      <WhatsAppFab phone={WA} message="مرحبًا، أريد الاستفسار عن كورس CPHQ" />
    </div>
  );
}

/* lucide doesn't export a distinct icon name we need above; alias ClipboardCheck. */
function ClipboardCheckIcon(props: { className?: string }) {
  return <CheckCircle2 {...props} />;
}
