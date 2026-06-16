import { requirePermission } from "@/lib/permission-guard";

export default async function CoursesLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("lms.courses.view");
  return <>{children}</>;
}
