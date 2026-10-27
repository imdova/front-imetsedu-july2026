import { NextResponse } from "next/server";

import { dal } from "@/lib/dal";
import { courseHaystack } from "@/features/marketing/lib/smart-course-search";

/**
 * The full search text for every published course, fetched on demand by the
 * catalog's search box.
 *
 * The page itself carries only a short haystack per course. The full one — with
 * each description and every module and lesson title — is the bulk of a course
 * record, and inlining it put hundreds of kilobytes into /courses for the sake
 * of a feature most visitors never touch. Fetching it when the search box is
 * first focused keeps every word searchable and costs the page nothing.
 *
 * `force-dynamic` rather than a prerendered route: this is a function of data
 * the API serves, and a build with the API unreachable must not fail over it.
 * The upstream fetch is still served from Next's data cache, and the explicit
 * Cache-Control lets the CDN hold the response.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await dal.courses.fetchPublishedCourses();
  if (!res.ok) {
    // An error status is not cached, so the next focus retries.
    return NextResponse.json({ message: "Course data unavailable" }, { status: 503 });
  }

  const index: Record<string, string> = {};
  for (const course of res.data) index[course.id] = courseHaystack(course);

  return NextResponse.json(index, {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" },
  });
}
