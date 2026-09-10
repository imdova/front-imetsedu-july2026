import { geoMarketRoute } from "@/features/marketing/lib/geo-route";

/**
 * Country landing pages for the CPHQ course (`/cphq-course/egypt`).
 *
 * The segment is `cphq-course` rather than the course slug because that is the
 * URL that shipped first and is already indexed — see `PROGRAM_SEGMENT`.
 */
const route = geoMarketRoute("cphq-course");

export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
