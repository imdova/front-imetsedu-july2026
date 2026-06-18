import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { GroupsManagement } from "@/features/admin/components/groups-management";

export default async function AdminGroupsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [groupsRes, statsRes, categoriesRes, subcategoriesRes] = await Promise.all([
    dal.groups.fetchGroups(),
    dal.groups.fetchGroupStats(),
    dal.groups.fetchGroupCategories(),
    dal.groups.fetchGroupSubcategories(),
  ]);

  const stats = statsRes.ok ? statsRes.data : { total: 0, pending: 0, inprogress: 0, finished: 0, totalStudents: 0, totalRevenue: 0 };

  return (
    <div className="mx-auto max-w-[1500px]">
      <GroupsManagement
        initial={groupsRes.ok ? groupsRes.data : []}
        stats={stats}
        categories={categoriesRes.ok ? categoriesRes.data : []}
        subcategories={subcategoriesRes.ok ? subcategoriesRes.data : []}
      />
    </div>
  );
}
