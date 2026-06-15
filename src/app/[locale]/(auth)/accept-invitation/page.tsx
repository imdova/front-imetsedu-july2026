"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";

export default function AcceptInvitationPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  // In production these come from the signed invitation token in the URL.
  const org = "IMETS School of Business";
  const role = "Counselor";
  const email = "new.member@imets.edu";

  return (
    <AuthCard title={t("acceptInviteTitle", { org })} subtitle={t("acceptInviteSubtitle", { role })}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (password !== confirm) {
            toast.error(t("passwordsNoMatch"));
            return;
          }
          toast.success(t("accountActivated"));
          router.push("/login");
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("email")}</Label>
          <Input id="email" type="email" value={email} disabled readOnly />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("fullName")}</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="np">{t("newPassword")}</Label>
          <Input id="np" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cp">{t("confirmPassword")}</Label>
          <Input id="cp" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          {t("activateAccount")}
        </Button>
      </form>
    </AuthCard>
  );
}
