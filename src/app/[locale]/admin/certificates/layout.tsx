import { requirePermission } from "@/lib/permission-guard";

export default async function CertificatesLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("lms.certificates.view");
  return <>{children}</>;
}
