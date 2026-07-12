import * as React from "react";

/** Breadcrumb eyebrow + title + description header used atop each SEO sub-page. */
export function SeoPanelHead({
  crumb,
  title,
  description,
  action,
}: {
  crumb: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Configuration / {crumb}
        </p>
        <h2 className="mt-1 font-heading text-xl font-bold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
