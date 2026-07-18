import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Info,
  Lightbulb,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ArticleBlock, ArticleSection, SectionBg } from "@/types/blog";

/* Renders the block-builder layout. Shared by the public detail page and the
 * admin builder's live preview. CTA/button blocks render as real <a> links.
 * Headings carry a slug `id` so the article's table of contents can anchor to
 * them and scroll-mt keeps them clear of the sticky reading-progress bar. */

const BG: Record<SectionBg, string> = {
  default: "",
  muted: "bg-muted/40 ring-1 ring-border/50",
  soft: "bg-primary/[0.04] ring-1 ring-primary/10",
  primary: "bg-primary text-primary-foreground",
  dark: "bg-foreground text-background",
  gradient:
    "bg-gradient-to-br from-primary/10 via-primary/[0.03] to-transparent ring-1 ring-primary/10",
};
const COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

const CALLOUT: Record<
  string,
  { wrap: string; icon: React.ElementType; tone: string }
> = {
  info: { wrap: "border-info/30 bg-info/[0.07]", icon: Info, tone: "text-info" },
  tip: { wrap: "border-primary/30 bg-primary/[0.06]", icon: Lightbulb, tone: "text-primary" },
  warning: { wrap: "border-warning/40 bg-warning/[0.08]", icon: AlertTriangle, tone: "text-warning" },
  success: { wrap: "border-success/40 bg-success/[0.08]", icon: CheckCircle2, tone: "text-success" },
};

