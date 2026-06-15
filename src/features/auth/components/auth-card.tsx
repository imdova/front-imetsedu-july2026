import * as React from "react";

/** Shared presentational shell for auth forms. */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-7 shadow-lg sm:p-8">
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
      {footer && (
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      )}
    </div>
  );
}
