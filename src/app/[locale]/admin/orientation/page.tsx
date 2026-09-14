import { redirect } from "@/i18n/navigation";

/**
 * Sales Orientation moved into Office as a tab. This keeps old bookmarks and
 * shared links working; the Office page applies the permission check.
 */
export default async function OrientationRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/admin/crm/office?tab=orientation", locale });
}
