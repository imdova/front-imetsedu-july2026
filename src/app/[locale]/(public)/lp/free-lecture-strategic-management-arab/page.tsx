import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, Briefcase, Target,
  BookOpen, Users, TrendingUp, ArrowUpRight, Wallet, BarChart3, RefreshCw,
  Map, Layers, ArrowLeftRight,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-strategic-management-arab";

export const metadata: Metadata = {
  title: "دبلوم الإدارة الاستراتيجية الصحية — محاضرة مجانية | IMETS",
  description:
    "هل تريد قيادة المؤسسات الصحية برؤية استراتيجية تحقق نتائج حقيقية؟ احضر محاضرة مجانية (90 دقيقة) واكتشف كيف تساعدك دبلومة الإدارة الاستراتيجية الصحية على بناء الخطط وقيادة التغيير وتحقيق نتائج قابلة للقياس. مخصّصة للقيادات والإداريين في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "قُد المؤسسات الصحية برؤية استراتيجية تحقق نتائج — يبدأ من محاضرة مجانية",
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
      هل تريد قيادة المؤسسات الصحية <span className="text-[#f4c430]">برؤية استراتيجية تحقق نتائج حقيقية؟</span>
    </>
  ),
  heroLead:
    "احضر محاضرة مجانية واكتشف كيف تساعدك دبلومة الإدارة الاستراتيجية الصحية على بناء الخطط، وقيادة التغيير، وتحقيق نتائج قابلة للقياس داخل المؤسسات الصحية.",
  heroBullets: [
    "كيف تُبنى الاستراتيجية في المؤسسات الصحية؟",
    "لماذا أصبحت الإدارة الاستراتيجية مهارة أساسية للقادة؟",
    "كيف تبدأ مسارك القيادي؟",
  ],

  trust: [
    { icon: BarChart3, label: "أدوات إدارية عالمية" },
    { icon: ShieldCheck, label: "حوكمة وأداء مؤسسي" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تبدو هذه التحديات مألوفة؟",
  pains: [
    { icon: Compass, t: "خبرة تشغيلية بلا رؤية", b: "لديك خبرة تشغيلية ولكنك تفتقد للرؤية الاستراتيجية." },
    { icon: Target, t: "من الخطة إلى النتيجة", b: "تواجه صعوبة في تحويل الخطط إلى نتائج عملية." },
    { icon: TrendingUp, t: "تطوير مهارات القيادة", b: "ترغب في تطوير مهارات القيادة واتخاذ القرار." },
    { icon: Map, t: "بلا إطار استراتيجي", b: "تعمل بدون إطار استراتيجي واضح يوجّه جهدك." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد انتهاء المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Map, t: "تفهم التخطيط الاستراتيجي", b: "تعرف كيف تتحوّل الرؤية إلى خطة قابلة للتنفيذ." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "الأدوار القيادية المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات القيادية التي تحتاجها للانتقال." },
    { icon: BookOpen, t: "بناء خارطة طريق", b: "خارطة طريق واضحة لتطوير مسارك القيادي." },
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
  audience: [
    { emoji: "🏥", label: "مدراء المستشفيات / Hospital Managers" },
    { emoji: "🧑‍💼", label: "القيادات الصحية / Healthcare Executives" },
    { emoji: "📊", label: "رؤساء الأقسام والوحدات" },
    { emoji: "🎓", label: "الخريجون الجدد / Fresh Grads" },
    { emoji: "🚀", label: "الطامحون للقيادة الاستراتيجية" },
    { emoji: "🩺", label: "الكوادر الصحية المتجهة للقيادة" },
  ],

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "اكتسب عقلية القائد الاستراتيجي التي تبحث عنها المؤسسات الصحية.",
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
  speakerTitle: "لماذا يتعلّم القادة الصحيون مع IMETS؟",
  speakerBio:
    "نخبة من قيادات القطاع الصحي بخبرة في بناء وتنفيذ الاستراتيجيات — لا تنظير. يشرحون بالعربية ويركّزون على الأدوات التي تفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة قيادية حقيقية", "12 عامًا في الإدارة الصحية", "5,000+ متدرب", "استشاري استراتيجية"],

  testimonials: [
    { quote: "ساعدتني المحاضرة على فهم كيف تُبنى الاستراتيجية داخل المستشفيات، ثم كانت الدبلومة نقلة في طريقة إدارتي.", name: "د. فهد", role: "مدير قسم — الرياض" },
    { quote: "فهمت أخيرًا كيف تُبنى الاستراتيجية عمليًا. خطوة مهمة لمساري.", name: "لمى", role: "إدارية — أبوظبي" },
    { quote: "شرح عملي بالعربية بأمثلة واقعية. قررت أُكمل الدبلومة.", name: "عمر", role: "منسق مشاريع — عمّان" },
  ],

  faqs: [
    { q: "هل يناسب هذا البرنامج المديرين الجدد؟", a: "نعم، البرنامج مثالي للمديرين الجدد الراغبين في بناء أساس قيادي واستراتيجي قوي من البداية." },
    { q: "هل يناسب من ليس لديه خبرة إدارية؟", a: "نعم. يبدأ كثيرون من خلفية سريرية أو تشغيلية؛ المحتوى يأخذك من الأساسيات حتى تتقن التفكير الاستراتيجي بثقة." },
    { q: "هل سأتعلّم أدوات مثل SWOT و KPI و Balanced Scorecard؟", a: "نعم، تغطي الدبلومة أدوات عملية مثل SWOT و PESTEL ومؤشرات الأداء KPIs وبطاقة الأداء المتوازن BSC وكيفية تطبيقها في القطاع الصحي." },
    ...COMMON_ARAB_FAQS.filter((f) => !f.q.includes("خبرة سابقة")),
  ],

  finalTitle: "ابدأ رحلتك القيادية اليوم",
  finalSub: "شاهد المحاضرة المجانية واكتشف كيف تقود المؤسسات الصحية باستراتيجية تحقق نتائج.",
  finalCtaLabel: "ابدأ رحلتي القيادية",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة الإدارة الاستراتيجية التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
