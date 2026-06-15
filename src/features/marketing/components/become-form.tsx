"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function BecomeForm() {
  const t = useTranslations("Marketing");
  const tc = useTranslations("Common");
  const [submitting, setSubmitting] = React.useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
          toast.success(t("becomeApplied"));
          (e.target as HTMLFormElement).reset();
        }, 600);
      }}
      className="space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="b-name">{tc("fullName")}</Label>
          <Input id="b-name" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="b-email">{tc("email")}</Label>
          <Input id="b-email" type="email" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-exp">{t("becomeExpertise")}</Label>
        <Input id="b-exp" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="b-bio">{t("becomeBio")}</Label>
        <Textarea id="b-bio" rows={5} required />
      </div>
      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {t("becomeApply")}
      </Button>
    </form>
  );
}
