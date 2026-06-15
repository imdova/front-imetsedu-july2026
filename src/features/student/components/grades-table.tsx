"use client";

import { useTranslations } from "next-intl";

import type { Grade } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS: Record<Grade["status"], { key: string; style: string }> = {
  graded: { key: "gradeGraded", style: "bg-success/15 text-success" },
  submitted: { key: "gradeSubmitted", style: "bg-chart-3/15 text-chart-3" },
  pending: { key: "gradePending", style: "bg-muted text-muted-foreground" },
};
const TYPE: Record<Grade["type"], string> = { quiz: "typeQuiz", assignment: "typeAssignment", exam: "typeExam" };

export function GradesTable({ grades }: { grades: Grade[] }) {
  const t = useTranslations("Student");

  return (
    <Card>
      <CardContent className="px-0">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="ps-6">{t("gColCourse")}</TableHead>
              <TableHead>{t("gColItem")}</TableHead>
              <TableHead>{t("gColType")}</TableHead>
              <TableHead>{t("gColScore")}</TableHead>
              <TableHead>{t("gColStatus")}</TableHead>
              <TableHead>{t("gColDate")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((g) => (
              <TableRow key={g.id}>
                <TableCell className="ps-6 font-medium">{g.course}</TableCell>
                <TableCell>{g.item}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{t(TYPE[g.type])}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">
                  {g.status === "graded" ? (
                    <span className="font-semibold">{g.score}/{g.max}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={cn("border-transparent", STATUS[g.status].style)}>
                    {t(STATUS[g.status].key)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{g.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
