import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, Users, TrendingUp,
  ArrowUpRight, Wallet, Package, Truck, Warehouse, ShoppingCart, Boxes,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MGMT_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-supply-chain-arab";

export const metadata: Metadata = {
  title: "دبلوم سلسلة الإمداد الصحية — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف في سلسلة الإمداد الصحية: إدارة المخزون الطبي، المشتريات، اللوجستيات، وتقليل التكاليف. مخصّصة للإداريين والكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى سلسلة الإمداد الصحية يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دبلومة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Supply Chain Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_supply_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل تريد إتقان <span className="text-[#f4c430]">سلسلة الإمداد الصحية؟</span>
      <br />
      وضبط المخزون والتكاليف باحتراف
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "كيف تُدار مستلزمات وأدوية المستشفى بكفاءة؟",
    "كيف تبدأ الطريق الصحيح في هذا المجال؟",
    "وما هي فرص العمل والرواتب المتاحة؟",
  ],

  trust: [
    { icon: Boxes, label: "أفضل ممارسات اللوجستيات" },
    { icon: ShieldCheck, label: "ضبط الجودة والسلامة" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "تائه في البداية", b: "تريد دخول سلسلة الإمداد لكنك لا تعرف من أين تبدأ." },
    { icon: HelpCircle, t: "هدر ونقص في المخزون", b: "مستلزمات تنتهي فجأة وأخرى تتكدّس وتنتهي صلاحيتها." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في دبلومة غير مناسبة لمسارك." },
    { icon: ArrowLeftRight, t: "عالق في مكانك", b: "ترى فرص الانتقال إلى إدارة المشتريات تفوتك." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Package, t: "تفهم سلسلة الإمداد", b: "تعرف رحلة المنتج الطبي من المورّد حتى المريض." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "الأدوار المتاحة في المشتريات والمخازن بالخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات التي تحتاجها للانتقال إلى القسم." },
    { icon: BookOpen, t: "تختار خطة التعلّم", b: "تحدّد أنسب مسار دراسي يناسب وقتك وخبرتك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Package, t: "مفهوم سلسلة الإمداد الصحية", b: "المكوّنات وخصوصية القطاع الصحي." },
    { icon: Boxes, t: "إدارة المخزون الطبي", b: "مستويات الأمان، الصلاحية، وتقليل الهدر." },
    { icon: ShoppingCart, t: "المشتريات والتعاقد", b: "دورة الشراء واختيار الموردين والتفاوض." },
    { icon: Warehouse, t: "التخزين واللوجستيات", b: "التخزين الآمن والنقل وسلسلة التبريد." },
    { icon: Users, t: "إدارة الموردين", b: "تقييم الأداء وبناء علاقات موثوقة." },
    { icon: ArrowUpRight, t: "الأنظمة وتقليل التكاليف", b: "دور أنظمة ERP في الكفاءة وخفض التكلفة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MGMT_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك المهني.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: TrendingUp, ar: "الترقّي داخل المنشأة", en: "Promotion" },
    { icon: Truck, ar: "إدارة المشتريات والمخازن", en: "Procurement" },
    { icon: ArrowLeftRight, ar: "تغيير مسارك المهني", en: "Career Shift" },
    { icon: Package, ar: "دخول قسم الإمداد", en: "Supply Dept." },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير سلسلة الإمداد",
  speakerRole: "استشاري سلسلة الإمداد الصحية",
  speakerFaculty: "IMETS Faculty · Supply Chain",
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من خبراء سلسلة الإمداد بخبرة داخل المستشفيات والمخازن الطبية — لا تنظير. يشرحون بالعربية ويركّزون على ما يفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة لوجستية داخل القطاع الصحي", "12 عامًا من الخبرة", "5,000+ متدرب", "استشاري إمداد معتمد"],

  testimonials: [
    { quote: "المحاضرة كشفت لي أسباب الهدر في مخزوننا وكيف أتفاداها.", name: "د. ماجد", role: "مسؤول مخازن — الرياض" },
    { quote: "فهمت دورة المشتريات كاملة. خطوة فتحت لي مسارًا جديدًا.", name: "سلطان", role: "إداري إمداد — الدوحة" },
    { quote: "شرح عملي بالعربية بأمثلة من المستشفى. قررت أُكمل الدبلومة.", name: "أروى", role: "منسقة مشتريات — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك في سلسلة الإمداد الصحية اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي في سلسلة الإمداد",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة سلسلة الإمداد الصحية التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
