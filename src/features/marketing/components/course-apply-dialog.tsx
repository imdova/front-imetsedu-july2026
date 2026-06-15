"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

/** Fixed specialty options for the public application form. */
const SPECIALTIES = ["Doctor", "Dentist", "Pharmacist", "Nurse", "Technician", "Others"] as const;

const COUNTRY_CODES = [
  { dial: "+20", flag: "🇪🇬" },
  { dial: "+966", flag: "🇸🇦" },
  { dial: "+971", flag: "🇦🇪" },
  { dial: "+974", flag: "🇶🇦" },
  { dial: "+965", flag: "🇰🇼" },
  { dial: "+973", flag: "🇧🇭" },
  { dial: "+968", flag: "🇴🇲" },
  { dial: "+962", flag: "🇯🇴" },
  { dial: "+1", flag: "🇺🇸" },
  { dial: "+44", flag: "🇬🇧" },
];

const EMPTY = { fullName: "", email: "", specialty: "", code: "+20", phone: "" };

/** "Apply now" → opens a modal that captures the applicant and creates a CRM
 * lead with this course as the interest. */
export function CourseApplyDialog({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const t = useTranslations("Marketing");
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY);
  const set = (k: keyof typeof EMPTY, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.fullName.trim().length < 2 || form.phone.trim().length < 6) {
      toast.error(t("applyRequired"));
      return;
    }
    setSaving(true);
    const res = await dal.crm.createLead({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      phoneCountryCode: form.code,
      whatsApp: form.phone.trim(),
      whatsAppCountryCode: form.code,
      specialty: form.specialty.trim() || undefined,
      source: "Website",
      leadType: "warm",
      coursesOfInterest: [courseId],
    });
    setSaving(false);
    if (res.ok) {
      toast.success(t("applySuccess"));
      setOpen(false);
      setForm(EMPTY);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">{t("applyNow")}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("applyTitle")}</DialogTitle>
          <DialogDescription>{t("applyDesc", { course: courseTitle })}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("applyName")} <span className="text-destructive">*</span></Label>
            <Input value={form.fullName} onChange={(e) => set("fullName", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("applyEmail")}</Label>
            <Input type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("applySpecialty")}</Label>
            <Select value={form.specialty} onValueChange={(v) => set("specialty", v)}>
              <SelectTrigger><SelectValue placeholder={t("applySpecialtyPh")} /></SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((s) => (
                  <SelectItem key={s} value={s}>{t(`spec${s}` as never)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t("applyPhone")} <span className="text-destructive">*</span></Label>
            <div className="flex gap-2">
              <select
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
                className="h-9 shrink-0 rounded-md border border-input bg-background px-2 text-sm"
                aria-label={t("applyPhone")}
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.dial} value={c.dial}>{c.flag} {c.dial}</option>
                ))}
              </select>
              <Input dir="ltr" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              {t("applyCancel")}
            </Button>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {t("applySubmit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
