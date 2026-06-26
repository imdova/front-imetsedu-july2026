"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Mail, KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { useAuth } from "@/store";
import { persistSessionCookie } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StaffAccountSettings() {
  const t = useTranslations("Staff");
  const tc = useTranslations("Common");
  const { user, setUser } = useAuth();

  // ── Email ──
  const [newEmail, setNewEmail] = React.useState("");
  const [emailPw, setEmailPw] = React.useState("");
  const [emailBusy, setEmailBusy] = React.useState(false);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !emailPw) { toast.error(t("fillRequired")); return; }
    setEmailBusy(true);
    const res = await dal.auth.changeEmail(newEmail.trim(), emailPw);
    setEmailBusy(false);
    if (res.ok) {
      if (user) {
        const updated = { ...user, email: res.data.email ?? newEmail.trim() };
        setUser(updated);
        persistSessionCookie(updated);
      }
      toast.success(t("emailChanged"));
      setNewEmail(""); setEmailPw("");
    } else {
      toast.error(res.error);
    }
  };

  // ── Password ──
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [pwBusy, setPwBusy] = React.useState(false);

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next) { toast.error(t("fillRequired")); return; }
    if (next !== confirm) { toast.error(t("passwordsDontMatch")); return; }
    setPwBusy(true);
    const res = await dal.auth.changePassword(current, next);
    setPwBusy(false);
    if (res.ok) {
      toast.success(t("passwordChanged"));
      setCurrent(""); setNext(""); setConfirm("");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Mail className="size-4" /></span>
            {t("emailTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{t("emailDesc")}</p>
          <form onSubmit={submitEmail} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("currentEmail")}</Label>
              <Input type="email" value={user?.email ?? ""} readOnly className="bg-muted/30" />
            </div>
            <PwField label={t("newEmail")} type="email" value={newEmail} onChange={setNewEmail} autoComplete="email" />
            <PwField label={t("currentPasswordLabel")} value={emailPw} onChange={setEmailPw} />
            <Button type="submit" disabled={emailBusy} className="gap-1.5">
              {emailBusy && <Loader2 className="size-4 animate-spin" />}
              {t("changeEmailBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><KeyRound className="size-4" /></span>
            {t("passwordTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{t("passwordDesc")}</p>
          <form onSubmit={submitPassword} className="space-y-4">
            <PwField label={t("currentPasswordLabel")} value={current} onChange={setCurrent} autoComplete="current-password" />
            <PwField label={t("newPasswordLabel")} value={next} onChange={setNext} autoComplete="new-password" />
            <PwField label={t("confirmPasswordLabel")} value={confirm} onChange={setConfirm} autoComplete="new-password" />
            <Button type="submit" disabled={pwBusy} className="gap-1.5">
              {pwBusy && <Loader2 className="size-4 animate-spin" />}
              {t("changePasswordBtn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function PwField({
  label, value, onChange, type = "password", autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} />
    </div>
  );
}
