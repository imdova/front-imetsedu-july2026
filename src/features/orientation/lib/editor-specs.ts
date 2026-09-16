import type { Field } from "@/features/orientation/components/structured-fields";
import { WEEK_TOOL_LINKS } from "@/features/orientation/lib/course-map";
import { newTaskFieldKey, type LessonId } from "@/features/orientation/lib/sales-orientation";

/** Which copy of the content a spec edits. Structure (courses, videos, keys) is edited in Arabic. */
export type EditLang = "ar" | "en";

const TASK_FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "yesno", label: "Yes / No" },
  { value: "select", label: "Dropdown" },
  { value: "url", label: "Link" },
];

const TOOL_OPTIONS = [
  { value: "", label: "No link" },
  ...Object.entries(WEEK_TOOL_LINKS).map(([value, t]) => ({ value, label: `${value} (${t.href})` })),
];

/** The task-lesson form definition: programmes, what a row is called, and the fields — both languages. */
export function taskConfigFields(courseOptions: { value: string; label: string }[]): Field[] {
  return [
    {
      kind: "list",
      key: "programs",
      label: "Programmes",
      hint: "Staff fill the task once for each",
      minItems: 1,
      itemTitle: (p) => p?.nameEn || p?.name || p?.slug || "",
      newItem: () => ({ slug: courseOptions[0]?.value ?? "", name: courseOptions[0]?.label ?? "", nameEn: courseOptions[0]?.label ?? "" }),
      item: [
        { kind: "select", key: "slug", label: "Course", options: courseOptions },
        { kind: "text", key: "name", label: "Tab name (Arabic)" },
        { kind: "text", key: "nameEn", label: "Tab name (English)", ltr: true },
      ],
    },
    { kind: "text", key: "entryLabel", label: "What one entry is called (Arabic)", hint: "e.g. منافس" },
    { kind: "text", key: "entryLabelEn", label: "What one entry is called (English)", hint: "e.g. competitor", ltr: true },
    { kind: "number", key: "minEntries", label: "Minimum entries per programme", min: 1, max: 50 },
    { kind: "boolean", key: "allowFiles", label: "Allow file attachments", hint: "PDF, Word and images, up to 10 MB each" },
    { kind: "boolean", key: "allowVoice", label: "Allow voice notes", hint: "Recorded in the browser and attached directly" },
    {
      kind: "list",
      key: "fields",
      label: "Form fields",
      minItems: 1,
      itemTitle: (f) =>
        `${f?.labelEn || f?.label || "Untitled"} · ${TASK_FIELD_TYPE_OPTIONS.find((o) => o.value === f?.type)?.label ?? f?.type}${f?.required ? " · required" : ""}`,
      newItem: () => ({ key: newTaskFieldKey(), label: "", labelEn: "", type: "text", options: [], optionsEn: [], required: false, hint: "", hintEn: "" }),
      item: [
        { kind: "text", key: "label", label: "Label (Arabic)" },
        { kind: "text", key: "labelEn", label: "Label (English)", ltr: true },
        { kind: "select", key: "type", label: "Type", options: TASK_FIELD_TYPE_OPTIONS },
        { kind: "boolean", key: "required", label: "Required before submitting" },
        { kind: "strings", key: "options", label: "Dropdown choices (Arabic — the saved answer)", hint: "One per line — dropdown fields only" },
        { kind: "strings", key: "optionsEn", label: "Dropdown choices (English, same order)", hint: "One per line" },
        { kind: "text", key: "hint", label: "Hint under the field (Arabic)" },
        { kind: "text", key: "hintEn", label: "Hint under the field (English)", ltr: true },
      ],
    },
  ];
}

/** Training-wide settings. */
export const settingsFields: Field[] = [
  {
    kind: "text",
    key: "teamLeadLink",
    label: "“Message your team lead” link",
    hint: "e.g. https://wa.me/20… — leave empty to hide the link",
    ltr: true,
  },
];

