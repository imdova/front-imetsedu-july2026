import { requirePermission } from "@/lib/permission-guard";

export default async function InvoicesLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("finance.invoices.view");
  return <>{children}</>;
}
