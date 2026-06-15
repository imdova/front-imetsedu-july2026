"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  countLabel: string;
  clearLabel: string;
  onClear: () => void;
  children: ReactNode;
  className?: string;
}

/** Contextual bar shown when table rows are selected (matches admin bulk-action design). */
export function BulkActionsBar({
  countLabel,
  clearLabel,
  onClear,
  children,
  className,
}: BulkActionsBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">{countLabel}</span>
        {children}
      </div>
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={onClear}>
        <X className="size-4" />
        {clearLabel}
      </Button>
    </div>
  );
}

interface BulkActionButtonProps extends React.ComponentProps<typeof Button> {
  tone?: "primary" | "destructive";
}

export function BulkActionButton({
  tone = "primary",
  className,
  size = "sm",
  ...props
}: BulkActionButtonProps) {
  if (tone === "destructive") {
    return (
      <Button
        variant="destructive"
        size={size}
        className={cn("gap-1.5", className)}
        {...props}
      />
    );
  }

  return (
    <Button
      variant="outline"
      size={size}
      className={cn(
        "gap-1.5 border-primary/40 bg-background text-primary hover:bg-primary/5 hover:text-primary",
        className,
      )}
      {...props}
    />
  );
}
