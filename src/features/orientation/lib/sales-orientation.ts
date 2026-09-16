import content from "../content/sales-orientation.json";
import contentEn from "../content/sales-orientation.en.json";
import programDetails from "../content/program-details.json";
import programDetailsEn from "../content/program-details.en.json";
import {
  COURSE_ORDER,
  JOURNEY_VERSION,
  LESSON_META,
  LESSON_TYPES,
  isModuleId,
  slugForLesson,
  type LessonType,
  type ModuleId,
} from "./course-map";
import type { OrientationLocale } from "./i18n";

/**
 * Sales-team orientation content, in Egyptian Arabic and English.
 *
 * The training follows the console language: the Arabic copy is the original
 * (and what reps send to clients), the English copy is its translation. Both
 * ship as JSON defaults. Admins edit either language from the editor; the saved
 * copy lives in the backend (Arabic in `content`, English in `content.en`) and
 * `resolveOrientation` lays it over these defaults, so a lesson, field or
 * language the saved copy lacks still renders.
 */

export type Side = "client" | "rep";

export interface ThreadMessage {
  from: Side;
  who: string;
  text: string;
}

export interface Thread {
  messages: ThreadMessage[];
  verdict: { tone: "good" | "bad"; lead: string; rest: string };
}

export interface PathStep {
  /** The step number as written in the copy. */
  n: string;
  title: string;
  body: string;
}

export interface RuleLine {
  side: Side;
  text: string;
}

export interface Rule {
  id: string;
  title: string;
  /** English gloss (kept from the original copy). */
  en: string;
  intro: string;
  bad: RuleLine[];
  good: RuleLine[];
  /** The memorable shape of the rule, e.g. "سؤال ← قيمة ← سؤال". */
  formula: string;
  note: string;
  /** Feature words the rule warns against leading with. Empty for most rules. */
  chips: string[];
}

export interface ScenarioOption {
  text: string;
  correct: boolean;
  feedback: string;
}

export interface Scenario {
  /** Which rule(s) the scenario exercises, e.g. "R1" or "R1 + R4". */
  tag: string;
  message: string;
  options: ScenarioOption[];
}

export interface ObjectionMethodStep {
  n: string;
  title: string;
  body: string;
}

export interface Objection {
  /** One of five buckets, used as the bank's filter. */
  category: string;
  objection: string;
  /** What the customer is really worried about underneath it. */
  behind: string;
  /** The weak reply — usually over-promising or dismissing a competitor. */
  wrong: string;
  right: string;
  /** Policy points that can be stated without checking with anyone. */
  facts: string[];
  /** The question that moves the conversation on. */
  next: string;
}

/** Display metadata only — the figures come from the live course record. */
export interface ProgrammeRef {
  slug: string;
  name: string;
  subtitle: string;
  /** YouTube videos about the programme, shown when a rep opens it. */
  videos?: OrientationVideo[];
}

/** A programme with its live numbers resolved, ready to quote. */
export interface ProgrammeNumbers extends ProgrammeRef {
  lectures: number;
  /** List fee, EGP. */
  price: number;
  /** Current fee after the standing discount, EGP. */
  sale: number;
  students: number;
}

/** One cell of a certification's facts grid. */
export interface ProgramFact {
  label: string;
  value: string;
}

/** One certification programme in the Program details lesson. Fees/lectures come from the live course by `slug`. */
export interface ProgramDetail {
  slug: string;
  /** Tab label, e.g. "CPHQ". */
  name: string;
  fullName: string;
  awardedBy: string;
  tagline: string;
  /** Six-cell summary: issuer, eligibility, exam, exam fee, our course, practice. */
  facts?: ProgramFact[];
  whatItIs: string;
  /** Why healthcare professionals study it. */
  whyStudy: string[];
  whoFor: string[];
  /** Exam eligibility — verified facts from the awarding body only. */
  eligibility: string[];
  courseFacts: string[];
  curriculum: string[];
  outcomes: string[];
  careerPaths: string[];
  sayThis: string[];
  avoid: string[];
}

/** Why one profession considers management programmes, and how to open the conversation. */
export interface AudienceProfile {
  title: string;
  motivations: string[];
  worries: string[];
  bestFit: string;
  openingQuestion: string;
}

export interface ProgramDetailsContent {
  intro: string;
  programmes: ProgramDetail[];
  audiencesIntro: string;
  audiences: AudienceProfile[];
}

/** A tool the "first week" lesson introduces. `key` picks the console page it links to. */
export interface WeekTool {
  key: string;
  title: string;
  body: string;
}

export interface WeekItem {
  title: string;
  detail: string;
  /** A tool key (`leads`, `pipelines`, `payment-links`, `rules`) to link, or empty. */
  link: string;
}

