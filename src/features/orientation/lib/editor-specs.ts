import type { Field } from "@/features/orientation/components/structured-fields";
import type { LessonId } from "@/features/orientation/lib/sales-orientation";

/**
 * What each lesson's content editor shows, as field specs over the
 * `SalesOrientation` content object. Labels are English (the admin console);
 * the values themselves are the Arabic training copy.
 */

const SIDE_OPTIONS = [
  { value: "client", label: "Client (العميل)" },
  { value: "rep", label: "Sales rep (المندوب)" },
];

const threadFields = (label: string): Field => ({
  kind: "group",
  key: label === "bad" ? "bad" : "good",
  label: label === "bad" ? "Interrogation style (the weak reply)" : "Consultation style (the strong reply)",
  fields: [
    {
      kind: "list",
      key: "messages",
      label: "Messages",
      minItems: 1,
      itemTitle: (m) => `${m?.who ?? ""}: ${m?.text ?? ""}`,
      newItem: () => ({ from: "rep", who: "المندوب", text: "" }),
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

export function lessonContentFields(id: LessonId, courseOptions: { value: string; label: string }[]): Field[] {
  switch (id) {
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
            { kind: "text", key: "n", label: "Step number (as shown, e.g. ١)" },
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
            { kind: "text", key: "id", label: "Code", hint: "Practice scenarios reference it, e.g. R1", ltr: true },
            { kind: "text", key: "title", label: "Title" },
            { kind: "text", key: "en", label: "English subtitle", ltr: true },
            { kind: "text", key: "intro", label: "Introduction", multiline: true },
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
            { kind: "text", key: "tag", label: "Rules exercised", hint: "e.g. R1 + R4", ltr: true },
            { kind: "text", key: "message", label: "Customer message", multiline: true },
            {
              kind: "list",
              key: "options",
              label: "Reply options",
              hint: "Mark exactly one as correct",
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
          hint: "Also used by the Rapid drill lesson",
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
      return [
        {
          kind: "list",
          key: "programmes",
          label: "Programmes",
          hint: "Fees, lecture counts and learners come from the live published course",
          minItems: 1,
          itemTitle: (p) => p?.name ?? p?.slug ?? "",
          newItem: () => ({ slug: courseOptions[0]?.value ?? "", name: "", subtitle: "" }),
          item: [
            { kind: "select", key: "slug", label: "Course", options: courseOptions },
            { kind: "text", key: "name", label: "Name shown to reps" },
            { kind: "text", key: "subtitle", label: "Subtitle" },
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
            { kind: "text", key: "risky", label: "Risky phrase (don't say)", multiline: true },
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
    case "drill":
      return [];
  }
}
