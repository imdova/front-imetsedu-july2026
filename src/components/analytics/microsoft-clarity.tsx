import Script from "next/script";

/**
 * Microsoft Clarity (heatmaps + session recording). Project ID is overridable
 * via `NEXT_PUBLIC_CLARITY_ID`; falls back to the configured default. Injected
 * with `next/script` (App Router manages <head>) `afterInteractive` to keep it
 * off the critical path. Renders nothing when unset.
 */
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "xt3h8pqltv";

export function MicrosoftClarity({ projectId }: { projectId?: string } = {}) {
  const ID = projectId || CLARITY_ID;
  if (!ID) return null;

  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "${ID}");`}
    </Script>
  );
}
