import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { GroupSettings } from "@/features/admin/components/group-settings";

export default async function AdminGroupSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const [catRes, subRes] = await Promise.all([
    dal.groups.fetchGroupCategories(),
    dal.groups.fetchGroupSubcategories(),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
          <Link href="/admin/groups">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("gsBackToGroups")}
          </Link>
        </Button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{t("gsTitle")}</h1>
      </div>
      <GroupSettings
        categories={catRes.ok ? catRes.data : []}
        subcategories={subRes.ok ? subRes.data : []}
      />
    </div>
  );
}
