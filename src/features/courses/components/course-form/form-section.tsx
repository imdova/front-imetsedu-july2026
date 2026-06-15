import * as React from "react";
import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

/** A titled card grouping related form fields (matches the BA "sections"). */
export function FormSection({
  title,
  description,
  children,
  className,
  action,
}: FormSectionProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("space-y-5", className)}>{children}</div>
    </section>
  );
}
