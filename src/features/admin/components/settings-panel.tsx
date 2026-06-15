"use client";

import { useTranslations } from "next-intl";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type SettingField =
  | { kind: "text" | "number"; label: string; value?: string }
  | { kind: "toggle"; label: string; checked?: boolean };

export interface SettingsGroup {
  title: string;
  fields: SettingField[];
}

/** Generic, data-driven settings form reused by CRM / Course / LMS / Group settings. */
export function SettingsPanel({ groups }: { groups: SettingsGroup[] }) {
  const t = useTranslations("Admin");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        toast.success(t("settingsSaved"));
      }}
      className="space-y-5"
    >
      {groups.map((g) => (
        <Card key={g.title}>
          <CardHeader>
            <CardTitle className="text-base">{g.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {g.fields.map((f) =>
              f.kind === "toggle" ? (
                <label
                  key={f.label}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3.5"
                >
                  <span className="text-sm font-medium">{f.label}</span>
                  <Switch defaultChecked={f.checked} />
                </label>
              ) : (
                <div key={f.label} className="space-y-1.5">
                  <Label>{f.label}</Label>
                  <Input defaultValue={f.value} type={f.kind === "number" ? "number" : "text"} />
                </div>
              ),
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button type="submit" className="gap-1.5">
          <Save className="size-4" />
          {t("saveSettings")}
        </Button>
      </div>
    </form>
  );
}