export interface WeekContent {
  intro: string;
  tools: WeekTool[];
  setupTitle: string;
  /** The setup steps; ticking all of them completes the lesson. */
  checklist: WeekItem[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  /** Index of the right option. */
  correct: number;
}

export interface QuizContent {
  intro: string;
  /** Correct answers needed to pass. */
  passMark: number;
  questions: QuizQuestion[];
}

export interface SalesOrientation {
  threads: { bad: Thread; good: Thread };
  steps: PathStep[];
  rules: Rule[];
  scenarios: Scenario[];
  phraseBank: { risky: string; safe: string }[];
  closings: { situation: string; text: string }[];
  checklist: { question: string; hint: string }[];
  objectionMethod: {
    intro: string;
    steps: ObjectionMethodStep[];
    /** Isolate the objection before answering it. */
    isolate: string;
  };
  objections: Objection[];
  programmes: ProgrammeRef[];
  programDetails: ProgramDetailsContent;
  week: WeekContent;
  quiz: QuizContent;
  /** Where "Message your team lead" goes (a WhatsApp link, for example). Empty hides the link. */
  teamLeadLink: string;
  /** Built-in lesson ids that existed when this copy was saved — see `resolveOrientation`. */
  knownLessons?: string[];
  /** Set by the journey-aware editor; older saves are re-ordered into the journey. */
  journeyVersion?: number;
}

/** The bundled default content, Arabic. */
export const DEFAULT_SALES_ORIENTATION = { ...content, programDetails } as SalesOrientation;
/** The bundled default content, English. */
export const DEFAULT_SALES_ORIENTATION_EN = { ...contentEn, programDetails: programDetailsEn } as SalesOrientation;

/* ── lessons ─────────────────────────────────────────────────────────────── */

/**
 * The built-in lessons, each bound to the interactive module that renders it.
 *
 * `id` is the key completion is stored under, so an id never changes —
 * renaming one would reset that lesson for everyone. The URL uses the lesson's
 * slug (see `course-map`), and the id still works as an anchor. Admins can
 * reorder, remove (and restore) these, and add their own `custom` lessons.
 */
export const LESSON_IDS = [
  "week",
  "contrast",
  "path",
  "program-details",
  "rules",
  "practice",
  "objections",
  "drill",
  "programs",
  "phrases",
  "closing",
  "checklist",
  "quiz",
] as const;

/** A built-in (module) lesson id. */
export type LessonId = (typeof LESSON_IDS)[number];

export const isModuleLesson = (id: string): id is LessonId => (LESSON_IDS as readonly string[]).includes(id);

/**
 * `module` = a built-in interactive lesson; `custom` = an admin-written lesson
 * (text + videos); `task` = an assignment staff fill in per programme (e.g. a
 * competitor analysis), reviewed by admins.
 */
export type LessonKind = "module" | "custom" | "task";

export type TaskFieldType = "text" | "textarea" | "number" | "yesno" | "select" | "url";

export interface TaskField {
  /** Stable key the answers are stored under — never shown, never edited. */
  key: string;
  label: string;
  type: TaskFieldType;
  /** Dropdown choices (select fields only). These are the stored values. */
  options: string[];
  required: boolean;
  hint: string;
  labelEn?: string;
  hintEn?: string;
  /** English display text for `options`, by position. */
  optionsEn?: string[];
}

export interface TaskProgram {
  /** Course slug — one submission per programme. */
  slug: string;
  name: string;
  nameEn?: string;
}

export interface LessonTask {
  programs: TaskProgram[];
  /** What one row is called, e.g. «منافس». */
  entryLabel: string;
  entryLabelEn?: string;
  /** Rows required before submitting. */
  minEntries: number;
  fields: TaskField[];
  /** Learners can attach PDF, Word and image files to their answer. */
  allowFiles: boolean;
  /** Learners can record and attach voice notes. */
  allowVoice: boolean;
}

export const TASK_FIELD_TYPES: TaskFieldType[] = ["text", "textarea", "number", "yesno", "select", "url"];

export const newTaskFieldKey = () => `f-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

/** A blank task an admin builds up in the editor. */
export const blankTask = (): LessonTask => ({
  programs: [],
  entryLabel: "إدخال",
  entryLabelEn: "entry",
  minEntries: 1,
  allowFiles: true,
  allowVoice: true,
  fields: [{ key: newTaskFieldKey(), label: "", type: "text", options: [], required: true, hint: "" }],
});

/** The competitor-analysis template: the four programmes and the fields sales needs about each competitor. */
export const competitorAnalysisTask = (): LessonTask => ({
  programs: [
    { slug: "cphq-preparation", name: "CPHQ Preparation", nameEn: "CPHQ Preparation" },
    { slug: "cic-preparation", name: "CIC Preparation", nameEn: "CIC Preparation" },
    { slug: "healthcare-quality-management-diploma", name: "دبلومة إدارة الجودة الصحية", nameEn: "Healthcare Quality Diploma" },
    { slug: "infection-control-diploma", name: "دبلومة مكافحة العدوى", nameEn: "Infection Control Diploma" },
  ],
  entryLabel: "منافس",
  entryLabelEn: "competitor",
  minEntries: 1,
  allowFiles: true,
  allowVoice: true,
  fields: COMPETITOR_FIELDS.map((f) => ({ ...f, options: [...f.options], optionsEn: f.optionsEn ? [...f.optionsEn] : undefined })),
});

/** The competitor-analysis fields, bilingual. Keys are stable: saved answers use them. */
export const COMPETITOR_FIELDS: TaskField[] = [
  { key: "competitor", label: "اسم المنافس", labelEn: "Competitor name", type: "text", options: [], required: true, hint: "اسم الأكاديمية أو المدرب أو الجهة", hintEn: "The academy, trainer or organisation" },
  { key: "location", label: "المكان", labelEn: "Location", type: "text", options: [], required: true, hint: "الدولة والمدينة، أو «أونلاين بس»", hintEn: "Country and city, or “online only”" },
  { key: "instructors", label: "مين المحاضر / المحاضرين", labelEn: "Instructor(s)", type: "textarea", options: [], required: false, hint: "الاسم والخلفية لو معلنة", hintEn: "Name and background, if published" },
  { key: "price", label: "السعر", labelEn: "Price", type: "text", options: [], required: true, hint: "اكتب العملة — ولو مش معلن اكتب «غير معلن»", hintEn: "Include the currency — if it isn't published, write “Not published”" },
  { key: "installments", label: "فيه تقسيط ولا لأ؟", labelEn: "Instalments available?", type: "yesno", options: [], required: true, hint: "" },
  { key: "installments-details", label: "تفاصيل التقسيط", labelEn: "Instalment details", type: "text", options: [], required: false, hint: "عدد الدفعات والمدة", hintEn: "Number of payments and period" },
  { key: "delivery", label: "أونلاين ولا أوفلاين؟", labelEn: "Online or in person?", type: "select", options: ["أونلاين", "أوفلاين", "الاتنين"], optionsEn: ["Online", "In person", "Both"], required: true, hint: "" },
  { key: "format", label: "لايف ولا مسجّل؟", labelEn: "Live or recorded?", type: "select", options: ["لايف", "مسجّل", "الاتنين"], optionsEn: ["Live", "Recorded", "Both"], required: false, hint: "" },
  { key: "duration", label: "مدة البرنامج", labelEn: "Program duration", type: "text", options: [], required: false, hint: "" },
  { key: "sessions", label: "عدد المحاضرات / الساعات", labelEn: "Lectures / hours", type: "text", options: [], required: false, hint: "" },
  { key: "certificate", label: "الشهادة اللي بيدّيها", labelEn: "Certificate awarded", type: "text", options: [], required: false, hint: "شهادة حضور؟ اعتماد؟ من مين؟", hintEn: "Attendance certificate? Accreditation? From whom?" },
  { key: "extras", label: "بيقدّم إيه زيادة", labelEn: "What else they offer", type: "textarea", options: [], required: false, hint: "بنك أسئلة، امتحان تجريبي، مواد، متابعة…", hintEn: "Question bank, mock exam, materials, follow-up…" },
  { key: "strengths", label: "نقاط قوته", labelEn: "Strengths", type: "textarea", options: [], required: false, hint: "" },
  { key: "weaknesses", label: "نقاط ضعفه مقارنةً بينا", labelEn: "Weaknesses compared with us", type: "textarea", options: [], required: false, hint: "" },
  { key: "source", label: "مصدر المعلومة", labelEn: "Source", type: "url", options: [], required: true, hint: "رابط الصفحة أو الإعلان أو البوست", hintEn: "Link to the page, ad or post" },
  { key: "notes", label: "ملاحظات", labelEn: "Notes", type: "textarea", options: [], required: false, hint: "" },
];

/** English instructions for the competitor-analysis task (the Arabic ones are the lesson body). */
export const COMPETITOR_ANALYSIS_BODY_EN =
  "For each program, look for competitors offering the same or a similar program, and record their details in the form.\n\n- Record at least one competitor per program.\n- Add the source of every fact (a page link, an ad or a post).\n- Write only what you actually found. If something isn't published, write “Not published” — don't guess.\n- You can attach ad screenshots, PDF or Word files, or record a voice note and send it straight away.\n- This analysis is for the team only: never name a competitor to a client, and never attack anyone.";

export const COMPETITOR_ANALYSIS_LESSON = {
  short: "مهمة: تحليل المنافسين",
  en: "Task: competitor analysis",
  heading: "مهمة: تحليل المنافسين لكل برنامج",
  intro: "اختار كل برنامج، وسجّل المنافسين اللي بيقدّموا نفس البرنامج أو برنامج شبهه. المهمة بتكمل لما تبعت تحليل كل البرامج.",
  introEn:
    "Pick each program and record the competitors offering the same or a similar program. The task is complete once you've sent the analysis for every program.",
  body:
    "لكل برنامج، دوّر على المنافسين اللي بيقدّموا نفس البرنامج أو برنامج قريب منه، وسجّل بياناتهم في الفورم.\n\n- سجّل منافس واحد على الأقل لكل برنامج.\n- اكتب مصدر كل معلومة (رابط صفحة، إعلان، أو بوست).\n- اكتب اللي لقيته فعلًا، ولو معلومة مش معلنة اكتب «غير معلن» — ما تخمّنش.\n- تقدر ترفق صور الإعلانات أو ملفات PDF أو Word، أو تسجّل ملاحظة صوتية وتبعتها على طول.\n- التحليل ده للفريق من جوه بس: ما تذكرش اسم أي منافس للعميل، وما تهاجمش حد.",
  bodyEn: COMPETITOR_ANALYSIS_BODY_EN,
};

/** Ids for admin-added lessons — prefixed so they can never collide with a built-in id. */
export const newCustomLessonId = () => `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** YouTube only — upload to YouTube (Unlisted works) and paste the link. */
export type VideoProvider = "youtube";

export interface OrientationVideo {
  id: string;
  /** English title (or the only title an older save has). */
  title: string;
  titleAr?: string;
  provider: VideoProvider;
  /** A YouTube watch, share (youtu.be), shorts, live or embed link. */
  url: string;
  /** Optional running time as shown, e.g. "5:12". */
  duration?: string;
}

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/** The 11-character video id from any YouTube link, or null. */
export function youTubeId(url: string): string | null {
  return url.match(YOUTUBE_ID)?.[1] ?? null;
}

export const hasArabic = (s: string) => /[؀-ۿ]/.test(s);

/**
 * A lesson as stored. The original fields (`short`, `en`, `heading`, `intro`,
 * `body`) are kept as they were saved; the journey fields (module, type,
 * minutes, bilingual title/outcome/gate…) default from `course-map` when a
 * saved lesson doesn't set them.
 */
export interface OrientationLesson {
  id: string;
  kind: LessonKind;
  /** Readable URL anchor, e.g. `details`. */
  slug: string;
  short: string;
  en: string;
  heading: string;
  intro: string;
  /** Custom lessons: the lesson text. Task lessons: the instructions. Blank line = new paragraph; "- " starts a bullet. */
  body: string;
  videos: OrientationVideo[];
  /** Task lessons only. */
  task?: LessonTask;

