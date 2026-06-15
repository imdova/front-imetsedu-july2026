"use client";

import { useTranslations } from "next-intl";
import { ClipboardList } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { StudentAssignment, StudentAssignmentStatus } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const STATUS: Record<StudentAssignmentStatus, { key: string; style: string }> = {
  pending: { key: "statusPendingA", style: "bg-warning/18 text-warning" },
  submitted: { key: "statusSubmittedA", style: "bg-chart-3/15 text-chart-3" },
  graded: { key: "statusGradedA", style: "bg-success/15 text-success" },
};

export function AssignmentsList({ items }: { items: StudentAssignment[] }) {
  const t = useTranslations("Student");
  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="ps-6">{t("aColAssignment")}</TableHead>
              <TableHead>{t("aColCourse")}</TableHead>
              <TableHead>{t("aColDue")}</TableHead>
              <TableHead>{t("aColStatus")}</TableHead>
              <TableHead>{t("aColGrade")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((a) => (
              <TableRow key={a.id}>
                <TableCell className="ps-6">
                  <Link href={`/student/assignments/${a.id}`} className="inline-flex items-center gap-2 font-medium hover:text-primary">
                    <ClipboardList className="size-4 text-muted-foreground" />{a.title}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{a.course}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{a.dueDate}</TableCell>
                <TableCell><Badge className={cn("border-transparent", STATUS[a.status].style)}>{t(STATUS[a.status].key)}</Badge></TableCell>
                <TableCell className="tabular-nums">
                  {a.status === "graded" ? <span className="font-semibold">{a.grade}/{a.maxGrade}</span> : <span className="text-muted-foreground">—</span>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
