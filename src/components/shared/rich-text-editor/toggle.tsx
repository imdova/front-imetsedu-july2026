"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps extends React.ComponentProps<"button"> {
  pressed: boolean;
  label: string;
}

/** Small icon toggle used by the editor toolbar (active state = primary tint). */
export function Toggle({
  pressed,
  label,
  className,
  children,
  ...props
}: ToggleProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-40",
        pressed && "bg-primary/10 text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
