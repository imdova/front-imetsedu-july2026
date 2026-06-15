"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Link2, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";

import type { PipelineSummary } from "@/lib/db/crm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Active inventory pipelines plus the default admissions funnel. */
export function buildAssignablePipelines(
  inventory: PipelineSummary[],
): { id: string; title: string }[] {
  const active = inventory.filter((p) => !p.archived);
  const hasDefault = active.some((p) => p.title === "Default");
  return hasDefault
    ? active.map((p) => ({ id: p.id, title: p.title }))
    : [...active.map((p) => ({ id: p.id, title: p.title })), { id: "pl_default", title: "Default" }];
}

interface AssignPipelineDialogProps {
  pipelines: { id: string; title: string }[];
  assignedIds: string[];
  onSave: (ids: string[]) => void;
}

export function AssignPipelineTrigger({
  pipelines,
  assignedIds,
  onSave,
}: AssignPipelineDialogProps) {
  const t = useTranslations("Crm");
  const tc = useTranslations("Common");
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<string[]>(assignedIds);

  React.useEffect(() => {
    if (open) setDraft(assignedIds);
  }, [open, assignedIds]);

  const primary = pipelines.find((p) => assignedIds.includes(p.id));
  const triggerLabel = primary?.title ?? t("noPipeline");

  const toggle = (id: string) => {
    setDraft((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const save = () => {
    onSave(draft);
    setOpen(false);
    toast.success(t("pipelinesAssigned"));
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5 border-violet-300 bg-background text-violet-700 hover:bg-violet-50 hover:text-violet-800 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/40"
      >
        <Link2 className="size-4" />
        {t("assignPipeline")} · {triggerLabel}
        <ChevronDown className="size-4 opacity-70" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Link2 className="size-4 text-violet-600" />
              {t("assignPipelinesTitle")}
            </DialogTitle>
          </DialogHeader>

          <ul className="max-h-80 overflow-y-auto px-2 py-2">
            {pipelines.map((pipeline) => {
              const checked = draft.includes(pipeline.id);
              return (
                <li key={pipeline.id}>
                  <button
                    type="button"
                    onClick={() => toggle(pipeline.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-start text-sm transition-colors",
                      checked && "bg-violet-50 dark:bg-violet-950/30",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded border transition-colors",
                        checked
                          ? "border-violet-600 bg-violet-600 text-white"
                          : "border-input",
                      )}
                    >
                      {checked && <Check className="size-3" />}
                    </span>
                    <span className={cn(checked && "font-medium text-violet-900 dark:text-violet-100")}>
                      {pipeline.title}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {tc("cancel")}
            </Button>
            <Button type="button" onClick={save}>
              {tc("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
