import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { LmsSettings } from "@/features/admin/components/lms-settings";

export default async function AdminLmsSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [catRes, subRes] = await Promise.all([
    dal.lms.fetchLmsCategories(),
    dal.lms.fetchLmsSubcategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsSettings
        categories={catRes.ok ? catRes.data : []}
        subcategories={subRes.ok ? subRes.data : []}
      />
    </div>
  );
}