/**
 * What each lesson's content editor shows, as field specs over the
 * `SalesOrientation` content object. Labels are English (the admin console);
 * the values are the training copy in the language being edited.
 */

const SIDE_OPTIONS = [
  { value: "client", label: "Client" },
  { value: "rep", label: "Sales rep" },
];

const threadFields = (tone: "bad" | "good"): Field => ({
  kind: "group",
  key: tone,
  label: tone === "bad" ? "Interrogation style (the weak reply)" : "Consultation style (the strong reply)",
  fields: [
    {
      kind: "list",
      key: "messages",
      label: "Messages",
      minItems: 1,
      itemTitle: (m) => `${m?.who ?? ""}: ${m?.text ?? ""}`,
      newItem: () => ({ from: "rep", who: "", text: "" }),
      item: [
        { kind: "select", key: "from", label: "Sent by", options: SIDE_OPTIONS },
        { kind: "text", key: "who", label: "Name shown above the bubble" },
        { kind: "text", key: "text", label: "Message", multiline: true },
      ],
    },
    {
      kind: "group",
      key: "verdict",
      label: "Verdict under the conversation",
      fields: [
        {
          kind: "select",
          key: "tone",
          label: "Tone",
          options: [
            { value: "bad", label: "Bad (red)" },
            { value: "good", label: "Good (green)" },
          ],
        },
        { kind: "text", key: "lead", label: "Bold opening" },
        { kind: "text", key: "rest", label: "Rest of the verdict", multiline: true },
      ],
    },
  ],
});

const dialogueLines = (key: "bad" | "good", label: string): Field => ({
  kind: "list",
  key,
  label,
  itemTitle: (l) => l?.text ?? "",
  newItem: () => ({ side: "rep", text: "" }),
  item: [
    { kind: "select", key: "side", label: "Side", options: SIDE_OPTIONS },
    { kind: "text", key: "text", label: "Line", multiline: true },
  ],
});

const videoItems = (): Field[] => [
  { kind: "text", key: "title", label: "Title (English)", ltr: true },
  { kind: "text", key: "titleAr", label: "Title (Arabic)" },
  { kind: "text", key: "url", label: "YouTube link", hint: "youtube.com/watch?v=… or youtu.be/…", ltr: true },
];

