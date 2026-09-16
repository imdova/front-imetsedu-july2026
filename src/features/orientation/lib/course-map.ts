/**
 * The shape of the Sales Orientation journey: five modules, what each lesson is
 * (type, minutes, outcome, completion gate) and where it sits.
 *
 * Lessons are keyed by a readable `slug` (`rules`, `details`, `send`…). A
 * lesson's stored id — the key its completion is saved under — never changes,
 * so a built-in lesson whose slug differs from its id (`program-details` →
 * `details`, `checklist` → `send`) and admin-created lessons (`c-…`, which
 * carry their slug on the saved lesson) keep everyone's progress. Old anchors
 * (`#program-details`, `#c-mu2qfyya9hgz`…) still open the right lesson.
 *
 * Minutes, outcomes and gate labels here are defaults; an admin can override
 * any of them per lesson in the editor.
 */

export type LessonType = "video" | "read" | "interactive" | "practice" | "quiz" | "task" | "checklist";

export const LESSON_TYPES: LessonType[] = ["video", "read", "interactive", "practice", "quiz", "task", "checklist"];

export type ModuleId = "m1" | "m2" | "m3" | "m4" | "m5";

export interface Bilingual {
  en: string;
  ar: string;
}

export interface OrientationModule {
  id: ModuleId;
  title: Bilingual;
}

export const MODULES: OrientationModule[] = [
  { id: "m1", title: { en: "Welcome to IMETS", ar: "أهلًا بيك في IMETS" } },
  { id: "m2", title: { en: "Know what you sell", ar: "اعرف إنت بتبيع إيه" } },
  { id: "m3", title: { en: "The conversation method", ar: "طريقة المحادثة" } },
  { id: "m4", title: { en: "Handle objections", ar: "التعامل مع الاعتراضات" } },
  { id: "m5", title: { en: "Prove you're ready", ar: "اثبت جاهزيتك" } },
];

export const MODULE_IDS = MODULES.map((m) => m.id);

export const isModuleId = (v: unknown): v is ModuleId => typeof v === "string" && (MODULE_IDS as string[]).includes(v);

export interface LessonMeta {
  slug: string;
  moduleId: ModuleId;
  type: LessonType;
  minutes: number;
  isNew?: boolean;
  title: Bilingual;
  /** "By the end you can …" */
  outcome: Bilingual;
  /** What finishing the lesson takes, e.g. "open all 4 rules". */
  gate: Bilingual;
  /** The lesson stays locked until every lesson in these modules is complete. */
  lockedUntilModulesComplete?: ModuleId[];
}

/**
 * Lessons whose stored id isn't their slug: two built-ins renamed in the
 * journey, and the three lessons admins created before it (the welcome
 * videos, the graduate stories and the competitor task).
 */
export const BUILTIN_SLUGS: Record<string, string> = {
  "program-details": "details",
  checklist: "send",
  "c-mu2ne84q8q1c": "welcome",
  "c-mu2ngksqvv7j": "stories",
  "c-mu2qfyya9hgz": "task",
};

/** Saves made by the journey-aware editor carry this; older saves are shown in journey order. */
export const JOURNEY_VERSION = 2;

/** The journey in order, by slug. Reordering the default training is a change to this list. */
export const COURSE_ORDER = [
  "welcome",
  "week",
  "programs",
  "details",
  "stories",
  "path",
  "rules",
  "contrast",
  "phrases",
  "closing",
  "practice",
  "objections",
  "drill",
  "send",
  "quiz",
  "task",
] as const;

