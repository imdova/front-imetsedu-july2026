import { getTranslations, setRequestLocale } from "next-intl/server";

import { PageHeader } from "@/components/shared/page-header";
import { ProfileSettings } from "@/features/student/components/profile-settings";

export default async function InstructorProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tn = await getTranslations("Nav");

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      <PageHeader title={tn("profile")} />
      <ProfileSettings />
    </div>
  );
}
