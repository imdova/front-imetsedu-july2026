import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function splitAudienceLines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^[\s•·▪▸►\-\*–—]+/, "").replace(/^\d+[\.\)]\s*/, "").trim())
    .filter(Boolean);
}

/** Parse audience copy from plain text, line breaks, or HTML lists. */
export function parseAudienceItems(content: string): string[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const listItems = [...trimmed.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
  if (listItems.length > 0) {
    return listItems.map((m) => stripHtml(m[1])).filter(Boolean);
  }

  const plain = /<[a-z][\s\S]*>/i.test(trimmed) ? stripHtml(trimmed) : trimmed;
  return splitAudienceLines(plain);
}

function GoldenCheckbox({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "mt-0.5 grid size-5 shrink-0 place-items-center rounded-[6px]",
        "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600",
        "shadow-[0_1px_3px_rgba(180,83,9,0.35)] ring-1 ring-amber-500/50",
        className,
      )}
      aria-hidden
    >
      <Check className="size-3 stroke-[3] text-white drop-shadow-sm" />
    </span>
  );
}

interface CourseWhoShouldAttendProps {
  title: string;
  content: string;
  locale: string;
  className?: string;
}

export function CourseWhoShouldAttend({
  title,
  content,
  locale,
  className,
}: CourseWhoShouldAttendProps) {
  const items = parseAudienceItems(content);
  if (!items.length) return null;

  return (
    <section
      className={cn(
        "scroll-mt-32 rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-background to-background p-6 sm:p-7",
        "dark:border-amber-900/40 dark:from-amber-950/25 dark:via-background dark:to-background",
        className,
      )}
    >
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <ul
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mt-5 grid gap-3.5 sm:grid-cols-2"
      >
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85">
            <GoldenCheckbox />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
