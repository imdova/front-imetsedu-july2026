import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, ShieldAlert, FileCheck2, Award, Compass, HelpCircle,
  BookOpen, TrendingUp, Syringe, Droplets, Activity, ArrowUpRight,
  ClipboardCheck, ArrowLeftRight, Wallet, Users,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MEDICAL_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-infection-control-arab";

export const metadata: Metadata = {
  title: "دبلوم مكافحة العدوى — محاضرة مجانية | IMETS",
  description:
    "هل ترغب في أن تصبح متخصصًا في مكافحة العدوى؟ احضر محاضرة مجانية (90 دقيقة) واكتشف كيف تساعدك دبلومة مكافحة العدوى على اكتساب المهارات العملية والاستعداد للعمل بثقة في مجال Infection Prevention & Control. مخصّصة للكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "كن متخصصًا في مكافحة العدوى — يبدأ من محاضرة مجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دبلومة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "Infection Control Diploma Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_ic_diploma_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل ترغب في أن تصبح <span className="text-[#f4c430]">متخصصًا في مكافحة العدوى؟</span>
    </>
  ),
  heroLead:
    "احضر محاضرة مجانية واكتشف كيف تساعدك دبلومة مكافحة العدوى على اكتساب المهارات العملية والاستعداد للعمل بثقة في مجال Infection Prevention & Control.",
  heroBullets: [
    "ماذا ستتعلم في دبلومة مكافحة العدوى؟",
    "هل هذا المسار المهني مناسب لك؟",
    "كيف تبدأ بطريقة صحيحة؟",
  ],
  heroNote: "🎓 شاهد المحاضرة الآن، وابدأ التعلّم فورًا — لا حاجة لانتظار موعد.",

  trust: [
    { icon: ShieldCheck, label: "إرشادات CDC / WHO" },
    { icon: FileCheck2, label: "معايير APIC" },
    { icon: ClipboardCheck, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تبدو هذه التحديات مألوفة؟",
  pains: [
    { icon: Compass, t: "لا تمتلك خبرة عملية؟", b: "ترغب في دخول مكافحة العدوى لكن ليست لديك خبرة عملية في المجال." },
    { icon: HelpCircle, t: "أين أول خطوة؟", b: "لا تعرف أول خطوة صحيحة لدخول المجال والانتقال إليه." },
    { icon: BookOpen, t: "مصادر كثيرة ومتضاربة", b: "تجد معلومات كثيرة لكن لا تعرف المصدر الصحيح الموثوق." },
    { icon: TrendingUp, t: "تطمح للتطوّر", b: "تريد تطوير مسارك المهني في القطاع الصحي." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد انتهاء المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Syringe, t: "فهم أساسيات IPC", b: "Infection Prevention & Control: سلسلة العدوى والاحتياطات القياسية." },
    { icon: ShieldCheck, t: "مسؤوليات أخصائي مكافحة العدوى", b: "أهم المهام والأدوار اليومية داخل المنشأة الصحية." },
    { icon: ClipboardCheck, t: "معرفة محتوى الدبلومة", b: "ما الذي تغطيه دبلومة مكافحة العدوى بالتفصيل." },
    { icon: BookOpen, t: "وضع خطة واضحة", b: "خطة عملية لبداية رحلتك المهنية في المجال." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agendaLabel: "الدرس",
  agenda: [
    { icon: Syringe, t: "مقدمة في مكافحة العدوى (Introduction to IPC)", b: "المفاهيم الأساسية وسلسلة انتقال العدوى." },
    { icon: ShieldCheck, t: "الاحتياطات القياسية (Standard Precautions)", b: "نظافة اليدين ومعدات الحماية الشخصية." },
    { icon: ShieldAlert, t: "احتياطات العزل (Isolation Precautions)", b: "أنواع العزل ومتى وكيف تُطبَّق عمليًا." },
    { icon: Droplets, t: "التعقيم والتطهير (Sterilization & Disinfection)", b: "معالجة الأدوات الطبية ومستويات التطهير." },
    { icon: Activity, t: "عدوى الرعاية الصحية (HAIs)", b: "Healthcare-Associated Infections والترصد والوقاية." },
    { icon: ArrowUpRight, t: "خريطة المسار المهني (Career Roadmap)", b: "كيف تبني مسارك في مكافحة العدوى خطوة بخطوة." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MEDICAL_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "اكتسب المهارات التي يبحث عنها أصحاب العمل في مكافحة العدوى.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: ShieldCheck, ar: "مهارات عملية مطلوبة", en: "Practical Skills" },
    { icon: Users, ar: "قيادة فريق مكافحة العدوى", en: "IPC Team Lead" },
    { icon: ArrowLeftRight, ar: "تغيير مسارك المهني", en: "Career Shift" },
    { icon: ClipboardCheck, ar: "دخول قسم مكافحة العدوى", en: "IPC Dept." },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · خبير IPC",
  speakerRole: "استشاري مكافحة العدوى",
  speakerFaculty: "IMETS Faculty · IPC",
  speakerTitle: "لماذا يختار آلاف المتخصصين الصحيين التعلّم مع IMETS؟",
  speakerBio:
    "نخبة من استشاريي مكافحة العدوى المعتمدين بخبرة عملية داخل المستشفيات — لا تنظير. يشرحون بالعربية ويركّزون على التطبيق العملي الذي يفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة عملية في المستشفيات", "12 عامًا في مكافحة العدوى", "5,000+ متدرب", "استشاري IPC معتمد"],

  testimonials: [
    { quote: "كنت أبحث عن نقطة بداية في مكافحة العدوى، والمحاضرة أوضحت لي الطريق، والدبلومة كانت أفضل خطوة بعدها.", name: "د. ليلى", role: "أخصائية IPC — جدة" },
    { quote: "أخيرًا فهمت كيف يُطبَّق الترصد فعليًا. قررت أُكمل الدبلومة.", name: "يوسف", role: "ممرض — الدوحة" },
    { quote: "شرح عملي بالعربية سهّل عليّ كل شيء. تجربة ممتازة مع IMETS.", name: "سلمى", role: "فنية تعقيم — عمّان" },
  ],

  faqs: [
    ...COMMON_ARAB_FAQS.filter((f) => !f.q.includes("خبرة سابقة")),
    { q: "هل أحتاج إلى خبرة سابقة للعمل في مكافحة العدوى؟", a: "لا يُشترط. يبدأ كثيرون في المجال من خلفيات تمريض أو مختبر أو صيدلة، والدبلومة مصمّمة لتأخذك من الأساسيات حتى الاحتراف خطوة بخطوة." },
  ],

  finalTitle: "ابدأ رحلتك في مكافحة العدوى اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي في مكافحة العدوى",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة مكافحة العدوى التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
