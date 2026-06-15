"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, CalendarDays, Shield, Building2 } from "lucide-react";

import type { UserDetail as UserDetailModel } from "@/lib/db/admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatusBadge } from "./admin-status-badge";

export function UserDetail({ user }: { user: UserDetailModel }) {
  const t = useTranslations("Admin");

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <Avatar className="size-14 border">
              <AvatarFallback className="bg-primary/10 font-medium text-primary">{user.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-semibold">{user.name}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="secondary" className="gap-1"><Shield className="size-3" />{user.role}</Badge>
                <AdminStatusBadge value={user.status} />
              </div>
            </div>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />{user.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" />{user.phone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Building2 className="size-4" />{user.department}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />{t("joinedLabel")}: {user.joinedAt}</div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{t("sectionActivity")}</CardTitle></CardHeader>
        <CardContent className="space-y-0">
          {user.activity.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-b border-border/50 py-3 text-sm last:border-0">
              <div className="flex items-center gap-3">
                <span className="size-2 shrink-0 rounded-full bg-primary/60" />
                <span className="font-medium">{a.action}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{a.at}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
