import { redirect } from "@/i18n/navigation";

/** Consented reviews, added in batches. Cleared early by the cache tags on its data. */
export const revalidate = 3600;

/** Legacy URL — keep bookmarks working; canonical page is /success-stories. */
export default async function ReviewsRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/success-stories", locale });
}
