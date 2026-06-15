"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const t = useTranslations("Marketing");
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
          toast.success(t("contactSent"));
          (e.target as HTMLFormElement).reset();
        }, 600);
      }}
      className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="c-name">{t("contactName")}</Label>
          <Input id="c-name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="c-email">{t("contactEmail")}</Label>
          <Input id="c-email" type="email" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-phone">{t("contactPhone")}</Label>
        <Input id="c-phone" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="c-msg">{t("contactMessage")}</Label>
        <Textarea id="c-msg" rows={5} required />
      </div>
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {t("contactSend")}
      </Button>
    </form>
  );
}
