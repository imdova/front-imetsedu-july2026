import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import {
  OrientationTaskSubmissions,
  type TaskSummary,
} from "@/features/orientation/components/orientation-task-submissions";
import { resolveOrientation } from "@/features/orientation/lib/sales-orientation";

export const metadata = { robots: { index: false } };

/** Team answers to Sales Orientation tasks — super-admin only (the backend requires admin). */
export default async function OrientationTasksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const saved = await dal.orientation.fetchSalesOrientation();
  if (!saved.ok) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Couldn&apos;t load the training: {saved.error}
      </div>
    );
  }

  const tasks: TaskSummary[] = resolveOrientation(saved.data)
    .lessons.filter((l) => l.kind === "task" && l.task)
    .map((l) => ({ id: l.id, title: l.short, task: l.task! }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <OrientationTaskSubmissions tasks={tasks} />
    </div>
  );
}
