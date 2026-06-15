import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { UserDetail } from "@/features/admin/components/user-detail";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Admin");

  const res = await dal.userManagement.fetchUmUser(id);
  if (!res.ok || !res.data) notFound();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <Button asChild variant="ghost" size="sm" className="gap-1.5 -ms-2">
        <Link href="/admin/users">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("usersTitle")}
        </Link>
      </Button>
      <PageHeader title={res.data.name} description={t("userDetailSubtitle")} />
      <UserDetail user={res.data} />
    </div>
  );
}
