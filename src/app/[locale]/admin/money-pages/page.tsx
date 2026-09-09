import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { requirePermission } from "@/lib/permission-guard";
import { MoneyPagesWorkspace } from "@/features/money-pages/components/money-pages-workspace";
import {
  builtPaths,
  measureGate,
} from "@/features/money-pages/lib/money-pages";

export const metadata = { robots: { index: false } };

export default async function MoneyPagesAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await requirePermission("marketing.money_pages.view");

  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Nav");

  /*
   * Measured server-side from the deployed content files, so the gate figures
   * in the console are the same ones that gate the build — not a copy that can
   * drift from them.
   */
  const gate = measureGate();
  const built = [...builtPaths()];

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title={t("moneyPages")} description={t("moneyPagesDesc")} />
      <MoneyPagesWorkspace gate={gate} built={built} />
    </div>
  );
}
