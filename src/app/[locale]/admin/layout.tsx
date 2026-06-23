import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AdminBootstrap } from "@/components/layout/admin-bootstrap";
import { PermissionsRefresher } from "@/components/layout/permissions-refresher";
import { getTheme } from "@/lib/db/site-settings";

/** Private workspace — never index. */
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const theme = await getTheme().catch(() => null);

  return (
    <div className="flex min-h-svh bg-muted/30">
      <AdminBootstrap />
      <PermissionsRefresher />
      <AppSidebar logoLight={theme?.logoLight} logoDark={theme?.logoDark} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
