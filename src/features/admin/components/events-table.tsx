"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import type { AdminEvent, AdminEventType } from "@/lib/db/admin";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

const TYPE_KEY: Record<AdminEventType, string> = {
  webinar: "evWebinar",
  workshop: "evWorkshop",
  orientation: "evOrientation",
};

export function EventsTable({ initialData }: { initialData: AdminEvent[] }) {
  const t = useTranslations("Admin");

  const columns: ColumnDef<AdminEvent>[] = [
    { accessorKey: "title", header: t("colTitle"), cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
    { accessorKey: "type", header: t("colType"), cell: ({ row }) => <Badge variant="secondary">{t(TYPE_KEY[row.original.type])}</Badge> },
    { accessorKey: "host", header: t("colHost"), cell: ({ row }) => <span className="text-muted-foreground">{row.original.host}</span> },
    { accessorKey: "date", header: t("colDate"), cell: ({ row }) => <span className="tabular-nums">{row.original.date} · {row.original.time}</span> },
    { accessorKey: "registered", header: t("colRegistered"), cell: ({ row }) => <span className="tabular-nums">{row.original.registered}/{row.original.capacity}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
  ];

  return <DataTable columns={columns} data={initialData} pageSize={8} />;
}
