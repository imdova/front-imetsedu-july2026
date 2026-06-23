import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ArticleBlock, ArticleSection, SectionBg } from "@/types/blog";

/* Renders the block-builder layout. Shared by the public detail page and the
 * admin builder's live preview. CTA/button blocks render as real <a> links. */

const BG: Record<SectionBg, string> = {
  default: "",
  muted: "bg-muted/50",
  soft: "bg-primary/5",
  primary: "bg-primary text-primary-foreground",
  dark: "bg-foreground text-background",
  gradient: "bg-gradient-to-br from-primary/10 via-transparent to-primary/5",
};
const COLS: Record<number, string> = {
  1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4",
};
const CALLOUT: Record<string, string> = {
  info: "border-info/40 bg-info/10", tip: "border-primary/40 bg-primary/10",
  warning: "border-warning/40 bg-warning/10", success: "border-success/40 bg-success/10",
};

// eslint-disable-next-line @next/next/no-img-element
const Img = (p: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...p} alt={p.alt ?? ""} />;

function Block({ block: b }: { block: ArticleBlock }) {
  switch (b.type) {
    case "heading": {
      const Tag = (b.level === 3 ? "h3" : "h2") as "h2" | "h3";
      return <Tag className={cn("font-heading font-semibold tracking-tight", b.level === 3 ? "text-xl" : "text-2xl")}>{b.text}</Tag>;
    }
    case "paragraph":
      return b.html
        ? <div className="prose-blog leading-relaxed [&_a]:text-primary [&_a]:underline" dangerouslySetInnerHTML={{ __html: b.html }} />
        : <p className="leading-relaxed text-muted-foreground">{b.text}</p>;
    case "list":
      return b.ordered
        ? <ol className="list-decimal space-y-1 ps-5">{(b.items ?? []).map((it, i) => <li key={i}>{it}</li>)}</ol>
        : <ul className="list-disc space-y-1 ps-5">{(b.items ?? []).map((it, i) => <li key={i}>{it}</li>)}</ul>;
    case "checklist":
      return (
        <ul className="space-y-1.5">
          {(b.items ?? []).map((it, i) => (
            <li key={i} className="flex items-start gap-2"><span className="mt-0.5 text-success">✓</span>{it}</li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="border-s-4 border-primary/40 ps-4 italic text-foreground/90">
          “{b.text}”{b.cite && <footer className="mt-1 text-sm not-italic text-muted-foreground">— {b.cite}</footer>}
        </blockquote>
      );
    case "image":
      return (
        <figure className="space-y-2">
          {b.url && <Img src={b.url} alt={b.alt} className="w-full rounded-xl" />}
          {b.caption && <figcaption className="text-center text-xs text-muted-foreground">{b.caption}</figcaption>}
        </figure>
      );
    case "gallery":
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(b.images ?? []).map((im, i) => <Img key={i} src={im.url} alt={im.alt} className="aspect-square w-full rounded-lg object-cover" />)}
        </div>
      );
    case "embed":
      return b.url ? (
        <div className="aspect-video overflow-hidden rounded-xl border border-border/60">
          <iframe src={b.url} className="size-full" allowFullScreen title={b.caption || "Embedded media"} />
        </div>
      ) : null;
    case "table":
      return (
        <div className="overflow-x-auto rounded-xl border border-border/60">
          <table className="w-full text-sm">
            <tbody>
              {(b.rows ?? []).map((row, ri) => (
                <tr key={ri} className={cn("border-b border-border/50 last:border-0", ri === 0 && "bg-muted/40 font-semibold")}>
                  {row.map((cell, ci) => <td key={ci} className="px-3 py-2">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return <pre className="overflow-x-auto rounded-xl bg-foreground p-4 text-xs text-background"><code>{b.text}</code></pre>;
    case "hero":
      return (
        <div className="rounded-2xl bg-gradient-to-br from-primary/15 to-transparent p-8 text-center">
          {b.label && <Badge variant="secondary" className="mb-2">{b.label}</Badge>}
          <h2 className="font-heading text-3xl font-bold">{b.text}</h2>
          {b.caption && <p className="mt-2 text-muted-foreground">{b.caption}</p>}
          {b.url && b.label && <a href={b.url} className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground">{b.label}</a>}
        </div>
      );
    case "stats":
      return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {(b.metrics ?? []).map((m, i) => (
            <div key={i} className="rounded-xl border border-border/60 p-4 text-center">
              <div className="font-heading text-2xl font-bold text-primary">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      );
    case "feature":
      return (
        <div className="rounded-xl border border-border/60 p-5">
          {b.label && <h3 className="font-semibold">{b.label}</h3>}
          <p className="mt-1 text-sm text-muted-foreground">{b.text}</p>
        </div>
      );
    case "testimonial":
      return (
        <div className="rounded-xl bg-muted/50 p-5">
          <p className="italic">“{b.text}”</p>
          {b.cite && <p className="mt-2 text-sm font-medium">{b.cite}</p>}
        </div>
      );
    case "callout":
      return (
        <div className={cn("rounded-xl border p-4", CALLOUT[b.variant ?? "info"] ?? CALLOUT.info)}>
          {b.label && <p className="font-semibold">{b.label}</p>}
          <p className="text-sm">{b.text}</p>
        </div>
      );
    case "faq":
      return (
        <div className="divide-y divide-border/60 rounded-xl border border-border/60">
          {(b.faqs ?? []).map((f, i) => (
            <details key={i} className="group p-4">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      );
    case "cta":
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-primary/10 p-6 text-center sm:flex-row sm:justify-between sm:text-start">
          <p className="font-medium">{b.text}</p>
          {b.url && b.label && <a href={b.url} className="rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground">{b.label}</a>}
        </div>
      );
    case "button":
      return b.url ? <a href={b.url} className="inline-block rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground">{b.label || "Learn more"}</a> : null;
    case "divider":
      return <hr className="border-border/60" />;
    default:
      return null;
  }
}

export function ArticleSections({ sections }: { sections: ArticleSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.id} className={cn("rounded-2xl", BG[section.bg], section.bg !== "default" && "p-6")}>
          <div className={cn("grid grid-cols-1 gap-6", COLS[section.columns] ?? COLS[1])}>
            {section.cols.map((col) => (
              <div key={col.id} className="space-y-4">
                {col.blocks.map((block) => <Block key={block.id} block={block} />)}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Legacy fallback — renders the post's raw `content` HTML when there are no sections. */
export function ArticleContent({ html }: { html: string }) {
  return <div className="prose-blog max-w-none leading-relaxed [&_a]:text-primary [&_a]:underline [&_h2]:mt-6 [&_h2]:font-heading [&_h2]:text-2xl [&_p]:mb-4" dangerouslySetInnerHTML={{ __html: html }} />;
}
