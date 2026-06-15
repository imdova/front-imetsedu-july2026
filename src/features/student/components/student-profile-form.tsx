"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { User, Mail, MapPin, GraduationCap, Link2, Camera, Briefcase } from "lucide-react";

import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import type { StudentProfile, StudentProfileForm } from "@/lib/student/map-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRY_CODES = [
  ["EG", "+20"], ["SA", "+966"], ["AE", "+971"], ["BH", "+973"], ["KW", "+965"], ["QA", "+974"], ["OM", "+968"],
] as const;
const SPECIALTIES = ["Dentist", "Physician", "Pharmacist", "Nurse", "Lab Specialist", "Physiotherapist", "Other"];
const EDUCATION = ["High School", "Diploma", "Bachelor", "Master", "MBA", "PhD"];

function toForm(p: StudentProfile): StudentProfileForm {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { memberSince, isActive, completion, ...form } = p;
  return form;
}

function ageOf(dob: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return "";
  const diff = Date.now() - d.getTime();
  const age = Math.floor(diff / (365.25 * 24 * 3600 * 1000));
  return age > 0 && age < 120 ? String(age) : "";
}

export function StudentProfileForm({ profile }: { profile: StudentProfile }) {
  const t = useTranslations("Student");
  const tc = useTranslations("Common");
  const [form, setForm] = React.useState<StudentProfileForm>(() => toForm(profile));
  const [sameWa, setSameWa] = React.useState(profile.whatsApp === profile.phone);
  const [busy, setBusy] = React.useState(false);

  const set = <K extends keyof StudentProfileForm>(k: K, v: StudentProfileForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(profile));

  const completion = (() => {
    const fields = [form.name, form.email, form.phone, form.country, form.specialty, form.educationLevel, form.jobTitle, form.dateOfBirth, form.gender, form.whatsApp];
    return Math.round((fields.filter((x) => String(x ?? "").trim()).length / fields.length) * 100);
  })();

  const save = async () => {
    const payload = sameWa ? { ...form, whatsApp: form.phone, whatsAppCountryCode: form.phoneCountryCode } : form;
    setBusy(true);
    const res = await dal.student.updateProfile(payload);
    setBusy(false);
    if (res.ok) toast.success(t("profileUpdated"));
    else toast.error(res.error || t("saved"));
  };
  const discard = () => { setForm(toForm(profile)); setSameWa(profile.whatsApp === profile.phone); };

  const codeSelect = (value: string, onChange: (v: string) => void, disabled?: boolean) => (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[110px] shrink-0"><SelectValue /></SelectTrigger>
      <SelectContent>
        {COUNTRY_CODES.map(([c, code]) => <SelectItem key={c} value={code}>{c} {code}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const optionSelect = (value: string, onChange: (v: string) => void, options: string[], placeholder: string) => {
    const opts = value && !options.includes(value) ? [value, ...options] : options;
    return (
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>{opts.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
      </Select>
    );
  };

  return (
    <div className="space-y-6">
      {/* Action bar */}
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={!dirty || busy} onClick={discard}>{t("discard")}</Button>
        <Button disabled={!dirty || busy} onClick={save}>{t("saveChanges")}</Button>
      </div>

      {/* Header card */}
      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="size-16 border">
                {form.image ? <AvatarImage src={form.image} alt={form.name} /> : null}
                <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">{getInitials(form.name || "Student")}</AvatarFallback>
              </Avatar>
              <button type="button" aria-label={t("changePhoto")} onClick={() => toast.info(t("changePhoto"))}
                className="absolute -bottom-1 -end-1 grid size-6 place-items-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground">
                <Camera className="size-3.5" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{form.name || "—"}</h2>
              <p className="text-sm text-muted-foreground">{t("memberSince", { date: profile.memberSince })}</p>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                <span className="size-1.5 rounded-full bg-success" />{t("activeStudent")}
              </span>
            </div>
          </div>
          <div className="text-end">
            <p className="text-3xl font-bold text-primary">{completion}%</p>
            <p className="text-xs text-muted-foreground">{t("profileComplete")}</p>
            <div className="mt-1.5 h-1.5 w-32 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Contact information */}
          <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
            <SectionHead icon={<User className="size-4" />} title={t("contactInfo")} sub={t("contactInfoSub")} />
            <div className="mt-5 space-y-4">
              <Field label={tc("fullName")} required>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
              </Field>
              <Field label={tc("email")} required hint={t("emailHint")}>
                <div className="relative">
                  <Mail className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={form.email} readOnly className="ps-9 bg-muted/30" />
                </div>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={tc("phone")} required>
                  <div className="flex gap-2" dir="ltr">
                    {codeSelect(form.phoneCountryCode, (v) => set("phoneCountryCode", v))}
                    <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>
                </Field>
                <Field label={t("whatsapp")}>
                  <div className="flex gap-2" dir="ltr">
                    {codeSelect(sameWa ? form.phoneCountryCode : form.whatsAppCountryCode, (v) => set("whatsAppCountryCode", v), sameWa)}
                    <Input value={sameWa ? form.phone : form.whatsApp} onChange={(e) => set("whatsApp", e.target.value)} disabled={sameWa} />
                  </div>
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox checked={sameWa} onCheckedChange={(c) => setSameWa(!!c)} />{t("sameAsPhone")}
                  </label>
                </Field>
              </div>
              <Field label={t("country")}>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={form.country} onChange={(e) => set("country", e.target.value)} className="ps-9" />
                </div>
              </Field>
            </div>
          </section>

          {/* Education & career */}
          <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
            <SectionHead icon={<GraduationCap className="size-4" />} title={t("educationCareer")} sub={t("educationCareerSub")} />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t("specialtyField")}>{optionSelect(form.specialty, (v) => set("specialty", v), SPECIALTIES, t("selectSpecialty"))}</Field>
              <Field label={t("educationLevel")}>{optionSelect(form.educationLevel, (v) => set("educationLevel", v), EDUCATION, t("selectLevel"))}</Field>
              <div className="sm:col-span-2">
                <Field label={t("jobTitle")}>
                  <div className="relative">
                    <Briefcase className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder={t("jobTitlePlaceholder")} className="ps-9" />
                  </div>
                </Field>
              </div>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><Link2 className="size-5" /></span>
              <div>
                <p className="font-semibold">{t("importLinkedin")}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{t("importLinkedinSub")}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label className="text-xs font-medium">{t("linkedinUrl")}</Label>
              <Input value={form.linkedInUrl} onChange={(e) => set("linkedInUrl", e.target.value)} placeholder="https://www.linkedin.com/in/username" />
              <p className="text-xs text-muted-foreground">{t("linkedinHint")}</p>
            </div>
            <Button className="mt-3 w-full gap-2" variant="secondary" onClick={() => toast.info(t("linkedinSoon"))}>
              <Link2 className="size-4" />{t("importProfile")}
            </Button>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <SectionHead icon={<User className="size-4" />} title={t("personalDetails")} sub={t("personalDetailsSub")} />
            <div className="mt-4 space-y-4">
              <Field label={t("dateOfBirth")}>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
              </Field>
              <Field label={t("age")}>
                <Input value={ageOf(form.dateOfBirth)} readOnly placeholder={t("selectDob")} className="bg-muted/30" />
              </Field>
              <Field label={t("gender")}>
                <div className="flex gap-2">
                  {(["male", "female"] as const).map((g) => (
                    <button key={g} type="button" onClick={() => set("gender", g)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${form.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
                      {g === "male" ? t("genderMale") : t("genderFemale")}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}{required && <span className="ms-0.5 text-destructive">*</span>}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