/** Stable, URL-safe heading id used by the table of contents. Must match the
 *  slug the detail page derives from the same text. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// eslint-disable-next-line @next/next/no-img-element
const Img = (p: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...p} alt={p.alt ?? ""} />;

function Block({ block: b }: { block: ArticleBlock }) {
  switch (b.type) {
    case "heading": {
      if (b.level === 3) {
        return (
          <h3
            id={headingId(b.text ?? "")}
            className="scroll-mt-24 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            {b.text}
          </h3>
        );
      }
      return (
        <h2
          id={headingId(b.text ?? "")}
          className="scroll-mt-24 border-s-[3px] border-primary/60 ps-3 font-heading text-2xl font-bold leading-snug tracking-tight text-foreground sm:text-[1.7rem]"
        >
          {b.text}
        </h2>
      );
    }
    case "paragraph":
      return b.html ? (
        <div
          className="text-[1.05rem] leading-[1.85] text-foreground/85 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-2 hover:[&_a]:decoration-primary [&_em]:italic [&_strong]:font-semibold [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ __html: b.html }}
        />
      ) : (
        <p className="text-[1.05rem] leading-[1.85] text-foreground/85">{b.text}</p>
      );
    case "list":
      return b.ordered ? (
        <ol className="ms-1 list-decimal space-y-2 ps-5 text-[1.02rem] leading-relaxed text-foreground/85 marker:font-semibold marker:text-primary">
          {(b.items ?? []).map((it, i) => (
            <li key={i} className="ps-1">{it}</li>
          ))}
        </ol>
      ) : (
        <ul className="ms-1 list-disc space-y-2 ps-5 text-[1.02rem] leading-relaxed text-foreground/85 marker:text-primary/70">
          {(b.items ?? []).map((it, i) => (
            <li key={i} className="ps-1">{it}</li>
          ))}
        </ul>
      );
    case "checklist":
      return (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {(b.items ?? []).map((it, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/50 p-3 text-[0.98rem] leading-relaxed"
            >
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "quote":
      return (
        <blockquote className="relative rounded-2xl bg-muted/40 p-6 ps-8 text-lg font-medium italic leading-relaxed text-foreground/90 ring-1 ring-border/50">
          <span className="absolute start-3 top-1 font-heading text-4xl leading-none text-primary/30">“</span>
          {b.text}
          {b.cite && (
            <footer className="mt-2 text-sm not-italic font-normal text-muted-foreground">— {b.cite}</footer>
          )}
        </blockquote>
      );
    case "image":
      return (
        <figure className="space-y-2">
          {b.url && <Img src={b.url} alt={b.alt} className="w-full rounded-2xl" />}
          {b.caption && <figcaption className="text-center text-xs text-muted-foreground">{b.caption}</figcaption>}
        </figure>
      );
    case "gallery":
      return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {(b.images ?? []).map((im, i) => (
            <Img key={i} src={im.url} alt={im.alt} className="aspect-square w-full rounded-lg object-cover" />
          ))}
        </div>
      );
    case "embed":
      return b.url ? (
        <div className="aspect-video overflow-hidden rounded-2xl border border-border/60">
          <iframe src={b.url} className="size-full" allowFullScreen title={b.caption || "Embedded media"} />
        </div>
      ) : null;
    case "table": {
      const rows = b.rows ?? [];
      const [head, ...body] = rows;
      return (
        <div className="overflow-x-auto rounded-2xl border border-border/60 shadow-sm">
          <table className="w-full border-collapse text-sm">
            {head && (
              <thead>
                <tr className="bg-primary/[0.06] text-start">
                  {head.map((cell, ci) => (
                    <th key={ci} className="border-b border-border/60 px-4 py-3 text-start font-heading font-semibold text-foreground">
                      {cell}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri} className={cn("border-b border-border/40 last:border-0", ri % 2 === 1 && "bg-muted/25")}>
                  {row.map((cell, ci) => (
                    <td key={ci} className={cn("px-4 py-2.5 align-top text-foreground/85", ci === 0 && "font-medium text-foreground")}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "code":
      return (
        <pre className="overflow-x-auto rounded-2xl bg-foreground p-4 text-xs leading-relaxed text-background">
          <code>{b.text}</code>
        </pre>
      );
    case "hero":
      return (
        <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-8 text-center ring-1 ring-primary/10 sm:p-10">
          {b.label && <Badge variant="secondary" className="mb-3">{b.label}</Badge>}
          <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{b.text}</h2>
          {b.caption && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{b.caption}</p>}
          {b.url && b.label && (
            <a href={b.url} className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
              {b.label}
            </a>
          )}
        </div>
      );
    case "stats":
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(b.metrics ?? []).map((m, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/60 p-5 text-center shadow-sm">
              <div className="font-heading text-3xl font-bold text-primary">{m.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</div>
            </div>
          ))}
        </div>
      );
    case "feature":
      return (
        <div className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-sm transition-colors hover:border-primary/30">
          {b.label && <h3 className="font-heading font-semibold text-foreground">{b.label}</h3>}
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.text}</p>
        </div>
      );
    case "testimonial":
      return (
        <div className="rounded-2xl bg-muted/50 p-6 ring-1 ring-border/50">
          <p className="text-lg italic leading-relaxed">“{b.text}”</p>
          {b.cite && <p className="mt-3 text-sm font-medium text-foreground">{b.cite}</p>}
        </div>
      );
    case "callout": {
      const c = CALLOUT[b.variant ?? "info"] ?? CALLOUT.info;
      const Icon = c.icon;
      return (
        <div className={cn("flex gap-3 rounded-2xl border border-s-[3px] p-4 sm:p-5", c.wrap)}>
          <Icon className={cn("mt-0.5 size-5 shrink-0", c.tone)} />
          <div className="min-w-0">
            {b.label && <p className="font-heading font-semibold text-foreground">{b.label}</p>}
            <p className={cn("text-[0.98rem] leading-relaxed text-foreground/85", b.label && "mt-1")}>{b.text}</p>
          </div>
        </div>
      );
    }
    case "faq":
      return (
        <div className="space-y-3">
          {(b.faqs ?? []).map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-border/60 bg-card/40 p-4 transition-colors open:border-primary/30 open:bg-card/70 sm:p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-heading font-semibold text-foreground">
                {f.q}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      );
    case "cta":
      return (
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 text-center ring-1 ring-primary/15 sm:flex-row sm:justify-between sm:p-7 sm:text-start">
          <p className="text-lg font-semibold text-foreground">{b.text}</p>
          {b.url && b.label && (
            <a href={b.url} className="shrink-0 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
              {b.label}
            </a>
          )}
        </div>
      );
    case "button":
      return b.url ? (
        <a href={b.url} className="inline-block rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5">
          {b.label || "Learn more"}
        </a>
      ) : null;
    case "divider":
      return <hr className="border-border/60" />;
    default:
      return null;
  }
}

export function ArticleSections({ sections }: { sections: ArticleSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <section
          key={section.id}
          className={cn(
            "rounded-3xl",
            BG[section.bg],
            section.bg !== "default" && "p-6 sm:p-8",
          )}
        >
          <div className={cn("grid grid-cols-1 gap-6", COLS[section.columns] ?? COLS[1])}>
            {section.cols.map((col) => (
              <div key={col.id} className="space-y-5">
                {col.blocks.map((block) => (
                  <Block key={block.id} block={block} />
                ))}
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
  return (
    <div
      className="text-[1.05rem] leading-[1.85] text-foreground/85 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_h2]:mt-8 [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-heading [&_h3]:text-xl [&_li]:mb-1 [&_ol]:my-4 [&_ol]:ps-5 [&_p]:mb-4 [&_ul]:my-4 [&_ul]:ps-5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
