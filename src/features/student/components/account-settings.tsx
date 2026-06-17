"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountSettings() {
  const t = useTranslations("Student");
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next) { toast.error(t("currentPassword")); return; }
    if (next !== confirm) { toast.error(t("passwordsDontMatch")); return; }
    setBusy(true);
    const res = await dal.student.changePassword(current, next, confirm);
    setBusy(false);
    if (res.ok) {
      toast.success(t("passwordChanged"));
      setCurrent(""); setNext(""); setConfirm("");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>{t("security")}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label={t("currentPassword")} value={current} onChange={setCurrent} />
            <Field label={t("newPasswordLabel")} value={next} onChange={setNext} />
            <Field label={t("confirmPassword")} value={confirm} onChange={setConfirm} />
            <Button type="submit" disabled={busy}>{busy ? t("loading") : t("updatePasswordBtn")}</Button>
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

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="password" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
