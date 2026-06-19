import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { LmsManagement } from "@/features/admin/components/lms-management";

export default async function AdminLmsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [coursesRes, statsRes, catsRes, subcatsRes] = await Promise.all([
    dal.lms.fetchLmsCourses(),
    dal.lms.fetchLmsStats(),
    dal.lms.fetchLmsCategories(),
    dal.lms.fetchLmsSubcategories(),
  ]);

  const stats = statsRes.ok ? statsRes.data : { activeCourses: 0, totalLessons: 0, avgCompletion: 0 };
  const categoryOptions = (catsRes.ok ? catsRes.data : []).map((c) => ({ id: c.id, name: c.name }));
  const subcategoryOptions = (subcatsRes.ok ? subcatsRes.data : []).map((c) => ({ id: c.id, name: c.name, parentId: c.parentId }));

  return (
    <div className="mx-auto max-w-[1400px]">
      <LmsManagement
        initial={coursesRes.ok ? coursesRes.data : []}
        stats={stats}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
      />
    </div>
  );
}
