import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Megaphone, TrendingUp, Briefcase,
  Target, BookOpen, Users, Smartphone, BarChart3, Star, ArrowUpRight,
  Wallet, ArrowLeftRight,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-healthcare-marketing-arab";

export const metadata: Metadata = {
  title: "دبلوم التسويق الصحي — محاضرة مجانية | IMETS",
  description:
    "هل تريد بناء Career ناجح في التسويق الصحي؟ احضر محاضرة مجانية (90 دقيقة) واكتشف الفرق بين التسويق الصحي والتقليدي، والوظائف المطلوبة في Healthcare Marketing، وكيف تبدأ مسارك بثقة. مخصّصة للمسوّقين وأصحاب العيادات والكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "ابنِ Career ناجحًا في التسويق الصحي — يبدأ من محاضرة مجانية",
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
      هل تريد بناء <span className="text-[#f4c430]">Career ناجح في التسويق الصحي؟</span>
    </>
  ),
  heroLead:
    "احضر محاضرة مجانية واكتشف كيف تساعدك دبلومة التسويق الصحي على دخول المجال، ومعرفة الوظائف المطلوبة، وبناء مسارك المهني بثقة.",
  heroBullets: [
    "ما الفرق بين التسويق الصحي والتسويق التقليدي؟",
    "ما أكثر الوظائف المطلوبة في Healthcare Marketing؟",
    "كيف تبدأ Career في التسويق الصحي؟",
    "وهل يناسب تخصصك الحالي؟",
  ],

  trust: [
    { icon: Smartphone, label: "تسويق رقمي عملي" },
    { icon: ShieldCheck, label: "أخلاقيات التسويق الصحي" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تبدو هذه التحديات مألوفة؟",
  pains: [
    { icon: Megaphone, t: "خبرة تسويق بلا قطاع صحي", b: "لديك خبرة في التسويق لكن ليس في القطاع الصحي." },
    { icon: ShieldCheck, t: "تسويق صحي احترافي؟", b: "لا تعرف كيف تسوّق للخدمات الصحية بطريقة احترافية." },
    { icon: Users, t: "سلوك المريض والعميل", b: "لا تمتلك فهمًا لسلوك المريض والعملاء الصحيين." },
    { icon: TrendingUp, t: "فرص أكبر… كيف تبدأ؟", b: "تشعر أن فرص Healthcare Marketing أكبر لكن لا تعرف كيف تبدأ." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد انتهاء المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Megaphone, t: "تفهم التسويق الصحي", b: "تعرف ما الذي يميّز تسويق القطاع الصحي عن غيره." },
    { icon: Briefcase, t: "تعرف الوظائف المطلوبة", b: "أكثر الأدوار طلبًا في Healthcare Marketing بالخليج والدول العربية." },
    { icon: Target, t: "تحدّد جمهورك", b: "تعرف كيف تصل للمريض المناسب بالرسالة المناسبة." },
    { icon: BookOpen, t: "بناء خطة واضحة", b: "خطة واضحة لدخول مجال التسويق الصحي (Healthcare Marketing)." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agendaLabel: "الأسبوع",
  agenda: [
    { icon: Megaphone, t: "أساسيات التسويق الصحي (Fundamentals)", b: "ما الذي يجعل تسويق الصحة مختلفًا وأكثر حساسية." },
    { icon: Users, t: "رحلة المريض (Patient Journey)", b: "كيف يتخذ المريض قراره وكيف تبني الثقة قبل الحجز." },
    { icon: Smartphone, t: "التسويق الصحي الرقمي (Digital)", b: "السوشيال ميديا والإعلانات الممولة والمحتوى الطبي." },
    { icon: Star, t: "العلامة التجارية الصحية (Branding)", b: "بناء براند العيادة/المستشفى وإدارة السمعة." },
    { icon: BarChart3, t: "إدارة المحتوى والحملات (Campaigns)", b: "تخطيط الحملات وقياس النتائج (ROI)." },
    { icon: ArrowUpRight, t: "خارطة المسار المهني (Career Roadmap)", b: "كيف تبني مسارك في التسويق الصحي خطوة بخطوة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: [
    { emoji: "📣", label: "المسوّقون / Marketing Professionals" },
    { emoji: "🏥", label: "الإداريون الصحيون / Healthcare Administrators" },
    { emoji: "🎓", label: "خريجو إدارة الأعمال / Business Graduates" },
    { emoji: "👨‍⚕️", label: "أطباء أصحاب ممارسة خاصة" },
    { emoji: "🚀", label: "رواد الأعمال في القطاع الصحي" },
    { emoji: "⭐", label: "أصحاب العيادات والمراكز" },
  ],

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "اكتسب المهارات التي تحتاجها المؤسسات الصحية اليوم.",
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
  speakerTitle: "لماذا يتعلّم محترفو التسويق الصحي مع IMETS؟",
  speakerBio:
    "نخبة من خبراء التسويق الصحي بحملات حقيقية وميزانيات فعلية — لا تنظير. يشرحون بالعربية ويركّزون على ما يجلب لك مرضى ونتائج من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص ومسوّق في القطاع الصحي بالدول العربية.",
  speakerPoints: ["حملات صحية حقيقية", "12 عامًا في التسويق", "5,000+ متدرب", "استشاري تسويق صحي"],

  testimonials: [
    { quote: "ساعدتني المحاضرة على فهم كيف أبدأ في Healthcare Marketing، وبدأت مساري بثقة.", name: "ريم", role: "مسوّقة — الرياض" },
    { quote: "عرفت الوظائف المطلوبة في التسويق الصحي وكيف أؤهّل نفسي لها.", name: "خالد", role: "أخصائي تسويق — دبي" },
    { quote: "انتقلت من التسويق العام إلى التسويق الصحي بعد أن اتضح لي الطريق. شكرًا IMETS.", name: "هبة", role: "منسقة تسويق — عمّان" },
  ],

  faqs: [
    { q: "هل يناسب المسوّقين؟", a: "نعم. إذا كانت لديك خلفية تسويقية، ستتعلّم كيف تكيّفها لخصوصية القطاع الصحي ويفتح لك سوقًا جديدًا." },
    { q: "هل يناسب خريجي إدارة الأعمال؟", a: "نعم تمامًا. خلفية إدارة الأعمال أساس ممتاز للانطلاق في التسويق الصحي." },
    { q: "هل يناسب من يعمل في المستشفيات؟", a: "نعم. سيمكّنك من تسويق خدمات منشأتك وجذب المرضى باحتراف وأخلاقية." },
    { q: "هل سأتعلّم التسويق الرقمي؟", a: "نعم، يشمل البرنامج السوشيال ميديا والإعلانات الممولة والمحتوى الطبي وقياس النتائج." },
    { q: "هل سأتعلّم Branding؟", a: "نعم، تغطي الدبلومة بناء العلامة التجارية للعيادة/المستشفى وإدارة السمعة والتقييمات." },
    ...COMMON_ARAB_FAQS.filter((f) => !f.q.includes("خبرة سابقة")),
  ],

  finalTitle: "ابدأ رحلتك في Healthcare Marketing اليوم",
  finalSub: "شاهد المحاضرة المجانية واكتشف كيف تبني Career احترافيًا في التسويق الصحي.",
  finalCtaLabel: "ابدأ رحلتي في التسويق الصحي",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة التسويق الصحي التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