  moduleId: ModuleId;
  type: LessonType;
  minutes: number;
  isNew: boolean;
  titleAr: string;
  titleEn: string;
  introEn: string;
  bodyEn: string;
  outcomeAr: string;
  outcomeEn: string;
  gateAr: string;
  gateEn: string;
  /** Custom lessons: videos to watch before it completes (0 = read to the end). */
  gateRequired: number;
  takeawaysAr: string[];
  takeawaysEn: string[];
}

/** Videos a video lesson asks for by default. */
const VIDEO_GATES: Record<string, number> = { welcome: 2, stories: 2 };

/** "Remember" boxes under the video lessons. DRAFT copy from the redesign brief. */
const DEFAULT_TAKEAWAYS: Record<string, { en: string[]; ar: string[] }> = {
  welcome: {
    en: [
      "We prepare healthcare professionals for quality, infection control and management careers.",
      "Most of our students are working clinicians: plan around shifts.",
      "Graduation is the moment clients picture. Use it when you talk about the journey, not as a promise of a job.",
    ],
    ar: [
      "بنجهّز الكوادر الصحية لمسارات الجودة ومكافحة العدوى والإدارة.",
      "أغلب طلابنا شغالين في مستشفيات: خد الشيفتات في حسابك.",
      "حفلة التخرج هي الصورة اللي في دماغ العميل. استخدمها لما تحكي عن الرحلة، مش كوعد بوظيفة.",
    ],
  },
  stories: {
    en: [
      "Match the story to the client: same profession, same goal.",
      "Share what the graduate did, not what the program guarantees.",
    ],
    ar: ["اختار القصة اللي شبه العميل: نفس المهنة، نفس الهدف.", "احكي الخريج عمل إيه، مش البرنامج بيضمن إيه."],
  },
};

interface BuiltInCopy {
  short: string;
  en: string;
  heading: string;
  intro: string;
  introEn: string;
}

function builtIn(id: LessonId, copy: BuiltInCopy): OrientationLesson {
  const slug = slugForLesson(id);
  const m = LESSON_META[slug];
  return {
    id,
    kind: "module",
    slug,
    ...copy,
    body: "",
    bodyEn: "",
    videos: [],
    moduleId: m.moduleId,
    type: m.type,
    minutes: m.minutes,
    isNew: !!m.isNew,
    titleAr: m.title.ar,
    titleEn: m.title.en,
    outcomeAr: m.outcome.ar,
    outcomeEn: m.outcome.en,
    gateAr: m.gate.ar,
    gateEn: m.gate.en,
    gateRequired: 0,
    takeawaysAr: [],
    takeawaysEn: [],
  };
}

const BUILT_IN_LESSONS: OrientationLesson[] = [
  builtIn("week", {
    short: "أسبوعك الأول وأدوات شغلك",
    en: "Your first week & tools",
    heading: "أسبوعك الأول وأدوات شغلك",
    intro: "",
    introEn: "",
  }),
  builtIn("programs", {
    short: "أرقام البرامج",
    en: "Programme numbers",
    heading: "أرقام البرامج — احفظها قبل ما تتكلم في السعر",
    intro: "اختار برنامجًا وهتلاقي سعره وعدد محاضراته وتقسيم الدفعتين. الأرقام دي هي سلاحك في اعتراض «غالي»، مش الخصم.",
    introEn: "Pick a program to see its fee, lectures and instalments. These numbers are your answer to “too expensive”, not a discount.",
  }),
  builtIn("program-details", {
    short: "تفاصيل البرامج",
    en: "Program details",
    heading: "تفاصيل برنامجي CPHQ وCIC — وليه الكوادر الصحية بتدرس البرامج الإدارية",
    intro:
      "افتح كل برنامج واعرف: الشهادة مين بيصدرها، وشروط امتحانها، والكورس عندنا فيه إيه، وتقول إيه وما تقولش إيه. وفي الآخر شوف كل فئة من الكوادر الصحية بتفكر في البرامج الإدارية ليه، وتبدأ معاها بأي سؤال.",
    introEn:
      "Open each program and learn who issues the certification, its exam requirements, what our course includes, and what to say and never say. Then see why each group of healthcare professionals considers management programs, and which question to open with.",
  }),
  builtIn("path", {
    short: "مسار المحادثة",
    en: "Conversation path",
    heading: "مسار المحادثة من أولها لآخرها",
    intro:
      "ده الترتيب اللي بيخلي الحوار استشاري بدل ما يكون عرض كورسات وأسعار. لو اتخطّيت خطوة، غالبًا العميل هيقف عند «هفكر وأرد عليك».",
    introEn:
      "This order keeps the conversation consultative instead of a list of courses and prices. Skip a step and the client usually stops at “I'll think about it”.",
  }),
  builtIn("rules", {
    short: "القواعد الأربع",
    en: "The four rules",
    heading: "القواعد الأربع",
    intro: "كل قاعدة فيها الغلط الشائع، الصح، والمعادلة اللي تحفظها. افتح القواعد الأربع كلها عشان تكمّل الدرس.",
    introEn: "Each rule shows the common mistake, the fix, and a formula to remember. Open all four rules to finish the lesson.",
  }),
  builtIn("contrast", {
    short: "الفرق في ردّين",
    en: "The contrast",
    heading: "نفس العميل، ونفس البرنامج، وردّين مختلفين تمامًا",
    intro:
      "شغلك مش إنك تبعت تفاصيل الكورس. شغلك إنك تفهم العميل عايز إيه، وتساعده يقرر إن كان البرنامج ده مناسب لهدفه ولا لأ. بدّل بين الردّين وشوف الفرق.",
    introEn:
      "Same client, same program, two very different replies. Your job isn't to send course details; it's to understand what the client wants and help them decide whether this program fits their goal. Switch between the two and see the difference.",
  }),
  builtIn("phrases", {
    short: "بدائل آمنة",
    en: "Safer phrasing",
    heading: "جمل ممنوعة وبدائلها",
    intro:
      "الجمل دي بتوعد بحاجة مش تحت سيطرتنا، وبتفتح باب شكاوى واسترداد أموال بعدين. اقلب كل كارت تشوف الصياغة البديلة.",
    introEn:
      "These phrases promise things outside our control and open the door to complaints and refunds later. Flip each card to see the safer wording.",
  }),
  builtIn("closing", {
    short: "صياغة الخطوة التالية",
    en: "Next step",
    heading: "صياغة الخطوة التالية",
    intro:
      "اختار حالة العميل، وهتلاقي صيغة إقفال جاهزة تعدّلها على كلامك. المهم إن كل محادثة تنتهي بسؤال، مش بـ«أنا موجود لو احتجت».",
    introEn:
      "Pick the client's situation for a ready closing line to adapt in your own words. Every conversation ends with a question, never “I'm here if you need anything”.",
  }),
  builtIn("practice", {
    short: "تدريب",
    en: "Practice",
    heading: "تدريب: اختار الرد الأنسب",
    intro: "ستة مواقف حقيقية بتيجيلنا كل أسبوع. اختار ردًا واحدًا في كل موقف، وهيوصلك تعليق يوضح القاعدة اللي اتطبّقت.",
    introEn: "Six real situations we get every week. Pick one reply in each; the feedback tells you which rule applies.",
  }),
  builtIn("objections", {
    short: "بنك الاعتراضات",
    en: "Objection bank",
    heading: "منهج التعامل مع الاعتراض وبنك الاعتراضات",
    intro:
      "أربعتاشر اعتراضًا حقيقيًا على برامج IMETS، وكل واحد فيه: اللي وراه، الرد الضعيف، الرد النموذجي، والحقائق اللي تقدر تقولها من غير خوف.",
    introEn:
      "Fourteen real objections to IMETS programs, each with what's behind it, the weak reply, the model reply, and the facts you can state without worry.",
  }),
  builtIn("drill", {
    short: "تدريب سريع",
    en: "Rapid drill",
    heading: "تدريب سريع على الاعتراضات",
    intro:
      "اعتراض عشوائي بيظهر قدامك. جهّز ردك بصوت عالي في أقل من ٤٥ ثانية، وبعدين قارن بالرد النموذجي وقيّم نفسك. كرّرها كل يوم قبل ما تبدأ الشيفت.",
    introEn:
      "A random objection appears. Say your reply out loud in under 45 seconds, then compare it with the model reply and rate yourself. Repeat it every day before your shift.",
  }),
  builtIn("checklist", {
    short: "قبل الإرسال",
    en: "Before you send",
    heading: "قبل ما تبعت الرسالة",
    intro: "راجع الست نقاط دي على أي رد طويل قبل ما تضغط إرسال.",
    introEn: "Check any long reply against these six points before you press send.",
  }),
  builtIn("quiz", {
    short: "اختبار الجاهزية",
    en: "Knowledge check",
    heading: "اختبار الجاهزية",
    intro: "",
    introEn: "",
  }),
];

/** The shipped training: the built-in lessons in journey order. */
export const DEFAULT_ORIENTATION_LESSONS: OrientationLesson[] = [...BUILT_IN_LESSONS].sort(
  (a, b) => (COURSE_ORDER as readonly string[]).indexOf(a.slug) - (COURSE_ORDER as readonly string[]).indexOf(b.slug),
);

/* ── saved content over the default ──────────────────────────────────────── */

export interface ResolvedOrientation {
  lessons: OrientationLesson[];
  /** Arabic content. */
  content: SalesOrientation;
  /** English content. */
  contentEn: SalesOrientation;
}

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const nonEmpty = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v : fallback);
const strArr = (v: unknown): string[] | null =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim().length > 0) : null;
const intIn = (v: unknown, min: number, max: number): number | null =>
  typeof v === "number" && Number.isFinite(v) ? Math.min(max, Math.max(min, Math.round(v))) : null;

