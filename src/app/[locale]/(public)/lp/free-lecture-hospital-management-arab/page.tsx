import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, BookOpen, TrendingUp,
  ArrowLeftRight, Briefcase, Target, ClipboardCheck, ArrowUpRight, Wallet,
  Users, Building2, Settings,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-hospital-management-arab";

export const metadata: Metadata = {
  title: "دبلوم إدارة المستشفيات — محاضرة مجانية | IMETS",
  description:
    "هل تطمح إلى قيادة المستشفيات والمنشآت الصحية باحترافية؟ احضر محاضرة مجانية (90 دقيقة) واكتشف كيف تساعدك دبلومة إدارة المستشفيات على اكتساب المهارات القيادية والإدارية المطلوبة في القطاع الصحي. مخصّصة للإداريين والكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "قُد المستشفيات والمنشآت الصحية باحترافية — يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دبلومة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Hospital Management Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_hospital_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل تطمح إلى <span className="text-[#f4c430]">قيادة المستشفيات والمنشآت الصحية</span> باحترافية؟
    </>
  ),
  heroLead:
    "احضر محاضرة مجانية واكتشف كيف تساعدك دبلومة إدارة المستشفيات على اكتساب المهارات القيادية والإدارية المطلوبة في القطاع الصحي.",
  heroBullets: [
    "ماذا ستتعلم في دبلومة إدارة المستشفيات؟",
    "هل يناسبك هذا المسار المهني؟",
    "كيف تبدأ بطريقة صحيحة؟",
  ],

  trust: [
    { icon: ShieldCheck, label: "معايير JCI الدولية" },
    { icon: FileCheck2, label: "حوكمة المستشفيات" },
    { icon: ClipboardCheck, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تبدو هذه التحديات مألوفة؟",
  pains: [
    { icon: Compass, t: "من أين تبدأ؟", b: "ترغب في الانتقال للإدارة لكن لا تعرف من أين تبدأ الخطوة الأولى." },
    { icon: BookOpen, t: "تبحث عن مصدر موثوق؟", b: "تبحث عن مرجع موثوق لفهم إدارة المستشفيات بشكل صحيح." },
    { icon: TrendingUp, t: "تطوير مهاراتك القيادية؟", b: "ترغب في تطوير مهاراتك القيادية والإدارية في القطاع الصحي." },
    { icon: ArrowLeftRight, t: "عالق في مكانك", b: "ترى فرص الترقّي الإداري تفوتك عامًا بعد عام." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد انتهاء المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Building2, t: "تفهم إدارة المستشفى", b: "تعرف كيف تُدار الأقسام وتتكامل العمليات داخل المستشفى." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "المناصب الإدارية والمسارات المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات الإدارية التي تحتاجها للانتقال." },
    { icon: BookOpen, t: "وضع خطة واضحة", b: "خطة واضحة لبناء مسارك المهني في الإدارة الصحية." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agendaLabel: "الدرس",
  agenda: [
    { icon: Building2, t: "مقدمة في إدارة المستشفيات", b: "دور الإدارة في نجاح المنشأة الصحية." },
    { icon: Settings, t: "الهيكل التنظيمي للمستشفيات", b: "الأقسام والإدارات وكيف تتكامل معًا." },
    { icon: ShieldCheck, t: "إدارة الجودة وسلامة المرضى", b: "الجودة ومعايير الاعتماد (JCI) وسلامة المرضى." },
    { icon: Wallet, t: "الإدارة المالية والتشغيلية", b: "الموازنات والتكاليف وكفاءة التشغيل اليومي." },
    { icon: Users, t: "القيادة وإدارة الفرق", b: "مهارات قيادة الفرق واتخاذ القرار الإداري." },
    { icon: ArrowUpRight, t: "خارطة الطريق المهنية", b: "كيف تبني مسارك الإداري خطوة بخطوة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: [
    { emoji: "🏥", label: "مدراء المستشفيات والمراكز" },
    { emoji: "📊", label: "الإداريون الصحيون / Healthcare Administrators" },
    { emoji: "🧑‍💼", label: "رؤساء الأقسام والوحدات" },
    { emoji: "🎓", label: "الخريجون الجدد / Fresh Grads" },
    { emoji: "🚀", label: "الطامحون للترقّي الإداري" },
    { emoji: "🩺", label: "الكوادر الصحية المتجهة للإدارة" },
  ],

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "اكتسب المهارات القيادية والإدارية التي يحتاجها القطاع الصحي.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: TrendingUp, ar: "الترقّي إلى منصب إداري", en: "Promotion" },
    { icon: Users, ar: "قيادة الأقسام والفرق", en: "Leadership" },
    { icon: ArrowLeftRight, ar: "الانتقال من السريري للإداري", en: "Career Shift" },
    { icon: Building2, ar: "إدارة منشأة صحية", en: "Facility Mgmt" },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير الإدارة الصحية",
  speakerRole: "استشاري إدارة المستشفيات",
  speakerFaculty: "IMETS Faculty · Management",
  speakerTitle: "لماذا يختار المتخصصون الصحيون التعلّم مع IMETS؟",
  speakerBio:
    "نخبة من قيادات وإداريي المستشفيات بخبرة تشغيلية حقيقية — لا تنظير. يشرحون بالعربية ويركّزون على المهارات الإدارية التي تفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة تشغيلية داخل المستشفيات", "12 عامًا في الإدارة الصحية", "5,000+ متدرب", "استشاري إدارة معتمد"],

  testimonials: [
    { quote: "ساعدتني المحاضرة على فهم مجال إدارة المستشفيات، وبعدها التحقت بالدبلومة وكانت نقطة تحوّل في مسيرتي.", name: "د. عبدالله", role: "مشرف قسم — الرياض" },
    { quote: "فهمت أخيرًا الجانب المالي للمستشفى. خطوة غيّرت مساري المهني.", name: "نورة", role: "إدارية — أبوظبي" },
    { quote: "شرح عملي بالعربية بأمثلة واقعية. تجربة محترمة مع IMETS.", name: "طارق", role: "منسق عمليات — عمّان" },
  ],

  faqs: [
    ...COMMON_ARAB_FAQS,
    { q: "هل هذه الدبلومة مناسبة لغير الإداريين؟", a: "نعم. كثير من الأطباء والممرضين والصيادلة ينتقلون إلى الإدارة الصحية؛ الدبلومة مصمّمة لتأخذك من الأساسيات حتى تتقن المهارات الإدارية والقيادية بثقة." },
  ],

  finalTitle: "ابدأ رحلتك في إدارة المستشفيات اليوم",
  finalSub: "شاهد المحاضرة المجانية في الوقت الذي يناسبك، واكتشف كيف تبدأ مسارك في الإدارة الصحية بثقة.",
  finalCtaLabel: "ابدأ رحلتي الإدارية",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة إدارة المستشفيات التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
