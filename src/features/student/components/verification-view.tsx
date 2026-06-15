"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, BadgeCheck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function VerificationView() {
  const t = useTranslations("Student");
  const items = [
    { key: "emailVerified", date: "1 Feb 2026" },
    { key: "identityVerified", date: "3 Feb 2026" },
    { key: "enrolmentVerified", date: "5 Feb 2026" },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-4 bg-gradient-to-br from-success/15 to-card p-6">
          <span className="grid size-14 place-items-center rounded-2xl bg-success/20 text-success"><BadgeCheck className="size-7" /></span>
          <div>
            <p className="font-heading text-lg font-semibold">{t("identityVerified")}</p>
            <p className="text-sm text-muted-foreground">{t("verificationSubtitle")}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardContent>
          <ul className="divide-y divide-border/60">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-3 py-3.5 first:pt-0">
                <CheckCircle2 className="size-5 shrink-0 text-success" />
                <span className="flex-1 font-medium">{t(i.key)}</span>
                <span className="text-xs text-muted-foreground">{t("verifiedOn")} {i.date}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