function toVideo(v: unknown): OrientationVideo | null {
  const x = v as Partial<OrientationVideo> | null;
  if (!x || typeof x.id !== "string" || typeof x.url !== "string" || !youTubeId(x.url)) return null;
  return {
    id: x.id,
    title: str(x.title, ""),
    titleAr: str(x.titleAr, ""),
    provider: "youtube",
    url: x.url,
    duration: str(x.duration, ""),
  };
}

const LESSON_ID = /^[a-z0-9-]{1,40}$/;

/** A saved task definition, cleaned — or null when it's unusable (no programmes or no fields). */
function normalizeTask(raw: unknown): LessonTask | null {
  const t = raw as Partial<LessonTask> | undefined;
  if (!t || !Array.isArray(t.programs) || !Array.isArray(t.fields)) return null;
  const programs = t.programs
    .filter((p): p is TaskProgram => !!p && typeof p.slug === "string" && p.slug.length > 0)
    .map((p) => ({ slug: p.slug, name: nonEmpty(p.name, p.slug), nameEn: str(p.nameEn, "") }));
  const fields = t.fields
    .filter((f): f is TaskField => !!f && typeof f.key === "string" && typeof f.label === "string" && TASK_FIELD_TYPES.includes(f.type))
    .map((f) => {
      // A field still as the competitor template made it gets the template's English.
      const tpl = COMPETITOR_FIELDS.find((x) => x.key === f.key && x.label === f.label);
      return {
        key: f.key,
        label: f.label,
        type: f.type,
        options: Array.isArray(f.options) ? f.options.filter((o): o is string => typeof o === "string" && o.trim().length > 0) : [],
        required: !!f.required,
        hint: str(f.hint, ""),
        labelEn: nonEmpty(f.labelEn, tpl?.labelEn ?? ""),
        hintEn: nonEmpty(f.hintEn, tpl?.hint === f.hint ? (tpl?.hintEn ?? "") : ""),
        optionsEn:
          Array.isArray(f.optionsEn) && f.optionsEn.some((o) => typeof o === "string" && o.trim())
            ? f.optionsEn.map((o) => (typeof o === "string" ? o : ""))
            : tpl && tpl.options.join("|") === (f.options ?? []).join("|")
              ? [...(tpl.optionsEn ?? [])]
              : [],
      };
    });
  if (programs.length === 0 || fields.length === 0) return null;
  const tplPrograms = competitorAnalysisTask().programs;
  return {
    programs: programs.map((p) => ({ ...p, nameEn: p.nameEn || tplPrograms.find((x) => x.slug === p.slug)?.nameEn || "" })),
    fields,
    entryLabel: nonEmpty(t.entryLabel, "إدخال"),
    entryLabelEn: nonEmpty(t.entryLabelEn, t.entryLabel === "منافس" ? "competitor" : ""),
    minEntries: Math.max(1, Math.min(50, Math.round(Number(t.minEntries)) || 1)),
    // Tasks saved before attachments existed get them switched on.
    allowFiles: t.allowFiles !== false,
    allowVoice: t.allowVoice !== false,
  };
}

