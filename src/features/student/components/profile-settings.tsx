"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useAuth } from "@/store";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProfileSettings() {
  const t = useTranslations("Student");
  const tc = useTranslations("Common");
  const { user } = useAuth();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); toast.success(t("saved")); }}
      className="grid gap-6 lg:grid-cols-2"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("personalInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {getInitials(user?.name ?? "Student")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="p-name">{tc("fullName")}</Label>
              <Input id="p-name" defaultValue={user?.name} className="mt-1.5" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-email">{tc("email")}</Label>
            <Input id="p-email" type="email" defaultValue={user?.email} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-phone">{tc("phone")}</Label>
            <Input id="p-phone" dir="ltr" defaultValue="+966 50 000 0000" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("preferences")}</CardTitle>
            <CardDescription>{t("profileSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Toggle label={t("emailNotifs")} defaultChecked />
            <Toggle label={t("smsNotifs")} defaultChecked />
          </CardContent>
        </Card>
        <Button type="submit" className="w-full sm:w-auto">{t("saveChanges")}</Button>
      </div>
    </form>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-lg border p-3.5">
      <span className="text-sm font-medium">{label}</span>
      <Switch defaultChecked={defaultChecked} />
    </label>
  );
}
