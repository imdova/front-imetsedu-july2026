import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, ClipboardCheck, TrendingUp,
  ArrowUpRight, Wallet, Users,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MEDICAL_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-quality-diploma-arab";

export const metadata: Metadata = {
  title: "دبلوم إدارة الجودة الصحية — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف في إدارة الجودة الصحية: تحسين الجودة، مؤشرات الأداء، إدارة المخاطر، والاعتماد (JCI / CBAHI). مخصّصة للكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى مجال إدارة الجودة الصحية يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دبلومة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Quality Diploma Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_quality_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل تطمح لبناء مستقبل مهني في <span className="text-[#f4c430]">إدارة الجودة الصحية؟</span>
    </>
  ),
  heroLead:
    "احضر محاضرة مجانية واكتشف كيف تساعدك دبلومة إدارة الجودة الصحية على تطوير مسارك المهني واكتساب المهارات المطلوبة في القطاع الصحي.",
  heroBullets: [
    "ما الذي يفعله أخصائي الجودة فعليًا؟",
    "كيف تبدأ الطريق الصحيح؟",
    "وما هي فرص العمل والرواتب المتاحة؟",
  ],
  heroMicroProof: "انضم إلى أكثر من 17,000 متخصص صحي تعلّموا مع IMETS",

  trust: [
    { icon: Globe2, label: "معايير JCI الدولية" },
    { icon: FileCheck2, label: "اعتماد CBAHI / GAHAR" },
    { icon: ClipboardCheck, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "لا تمتلك خبرة سابقة؟", b: "تريد دخول مجال الجودة الصحية لكن ليست لديك خبرة سابقة فيه، ولا تعرف من أين تبدأ." },
    { icon: HelpCircle, t: "مصطلحات متداخلة", b: "PDCA ومؤشرات الأداء والاعتماد… مفاهيم كثيرة بلا مرجع واضح." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في دبلومة ثم تكتشف أنها غير مناسبة لمسارك." },
    { icon: ArrowLeftRight, t: "عالق في مكانك", b: "ترى زملاءك ينتقلون إلى أقسام الجودة وأنت في نفس المكان." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Globe2, t: "تفهم مجال الجودة", b: "تعرف ماذا يعمل قسم الجودة ودوره داخل المستشفى." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "المسارات والوظائف المتاحة أمامك في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات التي تحتاجها للانتقال إلى القسم." },
    { icon: BookOpen, t: "وضع خطة واضحة", b: "خطة واضحة لبدء رحلتك المهنية في مجال الجودة الصحية." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Globe2, t: "ما هي إدارة الجودة الصحية؟", b: "المفهوم والدور داخل المنشأة الصحية والفرق بينها وبين الاعتماد." },
    { icon: ClipboardCheck, t: "تحسين الجودة و RCA", b: "أدوات PDCA وتحليل الأسباب الجذرية (Root Cause Analysis) عمليًا." },
    { icon: TrendingUp, t: "مؤشرات الأداء KPIs", b: "كيف تُبنى وتُقاس مؤشرات جودة الرعاية الصحية." },
    { icon: ShieldCheck, t: "سلامة المرضى وإدارة المخاطر", b: "Patient Safety والتعرّف على المخاطر وتحليلها والوقاية منها." },
    { icon: Award, t: "اعتماد المنشآت الصحية", b: "معايير JCI و CBAHI و GAHAR ودورة الاعتماد بالكامل." },
    { icon: ArrowUpRight, t: "الخطوة التالية", b: "كيف تبني مسارك المهني في الجودة خطوة بخطوة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MEDICAL_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "اكتسب المهارات التي يحتاجها سوق العمل في الجودة الصحية.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: TrendingUp, ar: "الترقّي داخل المستشفى", en: "Promotion" },
    { icon: Users, ar: "قيادة فرق الجودة", en: "Leadership" },
    { icon: ArrowLeftRight, ar: "تغيير مسارك المهني", en: "Career Shift" },
    { icon: ClipboardCheck, ar: "دخول قسم الجودة", en: "Quality Dept." },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير الجودة",
  speakerRole: "استشاري إدارة الجودة الصحية",
  speakerFaculty: "IMETS Faculty · Quality",
  speakerTitle: "لماذا يختار آلاف المتخصصين الصحيين التعلّم مع IMETS؟",
  speakerBio:
    "نخبة من استشاريي الجودة المعتمدين بخبرة عملية داخل المستشفيات — لا تنظير. يشرحون بالعربية ويركّزون على ما يفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة عملية داخل المستشفيات", "12 عامًا في مجال الجودة", "5,000+ متدرب", "استشاري جودة معتمد"],

  testimonials: [
    { quote: "دبلومة إدارة الجودة الصحية مع IMETS أعطتني المهارات العملية التي احتجتها للانتقال إلى قسم الجودة في مستشفانا.", name: "د. سارة", role: "أخصائية جودة — جدة" },
    { quote: "كنت أظن الجودة مجرد أوراق، فاكتشفت مجالًا مهنيًا كاملًا. شكرًا IMETS.", name: "محمد", role: "إداري مستشفى — الكويت" },
    { quote: "شرح عملي بالعربية سهّل عليّ البداية. قررت أن أُكمل الدبلومة.", name: "ريم", role: "ممرضة — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك في إدارة الجودة الصحية اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي في الجودة",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة إدارة الجودة الصحية التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
