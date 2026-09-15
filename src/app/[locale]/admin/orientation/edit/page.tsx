import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { requireSuperAdmin } from "@/lib/permission-guard";
import { OrientationEditor } from "@/features/orientation/components/orientation-editor";
import { resolveOrientation } from "@/features/orientation/lib/sales-orientation";

export const metadata = { robots: { index: false } };

/** Sales Orientation editor — super-admin only (the backend requires admin to save). */
export default async function OrientationEditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSuperAdmin();

  const [saved, coursesRes] = await Promise.all([
    dal.orientation.fetchSalesOrientation(),
    dal.courses.fetchCourses(),
  ]);

  if (!saved.ok) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
        Couldn&apos;t load the saved training: {saved.error}. Nothing was changed — try again shortly.
      </div>
    );
  }

  const courses = coursesRes.ok
    ? coursesRes.data
        .filter((c) => c.slug)
        .map((c) => ({ slug: c.slug, title: `${c.titleEn || c.titleAr}${c.status === "published" ? "" : " (not published)"}` }))
    : [];

  return (
    <div className="mx-auto max-w-[1400px]">
      <OrientationEditor
        initial={resolveOrientation(saved.data)}
        customised={!!saved.data}
        updatedAt={saved.data?.updatedAt ?? null}
        courses={courses}
      />
    </div>
  );
}
