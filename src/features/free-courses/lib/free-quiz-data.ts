/**
 * Bundled knowledge-check quizzes for free-lecture programs, keyed by slug with
 * a sensible healthcare-quality default. Mirrors the "bundled content" pattern
 * used elsewhere (course-content.ts, hospital-curriculum.ts) — no backend field
 * yet, so questions live in code and can later move to the model.
 */
export interface QuizQuestion {
  q: { en: string; ar: string };
  options: { en: string; ar: string }[];
  correct: number; // index into options
}

const DEFAULT_QUIZ: QuizQuestion[] = [
  {
    q: { en: "What does CPHQ stand for?", ar: "اختصار CPHQ معناه؟" },
    options: [
      { en: "Certified Professional in Healthcare Quality", ar: "أخصائي معتمد في جودة الرعاية الصحية" },
      { en: "Clinical Practice for Health Quality", ar: "الممارسة الإكلينيكية لجودة الصحة" },
      { en: "Certified Public Health Quality", ar: "جودة الصحة العامة المعتمدة" },
      { en: "Central Program for Hospital Quality", ar: "البرنامج المركزي لجودة المستشفيات" },
    ],
    correct: 0,
  },
  {
    q: { en: "Which body issues the CPHQ certification?", ar: "أي جهة تصدر شهادة CPHQ؟" },
    options: [
      { en: "NAHQ (USA)", ar: "NAHQ (أمريكا)" },
      { en: "WHO", ar: "منظمة الصحة العالمية" },
      { en: "JCI", ar: "JCI" },
      { en: "CBAHI", ar: "CBAHI" },
    ],
    correct: 0,
  },
  {
    q: { en: "The core goal of healthcare quality is to…", ar: "الهدف الأساسي من جودة الرعاية الصحية هو…" },
    options: [
      { en: "Improve patient safety & outcomes", ar: "تحسين سلامة المرضى والنتائج" },
      { en: "Reduce staff numbers", ar: "تقليل عدد الموظفين" },
      { en: "Increase marketing", ar: "زيادة التسويق" },
      { en: "Speed up billing", ar: "تسريع الفوترة" },
    ],
    correct: 0,
  },
  {
    q: { en: "The PDSA improvement cycle stands for…", ar: "دورة التحسين PDSA تعني…" },
    options: [
      { en: "Plan – Do – Study – Act", ar: "خطّط – نفّذ – ادرس – تصرّف" },
      { en: "Prepare – Deliver – Score – Assess", ar: "جهّز – سلّم – قيّم – راجع" },
      { en: "Patient – Doctor – Staff – Admin", ar: "مريض – طبيب – موظف – إدارة" },
      { en: "Plan – Design – Store – Archive", ar: "خطّط – صمّم – خزّن – أرشف" },
    ],
    correct: 0,
  },
  {
    q: { en: "JCI accreditation is primarily about…", ar: "اعتماد JCI أساسًا بيتكلم عن…" },
    options: [
      { en: "International hospital quality & safety standards", ar: "معايير جودة وسلامة المستشفيات الدولية" },
      { en: "Insurance pricing", ar: "تسعير التأمين" },
      { en: "Pharmacy sales", ar: "مبيعات الصيدليات" },
      { en: "Medical-school ranking", ar: "ترتيب كليات الطب" },
    ],
    correct: 0,
  },
];

const QUIZZES: Record<string, QuizQuestion[]> = {
  // slug-specific quizzes can be added here; falls back to DEFAULT_QUIZ.
};

export function getFreeQuiz(slug: string): QuizQuestion[] {
  return QUIZZES[slug] ?? DEFAULT_QUIZ;
}
