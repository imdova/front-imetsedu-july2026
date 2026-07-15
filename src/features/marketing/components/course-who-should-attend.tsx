import {
  Check,
  Briefcase,
  Building2,
  ClipboardList,
  Compass,
  Rocket,
  GraduationCap,
  Stethoscope,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

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

function audienceIcon(item: string): LucideIcon {
  const t = item.toLowerCase();
  const has = (...w: string[]) => w.some((x) => t.includes(x));
  if (has("director", "executive", "chief", "ceo", "مدير تنفيذي", "مديري")) return Briefcase;
  if (has("administrator", "administration", "hospital manager", "إداري", "إدارة")) return Building2;
  if (has("clinic", "department manager", "supervisor", "عيادة", "مشرف")) return ClipboardList;
  if (has("consultant", "advisor", "استشاري", "مستشار")) return Compass;
  if (has("entrepreneur", "founder", "owner", "رائد", "مالك", "صاحب")) return Rocket;
  if (has("graduate", "student", "fresh", "خريج", "طالب")) return GraduationCap;
  if (has("nurse", "physician", "doctor", "clinical", "طبيب", "ممرض", "إكلينيكي")) return Stethoscope;
  if (has("quality", "safety", "accreditation", "جودة", "سلامة", "اعتماد")) return ShieldCheck;
  if (has("team", "hr", "staff", "فريق", "موارد بشرية")) return Users;
  return Check;
}

interface CourseWhoShouldAttendProps {
  title: string;
  content: string;
  locale: string;
  className?: string;
}

/**
 * Audience as a flowing chip/rail — not another title + equal card grid.
 */
export function CourseWhoShouldAttend({
  title,
  content,
  locale,
  className,
}: CourseWhoShouldAttendProps) {
  const items = parseAudienceItems(content);
  if (!items.length) return null;

  return (
    <section className={cn("scroll-mt-32", className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-md font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground lg:text-end">
          {locale === "ar"
            ? "إذا وجدت نفسك هنا — فأنت في المكان الصحيح."
            : "If you see yourself here, you're in the right place."}
        </p>
      </div>

      <ul
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mt-8 flex flex-wrap gap-2.5"
      >
        {items.map((item) => {
          const Icon = audienceIcon(item);
          return (
            <li
              key={item}
              className="inline-flex max-w-full items-center gap-2 rounded-full border border-border/70 bg-background px-3.5 py-2 text-sm font-medium text-foreground shadow-sm"
            >
              <Icon className="size-3.5 shrink-0 text-primary" />
              <span className="truncate">{item}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
