import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { Link } from "@/i18n/navigation";
import { AutomationBuilder } from "@/features/marketing-admin/components/automation-builder";

export const metadata = { robots: { index: false } };

export default async function AutomationBuilderPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ automationId?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { automationId } = await searchParams;

  const res = automationId ? await dal.emailMarketing.fetchAutomation(automationId) : null;

  if (!res || !res.ok || !res.data) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-muted-foreground">Automation not found.</p>
        <Link href="/admin/marketing/email" className="mt-2 inline-block text-sm text-primary hover:underline">Back to Email Marketing</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] py-2">
      <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading builder…</div>}>
        <AutomationBuilder automation={res.data} />
      </Suspense>
    </div>
  );
}
