"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import type { LmsCourseContent } from "@/lib/db/admin";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

export function LmsTable({ initialData }: { initialData: LmsCourseContent[] }) {
  const t = useTranslations("Admin");

  const columns: ColumnDef<LmsCourseContent>[] = [
    { accessorKey: "course", header: t("colCourse"), cell: ({ row }) => <span className="font-medium">{row.original.course}</span> },
    { accessorKey: "modules", header: t("colModules"), cell: ({ row }) => <span className="tabular-nums">{row.original.modules}</span> },
    { accessorKey: "lessons", header: t("colLessons"), cell: ({ row }) => <span className="tabular-nums">{row.original.lessons}</span> },
    { accessorKey: "quizzes", header: t("colQuestions"), cell: ({ row }) => <span className="tabular-nums">{row.original.quizzes}</span> },
    { accessorKey: "resources", header: t("colResources"), cell: ({ row }) => <span className="tabular-nums">{row.original.resources}</span> },
    { accessorKey: "updatedAt", header: t("colUpdated"), cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.updatedAt}</span> },
    { accessorKey: "published", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.published ? "published" : "draft"} /> },
  ];

  return <DataTable columns={columns} data={initialData} pageSize={8} />;
}
