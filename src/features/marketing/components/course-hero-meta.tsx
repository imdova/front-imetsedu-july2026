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
import { courseSocialProof } from "@/features/marketing/lib/course-social-proof";
import { CoursePrice } from "@/features/marketing/components/course-price";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < Math.round(rating);
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
  locale,
}: {
  course: CourseRow;
  locale: string;
}) {
  const t = await getTranslations("Marketing");
  const { rating, reviews } = courseSocialProof(course);

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-3 sm:gap-x-4">
      <span className="rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 px-3.5 py-1 text-xs font-semibold text-[#0a1424] shadow-sm ring-1 ring-amber-500/40">
        {t("heroOnline")}
      </span>

      <MetaDivider />

      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <StarRating rating={rating} />
          <span className="text-sm font-bold tabular-nums text-amber-300">{rating.toFixed(1)}</span>
        </div>
        <span className="text-[11px] leading-none text-white/65">
          {t("cardReviews", { count: reviews.toLocaleString("en-US") })}
        </span>
      </div>
      <MetaDivider />

      <MetaItem icon={GraduationCap}>
        {t("heroStudents", { count: formatCompact(course.students) })}
      </MetaItem>

      <MetaDivider />

      <MetaItem icon={Tag}>
        <CoursePrice
          locale={locale}
          variant="strip"
          egp={{ price: course.priceEGP, sale: course.salePriceEGP }}
          sar={{ price: course.priceSAR ?? 0, sale: course.salePriceSAR ?? 0 }}
          usd={{ price: course.priceUSD ?? 0, sale: course.salePriceUSD ?? 0 }}
        />
      </MetaItem>

      <MetaDivider />

      <MetaItem icon={CalendarDays}>{t("cardFrequency")}</MetaItem>

      <MetaDivider />

      <MetaItem icon={Monitor}>{t("heroOnlineZoom")}</MetaItem>
    </div>
  );
}
