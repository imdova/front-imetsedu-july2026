import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { INSTRUCTOR_NAV } from "@/constants/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AdminBootstrap } from "@/components/layout/admin-bootstrap";

/** Instructor workspace shell — teaching, analytics and earnings nav. */
export default async function InstructorLayout({
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
        nav={INSTRUCTOR_NAV}
        homeHref="/instructor/dashboard"
        taglineKey="instructorWorkspace"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader nav={INSTRUCTOR_NAV} showCreate={false} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