/**
 * The built-in lessons that existed before saves started recording
 * `knownLessons`. A saved copy without that field is treated as knowing exactly
 * these, so built-ins added since still appear.
 */
const LEGACY_LESSON_IDS = [
  "contrast",
  "path",
  "rules",
  "practice",
  "objections",
  "drill",
  "programs",
  "phrases",
  "closing",
  "checklist",
];

function lessonFromSaved(s: Record<string, unknown>): OrientationLesson | null {
  const id = typeof s?.id === "string" ? s.id : "";
  if (!LESSON_ID.test(id)) return null;
  const isBuiltIn = isModuleLesson(id);
  // A non-built-in id is only a lesson if it was saved as a custom or task one.
  if (!isBuiltIn && s.kind !== "custom" && s.kind !== "task") return null;
  const kind: LessonKind = isBuiltIn ? "module" : s.kind === "task" ? "task" : "custom";
  const task = kind === "task" ? normalizeTask(s.task) : null;
  if (kind === "task" && !task) return null;

  const def = DEFAULT_ORIENTATION_LESSONS.find((d) => d.id === id);
  const slug = slugForLesson(id, s.slug);
  const meta = LESSON_META[slug];
  const videos = Array.isArray(s.videos) ? s.videos.map(toVideo).filter((v): v is OrientationVideo => !!v) : [];

  const short = nonEmpty(s.short, def?.short ?? "");
  const en = str(s.en, def?.en ?? "");
  const heading = nonEmpty(s.heading, def?.heading ?? "");
  if (!short.trim() || !heading.trim()) return null;

  // Titles an older save doesn't carry: the course map, then whichever saved title is in each language.
  const arFallback = hasArabic(short) ? short : hasArabic(heading) ? heading : short;
  const enFallback = en.trim() || (!hasArabic(short) ? short : heading);

  return {
    id,
    kind,
    slug,
    short,
    en,
    heading,
    intro: str(s.intro, def?.intro ?? ""),
    body: isBuiltIn ? "" : str(s.body, ""),
    videos,
    ...(task ? { task } : {}),
    moduleId: isModuleId(s.moduleId) ? s.moduleId : (meta?.moduleId ?? "m1"),
    type: LESSON_TYPES.includes(s.type as LessonType)
      ? (s.type as LessonType)
      : (meta?.type ?? (kind === "task" ? "task" : videos.length ? "video" : "read")),
    minutes: intIn(s.minutes, 1, 600) ?? meta?.minutes ?? 5,
    isNew: typeof s.isNew === "boolean" ? s.isNew : !!meta?.isNew,
    titleAr: nonEmpty(s.titleAr, meta?.title.ar ?? arFallback),
    titleEn: nonEmpty(s.titleEn, meta?.title.en ?? enFallback),
    introEn: str(s.introEn, def?.introEn ?? (task ? COMPETITOR_ANALYSIS_LESSON.introEn : "")),
    bodyEn: isBuiltIn ? "" : str(s.bodyEn, slug === "task" ? COMPETITOR_ANALYSIS_BODY_EN : ""),
    outcomeAr: str(s.outcomeAr, meta?.outcome.ar ?? ""),
    outcomeEn: str(s.outcomeEn, meta?.outcome.en ?? ""),
    gateAr: str(s.gateAr, meta?.gate.ar ?? ""),
    gateEn: str(s.gateEn, meta?.gate.en ?? ""),
    gateRequired: intIn(s.gateRequired, 0, 20) ?? VIDEO_GATES[slug] ?? videos.length,
    takeawaysAr: strArr(s.takeawaysAr) ?? DEFAULT_TAKEAWAYS[slug]?.ar ?? [],
    takeawaysEn: strArr(s.takeawaysEn) ?? DEFAULT_TAKEAWAYS[slug]?.en ?? [],
  };
}

