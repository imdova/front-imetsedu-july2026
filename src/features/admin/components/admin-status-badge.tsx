"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const MAP: Record<string, { key: string; style: string }> = {
  active: { key: "stActive", style: "bg-success/15 text-success" },
  inactive: { key: "stInactive", style: "bg-muted text-muted-foreground" },
  published: { key: "stPublished", style: "bg-success/15 text-success" },
  draft: { key: "stDraft", style: "bg-muted text-muted-foreground" },
  pending: { key: "stPending", style: "bg-warning/18 text-warning" },
  accepted: { key: "stAccepted", style: "bg-success/15 text-success" },
  cancelled: { key: "stCancelled", style: "bg-muted text-muted-foreground" },
  suspended: { key: "stSuspended", style: "bg-destructive/12 text-destructive" },
  invited: { key: "stInvited", style: "bg-chart-3/15 text-chart-3" },
  inprogress: { key: "stInprogress", style: "bg-chart-3/15 text-chart-3" },
  finished: { key: "stFinished", style: "bg-muted text-muted-foreground" },
  completed: { key: "stCompleted", style: "bg-success/15 text-success" },
  dropped: { key: "stDropped", style: "bg-destructive/12 text-destructive" },
  failed: { key: "stFailed", style: "bg-destructive/12 text-destructive" },
  sent: { key: "stSent", style: "bg-success/15 text-success" },
  scheduled: { key: "stScheduled", style: "bg-chart-3/15 text-chart-3" },
  paid: { key: "stPaid", style: "bg-success/15 text-success" },
  processing: { key: "stProcessing", style: "bg-chart-3/15 text-chart-3" },
  approved: { key: "stApproved", style: "bg-success/15 text-success" },
  rejected: { key: "stRejected", style: "bg-destructive/12 text-destructive" },
  live: { key: "stLive", style: "bg-destructive/12 text-destructive" },
};

export function AdminStatusBadge({ value }: { value: string }) {
  const t = useTranslations("Admin") as unknown as (k: string) => string;
  const cfg = MAP[value] ?? { key: value, style: "bg-muted text-muted-foreground" };
  return <Badge className={cn("border-transparent capitalize", cfg.style)}>{t(cfg.key)}</Badge>;
}
