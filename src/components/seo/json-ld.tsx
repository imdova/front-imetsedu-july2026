/**
 * Renders one or more JSON-LD objects as a `<script type="application/ld+json">`.
 * Server component — safe to render inside server pages/layouts.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user-controlled `<` survives.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
