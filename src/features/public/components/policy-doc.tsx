import { FileText, ShieldCheck, RefreshCcw, GraduationCap, Mail } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { POLICIES, POLICY_ORDER, type PolicyDoc as Doc } from "@/features/public/lib/policy-content";

const ICONS: Record<string, React.ElementType> = {
  terms: FileText,
  enrollment: GraduationCap,
  refund: RefreshCcw,
  privacy: ShieldCheck,
};

export function PolicyDoc({ doc }: { doc: Doc }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-border/60 pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Policies</p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{doc.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {doc.updated}</p>
      </div>

      <div className="mt-8 gap-10 lg:grid lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="mb-10 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
          <nav aria-label="Policies" className="space-y-1">
            {POLICY_ORDER.map((slug) => {
              const p = POLICIES[slug];
              const Icon = ICONS[slug] ?? FileText;
              const active = slug === doc.slug;
              return (
                <Link
                  key={slug}
                  href={`/policy/${slug}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {p.navLabel}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 border-t border-border/60 pt-6">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">On this page</p>
            <ul className="mt-2 space-y-0.5">
              {doc.sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="block rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <article className="min-w-0 max-w-3xl">
          <p className="text-base leading-relaxed text-muted-foreground">{doc.intro}</p>

          <div className="mt-10 space-y-10">
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2 className="font-heading text-xl font-semibold tracking-tight">{s.heading}</h2>
                {s.body?.map((p, i) => (
                  <p key={i} className="mt-3 text-base leading-relaxed text-muted-foreground">{p}</p>
                ))}
                {s.bullets && (
                  <ul className="mt-3 space-y-2">
                    {s.bullets.map((b, i) => (
                      <li key={i} className="flex gap-2.5 text-base leading-relaxed text-muted-foreground">
                        <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.table && (
                  <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
                    <table className="w-full min-w-[26rem] text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                          {s.table.headers.map((h, i) => (
                            <th key={i} className="px-4 py-2.5 text-start font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((r, ri) => (
                          <tr key={ri} className="border-b border-border/40 last:border-0">
                            {r.map((c, ci) => (
                              <td key={ci} className={cn("px-4 py-2.5 align-top", ci === 0 ? "font-medium text-foreground" : "text-muted-foreground")}>{c}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Footer contact */}
          <div className="mt-12 flex flex-col gap-3 rounded-2xl border border-border/60 bg-muted/30 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Mail className="size-5" /></span>
              <div>
                <p className="font-medium">Need help understanding this policy?</p>
                <p className="text-sm text-muted-foreground">Our team is happy to clarify anything.</p>
              </div>
            </div>
            <a href="mailto:support@imetsedu.com" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Contact support
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
