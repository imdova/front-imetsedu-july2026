"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import { useRouter } from "@/i18n/navigation";
import type { Assignment } from "@/lib/db/admin";
import { DataTable } from "@/components/shared/data-table/data-table";

export function AssignmentsTable({ initialData }: { initialData: Assignment[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const columns: ColumnDef<Assignment>[] = [
    { accessorKey: "title", header: t("colTitle"), cell: ({ row }) => (
      <button type="button" onClick={() => router.push(`/admin/assignments/${row.original.id}`)} className="font-medium hover:text-primary">{row.original.title}</button>) },
    { accessorKey: "course", header: t("colCourse"), cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.course}</span> },
    { accessorKey: "dueDate", header: t("colDue"), cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.dueDate}</span> },
    { accessorKey: "submissions", header: t("colSubmissions"), cell: ({ row }) => <span className="tabular-nums">{row.original.submissions}</span> },
    { accessorKey: "graded", header: t("colGraded"), cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"><div className="h-full bg-success" style={{ width: `${Math.round((row.original.graded / row.original.submissions) * 100)}%` }} /></div>
        <span className="text-xs tabular-nums text-muted-foreground">{row.original.graded}/{row.original.submissions}</span>
      </div>) },
  ];
  return <DataTable columns={columns} data={initialData} pageSize={8} />;
}
