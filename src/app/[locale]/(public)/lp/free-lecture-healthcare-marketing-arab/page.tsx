import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, Megaphone, TrendingUp,
  Wallet, Users, Smartphone, BarChart3, Star,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-healthcare-marketing-arab";

export const metadata: Metadata = {
  title: "دبلوم التسويق الصحي — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف في التسويق الصحي: التسويق الرقمي، بناء العلامة التجارية للعيادة، جذب المرضى، وقياس النتائج. مخصّصة لأصحاب العيادات والمسوقين والكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى التسويق الصحي الاحترافي يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دبلومة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Healthcare Marketing Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_marketing_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل تريد إتقان <span className="text-[#f4c430]">التسويق الصحي؟</span>
      <br />
      وجذب المزيد من المرضى باحتراف
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "كيف تجذب المرضى للعيادة أو المستشفى؟",
    "كيف تبني علامة تجارية صحية موثوقة؟",
    "وما هي فرص العمل في هذا المجال؟",
  ],

  trust: [
    { icon: Smartphone, label: "تسويق رقمي عملي" },
    { icon: ShieldCheck, label: "أخلاقيات التسويق الصحي" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "تُنفق بلا نتائج", b: "تجرّب إعلانات ومنشورات لكنها لا تجلب مرضى فعليين." },
    { icon: HelpCircle, t: "تسويق عام لا يناسب الصحة", b: "قواعد التسويق الصحي مختلفة ولها ضوابط لا يعرفها الجميع." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في دبلومة غير مناسبة لمجالك." },
    { icon: ArrowLeftRight, t: "ضائع بين الأدوات", b: "منصّات وأدوات كثيرة ولا تعرف أين تبدأ." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Megaphone, t: "تفهم التسويق الصحي", b: "تعرف ما الذي يميّز تسويق القطاع الصحي عن غيره." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "الأدوار والمشاريع المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تحدّد جمهورك", b: "تعرف كيف تصل للمريض المناسب بالرسالة المناسبة." },
    { icon: BookOpen, t: "تختار خطة التعلّم", b: "تحدّد أنسب مسار دراسي يناسب وقتك وهدفك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Megaphone, t: "أساسيات التسويق الصحي", b: "ما الذي يجعل تسويق الصحة مختلفًا وأكثر حساسية." },
    { icon: Users, t: "فهم المريض والعميل", b: "رحلة المريض وكيف تبني الثقة قبل الحجز." },
    { icon: Smartphone, t: "التسويق الرقمي", b: "السوشيال ميديا والإعلانات الممولة والمحتوى الطبي." },
    { icon: Star, t: "العلامة التجارية والسمعة", b: "بناء براند العيادة/المستشفى وإدارة التقييمات." },
    { icon: ShieldCheck, t: "الأخلاقيات والقوانين", b: "ضوابط الإعلان الصحي وما يُسمح وما لا يُسمح." },
    { icon: BarChart3, t: "قياس النتائج (ROI)", b: "كيف تقيس الحملات وتعرف ما ينجح وما لا ينجح." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: [
    { emoji: "🏥", label: "أصحاب العيادات والمراكز" },
    { emoji: "👨‍⚕️", label: "أطباء أصحاب ممارسة خاصة" },
    { emoji: "📣", label: "المسوقون / Marketers" },
    { emoji: "📊", label: "مدراء تسويق المستشفيات" },
    { emoji: "🚀", label: "رواد الأعمال في القطاع الصحي" },
    { emoji: "🎓", label: "الخريجون الجدد / Fresh Grads" },
  ],

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك المهني ومشروعك.",
  benefits: [
    { icon: TrendingUp, ar: "زيادة عدد المرضى", en: "More Patients" },
    { icon: Wallet, ar: "دخل أعلى للعيادة", en: "Revenue" },
    { icon: Megaphone, ar: "علامة تجارية قوية", en: "Strong Brand" },
    { icon: ArrowLeftRight, ar: "دخول مجال جديد", en: "Career Shift" },
    { icon: Briefcase, ar: "العمل كمسوّق صحي", en: "Marketer Role" },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير التسويق الصحي",
  speakerRole: "استشاري التسويق الصحي",
  speakerFaculty: "IMETS Faculty · Marketing",
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من خبراء التسويق الصحي بحملات حقيقية وميزانيات فعلية — لا تنظير. يشرحون بالعربية ويركّزون على ما يجلب لك مرضى ونتائج من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص ومسوّق في القطاع الصحي بالدول العربية.",
  speakerPoints: ["حملات صحية حقيقية", "12 عامًا في التسويق", "5,000+ متدرب", "استشاري تسويق صحي"],

  testimonials: [
    { quote: "بعد المحاضرة غيّرت طريقة إعلانات عيادتي وزادت الحجوزات فعلًا.", name: "د. ريم", role: "طبيبة أسنان — الرياض" },
    { quote: "فهمت أخيرًا الفرق بين التسويق العام والتسويق الصحي. نقلة مهمة.", name: "خالد", role: "مسوّق — دبي" },
    { quote: "شرح عملي بالعربية بأمثلة من السوق. قررت أُكمل الدبلومة.", name: "هبة", role: "منسقة تسويق — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك في التسويق الصحي اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي في التسويق الصحي",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة التسويق الصحي التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
