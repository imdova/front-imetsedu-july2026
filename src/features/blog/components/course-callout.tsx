import { ArrowRight, GraduationCap } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CourseRow } from "@/types";
import { courseAnchorText, courseCalloutBlurb } from "@/features/blog/lib/course-anchors";
import {
  geoContent,
  geoCoursePath,
  type GeoCoursePage,
} from "@/features/marketing/lib/geo-course-pages";

/**
 * A single in-body link from an article to the course it supports.
 *
 * Rendered after the article's first major section rather than under the tags:
 * a link below the fold of a 2,000-word page is read as boilerplate by both
 * readers and crawlers. The anchor is a varied phrase (see `course-anchors.ts`),
 * not the course title repeated across all 48 posts.
 *
 * Server-rendered — it must be present in view-source, not injected on the
 * client, or it does not count as a link at all.
 */
export function CourseCallout({
  course,
  postSlug,
  locale,
  markets = [],
}: {
  course: CourseRow;
  postSlug: string;
  locale: string;
  /**
   * Market pages that cite this article. Rendered as a second line so the
   * reader who has already decided *where* they are can jump straight to local
   * fees and exam dates — and so those pages stop being reachable only from the
   * course page.
   */
  markets?: GeoCoursePage[];
}) {
  const anchor = courseAnchorText(course, postSlug, locale);
  const blurb = courseCalloutBlurb(course, locale);
  const ar = locale === "ar";

  return (
    <aside className="my-10 rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <GraduationCap className="size-4" />
        {ar ? "برنامج ذو صلة" : "Related program"}
      </p>

      <p className="mt-3 text-[0.975rem] leading-relaxed text-foreground">
        {ar ? "إذا كنت تطبّق هذا عمليًا، فإن " : "If you are working toward this in practice, "}
        <Link
          href={`/courses/${course.slug}`}
          className="font-semibold text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          {anchor}
        </Link>
        {ar ? " يغطّيه بالتفصيل." : " covers it in depth."}
      </p>

      {/*
        Deliberately the only link in this block. A second "Program details"
        button would give one generic anchor ~50% of all links to this course —
        past the 40% ceiling the varied anchors exist to stay under.
      */}
      <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
        <ArrowRight className="mt-1 size-4 shrink-0 text-primary/70 rtl:rotate-180" />
        <span>{blurb}</span>
      </p>

      {markets.length > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-primary/15 pt-3 text-sm text-muted-foreground">
          <span>{ar ? "بتقدّم من:" : "Applying from:"}</span>
          {markets.map((m) => (
            <Link
              key={m.country}
              href={geoCoursePath(m)}
              className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              {geoContent(m, locale).countryName}
            </Link>
          ))}
          <span>{ar ? "— شوف الرسوم ومواعيد الامتحان عندك." : "— see local fees and exam dates."}</span>
        </p>
      )}
    </aside>
  );
}
