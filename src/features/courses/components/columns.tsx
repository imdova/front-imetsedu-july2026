"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Copy,
  Star,
  Crown,
  Sparkles,
} from "lucide-react";

import type { CourseRow } from "@/types";
import { Link } from "@/i18n/navigation";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTableColumnHeader } from "@/components/shared/data-table/data-table-column-header";
import { StatusBadge, DifficultyBadge } from "./course-badges";

type CoursesT = ReturnType<typeof useTranslations<"Courses">>;

interface ColumnOptions {
  onDelete: (course: CourseRow) => void;
  onDuplicate: (course: CourseRow) => void;
  t: CoursesT;
}

export function getCourseColumns({
  onDelete,
  onDuplicate,
  t,
}: ColumnOptions): ColumnDef<CourseRow>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
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
    },
    {
      accessorKey: "titleEn",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("colCourse")} />
      ),
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <Image
                src={c.thumbnailUrl}
                alt={c.titleEn}
                fill
                sizes="44px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-medium">{c.titleEn}</p>
                <CourseFlags course={c} />
              </div>
              <p className="truncate text-xs text-muted-foreground" dir="rtl">
                {c.titleAr}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: t("colCategory"),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.category}
        </span>
      ),
    },
    {
      accessorKey: "difficulty",
      header: t("colLevel"),
      cell: ({ row }) => <DifficultyBadge level={row.original.difficulty} />,
    },
    {
      accessorKey: "priceEGP",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("colPrice")} />
      ),
      cell: ({ row }) => {
        const { priceEGP, salePriceEGP } = row.original;
        const onSale = salePriceEGP > 0 && salePriceEGP < priceEGP;
        return (
          <div className="tabular-nums">
            <span className="font-medium">
              {formatCurrency(onSale ? salePriceEGP : priceEGP, "EGP")}
            </span>
            {onSale && (
              <span className="ms-1.5 text-xs text-muted-foreground line-through">
                {formatCurrency(priceEGP, "EGP")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "students",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("colStudents")} />
      ),
      cell: ({ row }) => (
        <span className="tabular-nums">
          {formatCompact(row.original.students)}
        </span>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title={t("colRating")} />
      ),
      cell: ({ row }) =>
        row.original.rating > 0 ? (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star className="size-3.5 fill-warning text-warning" />
            {row.original.rating.toFixed(1)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "status",
      header: t("colStatus"),
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          course={row.original}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
        />
      ),
      enableSorting: false,
    },
  ];
}

/** Small inline flag icons for featured / bestseller / top-rated courses. */
function CourseFlags({ course }: { course: CourseRow }) {
  const t = useTranslations("Courses");
  return (
    <span className="flex items-center gap-1">
      {course.isFeatured && (
        <Flag icon={<Sparkles className="size-3" />} label={t("featured")} />
      )}
      {course.isBestseller && (
        <Flag icon={<Crown className="size-3" />} label={t("bestseller")} />
      )}
      {course.isTopRated && (
        <Flag icon={<Star className="size-3" />} label={t("topRated")} />
      )}
    </span>
  );
}

function Flag({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="grid size-4 place-items-center rounded text-primary">
          {icon}
        </span>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function RowActions({
  course,
  onDelete,
  onDuplicate,
}: {
  course: CourseRow;
  onDelete: (course: CourseRow) => void;
  onDuplicate: (course: CourseRow) => void;
}) {
  const tc = useTranslations("Common");
  const t = useTranslations("Courses");
  return (
    <div className="text-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
            <span className="sr-only">{tc("edit")}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem asChild>
            <Link href={`/courses/${course.slug}`}>
              <Eye className="size-4" /> {tc("view")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/courses/${course.id}/edit`}>
              <Pencil className="size-4" /> {tc("edit")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate(course)}>
            <Copy className="size-4" /> {t("duplicateAction")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => onDelete(course)}>
            <Trash2 className="size-4" /> {tc("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
