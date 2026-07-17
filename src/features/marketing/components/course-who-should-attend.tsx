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
  UserRoundPlus,
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
  if (has("infection", "practitioner", "مكافحة العدوى", "وقاية")) return UserRoundPlus;
  if (has("director", "executive", "chief", "ceo", "مدير تنفيذي", "مديري")) return Briefcase;
  if (has("administrator", "administration", "hospital manager", "إداري", "إدارة")) return Building2;
  if (has("public-health", "public health", "الصحة العامة")) return Users;
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
  const ar = locale === "ar";
  const intro = ar
    ? "إذا وجدت نفسك هنا، فأنت في المكان الصحيح."
    : "If you see yourself here, you're in the right place.";

  const highlightedTitle =
    !ar && title.includes("Infection Control Diploma") ? (
      <>
        {title.replace("Infection Control Diploma", "").trim()}{" "}
        <span className="text-amber-300">Infection Control Diploma</span>
      </>
    ) : ar && title.includes("دبلومة مكافحة العدوى") ? (
      <>
        {title.replace("دبلومة مكافحة العدوى", "").trim()}{" "}
        <span className="text-amber-300">دبلومة مكافحة العدوى</span>
      </>
    ) : (
      title
    );

  return (
    <section
      id="audience"
      dir={ar ? "rtl" : "ltr"}
      className={cn(
        "scroll-mt-32 overflow-hidden rounded-[2rem] bg-[#073fa3] px-5 py-8 text-white shadow-2xl shadow-blue-950/20 sm:px-8 sm:py-10 lg:px-10",
        className,
      )}
    >
      <div className="relative">
        <div className="pointer-events-none absolute -end-2 -top-4 hidden text-amber-300/95 sm:block">
          <ShieldCheck className="size-32 stroke-[1.5] lg:size-44" />
        </div>

        <div className="max-w-3xl">
          <h2 className="font-heading text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {highlightedTitle}
          </h2>
          <div className="mt-5 h-0.5 w-36 rounded-full bg-amber-300" />
          <p className="mt-5 text-base font-medium leading-relaxed text-white/85 sm:text-lg">
            {intro}
          </p>
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:pe-4 xl:max-w-5xl">
          {items.map((item, index) => {
          const Icon = audienceIcon(item);
          return (
            <li
              key={item}
              className={cn(
                "flex min-h-24 items-center gap-4 rounded-xl bg-white px-5 py-4 text-[#0a2f7a] shadow-[0_10px_30px_rgba(0,0,0,0.12)] ring-1 ring-white/80",
                items.length % 2 === 1 && index === items.length - 1 && "sm:col-span-2 lg:max-w-[calc(50%-0.5rem)]",
              )}
            >
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#073fa3] text-amber-300 shadow-sm">
                <Icon className="size-7" strokeWidth={1.8} />
              </span>
              <span className="h-14 w-px shrink-0 bg-amber-300/70" aria-hidden />
              <span className="font-heading text-lg font-extrabold leading-snug sm:text-xl">
                {item}
              </span>
            </li>
          );
          })}
        </ul>
      </div>
    </section>
  );
}
