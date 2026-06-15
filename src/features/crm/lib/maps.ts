/** Shared stage/priority label-key + style maps for CRM components. */

export const STAGE_LABEL_KEY: Record<string, string> = {
  new: "stageNew",
  contacted: "stageContacted",
  // `qualified` retained as an alias so any legacy lead resolves to the merged stage.
  qualified: "stageContacted",
  waiting_payment: "stageWaiting",
  enrolled: "stageEnrolled",
  lost: "stageLost",
};

export const STAGE_STYLE: Record<string, string> = {
  new: "border-transparent bg-chart-3/15 text-chart-3",
  contacted: "border-transparent bg-primary/12 text-primary",
  qualified: "border-transparent bg-primary/12 text-primary",
  waiting_payment: "border-transparent bg-warning/18 text-warning",
  enrolled: "border-transparent bg-success/15 text-success",
  lost: "border-transparent bg-muted text-muted-foreground",
};

/** Top border accent for Kanban columns. */
export const STAGE_ACCENT: Record<string, string> = {
  new: "bg-chart-3",
  contacted: "bg-primary",
  qualified: "bg-primary",
  waiting_payment: "bg-warning",
  enrolled: "bg-success",
  lost: "bg-muted-foreground",
};

export const PRIORITY_LABEL_KEY: Record<string, string> = {
  hot: "priorityHot",
  warm: "priorityWarm",
  cold: "priorityCold",
};

export const PRIORITY_STYLE: Record<string, string> = {
  hot: "border-transparent bg-destructive/12 text-destructive",
  warm: "border-transparent bg-warning/18 text-warning",
  cold: "border-transparent bg-muted text-muted-foreground",
};

/** Ring/text color for the score dial based on band. */
export function scoreTone(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-muted-foreground";
}
