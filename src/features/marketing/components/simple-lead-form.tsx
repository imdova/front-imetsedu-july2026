"use client";

import * as React from "react";
import { CheckCircle2, Loader2, ShieldCheck, User, Mail, Phone, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: "+20", iso: "eg", name: "Egypt" },
  { code: "+966", iso: "sa", name: "Saudi Arabia" },
  { code: "+971", iso: "ae", name: "United Arab Emirates" },
  { code: "+965", iso: "kw", name: "Kuwait" },
  { code: "+974", iso: "qa", name: "Qatar" },
  { code: "+973", iso: "bh", name: "Bahrain" },
  { code: "+968", iso: "om", name: "Oman" },
  { code: "+962", iso: "jo", name: "Jordan" },
  { code: "+1", iso: "us", name: "United States" },
  { code: "+44", iso: "gb", name: "United Kingdom" },
  { code: "+91", iso: "in", name: "India" },
];

const SPECIALITIES = ["Doctors", "Dentist", "Pharmacist", "Nurse", "Others"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (s: string) => s.replace(/\D/g, "");

/** Real country flag (flagcdn) — renders consistently across OSes, unlike emoji flags. */
function Flag({ iso }: { iso: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/24x18/${iso}.png`}
      srcSet={`https://flagcdn.com/48x36/${iso}.png 2x`}
      width={24}
      height={18}
      alt=""
      loading="lazy"
      className="h-[18px] w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-black/5"
    />
  );
}

type FieldKey = "name" | "email" | "whatsapp" | "speciality";

/**
 * Smart English lead-capture form: Name, Email, WhatsApp (with auto-detected
 * country code) and Speciality. Inline validation with friendly messages,
 * digit-sanitized phone, input icons. Captures the lead via the public funnel,
 * tracks the landing view on mount + a conversion on submit, and fires the
 * browser-side Meta Lead event (deduped against the server CAPI event).
 */
export function SimpleLeadForm({ path, courseName }: { path: string; courseName: string }) {
  const [form, setForm] = React.useState({ name: "", email: "", code: "+20", whatsapp: "", speciality: "" });
  const [touched, setTouched] = React.useState<Record<FieldKey, boolean>>({
    name: false, email: false, whatsapp: false, speciality: false,
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  // Track the landing view + auto-detect the visitor's country code (smart default).
  React.useEffect(() => {
    dal.landing.trackLanding(path, "view").catch(() => {});
    try {
      const region =
        (navigator.languages || [navigator.language])
          .map((l) => l.split("-")[1])
          .find(Boolean)?.toUpperCase();
      const match = region && COUNTRY_CODES.find((c) => c.iso.toUpperCase() === region);
      if (match) setForm((f) => ({ ...f, code: match.code }));
    } catch { /* keep default */ }
  }, [path]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: FieldKey) => setTouched((t) => ({ ...t, [k]: true }));

  // Validation
  const nameOk = form.name.trim().length >= 2;
  const emailOk = EMAIL_RE.test(form.email.trim());
  const phoneOk = digits(form.whatsapp).length >= 7;
  const isValid = nameOk && emailOk && phoneOk;

  const errors: Record<FieldKey, string> = {
    name: touched.name && !nameOk ? "Please enter your full name." : "",
    email: touched.email && !emailOk ? "Enter a valid email address." : "",
    whatsapp: touched.whatsapp && !phoneOk
      ? (form.whatsapp.trim() ? "Enter a valid phone number." : "Please enter your WhatsApp number.")
      : "",
    speciality: "",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched({ name: true, email: true, whatsapp: true, speciality: true });
      return;
    }
    setSubmitting(true);
    const whatsapp = form.whatsapp.trim() ? `${form.code} ${digits(form.whatsapp)}` : "";
    const fb = fbLeadContext();
    const res = await dal.landing.captureLead({
      name: form.name.trim(), email: form.email.trim(), whatsapp,
      profession: form.speciality, interest: courseName, path, ...fb,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      dal.landing.trackLanding(path, "click").catch(() => {});
      fireBrowserLead(fb.eventId, { content_name: courseName });
    } else {
      toast.error(res.error);
    }
  };

  if (done) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <h3 className="text-xl font-semibold">Thanks, {form.name.trim().split(" ")[0]}!</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            An admissions advisor will reach out{form.whatsapp ? " on WhatsApp" : " by email"} within 24 hours to confirm your seat.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg shadow-primary/5">
      <CardContent className="py-6">
        <form onSubmit={submit} className="grid gap-4" dir="ltr" noValidate>
          <Field label="Full name" required error={errors.name}>
            <InputIcon icon={User}>
              <Input
                className="pl-9"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                onBlur={() => blur("name")}
                aria-invalid={!!errors.name}
                placeholder="Dr. Sara Hassan"
                autoComplete="name"
              />
            </InputIcon>
          </Field>

          <Field label="Email" required error={errors.email}>
            <InputIcon icon={Mail}>
              <Input
                className="pl-9"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                onBlur={() => blur("email")}
                aria-invalid={!!errors.email}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </InputIcon>
          </Field>

          <Field label="WhatsApp" required error={errors.whatsapp} hint="We'll send your study plan here.">
            <div className="flex gap-2">
              <Select value={form.code} onValueChange={(v) => set("code", v)}>
                <SelectTrigger className="w-28 shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      <span className="flex items-center gap-2">
                        <Flag iso={c.iso} />
                        <span>{c.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <InputIcon icon={Phone} className="flex-1">
                <Input
                  className="pl-9"
                  inputMode="tel"
                  value={form.whatsapp}
                  onChange={(e) => set("whatsapp", e.target.value.replace(/[^\d\s]/g, ""))}
                  onBlur={() => blur("whatsapp")}
                  aria-invalid={!!errors.whatsapp}
                  placeholder="10 1234 5678"
                  autoComplete="tel-national"
                />
              </InputIcon>
            </div>
          </Field>

          <Field label="Speciality">
            <Select value={form.speciality} onValueChange={(v) => set("speciality", v)}>
              <SelectTrigger>
                <span className="flex items-center gap-2">
                  <Stethoscope className="size-4 text-muted-foreground" />
                  <SelectValue placeholder="Select your speciality" />
                </span>
              </SelectTrigger>
              <SelectContent>
                {SPECIALITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Button type="submit" size="lg" className="mt-1 w-full gap-1.5" disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Submitting…" : "Book my seat - Now"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> No payment required. We&apos;ll never share your details.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function InputIcon({
  icon: Icon, className, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      {children}
    </div>
  );
}

function Field({
  label, required, error, hint, children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground/80">{hint}</p>
      ) : null}
    </div>
  );
}
