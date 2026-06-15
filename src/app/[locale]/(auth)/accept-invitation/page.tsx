"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/features/auth/components/auth-card";

const ORG = "IMETS School of Business";

export default function AcceptInvitationPage() {
  const t = useTranslations("Auth");
  const router = useRouter();
  // The token is in the emailed link's ?token=… — read it client-side.
  const [token, setToken] = React.useState<string | null>(null);
  const [ready, setReady] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token"));
    setReady(true);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 6) { toast.error(t("passwordTooShort")); return; }
    if (password !== confirm) { toast.error(t("passwordsNoMatch")); return; }
    setBusy(true);
    const res = await dal.userManagement.acceptInvitation(token, password);
    setBusy(false);
    if (res.ok) {
      toast.success(t("accountActivated"));
      router.push("/login");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <AuthCard title={t("acceptInviteTitle", { org: ORG })} subtitle={t("acceptInviteSetPw")}>
      {!ready ? (
        <div className="grid place-items-center py-6 text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
      ) : !token ? (
        <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{t("acceptInviteNoToken")}</p>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">{t("acceptInviteNote")}</p>
          <div className="space-y-1.5">
            <Label htmlFor="np">{t("newPassword")}</Label>
            <Input id="np" type="password" required minLength={6} autoFocus
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp">{t("confirmPassword")}</Label>
            <Input id="cp" type="password" required minLength={6}
              value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" className="w-full gap-1.5" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {t("activateAccount")}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
