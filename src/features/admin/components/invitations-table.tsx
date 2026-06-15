"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, Ban, Trash2, Mail, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import type { UmInvitation, UmInvitationStatus } from "@/lib/db/user-management";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STATUS_STYLE: Record<UmInvitationStatus, string> = {
  pending: "bg-warning/10 text-warning ring-warning/20",
  accepted: "bg-success/10 text-success ring-success/20",
  expired: "bg-muted text-muted-foreground ring-border",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function InvitationsTable({ initial }: { initial: UmInvitation[] }) {
  const t = useTranslations("Admin");
  const [list, setList] = React.useState<UmInvitation[]>(initial);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | UmInvitationStatus>("all");

  const statusLabel = (s: "all" | UmInvitationStatus) =>
    s === "all" ? t("umStAll")
      : s === "pending" ? t("umStPending")
      : s === "accepted" ? t("umStAccepted")
      : s === "expired" ? t("umStExpired")
      : t("umStCancelled");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((i) => {
      if (status !== "all" && i.status !== status) return false;
      if (!q) return true;
      return [i.name, i.email, i.role, i.department].some((f) => f.toLowerCase().includes(q));
    });
  }, [list, search, status]);

  const resend = async (i: UmInvitation) => {
    const res = await dal.userManagement.resendUmInvite(i.id);
    if (res.ok) {
      setList((p) => p.map((x) => (x.id === i.id ? { ...x, status: "pending" } : x)));
      toast.success(t("umInviteResent", { email: i.email }));
    } else toast.error(res.error);
  };

  const cancel = async (i: UmInvitation) => {
    if (!window.confirm(t("umCancelConfirm", { email: i.email }))) return;
    const prev = list;
    setList((p) => p.map((x) => (x.id === i.id ? { ...x, status: "cancelled" } : x)));
    const res = await dal.userManagement.cancelUmInvite(i.id);
    if (res.ok) toast.success(t("umInviteCancelled"));
    else { setList(prev); toast.error(res.error); }
  };

  const remove = async (i: UmInvitation) => {
    if (!window.confirm(t("umDeleteInviteConfirm", { email: i.email }))) return;
    const prev = list;
    setList((p) => p.filter((x) => x.id !== i.id));
    const res = await dal.userManagement.deleteUmInvite(i.id);
    if (res.ok) toast.success(t("umInviteDeleted"));
    else { setList(prev); toast.error(res.error); }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/70 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("umSearch")} className="ps-9" />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-[180px]">
            <span className="text-muted-foreground">{t("umStatusFilter", { value: statusLabel(status) })}</span>
          </SelectTrigger>
          <SelectContent>
            {(["all", "pending", "accepted", "expired", "cancelled"] as const).map((s) => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 text-start">{t("umColUser")}</th>
              <th className="px-4 py-3 text-start">{t("umColEmail")}</th>
              <th className="px-4 py-3 text-start">{t("umColRole")}</th>
              <th className="px-4 py-3 text-start">{t("umColDepartment")}</th>
              <th className="px-4 py-3 text-start">{t("umColInvitedBy")}</th>
              <th className="px-4 py-3 text-start">{t("umColExpires")}</th>
              <th className="px-4 py-3 text-start">{t("umColStatus")}</th>
              <th className="px-4 py-3 text-end">{t("umColActions")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">
                <Mail className="mx-auto mb-2 size-7 opacity-40" />{t("umNoInvitations")}
              </td></tr>
            ) : filtered.map((i) => (
              <tr key={i.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{i.initials}</AvatarFallback></Avatar>
                    <span className="font-medium">{i.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground" dir="ltr">{i.email}</td>
                <td className="px-4 py-3">{i.role}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.department}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.invitedBy}</td>
                <td className="px-4 py-3 tabular-nums text-muted-foreground">{i.expiresAt ?? t("umNever")}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", STATUS_STYLE[i.status])}>
                    <span className="size-1.5 rounded-full bg-current" />{statusLabel(i.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {i.status !== "accepted" && (
                      <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => resend(i)}>
                        <RefreshCw className="size-3.5" />{t("umActionResend")}
                      </Button>
                    )}
                    {i.status === "pending" && (
                      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-destructive hover:text-destructive" onClick={() => cancel(i)}>
                        <Ban className="size-3.5" />{t("umActionCancel")}
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => remove(i)} aria-label={t("umActionDelete")} title={t("umActionDelete")}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border/70 p-4 text-sm text-muted-foreground">
        {t("umInvShowing", { shown: filtered.length, total: list.length })}
      </div>
    </div>
  );
}
