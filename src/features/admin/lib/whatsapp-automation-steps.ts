/**
 * WhatsApp automation flow model — the drip sequence a WhatsApp automation runs.
 *
 * Mirrors the email automation envelope (see marketing-admin/lib/automation-steps)
 * but for the WhatsApp channel: message steps send an approved template (with
 * ordered params), delays wait, conditions branch on whether the contact replied,
 * and actions mutate the subscriber (tag) or notify the team.
 *
 * The backend persists the whole flow as a single `steps` JSON string (see
 * CreateWaAutomationDto.steps). We store a versioned envelope { settings, steps }
 * and migrate the legacy flat array on read so old automations keep working.
 */

export type WaStepType = "message" | "delay" | "condition" | "action";

export type WaDelayUnit = "minutes" | "hours" | "days";
export type WaConditionOn = "replied" | "not_replied";
export type WaActionKind = "add_tag" | "remove_tag" | "notify";

export interface WaMessageStep {
  id: string;
  type: "message";
  /** Internal step name (not shown to recipients). */
  name?: string;
  templateName?: string;
  language?: string;
  /** Ordered body params; `{{name}}` is substituted with the contact's first name. */
  params?: string[];
}
export interface WaDelayStep {
  id: string;
  type: "delay";
  amount: number;
  unit: WaDelayUnit;
}
export interface WaConditionStep {
  id: string;
  type: "condition";
  on: WaConditionOn;
}
export interface WaActionStep {
  id: string;
  type: "action";
  action: WaActionKind;
  value?: string;
}

export type WaStep = WaMessageStep | WaDelayStep | WaConditionStep | WaActionStep;

export interface WaFlowSettings {
  /** The subscriber group(s) whose members enter the flow (enter on joining ANY). */
  triggerGroups: string[];
}

export interface WaFlow {
  settings: WaFlowSettings;
  steps: WaStep[];
}

export const DEFAULT_WA_SETTINGS: WaFlowSettings = { triggerGroups: [] };

let seq = 0;
export const makeWaStepId = () => `ws_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export function makeWaStep(type: WaStepType, firstTemplate?: string, firstLanguage?: string, firstVarCount = 0): WaStep {
  const id = makeWaStepId();
  switch (type) {
    case "message":
      return {
        id, type, name: "", templateName: firstTemplate ?? "", language: firstLanguage ?? "ar",
        params: Array.from({ length: firstVarCount }, (_, i) => (i === 0 ? "{{name}}" : "")),
      };
    case "delay":
      return { id, type, amount: 1, unit: "days" };
    case "condition":
      return { id, type, on: "not_replied" };
    case "action":
      return { id, type, action: "add_tag", value: "" };
  }
}

/* ── Parse / migrate / serialize ── */

function migrateStep(raw: unknown): WaStep | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : makeWaStepId();

  if (r.type === "message")
    return {
      id, type: "message",
      name: typeof r.name === "string" ? r.name : "",
      templateName: typeof r.templateName === "string" ? r.templateName : "",
      language: typeof r.language === "string" ? r.language : "ar",
      params: Array.isArray(r.params) ? r.params.map((p) => String(p ?? "")) : [],
    };
  if (r.type === "delay")
    return {
      id, type: "delay",
      amount: Math.max(1, Number(r.amount) || 1),
      unit: (["minutes", "hours", "days"].includes(r.unit as string) ? r.unit : "days") as WaDelayUnit,
    };
  if (r.type === "condition")
    return {
      id, type: "condition",
      on: (["replied", "not_replied"].includes(r.on as string) ? r.on : "not_replied") as WaConditionOn,
    };
  if (r.type === "action")
    return {
      id, type: "action",
      action: (["add_tag", "remove_tag", "notify"].includes(r.action as string) ? r.action : "add_tag") as WaActionKind,
      value: typeof r.value === "string" ? r.value : "",
    };
  return null;
}

export function parseWaFlow(raw?: string | null): WaFlow {
  if (!raw) return { settings: { ...DEFAULT_WA_SETTINGS }, steps: [] };
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return { settings: { ...DEFAULT_WA_SETTINGS }, steps: [] }; }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    const rawSteps = Array.isArray(obj.steps) ? obj.steps : [];
    const settings = (obj.settings && typeof obj.settings === "object" ? obj.settings : {}) as Partial<WaFlowSettings>;
    return {
      settings: {
        triggerGroups: Array.isArray(settings.triggerGroups)
          ? settings.triggerGroups.filter((g): g is string => typeof g === "string")
          : [],
      },
      steps: rawSteps.map(migrateStep).filter(Boolean) as WaStep[],
    };
  }
  if (Array.isArray(parsed)) {
    return { settings: { ...DEFAULT_WA_SETTINGS }, steps: parsed.map(migrateStep).filter(Boolean) as WaStep[] };
  }
  return { settings: { ...DEFAULT_WA_SETTINGS }, steps: [] };
}

export function serializeWaFlow(flow: WaFlow): string {
  return JSON.stringify({ v: 2, settings: flow.settings, steps: flow.steps });
}

/* ── Display helpers ── */

const UNIT_LABEL: Record<WaDelayUnit, [string, string]> = {
  minutes: ["minute", "minutes"],
  hours: ["hour", "hours"],
  days: ["day", "days"],
};

export function formatWaDelay(step: WaDelayStep): string {
  const [one, many] = UNIT_LABEL[step.unit];
  return `Wait ${step.amount} ${step.amount === 1 ? one : many}`;
}

export const WA_CONDITION_LABEL: Record<WaConditionOn, string> = {
  replied: "replied to the previous message",
  not_replied: "hasn't replied yet",
};

export const WA_ACTION_LABEL: Record<WaActionKind, string> = {
  add_tag: "Add tag",
  remove_tag: "Remove tag",
  notify: "Notify team",
};

/** Human summary of the trigger row at the top of the flow. */
export function waTriggerSummary(groups?: string[]): string {
  const g = (groups ?? []).filter(Boolean);
  if (g.length === 0) return "When a contact joins a group";
  if (g.length === 1) return `When a contact joins “${g[0]}”`;
  return `When a contact joins any of ${g.length} groups`;
}
