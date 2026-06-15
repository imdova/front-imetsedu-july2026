import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { StudentsManagement } from "@/features/admin/components/students-management";

export default async function AdminStudentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [studentsRes, statsRes] = await Promise.all([
    dal.studentsMgmt.fetchSmStudents(),
    dal.studentsMgmt.fetchSmStats(),
  ]);

  const stats = statsRes.ok ? statsRes.data : { total: 0, inGroups: 0, newThisMonth: 0, certificates: 0 };

  return (
    <div className="mx-auto max-w-[1500px]">
      <StudentsManagement students={studentsRes.ok ? studentsRes.data : []} stats={stats} />
    </div>
  );
}
