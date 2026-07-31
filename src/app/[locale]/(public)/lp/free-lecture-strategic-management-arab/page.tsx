import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, Users, TrendingUp,
  ArrowUpRight, Wallet, BarChart3, RefreshCw, Map, Layers,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MGMT_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-strategic-management-arab";

export const metadata: Metadata = {
  title: "دبلوم الإدارة الاستراتيجية الصحية — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف في الإدارة الاستراتيجية الصحية: التخطيط الاستراتيجي، تحليل البيئة، بطاقة الأداء المتوازن، وإدارة التغيير. مخصّصة للقيادات والإداريين في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى الإدارة الاستراتيجية الصحية يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دبلومة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Strategic Management Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_strategic_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل تطمح إلى <span className="text-[#f4c430]">القيادة الاستراتيجية؟</span>
      <br />
      وتحويل الرؤية إلى نتائج
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "كيف تُبنى استراتيجية منشأة صحية ناجحة؟",
    "كيف تبدأ الطريق الصحيح نحو القيادة؟",
    "وما هي فرص العمل والرواتب المتاحة؟",
  ],

  trust: [
    { icon: BarChart3, label: "أدوات إدارية عالمية" },
    { icon: ShieldCheck, label: "حوكمة وأداء مؤسسي" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "بلا اتجاه واضح", b: "تعمل بجهد لكن دون خطة استراتيجية تربط الجهد بالنتيجة." },
    { icon: HelpCircle, t: "مصطلحات متداخلة", b: "SWOT وBSC وإدارة التغيير… مفاهيم كثيرة بلا تطبيق واضح." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في دبلومة غير مناسبة لطموحك." },
    { icon: ArrowLeftRight, t: "عالق في مكانك", b: "ترى فرص القيادة تذهب لمن يملك أدوات التخطيط." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Map, t: "تفهم التخطيط الاستراتيجي", b: "تعرف كيف تتحوّل الرؤية إلى خطة قابلة للتنفيذ." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "الأدوار القيادية المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات القيادية التي تحتاجها للانتقال." },
    { icon: BookOpen, t: "تختار خطة التعلّم", b: "تحدّد أنسب مسار دراسي يناسب وقتك وخبرتك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Compass, t: "مفهوم الإدارة الاستراتيجية", b: "لماذا تحتاجها كل منشأة صحية ناجحة." },
    { icon: Layers, t: "تحليل البيئة", b: "أدوات SWOT و PESTEL لفهم الواقع قبل التخطيط." },
    { icon: Target, t: "صياغة الرؤية والأهداف", b: "بناء أهداف SMART تقود المنشأة نحو مستقبلها." },
    { icon: BarChart3, t: "بطاقة الأداء المتوازن", b: "Balanced Scorecard لربط الأهداف بالمؤشرات." },
    { icon: RefreshCw, t: "إدارة التغيير", b: "كيف تقود التحوّل داخل المنشأة بأقل مقاومة." },
    { icon: ArrowUpRight, t: "التنفيذ والمتابعة", b: "تحويل الخطة إلى نتائج ومتابعة الأداء." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MGMT_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك القيادي.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: TrendingUp, ar: "الترقّي إلى القيادة", en: "Promotion" },
    { icon: Users, ar: "قيادة الفرق والمشاريع", en: "Leadership" },
    { icon: ArrowLeftRight, ar: "الانتقال إلى الإدارة العليا", en: "Career Shift" },
    { icon: Target, ar: "اتخاذ قرارات استراتيجية", en: "Decision Making" },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير الاستراتيجية",
  speakerRole: "استشاري الإدارة الاستراتيجية",
  speakerFaculty: "IMETS Faculty · Strategy",
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من قيادات القطاع الصحي بخبرة في بناء وتنفيذ الاستراتيجيات — لا تنظير. يشرحون بالعربية ويركّزون على الأدوات التي تفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة قيادية حقيقية", "12 عامًا في الإدارة الصحية", "5,000+ متدرب", "استشاري استراتيجية"],

  testimonials: [
    { quote: "المحاضرة أعطتني إطارًا واضحًا للتخطيط. غيّرت طريقة إدارتي لقسمي.", name: "د. فهد", role: "مدير قسم — الرياض" },
    { quote: "فهمت أخيرًا كيف تُبنى الاستراتيجية عمليًا. خطوة مهمة لمساري.", name: "لمى", role: "إدارية — أبوظبي" },
    { quote: "شرح عملي بالعربية بأمثلة واقعية. قررت أُكمل الدبلومة.", name: "عمر", role: "منسق مشاريع — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك القيادية اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي القيادية",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة الإدارة الاستراتيجية التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
