import type { ReactNode } from "react";
import { requireSuperAdmin } from "@/lib/permission-guard";

export default async function AdminCoursesSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSuperAdmin();
  return <>{children}</>;
}
