import { requirePermission } from "@/lib/permission-guard";

export default async function PaymentTrackingLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("finance.payment_tracking.view");
  return <>{children}</>;
}
