"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Columns3, Eye, UserPlus, Download, Mail, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { getInitials, cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table/data-table";

type Option = { value: string; label: string };

export interface CourseApplicant {
  id: string;
  student: string;
  email: string;
  courses: string[];
  country: string;
  specialty: string;
  salesAgent: string;
  leadSource: string;
  createdAt: string;
  createdAtISO?: string;
}

const RANGES = ["today", "yesterday", "week", "month", "30d", "90d", "year"] as const;
type Range = (typeof RANGES)[number] | "all";

function inRange(iso: string | undefined, range: Range): boolean {
  if (range === "all") return true;
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const day = 86_400_000;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const ts = d.getTime();
  switch (range) {
    case "today": return ts >= startOfToday;
    case "yesterday": return ts >= startOfToday - day && ts < startOfToday;
    case "week": return ts >= startOfToday - 6 * day;
    case "month": return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    case "30d": return ts >= startOfToday - 29 * day;
    case "90d": return ts >= startOfToday - 89 * day;
    case "year": return d.getFullYear() === now.getFullYear();
    default: return true;
  }
}

const uniqOptions = (vals: string[]): Option[] =>
  Array.from(new Set(vals.filter(Boolean))).map((v) => ({ value: v, label: v }));

export function RegistrationsTable({
  applicants,
  courseOptions,
  counselorOptions,
  counselorAssignOptions = [],
  basePath,
}: {
  applicants: CourseApplicant[];
  courseOptions: Option[];
  counselorOptions: Option[];
  /** Id-keyed counselor options for the bulk "assign sales agent" action. */
  counselorAssignOptions?: Option[];
  basePath: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [assigning, setAssigning] = React.useState(false);

  /** Bulk-assign the selected applicants to a sales agent (counselor). */
  const assignAgent = async (counselorId: string, ids: string[], done: () => void) => {
    if (!ids.length) return;
    setAssigning(true);
    const res = await dal.crm.bulkAssignCounselor(ids, counselorId);
    setAssigning(false);
    if (res.ok) {
      toast.success(t("rgAssignedToast", { n: ids.length }));
      done();
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  /** Download the selected applicants as a CSV (client-side). */
  const exportSelected = (rows: CourseApplicant[]) => {
    const head = ["Student", "Email", "Courses", "Country", "Specialty", "Sales agent", "Source", "Created"];
    const cell = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = rows.map((a) =>
      [a.student, a.email, a.courses.join(" | "), a.country, a.specialty, a.salesAgent, a.leadSource, a.createdAt].map(cell).join(","));
    const csv = [head.map(cell).join(","), ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url; link.download = "registrations.csv"; link.click();
    URL.revokeObjectURL(url);
    toast.success(t("rgExportedToast", { n: rows.length }));
  };

  /** Open a pre-filled email (BCC) to the selected applicants. */
  const emailSelected = (rows: CourseApplicant[]) => {
    const emails = Array.from(new Set(rows.map((a) => a.email).filter(Boolean)));
    if (!emails.length) { toast.error(t("rgNoEmails")); return; }
    window.open(`mailto:?bcc=${encodeURIComponent(emails.join(","))}`, "_self");
  };

  const [search, setSearch] = React.useState("");
  const [course, setCourse] = React.useState("all");
  const [country, setCountry] = React.useState("all");
  const [specialty, setSpecialty] = React.useState("all");
  const [salesAgent, setSalesAgent] = React.useState("all");
  const [group, setGroup] = React.useState("all");
  const [range, setRange] = React.useState<Range>("all");

  const countryOptions = React.useMemo(() => uniqOptions(applicants.map((a) => a.country)), [applicants]);
  const specialtyOptions = React.useMemo(() => uniqOptions(applicants.map((a) => a.specialty)), [applicants]);

  const rows = React.useMemo(
    () =>
      applicants.filter((a) => {
        if (search) {
          const q = search.toLowerCase();
          if (!(a.student.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.courses.join(" ").toLowerCase().includes(q))) return false;
        }
        if (course !== "all" && !a.courses.includes(course)) return false;
        if (country !== "all" && a.country !== country) return false;
        if (specialty !== "all" && a.specialty !== specialty) return false;
        if (salesAgent !== "all" && a.salesAgent !== salesAgent) return false;
        if (range !== "all" && !inRange(a.createdAtISO, range)) return false;
        return true;
      }),
    [applicants, search, course, country, specialty, salesAgent, range],
  );

  const columns = React.useMemo<ColumnDef<CourseApplicant>[]>(() => [
    {
      id: "select",
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label={t("rgSelectAll")}
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label={t("rgSelectRow")} />
      ),
    },
    {
      id: "student",
      header: t("colStudent"),
      cell: ({ row }) => {
        const a = row.original;
        return (
          <button type="button" onClick={() => router.push(`${basePath}/leads/${a.id}`)} className="flex items-center gap-3 text-start">
            <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{getInitials(a.student)}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium hover:text-primary">{a.student}</p>
              {a.email && <p className="truncate text-xs text-muted-foreground">{a.email}</p>}
            </div>
          </button>
        );
      },
    },
    {
      id: "course",
      header: t("colCourse"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.courses.length
            ? row.original.courses.map((c, i) => <Badge key={i} variant="outline" className="border-primary/30 text-primary">{c}</Badge>)
            : <span className="text-xs text-muted-foreground">—</span>}
        </div>
      ),
    },
    { id: "createdAt", header: t("colCreated"), cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.createdAt}</span> },
    { id: "country", header: t("rgCountry"), cell: ({ row }) => <span className="text-sm">{row.original.country || "—"}</span> },
    { id: "specialty", header: t("rgSpeciality"), cell: ({ row }) => <span className="text-sm">{row.original.specialty || "—"}</span> },
    { id: "salesAgent", header: t("rgSalesAgent"), cell: ({ row }) => <span className="text-sm">{row.original.salesAgent || t("rgUnassigned")}</span> },
    { id: "leadSource", header: t("rgLeadSource"), cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.leadSource || "—"}</span> },
    {
      id: "actions",
      header: t("csColActions"),
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => router.push(`${basePath}/leads/${row.original.id}`)} aria-label={t("rgView")}>
            <Eye className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [t, router, basePath]);

  return (
    <div className="space-y-4">
      {/* Search + date chips */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("rgSearch")} className="ps-9" />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", ...RANGES] as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={cn("rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                range === r ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground hover:bg-muted/40")}>
              {t(`rgRange_${r}` as never)}
            </button>
          ))}
        </div>
      </div>

      {/* Filters + column manager */}
      <DataTable
        columns={columns}
        data={rows}
        pageSize={10}
        toolbar={(table) => (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <Filter label={t("rgFCourse")} value={course} onChange={setCourse} all={t("rgAllCourses")} options={courseOptions} />
              <Filter label={t("rgFCountry")} value={country} onChange={setCountry} all={t("rgAllCountries")} options={countryOptions} />
              <Filter label={t("rgFSpeciality")} value={specialty} onChange={setSpecialty} all={t("rgAllSpecialties")} options={specialtyOptions} />
              <Filter label={t("rgFGroup")} value={group} onChange={setGroup} all={t("rgAllGroups")} options={[]} />
              <Filter label={t("rgFSalesAgent")} value={salesAgent} onChange={setSalesAgent} all={t("rgAllSalesAgents")} options={counselorOptions} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
                  <Columns3 className="size-4" />
                  {t("rgColumns")}
                  <Badge variant="secondary" className="rounded-full px-1.5 tabular-nums">
                    {table.getAllColumns().filter((c) => c.getCanHide() && !c.getIsVisible()).length}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("rgColumns")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table.getAllColumns().filter((c) => c.getCanHide()).map((c) => (
                  <DropdownMenuCheckboxItem key={c.id} checked={c.getIsVisible()} onCheckedChange={(v) => c.toggleVisibility(!!v)} className="capitalize">
                    {c.id}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        bulkBar={(table) => {
          const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
          const ids = selectedRows.map((a) => a.id);
          return (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
              <span className="ps-1 text-sm font-medium">{t("rgSelectedCount", { n: ids.length })}</span>
              <span className="h-5 w-px bg-border" />
              <Select disabled={assigning} value="" onValueChange={(v) => assignAgent(v, ids, () => table.resetRowSelection())}>
                <SelectTrigger className="h-8 w-auto gap-1.5">
                  {assigning ? <Loader2 className="size-3.5 animate-spin" /> : <UserPlus className="size-3.5" />}
                  <SelectValue placeholder={t("rgAssignAgent")} />
                </SelectTrigger>
                <SelectContent>
                  {counselorAssignOptions.length === 0 ? (
                    <SelectItem value="none" disabled>{t("rgNoAgents")}</SelectItem>
                  ) : counselorAssignOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => exportSelected(selectedRows)}>
                <Download className="size-3.5" />{t("rgExportSel")}
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => emailSelected(selectedRows)}>
                <Mail className="size-3.5" />{t("rgEmailSel")}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground" onClick={() => table.resetRowSelection()}>
                <X className="size-3.5" />{t("rgClearSel")}
              </Button>
            </div>
          );
        }}
        emptyState={<p className="text-sm text-muted-foreground">{t("rgEmpty")}</p>}
      />
    </div>
  );
}

function Filter({ label, value, onChange, all, options }: { label: string; value: string; onChange: (v: string) => void; all: string; options: Option[] }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{all}</SelectItem>
          {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}