export function lessonContentFields(id: LessonId, courseOptions: { value: string; label: string }[], lang: EditLang): Field[] {
  switch (id) {
    case "week":
      return [
        {
          kind: "group",
          key: "week",
          label: "Your first week & tools",
          fields: [
            { kind: "text", key: "intro", label: "Introduction", multiline: true },
            {
              kind: "list",
              key: "tools",
              label: "Tool cards",
              itemTitle: (x) => x?.title ?? "",
              newItem: () => ({ key: "leads", title: "", body: "" }),
              item: [
                { kind: "select", key: "key", label: "Links to", options: TOOL_OPTIONS.filter((o) => o.value) },
                { kind: "text", key: "title", label: "Title" },
                { kind: "text", key: "body", label: "One line of guidance", multiline: true },
              ],
            },
            { kind: "text", key: "setupTitle", label: "Setup checklist heading" },
            {
              kind: "list",
              key: "checklist",
              label: "Setup steps (ticking all completes the lesson)",
              minItems: 1,
              itemTitle: (x) => x?.title ?? "",
              newItem: () => ({ title: "", detail: "", link: "" }),
              item: [
                { kind: "text", key: "title", label: "Step" },
                { kind: "text", key: "detail", label: "Detail (optional)", multiline: true },
                { kind: "select", key: "link", label: "Open link", options: TOOL_OPTIONS },
              ],
            },
          ],
        },
      ];
    case "quiz":
      return [
        {
          kind: "group",
          key: "quiz",
          label: "Knowledge check",
          hint: "Passing notifies admins that the rep is ready for sign-off",
          fields: [
            { kind: "text", key: "intro", label: "Introduction", multiline: true },
            { kind: "number", key: "passMark", label: "Correct answers needed to pass", min: 1, max: 50 },
            {
              kind: "list",
              key: "questions",
              label: "Questions",
              minItems: 1,
              itemTitle: (q) => q?.question ?? "",
              newItem: () => ({ question: "", options: [], correct: 0 }),
              item: [
                { kind: "text", key: "question", label: "Question", multiline: true },
                { kind: "strings", key: "options", label: "Options", hint: "One per line, at least two" },
                { kind: "number", key: "correct", label: "Correct option", hint: "Its position counting from 0 (0 = first line)", min: 0, max: 20 },
              ],
            },
          ],
        },
      ];
    case "contrast":
      return [{ kind: "group", key: "threads", label: "The two conversations", fields: [threadFields("bad"), threadFields("good")] }];
    case "path":
      return [
        {
          kind: "list",
          key: "steps",
          label: "Conversation steps",
          minItems: 1,
          itemTitle: (s) => `${s?.n ?? ""} ${s?.title ?? ""}`,
          newItem: () => ({ n: "", title: "", body: "" }),
          item: [
            { kind: "text", key: "n", label: "Step number (as shown)" },
            { kind: "text", key: "title", label: "Title" },
            { kind: "text", key: "body", label: "Explanation", multiline: true },
          ],
        },
      ];
    case "rules":
      return [
        {
          kind: "list",
          key: "rules",
          label: "Rules",
          minItems: 1,
          itemTitle: (r) => `${r?.id ?? ""} · ${r?.title ?? ""}`,
          newItem: () => ({ id: "", title: "", en: "", intro: "", bad: [], good: [], formula: "", note: "", chips: [] }),
          item: [
            { kind: "text", key: "id", label: "Code", hint: "Same in both languages, e.g. R1", ltr: true },
            { kind: "text", key: "title", label: "Title" },
            { kind: "text", key: "intro", label: "Why it matters", multiline: true },
            dialogueLines("bad", "The common mistake (dialogue)"),
            dialogueLines("good", "The right way (dialogue)"),
            { kind: "text", key: "formula", label: "Formula to remember" },
            { kind: "text", key: "note", label: "Note", multiline: true },
            { kind: "strings", key: "chips", label: "Feature words to avoid leading with", hint: "One per line — optional" },
          ],
        },
      ];
    case "practice":
      return [
        {
          kind: "list",
          key: "scenarios",
          label: "Scenarios",
          minItems: 1,
          itemTitle: (s) => `${s?.tag ? `[${s.tag}] ` : ""}${s?.message ?? ""}`,
          newItem: () => ({ tag: "", message: "", options: [] }),
          item: [
            { kind: "text", key: "tag", label: "Rules exercised", hint: "Shown after answering, e.g. R1 + R4", ltr: true },
            { kind: "text", key: "message", label: "Customer message", multiline: true },
            {
              kind: "list",
              key: "options",
              label: "Reply options",
              hint: "Mark exactly one as correct — the order is shuffled for learners",
              minItems: 2,
              itemTitle: (o) => `${o?.correct ? "✓ " : ""}${o?.text ?? ""}`,
              newItem: () => ({ text: "", correct: false, feedback: "" }),
              item: [
                { kind: "text", key: "text", label: "Reply", multiline: true },
                { kind: "boolean", key: "correct", label: "This is the correct reply" },
                { kind: "text", key: "feedback", label: "Feedback shown after choosing it", multiline: true },
              ],
            },
          ],
        },
      ];
    case "objections":
      return [
        {
          kind: "group",
          key: "objectionMethod",
          label: "The objection-handling method",
          fields: [
            { kind: "text", key: "intro", label: "Introduction", multiline: true },
            {
              kind: "list",
              key: "steps",
              label: "Method steps",
              minItems: 1,
              itemTitle: (s) => `${s?.n ?? ""} ${s?.title ?? ""}`,
              newItem: () => ({ n: "", title: "", body: "" }),
              item: [
                { kind: "text", key: "n", label: "Step number" },
                { kind: "text", key: "title", label: "Title" },
                { kind: "text", key: "body", label: "Explanation", multiline: true },
              ],
            },
            { kind: "text", key: "isolate", label: "Isolating the objection", multiline: true },
          ],
        },
        {
          kind: "list",
          key: "objections",
          label: "Objection bank",
          hint: "Also used by the Rapid drill and Quick reference. Keep both languages in the same order.",
          minItems: 1,
          itemTitle: (o) => `[${o?.category ?? ""}] ${o?.objection ?? ""}`,
          newItem: () => ({ category: "", objection: "", behind: "", wrong: "", right: "", facts: [], next: "" }),
          item: [
            { kind: "text", key: "category", label: "Category", hint: "Groups the bank's filter — reuse an existing name" },
            { kind: "text", key: "objection", label: "The objection" },
            { kind: "text", key: "behind", label: "What is really behind it", multiline: true },
            { kind: "text", key: "wrong", label: "Weak reply", multiline: true },
            { kind: "text", key: "right", label: "Model reply", multiline: true },
            { kind: "strings", key: "facts", label: "Facts reps can state safely" },
            { kind: "text", key: "next", label: "Question that moves it forward", multiline: true },
          ],
        },
      ];
    case "programs":
      return lang === "en"
        ? [
            {
              kind: "list",
              key: "programmes",
              label: "Programme names in English",
              hint: "Courses and videos are set when editing in Arabic; names match by course",
              itemTitle: (p) => p?.name ?? p?.slug ?? "",
              newItem: () => ({ slug: courseOptions[0]?.value ?? "", name: "", subtitle: "" }),
              item: [
                { kind: "select", key: "slug", label: "Course", options: courseOptions },
                { kind: "text", key: "name", label: "Name shown to reps", ltr: true },
                { kind: "text", key: "subtitle", label: "Subtitle", ltr: true },
              ],
            },
          ]
        : [
            {
              kind: "list",
              key: "programmes",
              label: "Programmes",
              hint: "Fees, lecture counts and learners come from the live published course",
              minItems: 1,
              itemTitle: (p) => p?.name ?? p?.slug ?? "",
              newItem: () => ({ slug: courseOptions[0]?.value ?? "", name: "", subtitle: "", videos: [] }),
              item: [
                { kind: "select", key: "slug", label: "Course", options: courseOptions },
                { kind: "text", key: "name", label: "Name shown to reps" },
                { kind: "text", key: "subtitle", label: "Subtitle" },
                {
                  kind: "list",
                  key: "videos",
                  label: "YouTube videos",
                  hint: "Shown when a rep opens this programme",
                  itemTitle: (v) => v?.title || v?.titleAr || v?.url || "",
                  newItem: () => ({
                    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
                    title: "",
                    titleAr: "",
                    provider: "youtube",
                    url: "",
                  }),
                  item: videoItems(),
                },
              ],
            },
          ];
    case "phrases":
      return [
        {
          kind: "list",
          key: "phraseBank",
          label: "Phrase cards",
          minItems: 1,
          itemTitle: (p) => p?.risky ?? "",
          newItem: () => ({ risky: "", safe: "" }),
          item: [
            { kind: "text", key: "risky", label: "Risky phrase (never say)", multiline: true },
            { kind: "text", key: "safe", label: "Safe alternative", multiline: true },
          ],
        },
      ];
    case "closing":
      return [
        {
          kind: "list",
          key: "closings",
          label: "Closing lines",
          minItems: 1,
          itemTitle: (c) => c?.situation ?? "",
          newItem: () => ({ situation: "", text: "" }),
          item: [
            { kind: "text", key: "situation", label: "Customer situation" },
            { kind: "text", key: "text", label: "Suggested closing", multiline: true },
          ],
        },
      ];
    case "checklist":
      return [
        {
          kind: "list",
          key: "checklist",
          label: "Checklist",
          minItems: 1,
          itemTitle: (c) => c?.question ?? "",
          newItem: () => ({ question: "", hint: "" }),
          item: [
            { kind: "text", key: "question", label: "Question" },
            { kind: "text", key: "hint", label: "Hint", multiline: true },
          ],
        },
      ];
    case "program-details":
      return [
        {
          kind: "group",
          key: "programDetails",
          label: "Program details",
          hint: "Fees, lectures and learner numbers come from the live course — don't type them here",
          fields: [
            { kind: "text", key: "intro", label: "Introduction", multiline: true },
            {
              kind: "list",
              key: "programmes",
              label: "Programmes (one tab each)",
              minItems: 1,
              itemTitle: (p) => `${p?.name ?? ""} — ${p?.fullName ?? ""}`,
              newItem: () => ({
                slug: courseOptions[0]?.value ?? "",
                name: "",
                fullName: "",
                awardedBy: "",
                tagline: "",
                facts: [],
                whatItIs: "",
                whyStudy: [],
                whoFor: [],
                eligibility: [],
                courseFacts: [],
                curriculum: [],
                outcomes: [],
                careerPaths: [],
                sayThis: [],
                avoid: [],
              }),
              item: [
                { kind: "select", key: "slug", label: "Course (live fees & lectures)", options: courseOptions },
                { kind: "text", key: "name", label: "Tab name", hint: "e.g. CPHQ" },
                { kind: "text", key: "fullName", label: "Full certification name", ltr: true },
                { kind: "text", key: "awardedBy", label: "Awarded by" },
                { kind: "text", key: "tagline", label: "One-line summary", multiline: true },
                {
                  kind: "list",
                  key: "facts",
                  label: "Facts grid",
                  hint: "Issuer, eligibility, exam, exam fee, our course, practice",
                  itemTitle: (f) => `${f?.label ?? ""}: ${f?.value ?? ""}`,
                  newItem: () => ({ label: "", value: "" }),
                  item: [
                    { kind: "text", key: "label", label: "Label" },
                    { kind: "text", key: "value", label: "Value", multiline: true },
                  ],
                },
                { kind: "strings", key: "sayThis", label: "Say it like this" },
                { kind: "strings", key: "avoid", label: "Never say" },
                { kind: "text", key: "whatItIs", label: "What the certification is", multiline: true },
                { kind: "strings", key: "whyStudy", label: "Why healthcare professionals study it" },
                { kind: "strings", key: "whoFor", label: "Who it suits" },
                { kind: "strings", key: "eligibility", label: "Exam eligibility (verified facts only)" },
                { kind: "strings", key: "courseFacts", label: "Course facts (format, duration, sessions)" },
                { kind: "strings", key: "curriculum", label: "Course content (one module per line)" },
                { kind: "strings", key: "outcomes", label: "What they'll learn" },
                { kind: "strings", key: "careerPaths", label: "Career paths" },
              ],
            },
            { kind: "text", key: "audiencesIntro", label: "Professions tab — introduction", multiline: true },
            {
              kind: "list",
              key: "audiences",
              label: "Why each profession considers management programmes",
              minItems: 1,
              itemTitle: (a) => a?.title ?? "",
              newItem: () => ({ title: "", motivations: [], worries: [], bestFit: "", openingQuestion: "" }),
              item: [
                { kind: "text", key: "title", label: "Profession" },
                { kind: "text", key: "openingQuestion", label: "Question to open with", multiline: true },
                { kind: "strings", key: "motivations", label: "Why they consider management programmes" },
                { kind: "strings", key: "worries", label: "What usually worries them" },
                { kind: "text", key: "bestFit", label: "Best-fit programmes", multiline: true },
              ],
            },
          ],
        },
      ];
    case "drill":
      return [];
  }
}
