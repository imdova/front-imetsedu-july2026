"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { GripVertical } from "lucide-react";

import type { DashboardTask } from "@/lib/db/dashboard";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { SortableList } from "@/components/shared/sortable/sortable-list";

const PRIORITY_STYLES: Record<DashboardTask["priority"], string> = {
  high: "bg-destructive/15 text-destructive border-transparent",
  medium: "bg-warning/15 text-warning border-transparent",
  low: "bg-muted text-muted-foreground border-transparent",
};

/**
 * Reorderable "production pipeline" card section — drag to re-prioritize the
 * content work queue. Demonstrates the composable dnd-kit primitive.
 */
const PRIORITY_LABEL: Record<DashboardTask["priority"], string> = {
  high: "priorityHigh",
  medium: "priorityMedium",
  low: "priorityLow",
};

export function TaskBoard({ tasks }: { tasks: DashboardTask[] }) {
  const [items, setItems] = React.useState<DashboardTask[]>(tasks);
  const t = useTranslations("Dashboard");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t("productionPipeline")}</CardTitle>
        <CardDescription>{t("dragToPrioritize")}</CardDescription>
      </CardHeader>
      <CardContent>
        <SortableList
          items={items}
          onReorder={setItems}
          className="flex flex-col gap-2"
          renderItem={(task, handle) => (
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border bg-card p-3 transition-shadow",
                handle.isDragging && "shadow-lg ring-1 ring-primary/30",
              )}
            >
              <button
                type="button"
                className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
                aria-label="Drag to reorder"
                {...handle.attributes}
                {...handle.listeners}
              >
                <GripVertical className="size-4" />
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{task.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {task.course}
                </p>
              </div>

              <Badge className={cn(PRIORITY_STYLES[task.priority])}>
                {t(PRIORITY_LABEL[task.priority])}
              </Badge>

              <Avatar className="size-7 border">
                <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">
                  {getInitials(task.assignee)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        />
      </CardContent>
    </Card>
  );
}
