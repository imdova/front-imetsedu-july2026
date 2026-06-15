"use client";

import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountSettings() {
  const t = useTranslations("Student");
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>{t("security")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); toast.success(t("passwordChanged")); }} className="space-y-4">
            <Field label={t("currentPassword")} />
            <Field label={t("newPasswordLabel")} />
            <Field label={t("confirmPassword")} />
            <Button type="submit">{t("updatePasswordBtn")}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="size-5" />{t("dangerZone")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t("deleteAccountDesc")}</p>
          <Button variant="destructive" onClick={() => toast.error(t("deleteAccount"))}>{t("deleteAccount")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label }: { label: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="password" />
    </div>
  );
}
