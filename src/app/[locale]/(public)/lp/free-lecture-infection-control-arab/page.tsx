import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, ClipboardCheck, Activity,
  ArrowUpRight, Wallet, Users, Syringe, Trash2, Droplets,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MEDICAL_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-infection-control-arab";

export const metadata: Metadata = {
  title: "دبلوم مكافحة العدوى — محاضرة مجانية | IMETS",
  description:
    "احضر محاضرة مجانية (90 دقيقة) تكشف لك طريق الاحتراف العملي في مكافحة العدوى: الاحتياطات القياسية، التعقيم، الترصد، وبناء برنامج IPC داخل منشأتك. مخصّصة للكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "أتقِن مكافحة العدوى عمليًا — تبدأ من محاضرة مجانية",
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
      هل تريد إتقان <span className="text-[#f4c430]">مكافحة العدوى</span> عمليًا؟
      <br />
      خطوة بخطوة وباحتراف
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "ماذا يفعل أخصائي مكافحة العدوى فعليًا؟",
    "كيف تبدأ الطريق الصحيح؟",
    "وما هي فرص العمل المتاحة؟",
  ],

  trust: [
    { icon: ShieldCheck, label: "إرشادات CDC / WHO" },
    { icon: FileCheck2, label: "معايير APIC" },
    { icon: ClipboardCheck, label: "اعتماد CME / CPD" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "تائه في البداية", b: "تريد دخول مكافحة العدوى لكنك لا تعرف من أين تبدأ." },
    { icon: HelpCircle, t: "معلومات نظرية فقط", b: "تقرأ الكثير لكنك لا تعرف كيف تُطبَّق داخل المستشفى فعليًا." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من دفع مبلغ في دبلومة غير مناسبة لمسارك." },
    { icon: ArrowLeftRight, t: "ضائع بين المصادر", b: "مراجع كثيرة ومتضاربة ولا تعرف أين الصواب." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Globe2, t: "تفهم دور IPC", b: "تعرف ماذا يفعل قسم مكافحة العدوى ودوره في سلامة المرضى." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "الوظائف والمسارات المتاحة في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف المهارات العملية التي تحتاجها للبدء." },
    { icon: BookOpen, t: "تختار خطة التعلّم", b: "تحدّد أنسب مسار دراسي لوقتك وخبرتك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Syringe, t: "أساسيات مكافحة العدوى", b: "سلسلة انتقال العدوى والاحتياطات القياسية." },
    { icon: ShieldCheck, t: "العزل ومنع الانتقال", b: "أنواع العزل ومتى وكيف تُطبَّق عمليًا." },
    { icon: Droplets, t: "التعقيم والتطهير", b: "معالجة الأدوات الطبية ومستويات التطهير." },
    { icon: Activity, t: "الترصد الوبائي", b: "مراقبة عدوى المستشفيات (HAIs) وحساب المعدلات." },
    { icon: Trash2, t: "النفايات الطبية والبيئة", b: "الفرز الآمن للنفايات وصحة البيئة داخل المنشأة." },
    { icon: ArrowUpRight, t: "بناء برنامج IPC", b: "كيف تبني وتقود برنامج مكافحة عدوى في منشأتك." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MEDICAL_AUDIENCE,

  benefitsEyebrow: "لماذا هذا الدبلوم؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك المهني.",
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
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من استشاريي مكافحة العدوى المعتمدين بخبرة عملية داخل المستشفيات — لا تنظير. يشرحون بالعربية ويركّزون على التطبيق العملي الذي يفيدك في عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة عملية في المستشفيات", "12 عامًا في مكافحة العدوى", "5,000+ متدرب", "استشاري IPC معتمد"],

  testimonials: [
    { quote: "المحاضرة ربطت لي النظري بالعملي وفتحت لي باب قسم مكافحة العدوى.", name: "د. ليلى", role: "أخصائية IPC — جدة" },
    { quote: "أخيرًا فهمت كيف يُطبَّق الترصد فعليًا. قررت أُكمل الدبلومة.", name: "يوسف", role: "ممرض — الدوحة" },
    { quote: "شرح عملي بالعربية سهّل عليّ كل شيء. تجربة ممتازة مع IMETS.", name: "سلمى", role: "فنية تعقيم — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

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
