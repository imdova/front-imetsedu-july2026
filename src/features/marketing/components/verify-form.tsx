"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VerifyForm() {
  const t = useTranslations("Marketing");
  const router = useRouter();
  const [code, setCode] = React.useState("");

  const verify = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    router.push(`/verify-certificate?code=${encodeURIComponent(trimmed)}`);
  };

  return (
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
  );
}
