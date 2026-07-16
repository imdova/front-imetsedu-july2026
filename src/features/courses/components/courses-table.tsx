"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Columns3,
  List,
  LayoutGrid,
  CircleCheckBig,
  CircleX,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import type { CourseRow } from "@/types";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { DIFFICULTY_OPTIONS } from "@/constants/course-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table/data-table";
import {
  BulkActionButton,
  BulkActionsBar,
} from "@/components/shared/data-table/bulk-actions-bar";
import { getCourseColumns } from "./columns";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

interface CoursesTableProps {
  initialData?: CourseRow[];
}

type RangeKey =
  | "all"
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "d30"
  | "d90"
  | "year"
  | "custom";

export function CoursesTable({ initialData }: CoursesTableProps) {
  const t = useTranslations("Courses");
  const tc = useTranslations("Common");

  const [rows, setRows] = React.useState<CourseRow[]>(initialData ?? []);
  const [loading, setLoading] = React.useState(!initialData);
  const [tab, setTab] = React.useState<"all" | "review">("all");
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | "published" | "draft">("all");
  const [category, setCategory] = React.useState("all");
  const [level, setLevel] = React.useState("all");
  const [range, setRange] = React.useState<RangeKey>("all");
  const [hasStudents, setHasStudents] = React.useState(false);
  const [view, setView] = React.useState<"list" | "grid">("list");

  const categories = React.useMemo(
    () => Array.from(new Set((initialData ?? []).map((c) => c.category))),
    [initialData],
  );
  const reviewCount = React.useMemo(
    () => (initialData ?? []).filter((c) => c.status === "draft").length,
    [initialData],
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    const effStatus = tab === "review" ? "draft" : status;
    const res = await dal.courses.fetchCourses({
      search,
      status: effStatus,
      category: category === "all" ? undefined : category,
    });
    if (res.ok) {
      let data = res.data;
      if (level !== "all") data = data.filter((c) => c.difficulty === level);
      if (hasStudents) data = data.filter((c) => c.students > 0);
      setRows(data);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }, [search, status, category, level, hasStudents, tab]);

  const noFilters =
    tab === "all" &&
    !search &&
    status === "all" &&
    category === "all" &&
    level === "all" &&
    !hasStudents;

  // Two jobs that were one effect: fall back to the server rows when no filter
  // is on (a reset, so it belongs in render), and debounce the fetch when one is.
  useResetOnChange([initialData, noFilters], () => {
    if (initialData && noFilters) setRows(initialData);
  });
  React.useEffect(() => {
    if (initialData && noFilters) return;
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load, initialData, noFilters]);

  const handleDelete = React.useCallback(
    async (course: CourseRow) => {
      const res = await dal.courses.deleteCourse(course.id);
      if (res.ok) {
        setRows((prev) => prev.filter((c) => c.id !== course.id));
        toast.success(t("deleted", { title: course.titleEn }));
      } else {
        toast.error(res.error);
      }
    },
    [t],
  );

  const handleDuplicate = React.useCallback(
    async (course: CourseRow) => {
      const res = await dal.courses.duplicateCourse(course.id);
      if (res.ok && res.data) {
        const created = res.data;
        setRows((prev) => [created, ...prev]);
        toast.success(t("duplicated", { title: created.titleEn }));
      } else {
        toast.error((!res.ok && res.error) || t("noResults"));
      }
    },
    [t],
  );

  const columns = React.useMemo(
    () => getCourseColumns({ onDelete: handleDelete, onDuplicate: handleDuplicate, t }),
    [handleDelete, handleDuplicate, t],
  );

  const RANGES: { key: RangeKey; label: string }[] = [
    { key: "all", label: tc("all") },
    { key: "today", label: tc("rangeToday") },
    { key: "yesterday", label: tc("rangeYesterday") },
    { key: "week", label: tc("rangeWeek") },
    { key: "month", label: tc("rangeMonth") },
    { key: "d30", label: tc("range30") },
    { key: "d90", label: tc("range90") },
    { key: "year", label: tc("rangeYear") },
    { key: "custom", label: tc("rangeCustom") },
  ];

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center gap-6 border-b">
        {[
          { key: "all" as const, label: t("allCourses"), count: null },
          { key: "review" as const, label: t("pendingReview"), count: reviewCount },
        ].map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setTab(tabItem.key)}
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
              tab === tabItem.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tabItem.label}
            {tabItem.count !== null && (
              <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[0.7rem] font-semibold text-warning">
                {tabItem.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        isLoading={loading}
        pageSize={8}
        toolbar={(table) => (
          <div className="space-y-3">
            {/* Row 1: search · ranges · columns · view */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchCourses")}
                  className="ps-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/40 p-1">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => setRange(r.key)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      range === r.key
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1.5">
                    <Columns3 className="size-4" />
                    {tc("columns")}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>{tc("columns")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {table
                    .getAllColumns()
                    .filter((c) => c.getCanHide())
                    .map((c) => (
                      <DropdownMenuCheckboxItem
                        key={c.id}
                        checked={c.getIsVisible()}
                        onCheckedChange={(v) => c.toggleVisibility(!!v)}
                        className="capitalize"
                      >
                        {c.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center rounded-lg border p-0.5">
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setView("list")}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </Button>
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="icon-sm"
                  onClick={() => setView("grid")}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </div>
            </div>

            {/* Row 2: filter dropdowns */}
            <div className="flex flex-wrap items-center gap-3">
              <FilterSelect
                label={t("colCategory")}
                value={category}
                onChange={setCategory}
                allLabel={tc("all")}
                options={categories.map((c) => ({ value: c, label: c }))}
              />
              <FilterSelect
                label={t("colLevel")}
                value={level}
                onChange={setLevel}
                allLabel={tc("all")}
                options={DIFFICULTY_OPTIONS.map((d) => ({
                  value: d.value,
                  label: d.label,
                }))}
              />
              <FilterSelect
                label={t("colStatus")}
                value={status}
                onChange={(v) => setStatus(v as typeof status)}
                allLabel={tc("all")}
                options={[
                  { value: "published", label: t("published") },
                  { value: "draft", label: t("draft") },
                ]}
              />
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={hasStudents}
                  onCheckedChange={(v) => setHasStudents(!!v)}
                />
                {t("hasStudents")}
              </label>
            </div>
          </div>
        )}
        bulkBar={(table) => {
          const selected = table.getSelectedRowModel().rows;
          const ids = new Set(selected.map((r) => (r.original as CourseRow).id));

          const bulkUpdateStatus = async (status: CourseRow["status"]) => {
            const targetIds = [...ids];
            const results = await Promise.all(
              targetIds.map((id) => dal.courses.updateCourse(id, { status })),
            );
            const ok = results.filter((r) => r.ok).length;
            if (ok > 0) {
              setRows((prev) => prev.map((c) => (ids.has(c.id) ? { ...c, status } : c)));
              toast.success(
                status === "published"
                  ? t("bulkPublished", { count: ok })
                  : t("bulkUnpublished", { count: ok }),
              );
            }
            const failed = results.find((r) => !r.ok);
            if (failed && !failed.ok) toast.error(failed.error);
            table.resetRowSelection();
          };

          return (
            <BulkActionsBar
              countLabel={tc("selectedCount", { count: selected.length })}
              clearLabel={tc("clear")}
              onClear={() => table.resetRowSelection()}
            >
              <BulkActionButton onClick={() => bulkUpdateStatus("published")}>
                <CircleCheckBig className="size-4" />
                {t("publishAction")}
              </BulkActionButton>
              <BulkActionButton onClick={() => bulkUpdateStatus("draft")}>
                <CircleX className="size-4" />
                {t("unpublishAction")}
              </BulkActionButton>
              <BulkActionButton onClick={() => toast.success(tc("csvExported"))}>
                <Download className="size-4" />
                {tc("exportCsv")}
              </BulkActionButton>
              <BulkActionButton
                tone="destructive"
                onClick={() => {
                  selected.forEach((r) =>
                    handleDelete(r.original as CourseRow),
                  );
                  table.resetRowSelection();
                }}
              >
                <Trash2 className="size-4" />
                {tc("delete")}
              </BulkActionButton>
            </BulkActionsBar>
          );
        }}
        footer={(table) => {
          const selected = table.getFilteredSelectedRowModel().rows.length;
          const total = table.getFilteredRowModel().rows.length;
          return (
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <p className="text-sm text-muted-foreground">
                {tc("rowsSelected", { selected, total })}
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="gap-1"
                >
                  <ChevronLeft className="size-4 rtl:rotate-180" />
                  {tc("previous")}
                </Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {tc("page", {
                    page: table.getState().pagination.pageIndex + 1,
                    total: table.getPageCount() || 1,
                  })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="gap-1"
                >
                  {tc("next")}
                  <ChevronRight className="size-4 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  allLabel: string;
  options: { value: string; label: string }[];
}

/** "Label: Value" styled filter dropdown matching the reference. */
function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  options,
}: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-auto gap-1.5">
        <span className="text-muted-foreground">{label}:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
