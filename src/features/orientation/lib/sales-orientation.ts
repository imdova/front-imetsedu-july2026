import content from "../content/sales-orientation.json";

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
}

/** The bundled default content. */
export const DEFAULT_SALES_ORIENTATION = content as SalesOrientation;

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

/** `module` = a built-in interactive lesson; `custom` = an admin-written lesson (text + videos). */
export type LessonKind = "module" | "custom";

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
  /** Custom lessons only: the lesson text. Blank line = new paragraph; "- " starts a bullet. */
  body: string;
  videos: OrientationVideo[];
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
      "اختار برنامجًا وهتلاقي سعره وعدد محاضراته وتكلفة المحاضرة الواحدة وتقسيم الدفعتين. الأرقام دي هي سلاحك في اعتراض «غالي»، مش الخصم.",
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
    // A non-built-in id is only a lesson if it was saved as a custom one.
    if (!builtIn && s.kind !== "custom") return [];
    const def = DEFAULT_ORIENTATION_LESSONS.find((d) => d.id === id);
    const lesson: OrientationLesson = {
      id,
      kind: builtIn ? "module" : "custom",
      short: nonEmpty(s.short, def?.short ?? ""),
      en: str(s.en, def?.en ?? ""),
      heading: nonEmpty(s.heading, def?.heading ?? ""),
      intro: str(s.intro, def?.intro ?? ""),
      body: builtIn ? "" : str(s.body, ""),
      videos: Array.isArray(s.videos) ? s.videos.filter(isVideo) : [],
    };
    if (!lesson.short.trim() || !lesson.heading.trim()) return [];
    seen.add(id);
    return [lesson];
  });
  const lessons = fromSaved.length > 0 ? fromSaved : DEFAULT_ORIENTATION_LESSONS;

  const c = (saved?.content ?? {}) as Record<string, unknown>;
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
    },
  };
}
