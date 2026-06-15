"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";

export default function SetPasswordPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  return (
    <AuthCard
      title={t("setPasswordTitle")}
      subtitle={t("setPasswordSubtitle")}
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("backToLogin")}
        </Link>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password !== confirm) {
            toast.error(t("passwordsNoMatch"));
            return;
          }
          toast.success(t("passwordUpdated"));
          router.push("/login");
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="np">{t("newPassword")}</Label>
          <Input id="np" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp">{t("confirmPassword")}</Label>
          <Input id="cp" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          {t("setPasswordCta")}
        </Button>
      </form>
    </AuthCard>
  );
}
