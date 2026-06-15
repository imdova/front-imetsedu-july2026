"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, MailCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await dal.auth.forgotPassword(email.trim());
    setBusy(false);
    if (res.ok) {
      setSent(true);
      toast.success(t("resetSent"));
    } else {
      toast.error(res.error);
    }
  };

  return (
    <AuthCard
      title={t("forgotTitle")}
      subtitle={t("forgotSubtitle")}
      footer={
        <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
          <ArrowLeft className="size-4 rtl:rotate-180" />
          {t("backToLogin")}
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-success/30 bg-success/8 p-6 text-center">
          <MailCheck className="size-8 text-success" />
          <p className="text-sm text-foreground">{t("resetSent")}</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">{tc("email")}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full gap-1.5" disabled={busy || !email.trim()}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {t("sendResetLink")}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
