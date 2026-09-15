import { redirect } from "@/i18n/navigation";

/** Sales Orientation moved to its own section; this keeps earlier links working. */
export default async function OldOrientationProgressRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/admin/orientation/progress", locale });
}
