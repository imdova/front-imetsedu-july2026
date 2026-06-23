import { redirect } from "next/navigation";

/**
 * Compatibility redirect: the healthcare-licensing landing page is canonically
 * served at `/lp/healthcare-licensing` (where tracking + the registry row live).
 * This catches the older `/courses/lp/healthcare-licensing` link and forwards it,
 * preserving locale.
 */
export default async function CoursesLpRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect(locale === "ar" ? "/ar/lp/healthcare-licensing" : "/lp/healthcare-licensing");
}