/** Lay one language's saved sections over that language's defaults. */
function resolveContent(c: Record<string, unknown>, D: SalesOrientation): SalesOrientation {
  const details = c.programDetails as ProgramDetailsContent | undefined;
  const detailsValid =
    !!details && Array.isArray(details.programmes) && details.programmes.length > 0 && Array.isArray(details.audiences);
  const arr = <K extends keyof SalesOrientation>(key: K): SalesOrientation[K] =>
    (Array.isArray(c[key]) && (c[key] as unknown[]).length > 0 ? c[key] : D[key]) as SalesOrientation[K];
  const threads = c.threads as SalesOrientation["threads"] | undefined;
  const method = c.objectionMethod as SalesOrientation["objectionMethod"] | undefined;
  const week = c.week as WeekContent | undefined;
  const quiz = c.quiz as QuizContent | undefined;
  const quizValid =
    !!quiz &&
    Array.isArray(quiz.questions) &&
    quiz.questions.length > 0 &&
    quiz.questions.every((q) => Array.isArray(q?.options) && q.options.length > 1 && Number.isInteger(q.correct));

  return {
    threads: threads && Array.isArray(threads.bad?.messages) && Array.isArray(threads.good?.messages) ? threads : D.threads,
    steps: arr("steps"),
    rules: arr("rules"),
    scenarios: arr("scenarios"),
    phraseBank: arr("phraseBank"),
    closings: arr("closings"),
    checklist: arr("checklist"),
    objectionMethod: method && Array.isArray(method.steps) ? method : D.objectionMethod,
    objections: arr("objections"),
    programmes: arr("programmes"),
    programDetails: detailsValid ? details! : D.programDetails,
    week: week && Array.isArray(week.tools) && Array.isArray(week.checklist) && week.checklist.length > 0 ? week : D.week,
    quiz: quizValid
      ? { ...quiz!, passMark: Math.max(1, Math.min(quiz!.questions.length, Math.round(Number(quiz!.passMark)) || 1)) }
      : D.quiz,
    teamLeadLink: str(c.teamLeadLink, D.teamLeadLink ?? ""),
  };
}

