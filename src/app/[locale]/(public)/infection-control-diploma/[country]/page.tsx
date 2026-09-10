import { geoMarketRoute } from "@/features/marketing/lib/geo-route";

/**
 * Market landing pages for the infection-control-diploma
 * (`/infection-control-diploma/egypt`).
 *
 * Only markets with their own written content resolve — everything else 404s
 * rather than rendering a template with the place name swapped, which is the
 * doorway-page pattern Google penalises. See `geo-course-pages.ts`.
 */
const route = geoMarketRoute("infection-control-diploma");

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
