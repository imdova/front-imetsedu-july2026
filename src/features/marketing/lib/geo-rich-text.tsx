import * as React from "react";

import { Link } from "@/i18n/navigation";

/**
 * The tiny slice of Markdown the market content uses: `[label](/path)` links
 * and `**bold**`.
 *
 * A money page's job is partly to route — to the course page for the full
 * curriculum, and to the articles that answer the question the visitor arrived
 * with. Those links have to sit inside sentences, where they are contextual,
 * rather than in a block of "related reading" nobody reads. That means the
 * content file needs a way to express a link inside a paragraph, and this is
 * the smallest thing that does it.
 *
 * Deliberately not a Markdown library: the content is authored in-house against
 * this exact syntax, and a full parser would accept arbitrary HTML from a
 * content file into a marketing page. Anything it does not recognise renders as
 * literal text, which is a visible, harmless failure rather than a silent one.
 */

/** Matches `[label](/path)` or `**bold**`, capturing the parts. */
const TOKEN = /\[([^\]]+)\]\((\/[^)]*)\)|\*\*([^*]+)\*\*/g;

export function richText(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;

  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));

    const [, label, href, bold] = m;
    if (href) {
      out.push(
        // The i18n Link keeps the reader in their locale — a link written as
        // `/blog/x` resolves to `/ar/blog/x` for an Arabic reader.
        <Link
          key={key++}
          href={href}
          className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
        >
          {label}
        </Link>,
      );
    } else if (bold) {
      out.push(
        <strong key={key++} className="font-semibold text-foreground">
          {bold}
        </strong>,
      );
    }
    last = at + m[0].length;
  }

  if (last < text.length) out.push(text.slice(last));
  return out;
}
