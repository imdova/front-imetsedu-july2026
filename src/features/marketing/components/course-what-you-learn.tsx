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

export function CourseWhatYouLearn({
  title,
  subtitle,
  items,
  locale,
  className,
}: CourseWhatYouLearnProps) {
  if (!items.length) return null;

  return (
    <section
      id="learn"
      className={cn(
        "scroll-mt-32 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.06] via-background to-background p-6 sm:p-7 lg:p-8",
        "dark:border-primary/25 dark:from-primary/10",
        className,
      )}
    >
      <div className="max-w-2xl">
        <h2 className="font-heading text-xl font-semibold sm:text-2xl">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>

      <ul
        dir={locale === "ar" ? "rtl" : "ltr"}
        className="mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4"
      >
        {items.map((item, index) => {
          const Icon = OUTCOME_ICONS[index % OUTCOME_ICONS.length];
          return (
            <li
              key={item}
              className="group relative flex gap-3.5 rounded-xl border border-border/70 bg-card/80 p-4 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <span
                className="absolute end-3 top-3 text-[2.5rem] font-bold leading-none text-primary/[0.07] tabular-nums select-none"
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15 transition-colors group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground">
                <Icon className="size-[18px]" aria-hidden />
              </span>
              <p className="relative pt-0.5 text-sm leading-relaxed text-foreground/90">{item}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
