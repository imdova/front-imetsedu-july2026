/**
 * Automation flow model — the smart drip-sequence a marketing automation runs.
 *
 * The backend persists the whole flow as a single free-form `steps` JSON string
 * (see UpdateAutomationDto.steps). We store a versioned envelope so we can carry
 * per-flow settings (e.g. "repeat") without a schema change, and migrate the
 * legacy array-of-{wait|email} shape on read.
 */

export type StepType = "email" | "delay" | "condition" | "action";

export type DelayUnit = "minutes" | "hours" | "days";
export type ConditionOn = "opened" | "not_opened" | "clicked" | "not_clicked";
export type ActionKind =
  | "add_tag"
  | "remove_tag"
  | "move_group"
  | "unsubscribe"
  | "notify";

export interface EmailStep {
  id: string;
  type: "email";
  subject: string;
  previewText?: string;
  fromName?: string;
  templateId?: string;
}
export interface DelayStep {
  id: string;
  type: "delay";
  amount: number;
  unit: DelayUnit;
}
export interface ConditionStep {
  id: string;
  type: "condition";
  on: ConditionOn;
}
export interface ActionStep {
  id: string;
  type: "action";
  action: ActionKind;
  value?: string;
}

export type Step = EmailStep | DelayStep | ConditionStep | ActionStep;

export interface FlowSettings {
  /** Re-enter the same subscriber if the trigger fires again (max once/day). */
  repeat: boolean;
  /**
   * For the `tag_added` trigger: the subscriber group(s) whose members enter the
   * flow. Multiple groups = enter when the subscriber joins ANY of them. Stored
   * here (in the steps envelope) so it round-trips as an array without a schema
   * change; `triggerTag` mirrors a comma-joined copy for legacy display.
   */
  triggerGroups?: string[];
}

export interface Flow {
  settings: FlowSettings;
  steps: Step[];
}

export const DEFAULT_SETTINGS: FlowSettings = { repeat: false, triggerGroups: [] };

let seq = 0;
export const makeStepId = () =>
  `st_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export function makeStep(type: StepType): Step {
  const id = makeStepId();
  switch (type) {
    case "email":
      return { id, type, subject: "New email", previewText: "", fromName: "" };
    case "delay":
      return { id, type, amount: 1, unit: "days" };
    case "condition":
      return { id, type, on: "opened" };
    case "action":
      return { id, type, action: "add_tag", value: "" };
  }
}

/* ── Parse / migrate / serialize ── */

function migrateStep(raw: unknown): Step | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : makeStepId();

  // Legacy "wait" step → delay
  if (r.type === "wait") {
    const mins = Number(r.delayMinutes) || 60;
    if (mins % 1440 === 0) return { id, type: "delay", amount: mins / 1440, unit: "days" };
    if (mins % 60 === 0) return { id, type: "delay", amount: mins / 60, unit: "hours" };
    return { id, type: "delay", amount: mins, unit: "minutes" };
  }
  if (r.type === "delay")
    return {
      id,
      type: "delay",
      amount: Math.max(1, Number(r.amount) || 1),
      unit: (["minutes", "hours", "days"].includes(r.unit as string) ? r.unit : "days") as DelayUnit,
    };
  if (r.type === "email")
    return {
      id,
      type: "email",
      subject: String(r.subject ?? "New email"),
      previewText: typeof r.previewText === "string" ? r.previewText : "",
      fromName: typeof r.fromName === "string" ? r.fromName : "",
      templateId: typeof r.templateId === "string" ? r.templateId : undefined,
    };
  if (r.type === "condition")
    return {
      id,
      type: "condition",
      on: (["opened", "not_opened", "clicked", "not_clicked"].includes(r.on as string) ? r.on : "opened") as ConditionOn,
    };
  if (r.type === "action")
    return {
      id,
      type: "action",
      action: (["add_tag", "remove_tag", "move_group", "unsubscribe", "notify"].includes(r.action as string) ? r.action : "add_tag") as ActionKind,
      value: typeof r.value === "string" ? r.value : "",
    };
  return null;
}

export function parseFlow(raw?: string | null): Flow {
  if (!raw) return { settings: { ...DEFAULT_SETTINGS }, steps: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { settings: { ...DEFAULT_SETTINGS }, steps: [] };
  }
  // New envelope { settings, steps }
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    const rawSteps = Array.isArray(obj.steps) ? obj.steps : [];
    const settings = (obj.settings && typeof obj.settings === "object" ? obj.settings : {}) as Partial<FlowSettings>;
    return {
      settings: {
        repeat: Boolean(settings.repeat),
        triggerGroups: Array.isArray(settings.triggerGroups)
          ? settings.triggerGroups.filter((g): g is string => typeof g === "string")
          : [],
      },
      steps: rawSteps.map(migrateStep).filter(Boolean) as Step[],
    };
  }
  // Legacy array of steps
  if (Array.isArray(parsed)) {
    return {
      settings: { ...DEFAULT_SETTINGS },
      steps: parsed.map(migrateStep).filter(Boolean) as Step[],
    };
  }
  return { settings: { ...DEFAULT_SETTINGS }, steps: [] };
}

export function serializeFlow(flow: Flow): string {
  return JSON.stringify({ v: 2, settings: flow.settings, steps: flow.steps });
}

/* ── Display helpers ── */

const UNIT_LABEL: Record<DelayUnit, [string, string]> = {
  minutes: ["minute", "minutes"],
  hours: ["hour", "hours"],
  days: ["day", "days"],
};

export function formatDelay(step: DelayStep): string {
  const [one, many] = UNIT_LABEL[step.unit];
  return `Wait ${step.amount} ${step.amount === 1 ? one : many}`;
}

export const CONDITION_LABEL: Record<ConditionOn, string> = {
  opened: "opened the previous email",
  not_opened: "did not open the previous email",
  clicked: "clicked a link",
  not_clicked: "did not click a link",
};

export const ACTION_LABEL: Record<ActionKind, string> = {
  add_tag: "Add tag",
  remove_tag: "Remove tag",
  move_group: "Move to group",
  unsubscribe: "Unsubscribe",
  notify: "Notify team",
};

/** Human summary of the trigger row (top of the flow). */
export function triggerSummary(trigger: string, groups?: string[]): string {
  if (trigger === "tag_added") {
    const g = (groups ?? []).filter(Boolean);
    if (g.length === 0) return "When a subscriber joins a group";
    if (g.length === 1) return `When a subscriber joins “${g[0]}”`;
    return `When a subscriber joins any of ${g.length} groups`;
  }
  return "When a new subscriber is created";
}
