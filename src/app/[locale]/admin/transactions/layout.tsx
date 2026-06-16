import { requirePermission } from "@/lib/permission-guard";

export default async function TransactionsLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("finance.refunds.view");
  return <>{children}</>;
}
