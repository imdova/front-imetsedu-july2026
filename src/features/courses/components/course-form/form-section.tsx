import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  /** When set, the section body can be collapsed via the header. */
  collapsible?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Used only when `open` is uncontrolled. Defaults to true. */
  defaultOpen?: boolean;
}

/** A titled card grouping related form fields (matches the BA "sections"). */
export function FormSection({
  title,
  description,
  children,
  className,
  action,
  collapsible = false,
  open: openProp,
  onOpenChange,
  defaultOpen = true,
}: FormSectionProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  return (
    <section className="rounded-xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        {collapsible ? (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex min-w-0 flex-1 items-start justify-between gap-3 text-start"
            aria-expanded={open}
          >
            <div className="space-y-0.5">
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            <ChevronDown
              className={cn(
                "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </button>
        ) : (
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        {action}
      </div>
      {(!collapsible || open) && (
        <div className={cn("space-y-5", className)}>{children}</div>
      )}
    </section>
  );
}
