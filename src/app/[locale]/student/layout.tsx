import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { STUDENT_NAV } from "@/constants/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AdminBootstrap } from "@/components/layout/admin-bootstrap";

/** Private workspace — never index. */
export const metadata = { robots: { index: false, follow: false } };

/** Student portal shell — same rail/header chrome, scoped nav. */
export default async function StudentLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-svh bg-muted/30">
      <AdminBootstrap />
      <AppSidebar
        nav={STUDENT_NAV}
        homeHref="/student/dashboard"
        taglineKey="studentPortal"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader nav={STUDENT_NAV} showCreate={false} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
