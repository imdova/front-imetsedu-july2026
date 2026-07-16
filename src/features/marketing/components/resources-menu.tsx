"use client";

import * as React from "react";
import { ChevronDown, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getIcon } from "@/components/layout/icon-map";

export interface ResourceLink {
  href: string;
  label: string;
  desc: string;
  icon: string;
}

/**
 * "Resources" dropdown for the public header — Blog and the other free tools
 * that used to be scattered across the navbar (or buried in the footer).
 *
 * Same interaction contract as the courses mega menu: hover with a close delay,
 * click for touch, Esc + focus-out to close.
 */
export function ResourcesMenu({
  label,
  lead,
  links,
  active,
  onDark = false,
}: {
  label: string;
  lead: string;
  links: ResourceLink[];
  active?: boolean;
  onDark?: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<number | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };
  React.useEffect(() => () => cancelClose(), []);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!links.length) return null;

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          onDark
            ? active || open ? "text-white" : "text-white/75 hover:text-white"
            : active || open ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {label}
        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
      </button>

      <div
        className={cn(
          "absolute top-full z-50 w-80 origin-top pt-2 transition-all duration-200 start-0",
          open ? "pointer-events-auto opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1",
        )}
      >
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/98 p-2 shadow-2xl shadow-blue-950/10 backdrop-blur-xl ring-1 ring-black/5">
          <p className="px-3 pb-1.5 pt-1 text-[11px] text-muted-foreground">{lead}</p>
          <ul>
            {links.map((l) => {
              const Icon = getIcon(l.icon);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 text-sm font-semibold text-foreground group-hover:text-primary">
                        {l.label}
                        <ArrowRight className="size-3 opacity-0 transition-all group-hover:opacity-100 rtl:rotate-180" />
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{l.desc}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
