import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { JsonLd } from "@/components/seo/json-ld";
import { localeUrl, breadcrumbLd, socialMeta, courseEntityId, SITE_URL } from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";
import {
  getGeoCoursePage,
  geoContent,
  geoCoursePath,
  geoLocale,
  geoPagesBySegment,
} from "@/features/marketing/lib/geo-course-pages";
import {
  GeoCourseLanding,
  type GeoTestimonial,
} from "@/features/marketing/components/geo-course-landing";

/**
 * One market page, as a route factory.
 *
 * Every programme's market pages behave identically — same metadata rules, same
 * structured data, same 404-unless-written contract — and differ only in which
 * URL segment they answer on. Copying this file per programme would mean the
 * next canonical or schema fix has to be made three times and would be made
 * twice, so the segment is a parameter and the route files are four lines each.
 *
 * Usage, in `app/[locale]/(public)/<segment>/[country]/page.tsx`:
 *
 * ```tsx
 * const route = geoMarketRoute("infection-control-diploma");
 * export const generateStaticParams = route.generateStaticParams;
 * export const generateMetadata = route.generateMetadata;
 * export default route.Page;
 * ```
 */

type RouteParams = { params: Promise<{ locale: string; country: string }> };

/** Prices and consented reviews come from the same record the course page uses. */
async function loadCourse(slug: string) {
  const res = await dal.courses.fetchCourses();
  return (res.ok ? res.data : []).find((c) => c.slug === slug) ?? null;
}

export function geoMarketRoute(segment: string) {
  function generateStaticParams() {
    return geoPagesBySegment(segment).map((p) => ({ country: p.country }));
  }

  async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
    const { locale, country } = await params;
    const page = getGeoCoursePage(segment, country);
    if (!page) return {};
    const c = geoContent(page, locale);
    const path = geoCoursePath(page);
    /*
     * A market page exists in the locales it was written in. Until its Arabic
     * mirror is authored, /ar/<segment>/<market> serves the English text, so it
     * canonicalises to the English URL and advertises no `ar` alternate —
     * claiming one would send Google looking for a translation and find English.
     */
    const written = geoLocale(page, locale);
    const canonical = localeUrl(path, written);
    const languages: Record<string, string> = { en: localeUrl(path, "en") };
    if (page.ar) languages.ar = localeUrl(path, "ar");
    languages["x-default"] = localeUrl(path, "en");

    return mergeSeo(path, {
      // Absolute: the title already names the country and the credential, and
      // the layout's brand suffix would push it past the SERP truncation point.
      title: { absolute: c.title },
      description: c.metaDescription,
      /*
       * Self-referencing canonical. Pointing this at the course page would tell
       * Google the page is a duplicate and hand the ranking straight back to the
       * generic page — which is the problem this page exists to fix.
       */
      alternates: { canonical, languages },
      ...socialMeta({
        title: c.h1,
        description: c.metaDescription,
        path,
        locale,
      }),
    });
  }

  async function Page({ params }: RouteParams) {
    const { locale, country } = await params;
    setRequestLocale(locale);

    const page = getGeoCoursePage(segment, country);
    if (!page) notFound();

    const course = await loadCourse(page.courseSlug);
    if (!course || course.status !== "published") notFound();

    const c = geoContent(page, locale);
    const ar = locale === "ar";
    const courseTitle = ar ? course.titleAr || course.titleEn : course.titleEn;

    const price =
      page.currency === "SAR"
        ? { list: course.priceSAR ?? 0, sale: course.salePriceSAR ?? 0 }
        : page.currency === "USD"
          ? { list: course.priceUSD ?? 0, sale: course.salePriceUSD ?? 0 }
          : { list: course.priceEGP, sale: course.salePriceEGP };

    /*
     * Country-attributed testimonials, from the course's own consented reviews.
     *
     * `mapCourse` has already dropped anything without `consentToPublish`, so
     * this only narrows by country. Where a course holds no text reviews the
     * section simply does not render. There is no placeholder path: a fabricated
     * student is exactly the kind of content this codebase spent a lint rule to
     * make impossible.
     */
    const testimonials: GeoTestimonial[] = (course.textReviews ?? [])
      .filter(
        (r) =>
          (r.country ?? "").trim().toLowerCase() === page.countryCode.toLowerCase() ||
          (r.country ?? "").trim().toLowerCase() === page.en.countryName.toLowerCase(),
      )
      .map((r) => ({
        name: r.reviewerName,
        role: r.title,
        quote: r.comment,
        rating: r.rating,
      }))
      .filter((t) => !!t.name && !!t.quote);

    const path = geoCoursePath(page);
    const written = geoLocale(page, locale);
    const crumb = breadcrumbLd([
      { name: ar ? "الرئيسية" : "Home", url: localeUrl("/", locale) },
      { name: ar ? "الكورسات" : "Courses", url: localeUrl("/courses", locale) },
      { name: courseTitle, url: localeUrl(`/courses/${page.courseSlug}`, locale) },
      { name: c.h1, url: localeUrl(path, locale) },
    ]);

    /*
     * One Offer, scoped to this market, attached to the course entity that lives
     * on the course page. Deliberately NOT a second Course node: two Course
     * entities for one product forces Google to choose which is canonical for
     * the product, and it would not choose the course page.
     */
    const offerLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}${path}`,
      name: c.h1,
      inLanguage: written,
      mainEntity: {
        "@type": "Offer",
        itemOffered: { "@id": courseEntityId(page.courseSlug) },
        price: String(price.sale > 0 ? price.sale : price.list),
        priceCurrency: page.currency,
        areaServed: { "@type": "Country", name: page.en.countryName },
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}${path}`,
      },
    };

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const applyWebhook =
      page.courseSlug === "cphq-preparation" ? "https://aut.jobova.net/webhook/cphq" : undefined;

    return (
      <>
        <JsonLd data={[crumb, offerLd, faqLd]} />
        <nav
          aria-label="Breadcrumb"
          className="mx-auto flex max-w-4xl flex-wrap items-center gap-1 px-4 pt-8 text-xs text-muted-foreground sm:px-6"
        >
          <Link href="/" className="hover:text-foreground">
            {ar ? "الرئيسية" : "Home"}
          </Link>
          <ChevronRight className="size-3.5 rtl:rotate-180" />
          <Link href={`/courses/${page.courseSlug}`} className="hover:text-foreground">
            {courseTitle}
          </Link>
          <ChevronRight className="size-3.5 rtl:rotate-180" />
          <span className="line-clamp-1 text-foreground">{c.countryName}</span>
        </nav>

        <GeoCourseLanding
          page={page}
          locale={locale}
          courseId={course.id}
          courseTitle={courseTitle}
          listPrice={price.list}
          salePrice={price.sale}
          testimonials={testimonials}
          webhookUrl={applyWebhook}
          source={`money-page:${page.courseSlug}:${page.country}`}
        />
      </>
    );
  }

  return { generateStaticParams, generateMetadata, Page };
}
