"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, Download } from "lucide-react";
import { toast } from "sonner";

import type { TranscriptRow } from "@/lib/db/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TranscriptView({ rows }: { rows: TranscriptRow[] }) {
  const t = useTranslations("Student");
  const overall = rows.length ? Math.round(rows.reduce((s, r) => s + r.average, 0) / rows.length) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-6" /></span>
            <div>
              <p className="text-sm text-muted-foreground">{t("overallAverage")}</p>
              <p className="font-heading text-3xl font-bold tabular-nums">{overall}%</p>
            </div>
          </div>
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success(t("downloadTranscript"))}>
            <Download className="size-4" />{t("downloadTranscript")}
          </Button>
        </CardContent>
      </Card>

      {rows.map((r) => (
        <Card key={r.course}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{r.course}</CardTitle>
              <span className="font-heading text-lg font-semibold tabular-nums text-success">{r.average}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border/60">
              {r.items.map((i) => (
                <li key={i.item} className="flex items-center justify-between py-2.5 text-sm">
                  <span>{i.item}</span>
                  <span className="font-medium tabular-nums">{i.score}/{i.max}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
