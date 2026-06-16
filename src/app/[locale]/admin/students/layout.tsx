import { requirePermission } from "@/lib/permission-guard";

export default async function StudentsLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("students.directory.view");
  return <>{children}</>;
}
