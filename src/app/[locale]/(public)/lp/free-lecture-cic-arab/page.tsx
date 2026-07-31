import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, BookOpen,
  TrendingUp, Briefcase, Target, ClipboardCheck, Syringe, AlertTriangle,
  ArrowUpRight, Users,
} from "lucide-react";

import {
  FreeLectureArabLanding,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-cic-arab";

export const metadata: Metadata = {
  title: "محاضرة CIC المجانية | ابنِ مستقبلك في مكافحة العدوى — IMETS",
  description:
    "هل ترغب في بناء مستقبل مهني في مكافحة العدوى؟ ابدأ بمحاضرة CIC المجانية (90 دقيقة) لفهم الشهادة، ومتطلبات المجال، وأفضل طريق للاستعداد للاختبار. مخصّصة للكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "ابنِ مستقبلك المهني في مكافحة العدوى — يبدأ من محاضرة CIC المجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دورة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "CIC Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_cic_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل ترغب في بناء مستقبل مهني في <span className="text-[#f4c430]">مكافحة العدوى؟</span>
    </>
  ),
  heroLead:
    "ابدأ بمحاضرة مجانية تساعدك على فهم شهادة CIC، ومتطلبات المجال، وأفضل طريق للاستعداد للاختبار.",
  heroBullets: [
    "تعرف على شهادة CIC ومتطلبات الحصول عليها",
    "اكتشف الفرص المهنية في مكافحة العدوى",
    "افهم كيفية الاستعداد للاختبار بخطة واضحة",
    "تجنّب أكثر الأخطاء شيوعًا قبل البدء",
  ],

  trust: [
    { icon: Globe2, label: "الجهة المانحة CBIC" },
    { icon: FileCheck2, label: "معايير APIC" },
    { icon: ShieldCheck, label: "إرشادات CDC / WHO" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تبدو هذه التحديات مألوفة؟",
  pains: [
    { icon: Compass, t: "من أين تبدأ؟", b: "ترغب في الانتقال إلى مكافحة العدوى لكن لا تعرف من أين تبدأ." },
    { icon: HelpCircle, t: "هل CIC مناسبة لك؟", b: "تسمع كثيرًا عن شهادة CIC ولا تعرف إن كانت مناسبة لك." },
    { icon: BookOpen, t: "تبحث عن مصدر موثوق", b: "تبحث عن مرجع موثوق يشرح لك المسار الصحيح خطوة بخطوة." },
    { icon: TrendingUp, t: "تطمح للتطوّر", b: "تريد تطوير مسارك المهني في القطاع الصحي." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد انتهاء المحاضرة ستتمكن من:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Syringe, t: "فهم أساسيات مكافحة العدوى", b: "سلسلة انتقال العدوى وطرق الوقاية والاحتياطات القياسية." },
    { icon: Globe2, t: "التعرف على شهادة CIC", b: "ما هي، ومن يمنحها (CBIC)، ولماذا أصبحت مطلوبة." },
    { icon: ClipboardCheck, t: "معرفة متطلبات الاختبار", b: "شروط الأهلية ومحتوى الامتحان وتوزيع الدرجات." },
    { icon: BookOpen, t: "وضع خطة واضحة", b: "خطة عملية تبدأ بها رحلتك نحو CIC خطوة بخطوة." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agendaLabel: "الدرس",
  agenda: [
    { icon: Globe2, t: "ما هي شهادة CIC؟", b: "الشهادة والجهة المانحة (CBIC) ومكانتها في السوق الصحي." },
    { icon: Syringe, t: "دور أخصائي مكافحة العدوى", b: "المهام والمسؤوليات اليومية داخل المنشأة الصحية." },
    { icon: ClipboardCheck, t: "محتوى اختبار CIC", b: "المحاور التي يغطيها الاختبار وتوزيع الدرجات." },
    { icon: Target, t: "استراتيجية الاستعداد للاختبار", b: "خطة مذاكرة عملية توصلك للنجاح ولو كنت تعمل بدوام كامل." },
    { icon: AlertTriangle, t: "الأخطاء الشائعة", b: "الأخطاء التي يقع فيها معظم المتقدمين وكيف تتجنّبها." },
    { icon: ArrowUpRight, t: "كيف تبدأ؟", b: "خطوات التسجيل وأول خطوة عملية في مسارك." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: [
    { emoji: "👨‍⚕️", label: "الأطباء / Physicians" },
    { emoji: "🩺", label: "هيئة التمريض / Nurses" },
    { emoji: "💊", label: "الصيادلة / Pharmacists" },
    { emoji: "🔬", label: "مختبرات الأحياء الدقيقة / Microbiology" },
    { emoji: "🦠", label: "أخصائيو مكافحة العدوى / IPC" },
    { emoji: "📋", label: "أخصائيو الجودة الصحية / Quality" },
  ],

  benefitsEyebrow: "لماذا CIC تحديدًا؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمر في مهارات تساعدك على تطوير مسارك المهني.",
  benefits: [
    { icon: Syringe, ar: "فهم أعمق لمكافحة العدوى", en: "Deeper IPC" },
    { icon: ClipboardCheck, ar: "الاستعداد لاختبار CIC", en: "CIC Ready" },
    { icon: TrendingUp, ar: "تطوير مهني مستمر", en: "CPD" },
    { icon: Briefcase, ar: "تحسين فرصك الوظيفية", en: "Better Jobs" },
    { icon: Users, ar: "التعلّم من خبراء المجال", en: "Expert-Led" },
    { icon: Globe2, ar: "الانضمام إلى مجتمع مهني", en: "Community" },
  ],

  speakerBadge: "محاضرك · CIC Certified",
  speakerRole: "Dr. Ahmed Habib",
  speakerFaculty: "CIC Instructor · IMETS",
  speakerTitle: "لماذا يتعلّم الآلاف مع IMETS؟",
  speakerBio:
    "نخبة من استشاريي مكافحة العدوى المعتمدين بخبرة عملية داخل المستشفيات — لا تنظير. يشرحون بالعربية ويركّزون على ما يفيدك في الامتحان وفي عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص صحي من مختلف الدول العربية.",
  speakerPoints: ["مدرّب معتمد في مكافحة العدوى", "خبرة 12 عامًا", "5,000+ متدرب", "موثوق من المتخصصين الصحيين"],

  testimonials: [
    { quote: "المحاضرة وضّحت لي الصورة كاملة عن CIC، وقررت أن أُكمل مع IMETS.", name: "د. هالة", role: "أخصائية مكافحة عدوى — الرياض" },
    { quote: "كنت مترددًا بين الدورات، فرتّبت هذه المحاضرة المجانية أفكاري تمامًا.", name: "أحمد", role: "ممرض — دبي" },
    { quote: "الشرح العملي بالعربية جعل مفاهيم الترصد سهلة. تجربة محترمة.", name: "منى", role: "فني مختبر — عمّان" },
  ],

  faqs: [
    { q: "ما هي شهادة CIC؟", a: "شهادة CIC (Certified in Infection Control) شهادة دولية من مجلس CBIC تُثبت كفاءتك في مكافحة العدوى، وأصبحت مطلوبة في المستشفيات بالخليج والدول العربية." },
    { q: "هل هذه المحاضرة مجانية؟", a: "نعم، مجانية 100% — لكن الأماكن محدودة لضمان جودة التفاعل وجلسة الأسئلة." },
    { q: "هل أحتاج إلى خبرة سابقة؟", a: "لا. المحاضرة مناسبة للمبتدئين ولأصحاب الخبرة الراغبين في توثيق مهاراتهم بشهادة." },
    { q: "هل المحاضرة مسجّلة؟", a: "نعم، نسجّل المحاضرة ويصلك رابط التسجيل بعدها لتشاهدها في الوقت الذي يناسبك." },
    { q: "كم مدة المحاضرة؟", a: "حوالي 90 دقيقة مركّزة، تشمل شرحًا عمليًا وجلسة أسئلة مباشرة." },
    { q: "هل سأحصل على شهادة حضور؟", a: "نعم، كل مشترك يحصل على Certificate of Attendance من IMETS." },
    { q: "ماذا أفعل بعد انتهاء المحاضرة؟", a: "ستخرج بخطة واضحة؛ وإن رغبت في الاستمرار، سنوضّح لك مسار الاستعداد الكامل لاختبار CIC وكيفية التسجيل." },
  ],

  finalTitle: "ابدأ رحلتك في مكافحة العدوى اليوم",
  finalSub: "احجز مقعدك المجاني، وشاهد المحاضرة في الوقت الذي يناسبك، واكتشف كيف تبدأ رحلتك نحو شهادة CIC.",
  finalCtaLabel: "ابدأ رحلتي في مكافحة العدوى",
  finalMicroProof: "انضم إلى أكثر من 17,000 متخصص صحي استفادوا من برامج IMETS.",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة CIC التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
