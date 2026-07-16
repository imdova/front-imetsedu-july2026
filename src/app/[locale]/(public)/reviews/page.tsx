import { redirect } from "@/i18n/navigation";

/** Legacy URL — keep bookmarks working; canonical page is /success-stories. */
export default async function ReviewsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/success-stories", locale });
}
