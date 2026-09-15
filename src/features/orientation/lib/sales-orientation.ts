import content from "../content/sales-orientation.json";
import programDetails from "../content/program-details.json";

/**
 * Sales-team orientation content.
 *
 * The copy is Egyptian Arabic and stays that way regardless of the console's
 * UI language: it is scripted dialogue for a team that sells in Arabic, and
 * translating a WhatsApp reply would destroy the thing being taught. Only the
 * surrounding chrome follows the admin locale.
 *
 * The JSON file is the default. Admins can edit everything from the Office tab
 * (lesson titles, intros, videos and every module's content); the saved copy
 * lives in the backend and `resolveOrientation` lays it over this default, so a
 * lesson or field the saved copy lacks still renders.
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
  /** Arabic-Indic numeral, as written in the source. */
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
  /** English gloss, shown as a subtitle. */
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

/** One certification programme in the Program details lesson. Fees/lectures come from the live course by `slug`. */
export interface ProgramDetail {
  slug: string;
  /** Tab label, e.g. "CPHQ". */
  name: string;
  fullName: string;
  awardedBy: string;
  tagline: string;
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
  /** Built-in lesson ids that existed when this copy was saved — see `resolveOrientation`. */
  knownLessons?: string[];
}

/** The bundled default content. */
export const DEFAULT_SALES_ORIENTATION = { ...content, programDetails } as SalesOrientation;

/* ── lessons ─────────────────────────────────────────────────────────────── */

/**
 * The built-in lessons, each bound to the interactive module that renders it.
 *
 * `id` doubles as the URL hash and the key completion is stored under, so an id
 * never changes — renaming one would reset that lesson for everyone and break
 * shared links. Admins can reorder, remove (and restore) these, and add their
 * own `custom` lessons (text + videos) alongside them.
 */
export const LESSON_IDS = [
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
  /** Dropdown choices (select fields only). */
  options: string[];
  required: boolean;
  hint: string;
}

export interface TaskProgram {
  /** Course slug — one submission per programme. */
  slug: string;
  name: string;
}

export interface LessonTask {
  programs: TaskProgram[];
  /** What one row is called, e.g. «منافس». */
  entryLabel: string;
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
  minEntries: 1,
  allowFiles: true,
  allowVoice: true,
  fields: [{ key: newTaskFieldKey(), label: "", type: "text", options: [], required: true, hint: "" }],
});

/** The competitor-analysis template: the four programmes and the fields sales needs about each competitor. */
export const competitorAnalysisTask = (): LessonTask => ({
  programs: [
    { slug: "cphq-preparation", name: "CPHQ Preparation" },
    { slug: "cic-preparation", name: "CIC Preparation" },
    { slug: "healthcare-quality-management-diploma", name: "دبلومة إدارة الجودة الصحية" },
    { slug: "infection-control-diploma", name: "دبلومة مكافحة العدوى" },
  ],
  entryLabel: "منافس",
  minEntries: 1,
  allowFiles: true,
  allowVoice: true,
  fields: [
    { key: "competitor", label: "اسم المنافس", type: "text", options: [], required: true, hint: "اسم الأكاديمية أو المدرب أو الجهة" },
    { key: "location", label: "المكان", type: "text", options: [], required: true, hint: "الدولة والمدينة، أو «أونلاين بس»" },
    { key: "instructors", label: "مين المحاضر / المحاضرين", type: "textarea", options: [], required: false, hint: "الاسم والخلفية لو معلنة" },
    { key: "price", label: "السعر", type: "text", options: [], required: true, hint: "اكتب العملة — ولو مش معلن اكتب «غير معلن»" },
    { key: "installments", label: "فيه تقسيط ولا لأ؟", type: "yesno", options: [], required: true, hint: "" },
    { key: "installments-details", label: "تفاصيل التقسيط", type: "text", options: [], required: false, hint: "عدد الدفعات والمدة" },
    { key: "delivery", label: "أونلاين ولا أوفلاين؟", type: "select", options: ["أونلاين", "أوفلاين", "الاتنين"], required: true, hint: "" },
    { key: "format", label: "لايف ولا مسجّل؟", type: "select", options: ["لايف", "مسجّل", "الاتنين"], required: false, hint: "" },
    { key: "duration", label: "مدة البرنامج", type: "text", options: [], required: false, hint: "" },
    { key: "sessions", label: "عدد المحاضرات / الساعات", type: "text", options: [], required: false, hint: "" },
    { key: "certificate", label: "الشهادة اللي بيدّيها", type: "text", options: [], required: false, hint: "شهادة حضور؟ اعتماد؟ من مين؟" },
    { key: "extras", label: "بيقدّم إيه زيادة", type: "textarea", options: [], required: false, hint: "بنك أسئلة، امتحان تجريبي، مواد، متابعة…" },
    { key: "strengths", label: "نقاط قوته", type: "textarea", options: [], required: false, hint: "" },
    { key: "weaknesses", label: "نقاط ضعفه مقارنةً بينا", type: "textarea", options: [], required: false, hint: "" },
    { key: "source", label: "مصدر المعلومة", type: "url", options: [], required: true, hint: "رابط الصفحة أو الإعلان أو البوست" },
    { key: "notes", label: "ملاحظات", type: "textarea", options: [], required: false, hint: "" },
  ],
});

