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
  type GeoCoursePage,
} from "@/features/marketing/lib/geo-course-pages";
import {
  GeoCourseLanding,
  type GeoTestimonial,
} from "@/features/marketing/components/geo-course-landing";
import { plainText } from "@/features/marketing/lib/geo-rich-text";
import { formatCurrency } from "@/lib/utils";

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

type LoadedCourse = NonNullable<Awaited<ReturnType<typeof loadCourse>>>;

/** The market's own currency, list and sale, from the stored offer. */
function marketPrice(course: LoadedCourse, currency: GeoCoursePage["currency"]) {
  return currency === "SAR"
    ? { list: course.priceSAR ?? 0, sale: course.salePriceSAR ?? 0 }
    : currency === "USD"
      ? { list: course.priceUSD ?? 0, sale: course.salePriceUSD ?? 0 }
      : { list: course.priceEGP, sale: course.salePriceEGP };
}

/** What the page displays as *the* price — the sale figure when one applies. */
function shownPriceOf(course: LoadedCourse, currency: GeoCoursePage["currency"]): string {
  const p = marketPrice(course, currency);
  return formatCurrency(p.sale > 0 && p.sale < p.list ? p.sale : p.list, currency);
}

export function geoMarketRoute(segment: string) {
  function generateStaticParams() {
    return geoPagesBySegment(segment).map((p) => ({ country: p.country }));
  }

  async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
    const { locale, country } = await params;
    const page = getGeoCoursePage(segment, country);
    if (!page) return {};
    /*
     * The course is loaded here as well as in the page body because the meta
     * description quotes the price. A market page whose whole pitch is "here is
     * what this costs in your currency" wants that figure in the SERP snippet,
     * and the `{price}` placeholder is only substituted where something does the
     * substituting — the visible copy did, the description did not, so every
     * wave-2 page was publishing the literal token to search results.
     *
     * No course means the page itself 404s, so there is no metadata to emit.
     */
    const course = await loadCourse(page.courseSlug);
    if (!course || course.status !== "published") return {};

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
      description: plainText(c.metaDescription, shownPriceOf(course, page.currency)),
      /*
       * Self-referencing canonical. Pointing this at the course page would tell
       * Google the page is a duplicate and hand the ranking straight back to the
       * generic page — which is the problem this page exists to fix.
       */
      alternates: { canonical, languages },
      ...socialMeta({
        title: c.h1,
        description: plainText(c.metaDescription, shownPriceOf(course, page.currency)),
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

    const price = marketPrice(course, page.currency);

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

    /*
     * The FAQ answers go through the same two substitutions the visible page
     * applies: the `{price}` placeholder becomes the market's real price, and
     * `[label](/path)` becomes its label. Emitting the raw field would publish
     * "{price}, priced in Egyptian pounds" into the FAQ rich result.
     */
    const shownPrice = shownPriceOf(course, page.currency);
    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({
        "@type": "Question",
        name: plainText(f.q, shownPrice),
        acceptedAnswer: { "@type": "Answer", text: plainText(f.a, shownPrice) },
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
