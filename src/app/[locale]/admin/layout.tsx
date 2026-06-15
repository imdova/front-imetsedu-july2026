import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AdminBootstrap } from "@/components/layout/admin-bootstrap";

/**
 * Admin console shell: collapsible sidebar rail + sticky header + scrollable
 * content region. The route group `(admin)` keeps the URL clean (no /admin
 * segment) while scoping this layout to console pages.
 */
export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale); // keep nested pages statically rendered per-locale

  return (
    <div className="flex min-h-svh bg-muted/30">
      <AdminBootstrap />
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
