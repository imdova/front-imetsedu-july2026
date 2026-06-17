import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { StaffProfileForm } from "@/features/staff/components/staff-profile-form";

export default async function StaffProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("Nav");
  const t = await getTranslations("Staff");

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <PageHeader title={tn("profile")} description={t("profileSubtitle")} />
      <StaffProfileForm />
    </div>
  );
}
