import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  Globe2, ShieldCheck, FileCheck2, Award, Compass, HelpCircle, HeartCrack,
  ArrowLeftRight, Briefcase, Target, BookOpen, ClipboardCheck, Activity,
  ArrowUpRight, Wallet, Users, Microscope, Syringe,
} from "lucide-react";

import {
  FreeLectureArabLanding, COMMON_ARAB_FAQS, MEDICAL_AUDIENCE,
  type ArabLandingContent,
} from "@/features/marketing/components/free-lecture-arab-landing";

const PATH = "/lp/free-lecture-cic-arab";

export const metadata: Metadata = {
  title: "محاضرة CIC المجانية | طريقك إلى مكافحة العدوى — IMETS",
  description:
    "هل ترغب في الانتقال إلى مجال مكافحة العدوى أو الحصول على شهادة CIC لكنك لا تعرف من أين تبدأ؟ احضر محاضرة CIC المجانية (90 دقيقة) واكتشف الطريق الصحيح قبل أن تدفع في أي دورة. مخصّصة للكوادر الصحية في السعودية والإمارات والخليج والدول العربية.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "طريقك إلى مكافحة العدوى يبدأ من محاضرة CIC المجانية",
    description: "90 دقيقة تكشف لك الطريق الصحيح قبل أن تدفع في أي دورة. مجانًا وعبر الإنترنت.",
    type: "website",
  },
};

