import type { ComponentType, ReactNode } from "react";
import {
  CalendarDays,
  GraduationCap,
  Monitor,
  Star,
  Tag,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

import type { CourseRow } from "@/types";
import { cn, formatCompact } from "@/lib/utils";

function reviewCountFor(course: Pick<CourseRow, "rating" | "students">) {
  if (course.rating <= 0) return 0;
  return Math.max(1, Math.round(course.students * 0.04));
}

function formatHeroPrice(amount: number) {
  return `EGP ${Math.round(amount).toLocaleString("en-US")}`;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating > 0 && i < Math.round(rating);
        return (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              filled
                ? "fill-amber-400 text-amber-400"
                : "fill-white/20 text-white/30",
            )}
          />
        );
      })}
    </span>
  );
}

function MetaDivider() {
  return <span className="hidden h-7 w-px shrink-0 bg-white/25 sm:block" aria-hidden />;
}

function MetaItem({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-white/90">
      <span>{children}</span>
      <Icon className="size-4 shrink-0 text-white/80" aria-hidden />
    </span>
  );
}

export async function CourseHeroMeta({
  course,
  price,
  onSale,
}: {
  course: CourseRow;
  price: number;
  onSale: boolean;
}) {
  const t = await getTranslations("Marketing");
  const reviews = reviewCountFor(course);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 sm:gap-x-4">
      <span className="rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 px-3.5 py-1 text-xs font-semibold text-[#0a1424] shadow-sm ring-1 ring-amber-500/40">
        {t("heroOnline")}
      </span>

      <MetaDivider />

      {course.rating > 0 && (
        <>
          <div className="flex flex-col gap-0.5">
            <StarRating rating={course.rating} />
            <span className="text-[11px] leading-none text-white/65">
              {t("cardReviews", { count: reviews })}
            </span>
          </div>
          <MetaDivider />
        </>
      )}

      <MetaItem icon={GraduationCap}>
        {t("heroStudents", { count: formatCompact(course.students) })}
      </MetaItem>

      <MetaDivider />

      <MetaItem icon={Tag}>
        <span className="inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="font-semibold tabular-nums">{formatHeroPrice(price)}</span>
          {onSale && (
            <span className="text-xs text-red-300 line-through tabular-nums">
              {formatHeroPrice(course.priceEGP)}
            </span>
          )}
        </span>
      </MetaItem>

      <MetaDivider />

      <MetaItem icon={CalendarDays}>{t("cardFrequency")}</MetaItem>

      <MetaDivider />

      <MetaItem icon={Monitor}>{t("heroOnlineZoom")}</MetaItem>
    </div>
  );
}
