import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { StudentProfileForm } from "@/features/student/components/student-profile-form";
import type { StudentProfile } from "@/lib/student/map-profile";

const EMPTY_PROFILE: StudentProfile = {
  name: "", email: "", phone: "", phoneCountryCode: "+20", whatsApp: "", whatsAppCountryCode: "+20",
  country: "", city: "", specialty: "", educationLevel: "", jobTitle: "", aboutMe: "",
  dateOfBirth: "", gender: "", image: "", linkedInUrl: "", memberSince: "—", isActive: true, completion: 0,
};

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");

  const res = await dal.student.fetchProfile();

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <PageHeader title={t("profileTitle")} description={t("profileSubtitle")} />
      <StudentProfileForm profile={res.ok ? res.data : EMPTY_PROFILE} />
    </div>
  );
}
