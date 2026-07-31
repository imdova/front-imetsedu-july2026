import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, TrendingUp,
  ArrowUpRight, Wallet, Calculator, PiggyBank, LineChart, Receipt,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MGMT_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-financial-management-arab";

export const metadata: Metadata = {
  title: "كورس الإدارة المالية الصحية — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف في الإدارة المالية الصحية: الموازنات، التحليل المالي، إدارة التكاليف، والتدفقات النقدية. مخصّصة للإداريين والكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى الإدارة المالية الصحية يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي كورس. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Financial Management Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_finance_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل تريد إتقان <span className="text-[#f4c430]">الإدارة المالية؟</span>
      <br />
      وقراءة أرقام منشأتك بثقة
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "كيف تقرأ القوائم المالية وتفهم الأرقام؟",
    "كيف تبدأ الطريق الصحيح في الإدارة المالية؟",
    "وما هي فرص العمل والرواتب المتاحة؟",
  ],

  trust: [
    { icon: Calculator, label: "أسس محاسبية سليمة" },
    { icon: ShieldCheck, label: "حوكمة وضبط مالي" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "الأرقام تربكك", b: "تتعامل مع موازنات وتقارير لكنك لا تقرأها بثقة." },
    { icon: HelpCircle, t: "مصطلحات مالية غامضة", b: "التدفق النقدي والتكاليف والتحليل… مفاهيم بلا مرجع واضح." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في كورس غير مناسب لمسارك." },
    { icon: ArrowLeftRight, t: "عالق في مكانك", b: "ترى فرص الانتقال إلى الأدوار المالية تفوتك." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: LineChart, t: "تفهم الإدارة المالية", b: "تعرف كيف تُدار أموال المنشأة الصحية وتُتخذ القرارات." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "الأدوار المالية والإدارية المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات التي تحتاجها للانتقال إلى المجال." },
    { icon: BookOpen, t: "تختار خطة التعلّم", b: "تحدّد أنسب مسار دراسي يناسب وقتك وخبرتك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Calculator, t: "أساسيات المحاسبة", b: "المفاهيم المالية التي يحتاجها كل إداري صحي." },
    { icon: PiggyBank, t: "الموازنات (Budgeting)", b: "كيف تُبنى الموازنة وتُتابَع مقابل الأداء." },
    { icon: LineChart, t: "التحليل المالي", b: "قراءة القوائم والنِّسب المالية لاتخاذ القرار." },
    { icon: Receipt, t: "إدارة التكاليف", b: "تحليل التكاليف وترشيدها دون الإضرار بالجودة." },
    { icon: Wallet, t: "التدفقات النقدية", b: "إدارة السيولة وضمان استمرارية المنشأة." },
    { icon: ArrowUpRight, t: "اتخاذ القرار المالي", b: "كيف تحوّل الأرقام إلى قرارات إدارية سليمة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MGMT_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الكورس؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك المهني.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: TrendingUp, ar: "الترقّي إلى أدوار مالية", en: "Promotion" },
    { icon: LineChart, ar: "قراءة الأرقام بثقة", en: "Financial Literacy" },
    { icon: ArrowLeftRight, ar: "تغيير مسارك المهني", en: "Career Shift" },
    { icon: Calculator, ar: "دخول الإدارة المالية", en: "Finance Dept." },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير الإدارة المالية",
  speakerRole: "استشاري الإدارة المالية الصحية",
  speakerFaculty: "IMETS Faculty · Finance",
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من خبراء المالية بخبرة داخل المنشآت الصحية — لا تنظير. يشرحون بالعربية ويبسّطون الأرقام لتفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة مالية داخل القطاع الصحي", "12 عامًا من الخبرة", "5,000+ متدرب", "استشاري مالي معتمد"],

  testimonials: [
    { quote: "المحاضرة بسّطت لي القوائم المالية أخيرًا، وأصبحت أقرأ تقاريرنا بثقة.", name: "د. بدر", role: "مدير إداري — الرياض" },
    { quote: "فهمت الموازنة والتدفق النقدي عمليًا. خطوة غيّرت طريقة عملي.", name: "غادة", role: "محاسبة — أبوظبي" },
    { quote: "شرح مبسّط بالعربية بأمثلة واقعية. قررت أُكمل الكورس.", name: "وليد", role: "منسق مالي — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك في الإدارة المالية اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي في الإدارة المالية",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة الإدارة المالية التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
