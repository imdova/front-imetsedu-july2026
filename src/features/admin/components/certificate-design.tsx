"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Award, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ACCENTS = [
  { name: "Blue", value: "oklch(0.55 0.18 264)" },
  { name: "Emerald", value: "oklch(0.6 0.15 162)" },
  { name: "Amber", value: "oklch(0.72 0.16 75)" },
  { name: "Violet", value: "oklch(0.55 0.2 295)" },
];

export function CertificateDesign() {
  const t = useTranslations("Admin");
  const [accent, setAccent] = React.useState(ACCENTS[0].value);
  const [title, setTitle] = React.useState("Certificate of Completion");
  const [signatory, setSignatory] = React.useState("Dr. Karim El-Sayed, Dean");

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Card className="h-fit">
        <CardHeader><CardTitle className="text-base">{t("design")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t("designTitleField")}</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sig">{t("designSignature")}</Label>
            <Input id="sig" value={signatory} onChange={(e) => setSignatory(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{t("designAccent")}</Label>
            <div className="flex gap-2">
              {ACCENTS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAccent(a.value)}
                  aria-label={a.name}
                  className="size-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition"
                  style={{ backgroundColor: a.value, boxShadow: accent === a.value ? `0 0 0 2px ${a.value}` : "none" } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
          <Button className="w-full gap-1.5" onClick={() => toast.success(t("designSaved"))}>
            <Save className="size-4" />{t("saveDesign")}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{t("designPreview")}</p>
        <div
          className="relative aspect-[1.414/1] w-full overflow-hidden rounded-2xl border-4 bg-card p-8 text-center shadow-sm"
          style={{ borderColor: accent } as React.CSSProperties}
        >
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <span className="grid size-14 place-items-center rounded-full" style={{ backgroundColor: accent, color: "white" } as React.CSSProperties}>
              <Award className="size-7" />
            </span>
            <p className="font-heading text-2xl font-bold tracking-tight" style={{ color: accent } as React.CSSProperties}>{title}</p>
            <p className="text-sm text-muted-foreground">This is to certify that</p>
            <p className="font-heading text-3xl font-bold">Yara Mahmoud</p>
            <p className="max-w-md text-sm text-muted-foreground">has successfully completed the program at IMETS School of Business.</p>
            <div className="mt-2 border-t pt-2 text-sm font-medium" style={{ borderColor: accent } as React.CSSProperties}>{signatory}</div>
            <p className="font-mono text-xs text-muted-foreground">IMETS-2026-XXXX</p>
          </div>
        </div>
      </div>
    </div>
  );
}
