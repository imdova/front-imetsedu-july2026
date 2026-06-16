import { requirePermission } from "@/lib/permission-guard";

export default async function GroupsLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("crm.groups.view");
  return <>{children}</>;
}
