"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { User, ShieldCheck, ArrowRight, Lock, Phone } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { id: string; name: string };

export function InviteUserForm({ roles, departments }: { roles: Option[]; departments: Option[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [form, setForm] = React.useState({
    name: "", title: "", email: "", phone: "", role: roles[0]?.id ?? "", department: departments[0]?.id ?? "",
  });
  const [busy, setBusy] = React.useState(false);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.role || !form.department) { toast.error(t("umInviteRoleDeptRequired")); return; }
    setBusy(true);
    const res = await dal.userManagement.inviteUmUser(form);
    setBusy(false);
    if (res.ok) {
      toast.success(t("umInviteSent", { email: res.data.email }));
      router.push("/admin/users");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">{t("umInviteTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("umInviteSubtitle")}</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm md:p-8">
        {/* 1. Basic Information */}
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary"><User className="size-4" /></span>
          <h2 className="text-base font-semibold">{t("umStep1")}</h2>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label={t("umFullName")} value={form.name} placeholder={t("umFullNamePh")} onChange={(v) => set("name", v)} />
          <Field label={t("umJobTitle")} value={form.title} placeholder={t("umJobTitlePh")} onChange={(v) => set("title", v)} />
          <Field label={t("umEmailLabel")} value={form.email} placeholder={t("umEmailPh")} type="email" onChange={(v) => set("email", v)} />
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("umPhone")}</Label>
            <div className="relative">
              <Phone className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("umPhonePh")} className="ps-9" />
            </div>
          </div>
        </div>

        <div className="my-7 h-px bg-border/70" />

        {/* 2. Role & Department */}
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary"><ShieldCheck className="size-4" /></span>
          <h2 className="text-base font-semibold">{t("umStep2")}</h2>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("umRole")}</Label>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger className="w-full"><SelectValue placeholder={t("umSelectRole")} /></SelectTrigger>
              <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("umDepartment")}</Label>
            {departments.length === 0 ? (
              <Input disabled value={t("umNoDepartments")} className="text-muted-foreground" />
            ) : (
              <Select value={form.department} onValueChange={(v) => set("department", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("umSelectDepartment")} /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="my-7 h-px bg-border/70" />

        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={() => router.push("/admin/users")}>{t("umCancel")}</Button>
          <Button className="gap-2" disabled={!form.name || !form.email || busy} onClick={submit}>
            {t("umSendInvitation")}<ArrowRight className="size-4 rtl:rotate-180" />
          </Button>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="size-3.5" />{t("umSecureNote")}
      </p>
    </div>
  );
}

function Field({ label, value, placeholder, type = "text", onChange }: {
  label: string; value: string; placeholder?: string; type?: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