/**
 * Lay a saved document over the bundled default.
 *
 * Until the first save, the built-in lessons show as shipped. Once saved, the
 * saved lesson list is the training: its order, the lessons an admin removed,
 * and the custom lessons they added. A removed built-in lesson's content stays
 * in `content`, so restoring the lesson brings it back intact.
 *
 * Each content section falls back to the default when the saved copy lacks it
 * or has the wrong shape, so a partial or older save never takes the training
 * down. The English copy is resolved the same way from `content.en`; the
 * programme list itself (courses, videos) is shared, only its names translate.
 */
export function resolveOrientation(
  saved?: { lessons?: unknown[]; content?: Record<string, unknown> } | null,
): ResolvedOrientation {
  const savedLessons = Array.isArray(saved?.lessons) ? (saved!.lessons as Record<string, unknown>[]) : [];
  const seen = new Set<string>();
  const fromSaved: OrientationLesson[] = [];
  for (const s of savedLessons) {
    const lesson = lessonFromSaved(s);
    if (!lesson || seen.has(lesson.id)) continue;
    seen.add(lesson.id);
    fromSaved.push(lesson);
  }
  const c = (saved?.content ?? {}) as Record<string, unknown>;

  let lessons = fromSaved.length > 0 ? fromSaved : DEFAULT_ORIENTATION_LESSONS;
  if (fromSaved.length > 0) {
    /*
     * A built-in lesson shipped after this copy was saved isn't in its list —
     * but it wasn't removed either, so it's slotted in by journey order: after
     * the nearest lesson that comes before it, or before the nearest one after
     * it. Built-ins the admin did remove were "known" at that save and stay out.
     */
    const known = Array.isArray(c.knownLessons)
      ? (c.knownLessons as unknown[]).filter((x): x is string => typeof x === "string")
      : LEGACY_LESSON_IDS;
    const order = COURSE_ORDER as readonly string[];
    for (const def of DEFAULT_ORIENTATION_LESSONS) {
      if (known.includes(def.id) || lessons.some((l) => l.id === def.id)) continue;
      const pos = order.indexOf(def.slug);
      const before = [...order.slice(0, pos)].reverse().map((slug) => lessons.findIndex((l) => l.slug === slug)).find((i) => i >= 0);
      const after = order.slice(pos + 1).map((slug) => lessons.findIndex((l) => l.slug === slug)).find((i) => i >= 0);
      const at = before !== undefined ? before + 1 : after !== undefined ? after : lessons.length;
      lessons = [...lessons.slice(0, at), def, ...lessons.slice(at)];
    }

    /*
     * A copy saved before the journey existed keeps its lessons but takes the
     * journey's order: known lessons sort by `COURSE_ORDER`, and any other lesson
     * an admin added stays right after the lesson it followed. The first save
     * from the new editor records `journeyVersion`, and from then on the saved
     * order is the order.
     */
    if (c.journeyVersion !== JOURNEY_VERSION) {
      const order = COURSE_ORDER as readonly string[];
      let last = -1;
      const rank = lessons.map((l, i) => {
        const pos = order.indexOf(l.slug);
        last = pos >= 0 ? pos : last;
        return { l, key: pos >= 0 ? pos : last + 0.001 * (i + 1) };
      });
      lessons = rank.sort((a, b) => a.key - b.key).map((x) => x.l);
    }
  }

  const ar = resolveContent(c, DEFAULT_SALES_ORIENTATION);
  const enSaved = c.en && typeof c.en === "object" && !Array.isArray(c.en) ? (c.en as Record<string, unknown>) : {};
  const enResolved = resolveContent(enSaved, DEFAULT_SALES_ORIENTATION_EN);
  const enName = (slug: string) =>
    enResolved.programmes.find((p) => p.slug === slug) ?? DEFAULT_SALES_ORIENTATION_EN.programmes.find((p) => p.slug === slug);
  const en: SalesOrientation = {
    ...enResolved,
    programmes: ar.programmes.map((p) => {
      const t = enName(p.slug);
      return { ...p, name: t?.name || p.name, subtitle: t?.subtitle ?? p.subtitle };
    }),
    teamLeadLink: ar.teamLeadLink,
  };

  return { lessons, content: ar, contentEn: en };
}

