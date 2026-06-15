"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface Step {
  title: string;
  description: string;
}

interface StepperProps {
  steps: Step[];
  current: number;
  onStepClick?: (index: number) => void;
}

/** Horizontal step indicator for the course wizard. All steps are clickable. */
export function Stepper({ steps, current, onStepClick }: StepperProps) {
  return (
    <ol className="flex w-full items-center">
      {steps.map((step, i) => {
        const completed = i < current;
        const active = i === current;
        const last = i === steps.length - 1;

        return (
          <li
            key={step.title}
            className={cn("flex items-center", !last && "flex-1")}
          >
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              className="flex cursor-pointer items-center gap-3 text-start"
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-colors",
                  active && "border-primary bg-primary text-primary-foreground",
                  completed && "border-primary bg-primary text-primary-foreground",
                  !active &&
                    !completed &&
                    "border-border bg-background text-muted-foreground",
                )}
              >
                {completed ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="hidden flex-col sm:flex">
                <span
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
                <span className="text-xs text-muted-foreground">
                  {step.description}
                </span>
              </span>
            </button>

            {!last && (
              <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
                <motion.div
                  className="h-full bg-primary"
                  initial={false}
                  animate={{ width: completed ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
