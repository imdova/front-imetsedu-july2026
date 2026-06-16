import type { ReactNode } from "react";
import { requireSuperAdmin } from "@/lib/permission-guard";

export default async function AdminCrmSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSuperAdmin();
  return <>{children}</>;
}
