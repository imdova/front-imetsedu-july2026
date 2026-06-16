import { requirePermission } from "@/lib/permission-guard";

export default async function LmsLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("lms.courses.view");
  return <>{children}</>;
}