export const LESSON_META: Record<string, LessonMeta> = {
  welcome: {
    slug: "welcome",
    moduleId: "m1",
    type: "video",
    minutes: 8,
    title: { en: "Welcome to the IMETS family", ar: "أهلًا بيك في عيلة IMETS" },
    outcome: {
      en: "say who IMETS is, who we serve, and what a student's journey looks like up to graduation.",
      ar: "تقول IMETS مين، بنخدم مين، ورحلة الطالب شكلها إيه لحد التخرج.",
    },
    gate: { en: "watch both videos", ar: "اتفرّج على الفيديوهين" },
  },
  week: {
    slug: "week",
    moduleId: "m1",
    type: "read",
    minutes: 10,
    isNew: true,
    title: { en: "Your first week & tools", ar: "أسبوعك الأول وأدوات شغلك" },
    outcome: {
      en: "find your way around the tools you'll use on every enquiry.",
      ar: "تتعامل مع الأدوات اللي هتستخدمها في كل استفسار.",
    },
    gate: { en: "tick the 4 setup steps", ar: "علّم على خطوات التجهيز الأربعة" },
  },
  programs: {
    slug: "programs",
    moduleId: "m2",
    type: "interactive",
    minutes: 10,
    title: { en: "Our programs in numbers", ar: "برامجنا بالأرقام" },
    outcome: {
      en: "quote the fee, lecture count and instalment plan of any program without checking.",
      ar: "تقول سعر أي برنامج وعدد محاضراته وتقسيط الدفعتين من غير ما ترجع لحاجة.",
    },
    gate: { en: "open at least 3 programs", ar: "افتح 3 برامج على الأقل" },
  },
  details: {
    slug: "details",
    moduleId: "m2",
    type: "read",
    minutes: 20,
    title: { en: "CPHQ & CIC in depth", ar: "تفاصيل CPHQ وCIC" },
    outcome: {
      en: "explain who issues each certification, the exam rules, and what our course includes.",
      ar: "تشرح مين بيصدر كل شهادة، شروط الامتحان، والكورس عندنا فيه إيه.",
    },
    gate: { en: "open all 3 tabs", ar: "افتح التبويبات التلاتة" },
  },
  stories: {
    slug: "stories",
    moduleId: "m2",
    type: "video",
    minutes: 12,
    title: { en: "Hear it from our graduates", ar: "خريجينا بيحكوا" },
    outcome: {
      en: "retell a real graduate's story that matches the client in front of you.",
      ar: "تحكي قصة خريج حقيقي شبه العميل اللي قدامك.",
    },
    gate: { en: "watch at least 2 stories", ar: "اتفرّج على قصتين على الأقل" },
  },
  path: {
    slug: "path",
    moduleId: "m3",
    type: "interactive",
    minutes: 8,
    title: { en: "The conversation path", ar: "مسار المحادثة" },
    outcome: {
      en: "run a conversation in 5 steps so it stays consultative, not a price list.",
      ar: "تمشي المحادثة في ٥ خطوات عشان تفضل استشارية مش قايمة أسعار.",
    },
    gate: { en: "open all 5 steps", ar: "افتح الخطوات الخمسة" },
  },
  rules: {
    slug: "rules",
    moduleId: "m3",
    type: "interactive",
    minutes: 10,
    title: { en: "The four rules", ar: "القواعد الأربع" },
    outcome: {
      en: "spot and fix the four mistakes that lose most enquiries.",
      ar: "تكتشف وتصلّح الأربع غلطات اللي بتضيّع أغلب الاستفسارات.",
    },
    gate: { en: "open all 4 rules", ar: "افتح القواعد الأربع" },
  },
  contrast: {
    slug: "contrast",
    moduleId: "m3",
    type: "interactive",
    minutes: 5,
    title: { en: "See the difference", ar: "شوف الفرق" },
    outcome: {
      en: "tell an interrogation from a consultation in a real WhatsApp thread.",
      ar: "تفرّق بين الاستجواب والاستشارة في محادثة واتساب حقيقية.",
    },
    gate: { en: "view both styles", ar: "شوف الأسلوبين" },
  },
  phrases: {
    slug: "phrases",
    moduleId: "m3",
    type: "interactive",
    minutes: 6,
    title: { en: "Safer phrasing", ar: "جمل ممنوعة وبدائلها" },
    outcome: {
      en: "replace risky promises with phrases that are honest and still sell.",
      ar: "تبدّل الوعود الخطر بجمل صادقة وبرضه بتبيع.",
    },
    gate: { en: "flip all 6 cards", ar: "اقلب الكروت الستة" },
  },
  closing: {
    slug: "closing",
    moduleId: "m3",
    type: "interactive",
    minutes: 8,
    title: { en: "Close with a next step", ar: "اقفل بخطوة تالية" },
    outcome: {
      en: "end every conversation with a question, whatever state the client is in.",
      ar: "تختم أي محادثة بسؤال، مهما كانت حالة العميل.",
    },
    gate: { en: "open at least 3 situations", ar: "افتح 3 حالات على الأقل" },
  },
  practice: {
    slug: "practice",
    moduleId: "m3",
    type: "practice",
    minutes: 10,
    title: { en: "Practice: pick the best reply", ar: "تدريب: اختار الرد الأنسب" },
    outcome: {
      en: "apply R1–R4 to six enquiries we get every week.",
      ar: "تطبّق R1–R4 على ست مواقف بتيجيلنا كل أسبوع.",
    },
    gate: { en: "answer all 6 situations", ar: "جاوب على المواقف الستة" },
  },
  objections: {
    slug: "objections",
    moduleId: "m4",
    type: "interactive",
    minutes: 20,
    title: { en: "Objection method & bank", ar: "منهج الاعتراضات وبنك الردود" },
    outcome: {
      en: "handle the 14 objections we hear most with a 4-step method.",
      ar: "تتعامل مع أكتر ١٤ اعتراض بنسمعهم بمنهج من ٤ خطوات.",
    },
    gate: { en: "open one objection from each category", ar: "افتح اعتراض واحد من كل تصنيف" },
  },
  drill: {
    slug: "drill",
    moduleId: "m4",
    type: "practice",
    minutes: 10,
    title: { en: "Rapid objection drill", ar: "تدريب سريع على الاعتراضات" },
    outcome: {
      en: "answer a random objection out loud in under 45 seconds.",
      ar: "ترد على اعتراض عشوائي بصوت عالي في أقل من ٤٥ ثانية.",
    },
    gate: { en: "complete 3 rounds", ar: "كمّل 3 جولات" },
  },
  send: {
    slug: "send",
    moduleId: "m5",
    type: "checklist",
    minutes: 5,
    title: { en: "Before you send", ar: "قبل ما تبعت الرسالة" },
    outcome: {
      en: "check any long reply against six points before pressing send.",
      ar: "تراجع أي رد طويل على ست نقاط قبل ما تضغط إرسال.",
    },
    gate: { en: "tick all 6 points", ar: "علّم على النقاط الست" },
  },
  quiz: {
    slug: "quiz",
    moduleId: "m5",
    type: "quiz",
    minutes: 10,
    isNew: true,
    title: { en: "Knowledge check", ar: "اختبار الجاهزية" },
    outcome: {
      en: "show your team lead you're ready to take live enquiries.",
      ar: "تثبت لمشرفك إنك جاهز تستقبل استفسارات حقيقية.",
    },
    gate: { en: "score 4 out of 5", ar: "تجيب 4 من 5" },
    lockedUntilModulesComplete: ["m1", "m2", "m3", "m4"],
  },
  task: {
    slug: "task",
    moduleId: "m5",
    type: "task",
    minutes: 45,
    title: { en: "Field task: competitor analysis", ar: "مهمة: تحليل المنافسين" },
    outcome: {
      en: "know what competitors offer for each program, with sources.",
      ar: "تعرف المنافسين بيقدّموا إيه في كل برنامج، بالمصادر.",
    },
    gate: { en: "send your analysis for every program to your team lead", ar: "ابعت تحليل كل برنامج لمشرفك" },
  },
};

/**
 * Console pages the "first week" lesson points to, and the permission each
 * needs. Checked per viewer on the server: a trainee role may not have them yet.
 */
export const WEEK_TOOL_LINKS: Record<string, { href: string; permission: string }> = {
  leads: { href: "/admin/crm/leads", permission: "crm.leads.view" },
  pipelines: { href: "/admin/crm/pipelines", permission: "crm.pipelines.view" },
  "payment-links": { href: "/admin/crm/payment-links", permission: "crm.payment_links.view" },
  rules: { href: "/admin/crm/rules", permission: "crm.rules.view" },
};

/** The slug a lesson is known by — its saved slug, a built-in's mapped slug, or its id. */
export const slugForLesson = (id: string, savedSlug?: unknown) =>
  typeof savedSlug === "string" && /^[a-z0-9-]{1,40}$/.test(savedSlug) ? savedSlug : (BUILTIN_SLUGS[id] ?? id);
