import { redirect } from "@/i18n/navigation";

export default async function InstructorIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/instructor/dashboard", locale });
}
