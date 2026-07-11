"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef, RowData } from "@tanstack/react-table";
import { Phone, MessageCircle, Mail, Pencil, Globe, KeyRound } from "lucide-react";
import { toast } from "sonner";

declare module "@tanstack/react-table" {
  // Human-readable label used by the column manager (headers can be JSX).
  interface ColumnMeta<TData extends RowData, TValue> {
    label?: string;
  }
}

import type { Lead } from "@/lib/db/crm";
import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { StageBadge, PriorityBadge } from "./lead-badges";

type CrmT = ReturnType<typeof useTranslations<"Crm">>;

/** Email a "set your password" invite to the lead's user account, with confirm. */
async function sendSetPassword(lead: Lead, t: CrmT) {
  if (!window.confirm(t("setPwConfirm", { name: lead.fullName }))) return;
  const res = await dal.crm.sendLeadSetPassword(lead.id);
  if (res.ok) toast.success(t("setPwSent", { name: lead.fullName }));
  else toast.error(res.error);
}

/** Split a timestamp into a date line and a time line (e.g. "Jul 9, 2026" / "06:22 PM"). */
function fmtDateParts(iso?: string, fallback?: string): { date: string; time: string } {
  if (!iso) return { date: fallback ?? "—", time: "" };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: fallback ?? "—", time: "" };
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function getLeadColumns(
  t: CrmT,
  onOpen: (lead: Lead) => void,
  onEdit: (lead: Lead) => void,
): ColumnDef<Lead>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(v) => row.toggleSelected(!!v)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "rowNumber",
      header: () => <span>{t("colNumber")}</span>,
      // Continuous 1-based number in current sort order, across pages.
      cell: ({ row, table }) => {
        const rows = table.getRowModel().rows;
        const pos = rows.findIndex((r) => r.id === row.id);
        const { pageIndex, pageSize } = table.getState().pagination;
        const n = pos < 0 ? row.index + 1 : pageIndex * pageSize + pos + 1;
        return <span className="text-xs tabular-nums text-muted-foreground">{n}</span>;
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "fullName",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("colLead")} />,
      enableHiding: false,
      cell: ({ row }) => {
        const l = row.original;
        return (
          <button type="button" onClick={() => onOpen(l)} className="flex items-start gap-3 text-start">
            <Avatar className="size-9 border">
              <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{getInitials(l.fullName)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 space-y-0.5">
              <p className="truncate font-medium hover:text-primary">{l.fullName}</p>
              {(l.phone || l.email) && (
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {l.phone ? `${l.phoneCountryCode}${l.phone}` : l.email}
                </p>
              )}
              {l.phone && l.email && <p className="truncate text-xs text-muted-foreground">{l.email}</p>}
              {l.country && (
                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="size-3" />{l.country}
                </p>
              )}
            </div>
          </button>
        );
      },
    },
    {
      accessorKey: "counselorName",
      header: t("colAssignedAgent"),
      meta: { label: t("colAssignedAgent") },
      cell: ({ row }) => {
        const l = row.original;
        const assigned = !!l.counselorId;
        return (
          <span className="inline-flex items-center gap-2 text-sm">
            <span className={`grid size-6 place-items-center rounded-full text-[0.6rem] font-semibold ${assigned ? "bg-chart-2/20 text-chart-2" : "bg-muted text-muted-foreground"}`}>
              {assigned ? getInitials(l.counselorName) : "U"}
            </span>
            <span className={assigned ? "" : "text-muted-foreground"}>
              {assigned ? l.counselorName : t("unassignedLabel")}
            </span>
          </span>
        );
      },
    },
    {
      accessorKey: "specialty",
      header: t("colSpecialty"),
      meta: { label: t("colSpecialty") },
      cell: ({ row }) => <span className="text-sm">{row.original.specialty || "—"}</span>,
    },
    {
      accessorKey: "source",
      header: t("colSource"),
      meta: { label: t("colSource") },
      cell: ({ row }) => {
        const s = row.original.source;
        return s && s !== "—" ? <Badge variant="outline">{s}</Badge> : <span className="text-sm text-muted-foreground">—</span>;
      },
    },
    {
      id: "course",
      header: t("colCourse"),
      meta: { label: t("colCourse") },
      cell: ({ row }) => {
        const names = row.original.courseNames ?? [];
        if (!names.length) return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <span className="inline-flex items-center gap-1 text-sm" title={names.join(", ")}>
            <span className="max-w-[180px] truncate">{names[0]}</span>
            {names.length > 1 && <span className="text-xs text-muted-foreground">+{names.length - 1}</span>}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAtISO",
      header: ({ column }) => <DataTableColumnHeader column={column} title={t("colCreated")} />,
      meta: { label: t("colCreated") },
      cell: ({ row }) => {
        const { date, time } = fmtDateParts(row.original.createdAtISO, row.original.createdAt);
        return (
          <div className="text-xs leading-tight text-muted-foreground">
            <div className="whitespace-nowrap">{date}</div>
            {time && <div className="whitespace-nowrap">{time}</div>}
          </div>
        );
      },
    },
    {
      id: "pipeline",
      header: t("colPipeline"),
      meta: { label: t("colPipeline") },
      cell: ({ row }) =>
        row.original.pipelineName ? (
          <Badge variant="outline" className="gap-1 border-primary/30 text-primary">{row.original.pipelineName}</Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "stageKey",
      header: t("colPipelineStatus"),
      meta: { label: t("colPipelineStatus") },
      cell: ({ row }) => <StageBadge stageKey={row.original.stageKey} />,
    },
    {
      accessorKey: "priority",
      header: t("colStatus"),
      meta: { label: t("colStatus") },
      cell: ({ row }) => <PriorityBadge priority={row.original.priority} />,
    },
    {
      id: "actions",
      header: t("colActions"),
      cell: ({ row }) => {
        const l = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-success" asChild>
              <a href={`tel:${l.phoneCountryCode}${l.phone}`} aria-label={t("callNow")}><Phone className="size-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-success" asChild>
              <a href={`https://wa.me/${(l.whatsApp ?? l.phone).replace(/\D/g, "")}`} target="_blank" rel="noreferrer" aria-label={t("whatsAppNow")}>
                <MessageCircle className="size-4" />
              </a>
            </Button>
            <Button variant="ghost" size="icon" className="size-8" asChild disabled={!l.email}>
              <a href={l.email ? `mailto:${l.email}` : undefined} aria-label={t("actEmail")}><Mail className="size-4" /></a>
            </Button>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(l)} aria-label={t("editLead")}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-primary" onClick={() => sendSetPassword(l, t)} aria-label={t("setPwAction")}>
              <KeyRound className="size-4" />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
