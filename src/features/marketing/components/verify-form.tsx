"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Result =
  | null
  | { ok: true; student: string; course: string; issuedAt: string }
  | { ok: false };

export function VerifyForm() {
  const t = useTranslations("Marketing");
  const [code, setCode] = React.useState("");
  const [result, setResult] = React.useState<Result>(null);

  const verify = () => {
    const trimmed = code.trim();
    // Demo rule: codes starting with "IMETS-" are valid.
    if (/^IMETS-/i.test(trimmed)) {
      setResult({
        ok: true,
        student: "Ahmed Habib",
        course: "Advanced Financial Modeling",
        issuedAt: "2026-04-12",
      });
    } else {
      setResult({ ok: false });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("verifyPlaceholder")}
          className="flex-1 font-mono"
          onKeyDown={(e) => e.key === "Enter" && verify()}
        />
        <Button onClick={verify} className="gap-1.5">
          <ShieldCheck className="size-4" />
          {t("verifyButton")}
        </Button>
      </div>

      {result?.ok && (
        <div className="rounded-2xl border border-success/30 bg-success/8 p-5">
          <p className="flex items-center gap-2 font-medium text-success">
            <CheckCircle2 className="size-5" />
            {t("verifyValid")}
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">{t("verifyIssuedTo")}</dt>
              <dd className="font-medium">{result.student}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t("verifyCourse")}</dt>
              <dd className="font-medium">{result.course}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">{t("verifyIssuedOn")}</dt>
              <dd className="font-medium">{formatDate(result.issuedAt)}</dd>
            </div>
          </dl>
        </div>
      )}

      {result && !result.ok && (
        <p className="flex items-center gap-2 rounded-2xl border border-destructive/30 bg-destructive/8 p-5 font-medium text-destructive">
          <XCircle className="size-5" />
          {t("verifyInvalid")}
        </p>
      )}
    </div>
  );
}
