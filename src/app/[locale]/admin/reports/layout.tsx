import type { ReactNode } from "react";
import { requireSuperAdmin } from "@/lib/permission-guard";

export default async function AdminReportsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSuperAdmin();
  return <>{children}</>;
}