export const COMPETITOR_ANALYSIS_LESSON = {
  short: "مهمة: تحليل المنافسين",
  en: "Task: competitor analysis",
  heading: "مهمة: تحليل المنافسين لكل برنامج",
  intro: "اختار كل برنامج، وسجّل المنافسين اللي بيقدّموا نفس البرنامج أو برنامج شبهه. المهمة بتكمل لما تبعت تحليل كل البرامج.",
  body:
    "لكل برنامج، دوّر على المنافسين اللي بيقدّموا نفس البرنامج أو برنامج قريب منه، وسجّل بياناتهم في الفورم.\n\n- سجّل منافس واحد على الأقل لكل برنامج.\n- اكتب مصدر كل معلومة (رابط صفحة، إعلان، أو بوست).\n- اكتب اللي لقيته فعلًا، ولو معلومة مش معلنة اكتب «غير معلن» — ما تخمّنش.\n- تقدر ترفق صور الإعلانات أو ملفات PDF أو Word، أو تسجّل ملاحظة صوتية وتبعتها على طول.\n- التحليل ده للفريق من جوه بس: ما تذكرش اسم أي منافس للعميل، وما تهاجمش حد.",
};

/** Ids for admin-added lessons — prefixed so they can never collide with a built-in id. */
export const newCustomLessonId = () => `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** YouTube only — upload to YouTube (Unlisted works) and paste the link. */
export type VideoProvider = "youtube";

export interface OrientationVideo {
  id: string;
  title: string;
  provider: VideoProvider;
  /** A YouTube watch, share (youtu.be), shorts, live or embed link. */
  url: string;
}

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;

/** The 11-character video id from any YouTube link, or null. */
export function youTubeId(url: string): string | null {
  return url.match(YOUTUBE_ID)?.[1] ?? null;
}

/**
 * `short` is the curriculum rail; `heading` is the lesson's own title, which is
 * allowed to be a full sentence.
 */
export interface OrientationLesson {
  id: string;
  kind: LessonKind;
  short: string;
  en: string;
  heading: string;
  intro: string;
  /** Custom lessons: the lesson text. Task lessons: the instructions. Blank line = new paragraph; "- " starts a bullet. */
  body: string;
  videos: OrientationVideo[];
  /** Task lessons only. */
  task?: LessonTask;
}

export const DEFAULT_ORIENTATION_LESSONS: OrientationLesson[] = [
  {
    id: "contrast",
    short: "الفرق في ردّين",
    en: "The contrast",
    heading: "نفس العميل، ونفس البرنامج، وردّين مختلفين تمامًا",
    intro:
      "شغلك مش إنك تبعت تفاصيل الكورس. شغلك إنك تفهم العميل عايز إيه، وتساعده يقرر إن كان البرنامج ده مناسب لهدفه ولا لأ. بدّل بين الردّين وشوف الفرق.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "path",
    short: "مسار المحادثة",
    en: "Conversation path",
    heading: "مسار المحادثة من أولها لآخرها",
    intro:
      "ده الترتيب اللي بيخلي الحوار استشاري بدل ما يكون عرض كورسات وأسعار. لو اتخطّيت خطوة، غالبًا العميل هيقف عند «هفكر وأرد عليك».",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "program-details",
    short: "تفاصيل البرامج",
    en: "Program details",
    heading: "تفاصيل برنامجي CPHQ وCIC — وليه الكوادر الصحية بتدرس البرامج الإدارية",
    intro:
      "افتح كل برنامج واعرف: الشهادة مين بيصدرها، وشروط امتحانها، والكورس عندنا فيه إيه، وتقول إيه وما تقولش إيه. وفي الآخر شوف كل فئة من الكوادر الصحية بتفكر في البرامج الإدارية ليه، وتبدأ معاها بأي سؤال.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "rules",
    short: "القواعد الأربع",
    en: "The four rules",
    heading: "القواعد الأربع",
    intro:
      "كل قاعدة فيها الغلط الشائع، الصح، والمعادلة اللي تحفظها. افتح القواعد الأربع كلها عشان تكمّل الدرس.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "practice",
    short: "تدريب",
    en: "Practice",
    heading: "تدريب: اختار الرد الأنسب",
    intro:
      "ستة مواقف حقيقية بتيجيلنا كل أسبوع. اختار ردًا واحدًا في كل موقف، وهيوصلك تعليق يوضح القاعدة اللي اتطبّقت.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "objections",
    short: "بنك الاعتراضات",
    en: "Objection bank",
    heading: "منهج التعامل مع الاعتراض وبنك الاعتراضات",
    intro:
      "أربعتاشر اعتراضًا حقيقيًا على برامج IMETS، وكل واحد فيه: اللي وراه، الرد الضعيف، الرد النموذجي، والحقائق اللي تقدر تقولها من غير خوف.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "drill",
    short: "تدريب سريع",
    en: "Rapid drill",
    heading: "تدريب سريع على الاعتراضات",
    intro:
      "اعتراض عشوائي بيظهر قدامك. جهّز ردك بصوت عالي في أقل من ٤٥ ثانية، وبعدين قارن بالرد النموذجي وقيّم نفسك. كرّرها كل يوم قبل ما تبدأ الشيفت.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "programs",
    short: "أرقام البرامج",
    en: "Programme numbers",
    heading: "أرقام البرامج — احفظها قبل ما تتكلم في السعر",
    intro:
      "اختار برنامجًا وهتلاقي سعره وعدد محاضراته وتقسيم الدفعتين. الأرقام دي هي سلاحك في اعتراض «غالي»، مش الخصم.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "phrases",
    short: "بدائل آمنة",
    en: "Safer phrasing",
    heading: "جمل ممنوعة وبدائلها",
    intro:
      "الجمل دي بتوعد بحاجة مش تحت سيطرتنا، وبتفتح باب شكاوى واسترداد أموال بعدين. اقلب كل كارت تشوف الصياغة البديلة.",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "closing",
    short: "صياغة الخطوة التالية",
    en: "Next step",
    heading: "صياغة الخطوة التالية",
    intro:
      "اختار حالة العميل، وهتلاقي صيغة إقفال جاهزة تعدّلها على كلامك. المهم إن كل محادثة تنتهي بسؤال، مش بـ«أنا موجود لو احتجت».",
    kind: "module",
    body: "",
    videos: [],
  },
  {
    id: "checklist",
    short: "قبل الإرسال",
    en: "Before you send",
    heading: "قبل ما تبعت الرسالة",
    intro: "راجع الست نقاط دي على أي رد طويل قبل ما تضغط إرسال.",
    kind: "module",
    body: "",
    videos: [],
  },
];

/* ── saved content over the default ──────────────────────────────────────── */

export interface ResolvedOrientation {
  lessons: OrientationLesson[];
  content: SalesOrientation;
}

const str = (v: unknown, fallback: string) => (typeof v === "string" ? v : fallback);
const nonEmpty = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v : fallback);
function isVideo(v: unknown): v is OrientationVideo {
  const x = v as OrientationVideo;
  return !!x && typeof x.id === "string" && typeof x.url === "string" && !!youTubeId(x.url);
}

const LESSON_ID = /^[a-z0-9-]{1,40}$/;

/** A saved task definition, cleaned — or null when it's unusable (no programmes or no fields). */
function normalizeTask(raw: unknown): LessonTask | null {
  const t = raw as Partial<LessonTask> | undefined;
  if (!t || !Array.isArray(t.programs) || !Array.isArray(t.fields)) return null;
  const programs = t.programs
    .filter((p): p is TaskProgram => !!p && typeof p.slug === "string" && p.slug.length > 0)
    .map((p) => ({ slug: p.slug, name: nonEmpty(p.name, p.slug) }));
  const fields = t.fields
    .filter((f): f is TaskField => !!f && typeof f.key === "string" && typeof f.label === "string" && TASK_FIELD_TYPES.includes(f.type))
    .map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
      options: Array.isArray(f.options) ? f.options.filter((o): o is string => typeof o === "string" && o.trim().length > 0) : [],
      required: !!f.required,
      hint: str(f.hint, ""),
    }));
  if (programs.length === 0 || fields.length === 0) return null;
  return {
    programs,
    fields,
    entryLabel: nonEmpty(t.entryLabel, "إدخال"),
    minEntries: Math.max(1, Math.min(50, Math.round(Number(t.minEntries)) || 1)),
    // Tasks saved before attachments existed get them switched on.
    allowFiles: t.allowFiles !== false,
    allowVoice: t.allowVoice !== false,
  };
}

/**
 * The built-in lessons that existed before saves started recording
 * `knownLessons`. A saved copy without that field is treated as knowing exactly
 * these, so built-ins added since (like `program-details`) still appear.
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
 * down.
 */
export function resolveOrientation(
  saved?: { lessons?: unknown[]; content?: Record<string, unknown> } | null,
): ResolvedOrientation {
  const savedLessons = Array.isArray(saved?.lessons) ? (saved!.lessons as Record<string, unknown>[]) : [];
  const seen = new Set<string>();
  const fromSaved: OrientationLesson[] = savedLessons.flatMap((s) => {
    const id = typeof s?.id === "string" ? s.id : "";
    if (!LESSON_ID.test(id) || seen.has(id)) return [];
    const builtIn = isModuleLesson(id);
    // A non-built-in id is only a lesson if it was saved as a custom or task one.
    if (!builtIn && s.kind !== "custom" && s.kind !== "task") return [];
    const kind: LessonKind = builtIn ? "module" : s.kind === "task" ? "task" : "custom";
    const task = kind === "task" ? normalizeTask(s.task) : null;
    if (kind === "task" && !task) return [];
    const def = DEFAULT_ORIENTATION_LESSONS.find((d) => d.id === id);
    const lesson: OrientationLesson = {
      id,
      kind,
      short: nonEmpty(s.short, def?.short ?? ""),
      en: str(s.en, def?.en ?? ""),
      heading: nonEmpty(s.heading, def?.heading ?? ""),
      intro: str(s.intro, def?.intro ?? ""),
      body: builtIn ? "" : str(s.body, ""),
      videos: Array.isArray(s.videos) ? s.videos.filter(isVideo) : [],
      ...(task ? { task } : {}),
    };
    if (!lesson.short.trim() || !lesson.heading.trim()) return [];
    seen.add(id);
    return [lesson];
  });
  const c = (saved?.content ?? {}) as Record<string, unknown>;

  let lessons = fromSaved.length > 0 ? fromSaved : DEFAULT_ORIENTATION_LESSONS;
  if (fromSaved.length > 0) {
    /*
     * A built-in lesson shipped after this copy was saved isn't in its list —
     * but it wasn't removed either, so it's slotted in after the lesson it
     * follows by default. Built-ins the admin did remove were "known" at that
     * save and stay out.
     */
    const known = Array.isArray(c.knownLessons)
      ? (c.knownLessons as unknown[]).filter((x): x is string => typeof x === "string")
      : LEGACY_LESSON_IDS;
    DEFAULT_ORIENTATION_LESSONS.forEach((def, defIndex) => {
      if (known.includes(def.id) || lessons.some((l) => l.id === def.id)) return;
      const before = DEFAULT_ORIENTATION_LESSONS.slice(0, defIndex)
        .reverse()
        .find((d) => lessons.some((l) => l.id === d.id));
      const at = before ? lessons.findIndex((l) => l.id === before.id) + 1 : 0;
      lessons = [...lessons.slice(0, at), def, ...lessons.slice(at)];
    });
  }

  const details = c.programDetails as ProgramDetailsContent | undefined;
  const detailsValid =
    !!details &&
    Array.isArray(details.programmes) &&
    details.programmes.length > 0 &&
    Array.isArray(details.audiences);
  const D = DEFAULT_SALES_ORIENTATION;
  const arr = <K extends keyof SalesOrientation>(key: K): SalesOrientation[K] =>
    (Array.isArray(c[key]) && (c[key] as unknown[]).length > 0 ? c[key] : D[key]) as SalesOrientation[K];
  const threads = c.threads as SalesOrientation["threads"] | undefined;
  const method = c.objectionMethod as SalesOrientation["objectionMethod"] | undefined;

  return {
    lessons,
    content: {
      threads:
        threads && Array.isArray(threads.bad?.messages) && Array.isArray(threads.good?.messages) ? threads : D.threads,
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
    },
  };
}
