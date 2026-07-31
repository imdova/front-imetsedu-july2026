import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, Target,
  ArrowLeftRight, Briefcase, BookOpen, Users, UserPlus, ClipboardCheck,
  Scale, TrendingUp, ArrowUpRight, Wallet,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-hr-management-arab";

export const metadata: Metadata = {
  title: "دبلوم الموارد البشرية الصحية — محاضرة مجانية | IMETS",
  description:
    "هل تريد بناء Career ناجح في الموارد البشرية الصحية؟ احضر محاضرة مجانية (90 دقيقة) واكتشف الوظائف المطلوبة في Healthcare HR والمهارات اللازمة وكيف تبدأ مسارك بثقة. مخصّصة للكوادر والإداريين في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "ابنِ Career ناجحًا في الموارد البشرية الصحية — يبدأ من محاضرة مجانية",
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
      هل تريد بناء <span className="text-[#f4c430]">Career ناجح في الموارد البشرية الصحية؟</span>
    </>
  ),
  heroLead:
    "احضر محاضرة مجانية واكتشف كيف تساعدك دبلومة الموارد البشرية الصحية على دخول المجال، ومعرفة الوظائف المطلوبة، واكتساب المهارات اللازمة لبناء مسارك بثقة.",
  heroBullets: [
    "كيف تعمل إدارة الموارد البشرية داخل المؤسسات الصحية؟",
    "ما أكثر الوظائف المطلوبة في Healthcare HR؟",
    "كيف تبدأ Career في Healthcare HR؟",
    "وهل المجال مناسب لخلفيتك الحالية؟",
  ],

  trust: [
    { icon: Scale, label: "قانون العمل والامتثال" },
    { icon: ShieldCheck, label: "أفضل ممارسات HR" },
    { icon: FileCheck2, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تبدو هذه التحديات مألوفة؟",
  pains: [
    { icon: Compass, t: "أين أول خطوة؟", b: "تريد دخول المجال لكن لا تعرف أول خطوة صحيحة." },
    { icon: HelpCircle, t: "HR تقليدي أم صحي؟", b: "لا تعرف الفرق بين HR التقليدي و Healthcare HR." },
    { icon: Target, t: "ما المهارات المطلوبة؟", b: "لا تعرف المهارات المطلوبة للحصول على وظيفة." },
    { icon: ArrowLeftRight, t: "كيف تنافس؟", b: "ترى فرصًا كثيرة لكن لا تعرف كيف تنافس عليها." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد انتهاء المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Users, t: "تفهم HR الصحي", b: "تعرف دور الموارد البشرية في نجاح المنشأة الصحية." },
    { icon: Briefcase, t: "تعرف الوظائف المطلوبة", b: "أكثر الأدوار طلبًا في Healthcare HR بالخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات التي تحتاجها للحصول على وظيفة." },
    { icon: BookOpen, t: "بناء خطة واضحة", b: "خطة واضحة لدخول مجال الموارد البشرية الصحية." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agendaLabel: "الأسبوع",
  agenda: [
    { icon: Users, t: "أساسيات HR الصحي (Healthcare HR Fundamentals)", b: "دور الموارد البشرية في القطاع الصحي وخصوصيته." },
    { icon: UserPlus, t: "الاستقطاب وتخطيط القوى العاملة (Recruitment)", b: "جذب واختيار الكوادر وتخطيط الاحتياجات." },
    { icon: ClipboardCheck, t: "إدارة الأداء (Performance Management)", b: "أنظمة تقييم عادلة تربط الأداء بالأهداف." },
    { icon: Scale, t: "قانون العمل وسياسات HR (Labor Law & Policies)", b: "الحقوق والواجبات وتجنّب المخاطر القانونية." },
    { icon: TrendingUp, t: "إدارة المواهب (Talent Management)", b: "تطوير الكوادر والاحتفاظ بها ورفع كفاءتها." },
    { icon: ArrowUpRight, t: "خارطة المسار المهني (Career Roadmap)", b: "كيف تبني مسارك في Healthcare HR خطوة بخطوة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: [
    { emoji: "🎓", label: "حديثو التخرج الراغبون في دخول Healthcare HR" },
    { emoji: "🧑‍💼", label: "موظفو الموارد البشرية" },
    { emoji: "🏥", label: "مسؤولو التشغيل والإدارة الصحية" },
    { emoji: "📊", label: "رؤساء الأقسام والوحدات" },
    { emoji: "🚀", label: "الطامحون للانتقال إلى HR الصحي" },
    { emoji: "🩺", label: "الكوادر الصحية المهتمة بالإدارة" },
  ],

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "ابدأ ببناء مستقبل مهني في Healthcare HR.",
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
  speakerTitle: "لماذا يتعلّم المتخصصون في الموارد البشرية مع IMETS؟",
  speakerBio:
    "نخبة من خبراء الموارد البشرية بخبرة داخل المنشآت الصحية — لا تنظير. يشرحون بالعربية ويركّزون على الممارسات التي تفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص وإداري صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة HR داخل القطاع الصحي", "12 عامًا من الخبرة", "5,000+ متدرب", "استشاري موارد بشرية"],

  testimonials: [
    { quote: "ساعدتني المحاضرة على فهم كيف أدخل مجال HR الصحي، وبدأت مساري بثقة.", name: "د. منال", role: "منسقة موارد بشرية — الرياض" },
    { quote: "عرفت الوظائف المطلوبة في Healthcare HR وكيف أؤهّل نفسي لها.", name: "سعيد", role: "أخصائي توظيف — الدوحة" },
    { quote: "انتقلت من HR عام إلى HR صحي بعد أن اتضح لي الطريق. شكرًا IMETS.", name: "دعاء", role: "موظفة موارد بشرية — عمّان" },
  ],

  faqs: [
    { q: "هل أحتاج خبرة سابقة؟", a: "لا. المحاضرة والدبلومة مصمّمتان للمبتدئين ولمن يريد الانتقال إلى مجال الموارد البشرية الصحية." },
    { q: "هل يناسب خريجي إدارة الأعمال؟", a: "نعم تمامًا. خلفية إدارة الأعمال أساس ممتاز، وستتعلّم كيف تطبّقها في السياق الصحي." },
    { q: "هل يناسب خريجي الموارد البشرية؟", a: "نعم. سيساعدك على التخصّص في Healthcare HR وفهم خصوصية إدارة الكوادر الطبية." },
    { q: "هل سأتعلّم التوظيف داخل المستشفيات؟", a: "نعم، يشمل البرنامج استقطاب وتوظيف الكوادر الصحية وتخطيط القوى العاملة داخل المنشآت." },
    { q: "هل يساعدني في الحصول على وظيفة؟", a: "يمنحك المهارات والمفاهيم التي يبحث عنها أصحاب العمل في Healthcare HR ويزيد جاهزيتك للتقديم بثقة." },
    ...COMMON_ARAB_FAQS.filter((f) => !f.q.includes("خبرة سابقة")),
  ],

  finalTitle: "ابدأ رحلتك في Healthcare HR اليوم",
  finalSub: "شاهد المحاضرة المجانية واكتشف كيف تبدأ Career احترافيًا في الموارد البشرية الصحية.",
  finalCtaLabel: "ابدأ رحلتي في الموارد البشرية",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة الموارد البشرية الصحية التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
