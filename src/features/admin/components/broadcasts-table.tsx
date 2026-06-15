"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Mail, MessageSquare, Smartphone, Bell } from "lucide-react";

import type { AdminBroadcast, NotificationChannel } from "@/lib/db/admin";
import { formatCompact } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

const CHANNEL: Record<NotificationChannel, { key: string; icon: typeof Mail }> = {
  email: { key: "chEmail", icon: Mail },
  sms: { key: "chSms", icon: Smartphone },
  whatsapp: { key: "chWhatsapp", icon: MessageSquare },
  in_app: { key: "chInApp", icon: Bell },
};

export function BroadcastsTable({ initialData }: { initialData: AdminBroadcast[] }) {
  const t = useTranslations("Admin");

  const columns: ColumnDef<AdminBroadcast>[] = [
    { accessorKey: "title", header: t("colTitle"), cell: ({ row }) => <span className="font-medium">{row.original.title}</span> },
    { accessorKey: "channel", header: t("colChannel"), cell: ({ row }) => {
      const c = CHANNEL[row.original.channel];
      const Icon = c.icon;
      return <Badge variant="secondary" className="gap-1"><Icon className="size-3" />{t(c.key)}</Badge>;
    } },
    { accessorKey: "audience", header: t("colAudience"), cell: ({ row }) => <span className="text-muted-foreground">{row.original.audience}</span> },
    { accessorKey: "reach", header: t("colReach"), cell: ({ row }) => <span className="tabular-nums">{formatCompact(row.original.reach)}</span> },
    { accessorKey: "sentAt", header: t("colSent"), cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.sentAt}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
  ];

  return <DataTable columns={columns} data={initialData} pageSize={8} />;
}
