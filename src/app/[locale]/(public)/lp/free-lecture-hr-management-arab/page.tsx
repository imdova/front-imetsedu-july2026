import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, Users, TrendingUp,
  Wallet, UserPlus, ClipboardCheck, Scale, BarChart3,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MGMT_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-hr-management-arab";

export const metadata: Metadata = {
  title: "دبلوم إدارة الموارد البشرية الصحية — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف في إدارة الموارد البشرية الصحية: استقطاب الكوادر، تقييم الأداء، الاحتفاظ بالموظفين، وقانون العمل. مخصّصة للإداريين والكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى إدارة الموارد البشرية الصحية يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دبلومة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Healthcare HR Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_hr_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل تريد دخول <span className="text-[#f4c430]">الموارد البشرية الصحية؟</span>
      <br />
      لكنك لا تعرف من أين تبدأ؟
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "ما الذي يميّز HR في القطاع الصحي؟",
    "كيف تبدأ الطريق الصحيح؟",
    "وما هي فرص العمل والرواتب المتاحة؟",
  ],

  trust: [
    { icon: Scale, label: "قانون العمل والامتثال" },
    { icon: ShieldCheck, label: "أفضل ممارسات HR" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "تائه في البداية", b: "تريد دخول الموارد البشرية لكنك لا تعرف من أين تبدأ." },
    { icon: HelpCircle, t: "HR عام لا يناسب الصحة", b: "إدارة الكوادر الطبية لها خصوصية وتحديات مختلفة." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في دبلومة غير مناسبة لمسارك." },
    { icon: ArrowLeftRight, t: "عالق في مكانك", b: "ترى فرص الانتقال إلى قسم الموارد البشرية تفوتك." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Users, t: "تفهم HR الصحي", b: "تعرف دور الموارد البشرية في نجاح المنشأة الصحية." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "الأدوار والمسارات المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات التي تحتاجها للانتقال إلى القسم." },
    { icon: BookOpen, t: "تختار خطة التعلّم", b: "تحدّد أنسب مسار دراسي يناسب وقتك وخبرتك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Users, t: "تخطيط القوى العاملة", b: "كيف تُخطَّط احتياجات الكوادر الصحية بدقة." },
    { icon: UserPlus, t: "الاستقطاب والتوظيف", b: "جذب واختيار الكفاءات الطبية والإدارية المناسبة." },
    { icon: TrendingUp, t: "التدريب والتطوير", b: "بناء برامج تطوير ترفع كفاءة الفرق الصحية." },
    { icon: ClipboardCheck, t: "تقييم الأداء", b: "أنظمة تقييم عادلة تربط الأداء بالأهداف." },
    { icon: Scale, t: "قانون العمل والامتثال", b: "الحقوق والواجبات وتجنّب المخاطر القانونية." },
    { icon: BarChart3, t: "مؤشرات وتحليلات HR", b: "قياس الرضا والدوران واتخاذ قرارات بالبيانات." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MGMT_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك المهني.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: TrendingUp, ar: "الترقّي إلى منصب إداري", en: "Promotion" },
    { icon: Users, ar: "قيادة فريق الموارد البشرية", en: "HR Leadership" },
    { icon: ArrowLeftRight, ar: "تغيير مسارك المهني", en: "Career Shift" },
    { icon: ClipboardCheck, ar: "دخول قسم HR الصحي", en: "HR Dept." },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير الموارد البشرية",
  speakerRole: "استشاري الموارد البشرية الصحية",
  speakerFaculty: "IMETS Faculty · HR",
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من خبراء الموارد البشرية بخبرة داخل المنشآت الصحية — لا تنظير. يشرحون بالعربية ويركّزون على الممارسات التي تفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة HR داخل القطاع الصحي", "12 عامًا من الخبرة", "5,000+ متدرب", "استشاري موارد بشرية"],

  testimonials: [
    { quote: "المحاضرة رتّبت لي مفاهيم HR الصحي وفتحت لي بابًا جديدًا للعمل.", name: "د. منال", role: "منسقة موارد بشرية — الرياض" },
    { quote: "فهمت خصوصية إدارة الكوادر الطبية. خطوة غيّرت مساري.", name: "سعيد", role: "إداري — الدوحة" },
    { quote: "شرح عملي بالعربية بأمثلة واقعية. قررت أُكمل الدبلومة.", name: "دعاء", role: "أخصائية توظيف — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك في الموارد البشرية الصحية اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي في الموارد البشرية",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة الموارد البشرية الصحية التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
