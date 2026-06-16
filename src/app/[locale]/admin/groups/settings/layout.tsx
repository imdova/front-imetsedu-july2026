import type { ReactNode } from "react";
import { requireSuperAdmin } from "@/lib/permission-guard";

export default async function AdminGroupsSettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireSuperAdmin();
  return <>{children}</>;
}