const content: ArabLandingContent = {
  path: PATH,
  courseName: "CIC Free Lecture (Arab)",
  countdownKey: "imets_reg_deadline_cic_arab",
  whatsappNumber: "201142293143",
  thankYouPath: "/lp/free-lecture-arab/thank-you",
  portrait: "/instructor-cphq.webp",

  heroTitle: (
    <>
      هل ترغب في العمل بمجال <span className="text-[#f4c430]">مكافحة العدوى؟</span>
      <br />
      لكنك لا تعرف من أين تبدأ؟
    </>
  ),
  heroLead: "احضر محاضرة مجانية تساعدك على معرفة:",
  heroBullets: [
    "هل شهادة CIC مناسبة لك؟",
    "كيف تبدأ الطريق الصحيح؟",
    "وما هي فرص العمل المتاحة؟",
  ],

  trust: [
    { icon: Globe2, label: "الجهة المانحة CBIC" },
    { icon: FileCheck2, label: "معايير APIC" },
    { icon: ShieldCheck, label: "إرشادات CDC / WHO" },
    { icon: Award, label: "شهادة حضور معتمدة" },
  ],

  painsEyebrow: "إن كان هذا يحدث لك…",
  painsTitle: "هل تواجه واحدة من هذه؟",
  pains: [
    { icon: Compass, t: "تائه في البداية", b: "ترغب في الانتقال إلى مكافحة العدوى لكنك لا تعرف أين تبدأ." },
    { icon: HelpCircle, t: "غير متأكد من CIC", b: "سمعت عن الشهادة لكنك لا تعرف هل تستحق الاستثمار أم لا." },
    { icon: HeartCrack, t: "تخشى قرارًا خاطئًا", b: "قلق من أن تدفع في دورة ثم تكتشف أنها غير مناسبة لك." },
    { icon: ArrowLeftRight, t: "ضائع بين المصادر", b: "مراجع كثيرة ومتضاربة ولا تعرف أين الصواب." },
  ],
  painsFooter: "هذه المحاضرة صُمّمت من أجلك تحديدًا — تخرج منها وأنت تعرف الطريق الصحيح قبل أن تنفق أي مبلغ.",

  outcomesTitle: "بعد المحاضرة ستكون قادرًا على:",
  outcomesSub: "نتائج ملموسة تخرج بها — لا مجرد معلومات.",
  outcomes: [
    { icon: Globe2, t: "تفهم CIC بوضوح", b: "تعرف ما هي الشهادة، ومن يمنحها (CBIC)، ولماذا أصبحت مطلوبة." },
    { icon: Briefcase, t: "تعرف فرص العمل", b: "المسارات المهنية المتاحة أمامك في الخليج والدول العربية." },
    { icon: Target, t: "تقيّم جاهزيتك", b: "تعرف مدى جاهزيتك للامتحان وما الذي ينقصك." },
    { icon: BookOpen, t: "تختار خطة الدراسة", b: "تحدّد أفضل خطة دراسية تناسب وقتك وخبرتك." },
  ],

  agendaTitle: "المحاور التي سنغطّيها",
  agenda: [
    { icon: Globe2, t: "ما هي CIC؟", b: "الشهادة والجهة المانحة (CBIC) ومكانتها في السوق الصحي." },
    { icon: Syringe, t: "أساسيات مكافحة العدوى", b: "سلسلة انتقال العدوى وطرق الوقاية والاحتياطات القياسية." },
    { icon: Activity, t: "الترصد الوبائي", b: "مراقبة عدوى المستشفيات (HAIs) وحساب المعدلات." },
    { icon: Microscope, t: "مقاومة مضادات الميكروبات", b: "برامج ترشيد المضادات الحيوية والكائنات المقاومة." },
    { icon: ClipboardCheck, t: "محتوى الامتحان", b: "توزيع الدرجات والمهارات التي يقيسها امتحان CIC." },
    { icon: ArrowUpRight, t: "الخطوة التالية", b: "شروط الأهلية (Eligibility) وخطة الدراسة حتى النجاح." },
  ],

  audienceTitle: "هذه المحاضرة مناسبة لك إذا كنت:",
  audience: MEDICAL_AUDIENCE,

  benefitsEyebrow: "لماذا CIC تحديدًا؟",
  benefitsTitle: "أكثر من مجرد شهادة",
  benefitsSub: "استثمار مباشر في مستقبلك المهني.",
  benefits: [
    { icon: Wallet, ar: "زيادة الراتب", en: "Salary" },
    { icon: Award, ar: "شهادة دولية مطلوبة", en: "Global Cert" },
    { icon: Users, ar: "قيادة برنامج مكافحة العدوى", en: "IPC Lead" },
    { icon: ArrowLeftRight, ar: "تغيير مسارك المهني", en: "Career Shift" },
    { icon: ClipboardCheck, ar: "دخول قسم مكافحة العدوى", en: "IPC Dept." },
    { icon: Globe2, ar: "فرص عمل في الخليج", en: "Gulf Jobs" },
  ],

  speakerBadge: "محاضرك · CIC Certified",
  speakerRole: "استشاري مكافحة العدوى",
  speakerFaculty: "IMETS Faculty · CIC",
  speakerTitle: "لماذا تثق بمن سيشرح لك؟",
  speakerBio:
    "نخبة من استشاريي مكافحة العدوى المعتمدين بخبرة عملية داخل المستشفيات — لا تنظير. يشرحون بالعربية ويركّزون على ما يفيدك في الامتحان وفي عملك من أول يوم.",
  speakerTrainedLine: "درّبوا أكثر من 5,000 متخصص صحي من مختلف الدول العربية.",
  speakerPoints: ["خبرة عملية في مكافحة العدوى", "12 عامًا من الخبرة", "5,000+ متدرب", "استشاري IPC معتمد"],

  testimonials: [
    { quote: "المحاضرة وضّحت لي الصورة كاملة عن CIC، وقررت أن أُكمل مع IMETS.", name: "د. هالة", role: "أخصائية مكافحة عدوى — الرياض" },
    { quote: "كنت مترددًا بين الدورات، فرتّبت هذه المحاضرة المجانية أفكاري تمامًا.", name: "أحمد", role: "ممرض — دبي" },
    { quote: "الشرح العملي بالعربية جعل مفاهيم الترصد سهلة. تجربة محترمة.", name: "منى", role: "فني مختبر — عمّان" },
  ],

  faqs: COMMON_ARAB_FAQS,

  finalTitle: "ابدأ رحلتك في مكافحة العدوى اليوم",
  finalSub: "احجز مقعدك المجاني قبل اكتمال العدد — محاضرة مباشرة عبر الإنترنت، 90 دقيقة، وبشهادة حضور.",
  finalCtaLabel: "ابدأ رحلتي في مكافحة العدوى",
  heroCtaLabel: "احجز مقعدي المجاني",
  stickyLabel: "محاضرة CIC التمهيدية",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FreeLectureArabLanding content={content} />;
}
