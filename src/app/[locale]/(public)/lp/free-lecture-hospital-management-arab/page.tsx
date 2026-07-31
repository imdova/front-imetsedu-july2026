import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, ClipboardCheck, TrendingUp,
  ArrowUpRight, Wallet, Users, Building2, Settings, UserCog,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MGMT_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-hospital-management-arab";

export const metadata: Metadata = {
  title: "دبلوم إدارة المستشفيات — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف في إدارة المستشفيات: إدارة العمليات، الشؤون المالية، الموارد البشرية، الجودة والاعتماد، والقيادة. مخصّصة للإداريين والكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى إدارة المستشفيات يبدأ من محاضرة مجانية",
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
      هل تطمح إلى <span className="text-[#f4c430]">إدارة المستشفيات؟</span>
      <br />
      لكنك لا تعرف من أين تبدأ؟
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "ما المهارات التي يحتاجها مدير المستشفى؟",
    "كيف تبدأ الطريق الصحيح نحو الإدارة؟",
    "وما هي فرص العمل والرواتب المتاحة؟",
  ],

  trust: [
    { icon: ShieldCheck, label: "معايير JCI الدولية" },
    { icon: FileCheck2, label: "حوكمة المستشفيات" },
    { icon: ClipboardCheck, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "تائه في البداية", b: "تطمح إلى الإدارة لكنك لا تعرف من أين تبدأ الخطوة الأولى." },
    { icon: HelpCircle, t: "خبرة سريرية بلا إدارة", b: "لديك خبرة طبية لكن ينقصك الجانب الإداري والمالي." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في دبلومة غير مناسبة لمسارك." },
    { icon: ArrowLeftRight, t: "عالق في مكانك", b: "ترى فرص الترقّي الإداري تفوتك عامًا بعد عام." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Building2, t: "تفهم إدارة المستشفى", b: "تعرف كيف تُدار الأقسام وتتكامل العمليات داخل المستشفى." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "المناصب الإدارية والمسارات المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات الإدارية التي تحتاجها للانتقال." },
    { icon: BookOpen, t: "تختار خطة التعلّم", b: "تحدّد أنسب مسار دراسي يناسب وقتك وخبرتك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Building2, t: "هيكل المستشفى وأقسامه", b: "كيف تُبنى المنشأة الصحية وتتكامل إداراتها المختلفة." },
    { icon: Settings, t: "إدارة العمليات اليومية", b: "تدفّق المرضى، الأسرّة، والطوارئ وكفاءة التشغيل." },
    { icon: Wallet, t: "الإدارة المالية للمستشفى", b: "الموازنات، الإيرادات، والتكاليف واتخاذ القرار المالي." },
    { icon: UserCog, t: "إدارة الموارد البشرية", b: "استقطاب الكوادر الصحية وتقييم الأداء والاحتفاظ بها." },
    { icon: Award, t: "الجودة والاعتماد", b: "دور الجودة ومعايير الاعتماد (JCI) في نجاح المستشفى." },
    { icon: ArrowUpRight, t: "القيادة والخطوة التالية", b: "مهارات القيادة الإدارية وكيف تبني مسارك خطوة بخطوة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MGMT_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك المهني.",
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
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من قيادات وإداريي المستشفيات بخبرة تشغيلية حقيقية — لا تنظير. يشرحون بالعربية ويركّزون على المهارات الإدارية التي تفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة تشغيلية داخل المستشفيات", "12 عامًا في الإدارة الصحية", "5,000+ متدرب", "استشاري إدارة معتمد"],

  testimonials: [
    { quote: "المحاضرة أرتني الصورة الإدارية كاملة، وقررت الانتقال من التمريض إلى الإدارة.", name: "د. عبدالله", role: "مشرف قسم — الرياض" },
    { quote: "فهمت أخيرًا الجانب المالي للمستشفى. خطوة غيّرت مساري المهني.", name: "نورة", role: "إدارية — أبوظبي" },
    { quote: "شرح عملي بالعربية بأمثلة واقعية. تجربة محترمة مع IMETS.", name: "طارق", role: "منسق عمليات — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك في إدارة المستشفيات اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي الإدارية",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة إدارة المستشفيات التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
