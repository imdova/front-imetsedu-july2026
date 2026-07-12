"use client";

import type { ElementType } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Monitor,
  Star,
  Users,
  GraduationCap,
  Radio,
  Languages,
  Flame,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CourseRow } from "@/types";
import { cn, deriveDiscount, formatCompact } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { courseSocialProof } from "@/features/marketing/lib/course-social-proof";

function formatEgp(amount: number) {
  return `${amount.toLocaleString("en-US")} EGP`;
}

export function CourseCard({ course }: { course: CourseRow }) {
  const t = useTranslations("Marketing");
  const onSale =
    course.salePriceEGP > 0 && course.salePriceEGP < course.priceEGP;
  const price = onSale ? course.salePriceEGP : course.priceEGP;
  const discountPct = deriveDiscount(course.priceEGP, course.salePriceEGP);
  const { rating, reviews } = courseSocialProof(course);
  const isBestSeller = course.isBestseller || course.students >= 800;
  const isMostPopular = course.isTopRated || rating >= 4.7;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={`/courses/${course.slug}`}
        className="relative block aspect-[2/1] overflow-hidden bg-muted"
      >
        <Image
          src={course.thumbnailUrl}
          alt={course.titleEn}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 hover:scale-[1.02]"
        />

        <div className="absolute inset-x-2.5 top-2.5 flex flex-wrap gap-1.5">
          {isBestSeller && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f4c430] px-2.5 py-1 text-[11px] font-bold leading-none text-[#051a4a] shadow">
              <Flame className="size-3" /> {t("cardBadgeBestSeller")}
            </span>
          )}
          {isMostPopular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0b3fa8] px-2.5 py-1 text-[11px] font-bold leading-none text-white shadow">
              <Star className="size-3 fill-current" /> {t("cardBadgeMostPopular")}
            </span>
          )}
        </div>

        {onSale && discountPct > 0 && (
          <span className="absolute bottom-2.5 end-2.5 rounded-full bg-[#d32f2f] px-2.5 py-0.5 text-xs font-bold leading-none text-white">
            -{discountPct}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <Link href={`/courses/${course.slug}`} className="group/title">
          <h3 className="line-clamp-2 font-heading text-base font-bold leading-snug text-foreground group-hover/title:text-primary">
            {course.titleEn}
          </h3>
        </Link>

        <div className="flex flex-wrap items-center gap-1.5">
          <StarRating rating={rating} />
          <span className="font-heading text-sm font-bold tabular-nums text-amber-600">
            {rating.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {t("cardReviews", { count: reviews.toLocaleString("en-US") })}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <CardBadge
            icon={GraduationCap}
            label={t("cardBadgeCertificate")}
            tone="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800"
          />
          <CardBadge
            icon={Radio}
            label={t("cardBadgeLive")}
            tone="bg-rose-50 text-rose-700 ring-1 ring-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800"
          />
          <CardBadge
            icon={Languages}
            label={t("cardBadgeBilingual")}
            tone="bg-violet-50 text-violet-700 ring-1 ring-violet-200/80 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-xs text-muted-foreground">
          <MetaItem
            icon={BookOpen}
            iconClassName="text-sky-600 bg-sky-50 dark:bg-sky-950/40"
            label={t("cardLectures", { count: course.lectures })}
          />
          <MetaItem
            icon={CalendarDays}
            iconClassName="text-amber-600 bg-amber-50 dark:bg-amber-950/40"
            label={t("cardFrequency")}
          />
          <MetaItem
            icon={Users}
            iconClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
            label={t("cardStudents", { count: formatCompact(course.students) })}
          />
          <MetaItem
            icon={Monitor}
            iconClassName="text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40"
            label={t("cardOnlineZoom")}
          />
        </div>

        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-1">
          {onSale && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {formatEgp(course.priceEGP)}
            </span>
          )}
          <span className="font-heading text-xl font-bold tabular-nums text-[#1e3a5f] dark:text-primary">
            {formatEgp(price)}
          </span>
        </div>

        <Button asChild className="w-full gap-2 rounded-xl">
          <Link href={`/courses/${course.slug}`}>
            {t("cardDetails")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </Button>
      </div>
    </article>
  );
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
                : "fill-muted text-muted-foreground/35",
            )}
          />
        );
      })}
    </span>
  );
}

function CardBadge({ icon: Icon, label, tone }: { icon: ElementType; label: string; tone: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", tone)}>
      <Icon className="size-3" strokeWidth={2.25} />
      {label}
    </span>
  );
}

function MetaItem({
  icon: Icon,
  iconClassName,
  label,
}: {
  icon: ElementType;
  iconClassName: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-md",
          iconClassName,
        )}
      >
        <Icon className="size-3.5" />
      </span>
      <span className="leading-tight">{label}</span>
    </span>
  );
}
