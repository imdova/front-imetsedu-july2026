import Script from "next/script";

/**
 * Meta (Facebook) Pixel — base code.
 *
 * App Router manages <head>, so the pixel is injected via `next/script`
 * (`afterInteractive`) rather than a raw <script> in the layout. The ID is
 * overridable via `NEXT_PUBLIC_META_PIXEL_ID` and falls back to the configured
 * default; render nothing when unset so non-prod environments stay clean.
 *
 * Note: the base pixel fires a single `PageView` on initial load. App Router
 * client-side navigations are not auto-tracked — add an `fbq('track','PageView')`
 * on route change if SPA pageviews are needed.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "2378714735952830";

export function MetaPixel() {
  if (!PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
