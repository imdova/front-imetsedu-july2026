"use client";

import * as React from "react";
import {
  BookOpen,
  ClipboardCheck,
  ClipboardList,
  Copy,
  ListChecks,
  MousePointerClick,
  PlayCircle,
  Target,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LessonType } from "@/features/orientation/lib/course-map";
import { useOrientationT, type Translate } from "@/features/orientation/lib/i18n";

/** What every interactive lesson receives: the gate keys reached so far, and a way to record the next. */
export interface GateProps {
  seen: ReadonlySet<string>;
  mark: (key: string) => void;
}

export const TYPE_ICONS: Record<LessonType, LucideIcon> = {
  video: PlayCircle,
  read: BookOpen,
  interactive: MousePointerClick,
  practice: Target,
  quiz: ListChecks,
  task: ClipboardList,
  checklist: ClipboardCheck,
};

export function TypeIcon({ type, className }: { type: LessonType; className?: string }) {
  const Icon = TYPE_ICONS[type] ?? BookOpen;
  return <Icon className={cn("size-3.5 shrink-0", className)} aria-hidden="true" />;
}

export async function copyText(text: string, t: Translate) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(t("common.copied"));
    return true;
  } catch {
    // Clipboard blocked (insecure context or denied) — the text is on screen and selectable.
    toast.error(t("common.copyFailed"));
    return false;
  }
}

export function CopyButton({
  text,
  className,
  onCopied,
  size = "sm",
}: {
  text: string;
  className?: string;
  onCopied?: () => void;
  size?: "sm" | "icon";
}) {
  const { t } = useOrientationT();
  const label = t("common.copy");
  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={cn(size === "sm" ? "h-8 gap-1.5" : "size-8", className)}
      onClick={async () => {
        if (await copyText(text, t)) onCopied?.();
      }}
      aria-label={size === "icon" ? label : undefined}
      title={size === "icon" ? label : undefined}
    >
      <Copy className="size-3.5" />
      {size === "sm" && label}
    </Button>
  );
}

/** The short lead paragraph a lesson opens with. */
export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{children}</p>;
}

/** Small uppercase-ish label over a panel. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-xs font-bold text-muted-foreground", className)}>{children}</p>;
}

/** Admin-written text: a blank line starts a paragraph, lines starting with "- " are bullets. */
export function RichText({ body, className }: { body: string; className?: string }) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (blocks.length === 0) return null;
  return (
    <div className={cn("space-y-3", className)}>
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim());
        return lines.every((l) => /^[-•]\s+/.test(l)) ? (
          <ul key={i} className="space-y-1.5 ps-5 text-sm leading-relaxed [list-style:disc]">
            {lines.map((l, j) => (
              <li key={j}>{l.replace(/^[-•]\s+/, "")}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line text-sm leading-relaxed">
            {block}
          </p>
        );
      })}
    </div>
  );
}

/** One WhatsApp-style message. Client messages sit on the start side, the rep's on the end side. */
export function Bubble({ side, label, children }: { side: "client" | "rep"; label?: string; children: React.ReactNode }) {
  const isClient = side === "client";
  return (
    <div className={cn("flex", isClient ? "justify-start" : "justify-end")}>
      <p
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
          isClient
            ? "rounded-ss-md border border-border/70 bg-card text-foreground"
            : "rounded-se-md bg-primary text-primary-foreground",
        )}
      >
        {label && <span className="mb-0.5 block text-[11px] font-semibold opacity-70">{label}</span>}
        {children}
      </p>
    </div>
  );
}
