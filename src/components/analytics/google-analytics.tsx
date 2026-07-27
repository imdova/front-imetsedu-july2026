import Script from "next/script";

/**
 * Google Analytics 4 (gtag.js) loader. The measurement ID comes from Site
 * Settings → Integrations (`gaMeasurementId`), overridable via
 * `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Renders nothing when unset so non-configured
 * environments stay clean. Loaded `afterInteractive` to keep it off the
 * critical path; the base config fires the automatic `page_view`.
 */
const ENV_GA = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export function GoogleAnalytics({ measurementId }: { measurementId?: string } = {}) {
  const GA = measurementId || ENV_GA;
  if (!GA) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA}');`}
      </Script>
    </>
  );
}
