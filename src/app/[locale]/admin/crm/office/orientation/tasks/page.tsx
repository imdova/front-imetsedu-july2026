import { redirect } from "@/i18n/navigation";

/** Sales Orientation moved to its own section; this keeps earlier links working. */
export default async function OldOrientationTasksRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: "/admin/orientation/tasks", locale });
}
