import type { ComponentType } from "react";
import {
  Award,
  BarChart3,
  Infinity as InfinityIcon,
  MessageSquareQuote,
  Sparkles,
  Target,
} from "lucide-react";

import { cn } from "@/lib/utils";

const OUTCOME_ICONS: ComponentType<{ className?: string }>[] = [
  BarChart3,
  Target,
  Sparkles,
  MessageSquareQuote,
  Award,
  InfinityIcon,
];

interface CourseWhatYouLearnProps {
  title: string;
  subtitle: string;
  items: string[];
  locale: string;
  className?: string;
}

/** Numbered learning outcomes in a 2-column editorial grid. */
export function CourseWhatYouLearn({
  title,
  subtitle,
  items,
  locale,
  className,
}: CourseWhatYouLearnProps) {
  if (!items.length) return null;

  return (
    <section id="learn" className={cn("scroll-mt-32", className)}>
      <div className="w-full max-w-none">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>
      </div>

      <ol
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mt-10 grid w-full gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item, index) => {
          const Icon = OUTCOME_ICONS[index % OUTCOME_ICONS.length];
          return (
            <li key={item} className="flex gap-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="font-heading text-xs font-bold tabular-nums tracking-wider text-primary">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-base font-medium leading-snug text-foreground">
                  {item}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