/* ── one language at a time ──────────────────────────────────────────────── */

export interface LocalTaskField extends TaskField {
  /** Display labels for `options`, in the current language. */
  optionLabels: string[];
}

export interface LocalTask extends Omit<LessonTask, "fields"> {
  fields: LocalTaskField[];
}

/** A lesson with its text in the current language. */
export interface LessonView {
  id: string;
  slug: string;
  kind: LessonKind;
  moduleId: ModuleId;
  type: LessonType;
  minutes: number;
  isNew: boolean;
  title: string;
  intro: string;
  body: string;
  outcome: string;
  gate: string;
  gateRequired: number;
  videos: { id: string; url: string; title: string; duration: string }[];
  takeaways: string[];
  task?: LocalTask;
  lockedUntil?: ModuleId[];
}

const inLang = (locale: OrientationLocale, ar: string, en: string) => (locale === "ar" ? ar || en : en || ar);

export function localizeLesson(l: OrientationLesson, locale: OrientationLocale): LessonView {
  const task: LocalTask | undefined = l.task
    ? {
        ...l.task,
        entryLabel: inLang(locale, l.task.entryLabel, l.task.entryLabelEn ?? ""),
        programs: l.task.programs.map((p) => ({ ...p, name: inLang(locale, p.name, p.nameEn ?? "") })),
        fields: l.task.fields.map((f) => ({
          ...f,
          label: inLang(locale, f.label, f.labelEn ?? ""),
          hint: inLang(locale, f.hint, f.hintEn ?? ""),
          optionLabels: f.options.map((o, i) => (locale === "ar" ? o : f.optionsEn?.[i] || o)),
        })),
      }
    : undefined;

  return {
    id: l.id,
    slug: l.slug,
    kind: l.kind,
    moduleId: l.moduleId,
    type: l.type,
    minutes: l.minutes,
    isNew: l.isNew,
    title: inLang(locale, l.titleAr, l.titleEn),
    intro: inLang(locale, l.intro, l.introEn),
    body: inLang(locale, l.body, l.bodyEn),
    outcome: inLang(locale, l.outcomeAr, l.outcomeEn),
    gate: inLang(locale, l.gateAr, l.gateEn),
    gateRequired: l.gateRequired,
    videos: l.videos.map((v) => ({
      id: v.id,
      url: v.url,
      title: inLang(locale, v.titleAr ?? "", v.title),
      duration: v.duration ?? "",
    })),
    takeaways: locale === "ar" ? (l.takeawaysAr.length ? l.takeawaysAr : l.takeawaysEn) : l.takeawaysEn.length ? l.takeawaysEn : l.takeawaysAr,
    ...(task ? { task } : {}),
    lockedUntil: LESSON_META[l.slug]?.lockedUntilModulesComplete,
  };
}

/** Find a lesson by its id, slug, or an old anchor. */
export function findLessonIndex(lessons: { id: string; slug: string }[], anchor: string) {
  if (!anchor) return -1;
  const clean = decodeURIComponent(anchor);
  return lessons.findIndex((l) => l.id === clean || l.slug === clean);
}
