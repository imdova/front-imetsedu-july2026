"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import { useRouter } from "@/i18n/navigation";
import type { AdminQuiz } from "@/lib/db/admin";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

export function QuizzesTable({ initialData }: { initialData: AdminQuiz[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const columns: ColumnDef<AdminQuiz>[] = [
    { accessorKey: "title", header: t("colTitle"), cell: ({ row }) => (
      <button type="button" onClick={() => router.push(`/admin/quizzes/${row.original.id}`)} className="font-medium hover:text-primary">{row.original.title}</button>) },
    { accessorKey: "category", header: t("colCategory"), cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge> },
    { accessorKey: "questions", header: t("colQuestions"), cell: ({ row }) => <span className="tabular-nums">{row.original.questions}</span> },
    { accessorKey: "attempts", header: t("colAttempts"), cell: ({ row }) => <span className="tabular-nums">{row.original.attempts}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
  ];
  return <DataTable columns={columns} data={initialData} pageSize={8} />;
}
