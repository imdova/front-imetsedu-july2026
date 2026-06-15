"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { KeyRound, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function SettingsForm() {
  const t = useTranslations("Admin");

  return (
    <form onSubmit={(e) => { e.preventDefault(); toast.success(t("settingsSaved")); }} className="space-y-5">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">{t("settingsGeneral")}</TabsTrigger>
          <TabsTrigger value="crm">{t("settingsCrm")}</TabsTrigger>
          <TabsTrigger value="integrations">{t("settingsIntegrations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card><CardContent className="grid gap-5 sm:grid-cols-2">
            <Field label={t("settingPlatformName")} defaultValue="IMETS School of Business" />
            <Field label={t("settingDefaultLocale")} defaultValue="English (en)" />
            <Field label={t("settingBaseCurrency")} defaultValue="EGP" />
            <Field label={t("settingTimezone")} defaultValue="GCC · UTC+3" />
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="crm">
          <Card><CardContent className="space-y-5">
            <Field label={t("settingFirstResponse")} defaultValue="5" type="number" />
            <label className="flex items-center justify-between gap-3 rounded-lg border p-3.5">
              <span className="text-sm font-medium">{t("settingDupCheck")}</span>
              <Switch defaultChecked />
            </label>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card><CardContent className="space-y-5">
            <Secret label={t("settingVdocipher")} hint={t("secretHint")} />
            <Secret label={t("settingProxycurl")} hint={t("secretHint")} />
            <Secret label={t("settingStripe")} hint={t("secretHint")} />
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button type="submit" className="gap-1.5"><Save className="size-4" />{t("saveSettings")}</Button>
      </div>
    </form>
  );
}

function Field({ label, defaultValue, type }: { label: string; defaultValue: string; type?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input defaultValue={defaultValue} type={type} />
    </div>
  );
}

function Secret({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5"><KeyRound className="size-3.5 text-muted-foreground" />{label}</Label>
      <Input type="password" defaultValue="••••••••••••••••" dir="ltr" />
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}
