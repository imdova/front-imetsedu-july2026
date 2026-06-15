"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Save,
  Loader2,
  UserRound,
  Link2,
  Megaphone,
  GraduationCap,
  Sparkles,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { scoreLead } from "@/lib/crm/scoring";
import {
  SOURCES,
  SPECIALTIES,
  EDUCATION_LEVELS,
  type Counselor,
} from "@/lib/db/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/shared/multi-select";

// Lead-creation form: rich two-column layout wired to live CRM data.
type Option = { value: string; label: string };

/** Dial codes + ISO country names for the phone / country pickers (MENA-first). */
const COUNTRIES = [
  { code: "EG", dial: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "AE", dial: "+971", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "QA", dial: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", dial: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "OM", dial: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "BH", dial: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "JO", dial: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "LB", dial: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "IQ", dial: "+964", name: "Iraq", flag: "🇮🇶" },
  { code: "SD", dial: "+249", name: "Sudan", flag: "🇸🇩" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
] as const;

const schema = z.object({
  fullName: z.string().trim().min(2, "Required"),
  email: z.union([z.string().trim().email(), z.literal("")]),
  phoneCountryCode: z.string().trim().min(1),
  phone: z.string().trim().min(6, "Required"),
  whatsAppCountryCode: z.string().trim().min(1),
  whatsApp: z.string().trim().min(6, "Required"),
  country: z.string(),
  specialty: z.string(),
  educationLevel: z.string(),
  source: z.string(),
  jobTitle: z.string().trim(),
  coursesOfInterest: z.array(z.string()),
  counselorId: z.string(),
  gender: z.string(),
  dateOfBirth: z.string().trim(),
  leadType: z.string(),
  targetPipeline: z.string(),
  linkedinUrl: z.string().trim(),
});
type Values = z.infer<typeof schema>;

function ageFromDob(dob: string): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 120 ? age : null;
}

/** Best-effort name suggestion from a LinkedIn `/in/<slug>` URL. */
function nameFromLinkedIn(url: string): string | null {
  const m = url.match(/\/in\/([^/?#]+)/i);
  if (!m) return null;
  const slug = decodeURIComponent(m[1])
    .replace(/-?[0-9a-f]{6,}$/i, "") // trailing hash segment
    .replace(/[-_]+/g, " ")
    .replace(/\d+/g, "")
    .trim();
  if (!slug) return null;
  return slug.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function CreateLeadForm({
  counselors,
  pipelines,
  courseOptions,
  basePath,
}: {
  counselors: Counselor[];
  pipelines: Option[];
  courseOptions: Option[];
  basePath: string;
}) {
  const t = useTranslations("Crm");
  const router = useRouter();
  const [duplicate, setDuplicate] = React.useState<{ id: string; fullName: string } | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneCountryCode: "+20",
      phone: "",
      whatsAppCountryCode: "+20",
      whatsApp: "",
      country: "EG",
      specialty: "",
      educationLevel: "",
      source: "",
      jobTitle: "",
      coursesOfInterest: [],
      counselorId: "none",
      gender: "",
      dateOfBirth: "",
      leadType: "warm",
      targetPipeline: "none",
      linkedinUrl: "",
    },
  });

  const v = form.watch();
  const score = scoreLead({
    email: v.email,
    phone: v.phone,
    coursesOfInterest: v.coursesOfInterest,
    jobTitle: v.jobTitle,
    educationLevel: v.educationLevel,
    country: v.country,
    specialty: v.specialty,
  });

  // Section fill counters for the progress badges.
  const contactFilled = [v.fullName, v.email, v.phone, v.whatsApp, v.country, v.specialty, v.dateOfBirth, v.gender].filter(Boolean).length;
  const assignFilled = [v.source, v.targetPipeline !== "none" ? v.targetPipeline : "", v.counselorId !== "none" ? v.counselorId : ""].filter(Boolean).length;
  const canSubmit = !!v.phone && !!v.whatsApp && v.fullName.trim().length >= 2;
  const age = ageFromDob(v.dateOfBirth);

  const checkDuplicate = async (phone: string) => {
    if (phone.replace(/\D/g, "").length < 6) return;
    const res = await dal.crm.checkPhone(phone);
    setDuplicate(res.ok && res.data ? { id: res.data.id, fullName: res.data.fullName } : null);
  };

  const sameAsPhone = (checked: boolean) => {
    if (!checked) return;
    form.setValue("whatsAppCountryCode", form.getValues("phoneCountryCode"));
    form.setValue("whatsApp", form.getValues("phone"));
  };

  const extractLinkedIn = () => {
    const url = form.getValues("linkedinUrl");
    const name = url ? nameFromLinkedIn(url) : null;
    if (!name) {
      toast.error(t("linkedinNoMatch"));
      return;
    }
    if (!form.getValues("fullName")) form.setValue("fullName", name, { shouldValidate: true });
    toast.success(t("linkedinFilled", { name }));
  };

  const submit = (addAnother: boolean) =>
    form.handleSubmit(async (values) => {
      const res = await dal.crm.createLead({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        phoneCountryCode: values.phoneCountryCode,
        whatsApp: values.whatsApp || undefined,
        whatsAppCountryCode: values.whatsAppCountryCode,
        country: values.country || undefined,
        specialty: values.specialty || undefined,
        educationLevel: values.educationLevel || undefined,
        source: values.source || undefined,
        jobTitle: values.jobTitle || undefined,
        coursesOfInterest: values.coursesOfInterest,
        counselorId: values.counselorId === "none" ? undefined : values.counselorId,
        gender: values.gender === "male" || values.gender === "female" ? values.gender : undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        leadType: (["cold", "warm", "hot"].includes(values.leadType) ? values.leadType : "warm") as "cold" | "warm" | "hot",
        targetPipeline: values.targetPipeline === "none" ? undefined : values.targetPipeline,
      });
      if (res.ok) {
        toast.success(t("leadCreated", { name: res.data.fullName }));
        if (addAnother) {
          form.reset();
          setDuplicate(null);
        } else {
          router.push(`${basePath}/leads/${res.data.id}`);
        }
      } else {
        toast.error(res.error);
      }
    })();

  /* ── small building blocks ─────────────────────────────────────── */

  const selectField = (name: keyof Values, label: string, options: Option[], placeholder: string) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select value={field.value as string} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const phoneRow = (
    codeName: "phoneCountryCode" | "whatsAppCountryCode",
    numName: "phone" | "whatsApp",
    label: string,
    required: boolean,
    onBlur?: (val: string) => void,
  ) => (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="ms-0.5 text-destructive">*</span>}
      </FormLabel>
      <div className="flex gap-2">
        <FormField
          control={form.control}
          name={codeName}
          render={({ field }) => (
            <Select value={field.value as string} onValueChange={field.onChange}>
              <SelectTrigger className="w-[108px] shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code + c.dial} value={c.dial}>
                    <span className="tabular-nums">{c.flag} {c.dial}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        <Input
          dir="ltr"
          placeholder="(555) 000-0000"
          {...form.register(numName)}
          onBlur={(e) => onBlur?.(e.target.value)}
        />
      </div>
      <FormMessage>{form.formState.errors[numName]?.message}</FormMessage>
    </FormItem>
  );

  const sectionBadge = (text: string, tone: "muted" | "ok" = "muted") => (
    <Badge
      variant="secondary"
      className={cn(
        "rounded-full text-xs font-medium",
        tone === "ok"
          ? "bg-success/10 text-success border-success/20"
          : "bg-muted text-muted-foreground",
      )}
    >
      {text}
    </Badge>
  );

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Left column ─────────────────────────────────────────── */}
        <div className="space-y-6">
          {duplicate && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-warning">
                <AlertTriangle className="size-4" />
                {t("duplicateFound")} — {duplicate.fullName}
              </p>
              <Button asChild size="sm" variant="outline" className="bg-background">
                <Link href={`${basePath}/leads/${duplicate.id}`}>{t("openExisting")}</Link>
              </Button>
            </div>
          )}

          {/* Contact information */}
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <header className="mb-5 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
                <UserRound className="size-4 text-primary" />
                {t("secContact")}
              </h2>
              {sectionBadge(t("filledBadge", { n: contactFilled, total: 8 }), contactFilled >= 4 ? "ok" : "muted")}
            </header>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fFullName")}<span className="ms-0.5 text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="e.g. John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fEmail")}</FormLabel>
                  <FormControl><Input type="email" dir="ltr" placeholder="john.doe@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {phoneRow("phoneCountryCode", "phone", t("fPhone"), true, checkDuplicate)}

              <div className="space-y-2">
                {phoneRow("whatsAppCountryCode", "whatsApp", t("fWhatsApp"), true)}
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <Checkbox onCheckedChange={(c) => sameAsPhone(c === true)} /> {t("sameAsPhone")}
                </label>
              </div>

              {selectField("country", t("fCountry"), COUNTRIES.map((c) => ({ value: c.code, label: `${c.flag} ${c.name}` })), t("selectCountry"))}
              {selectField("specialty", t("fSpecialty"), SPECIALTIES.map((s) => ({ value: s, label: s })), t("selectSpecialty"))}

              <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("dateOfBirth")}</FormLabel>
                  <FormControl><Input type="date" dir="ltr" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormItem>
                <FormLabel>{t("ageLabel")}</FormLabel>
                <Input value={age != null ? t("ageValue", { n: age }) : ""} placeholder={t("agePlaceholder")} readOnly disabled />
              </FormItem>

              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>{t("genderLabel")}</FormLabel>
                  <div className="flex max-w-xs gap-2">
                    {(["male", "female"] as const).map((g) => (
                      <button key={g} type="button" onClick={() => field.onChange(field.value === g ? "" : g)}
                        className={cn("flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                          field.value === g ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted/40")}>
                        {t(g === "male" ? "genderMale" : "genderFemale")}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )} />
            </div>

            <div className="mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2">
              {selectField("educationLevel", t("fEducation"), EDUCATION_LEVELS.map((e) => ({ value: e, label: e })), t("selectEducation"))}
              <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fJobTitle")}</FormLabel>
                  <FormControl><Input placeholder="e.g. Quality Coordinator at Dar Al Fouad Hospital" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </section>

          {/* Academic interest */}
          <section className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <header className="mb-5 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-base font-semibold text-foreground">
                <GraduationCap className="size-4 text-primary" />
                {t("secAcademic")}
              </h2>
              {sectionBadge(t("selectedBadge", { n: v.coursesOfInterest.length }), v.coursesOfInterest.length ? "ok" : "muted")}
            </header>
            <FormField control={form.control} name="coursesOfInterest" render={({ field }) => (
              <FormItem>
                <FormLabel>{t("primaryCourse")}</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={courseOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t("coursePlaceholder")}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">{t("coursePickerHint")}</p>
                <FormMessage />
              </FormItem>
            )} />
          </section>
        </div>

        {/* ── Right column ────────────────────────────────────────── */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {/* Smart lead import */}
          <section className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-5 shadow-sm">
            <header className="mb-1 flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <Link2 className="size-4.5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{t("smartImportTitle")}</h2>
              </div>
            </header>
            <p className="mb-4 text-xs text-muted-foreground">{t("smartImportDesc")}</p>
            <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">{t("linkedinUrl")}</FormLabel>
                <FormControl>
                  <Input dir="ltr" placeholder="https://www.linkedin.com/in/username" {...field} />
                </FormControl>
              </FormItem>
            )} />
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{t("smartImportHint")}</p>
            <Button type="button" variant="outline" className="mt-3 w-full gap-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10" onClick={extractLinkedIn}>
              <Sparkles className="size-4" />
              {t("extractBtn")}
            </Button>
          </section>

          {/* Source & assignment */}
          <section className="rounded-2xl border bg-card p-5 shadow-sm">
            <header className="mb-5 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Megaphone className="size-4 text-primary" />
                {t("secAssignment")}
              </h2>
              {sectionBadge(t("filledBadge", { n: assignFilled, total: 3 }), assignFilled >= 2 ? "ok" : "muted")}
            </header>

            <div className="space-y-5">
              {selectField("source", t("leadSource"), SOURCES.map((s) => ({ value: s, label: s })), t("selectSource"))}
              {selectField("targetPipeline", t("targetPipeline"), [
                { value: "none", label: t("noPipelineOption") },
                ...pipelines,
              ], t("noPipelineOption"))}
              {selectField("counselorId", t("fCounselor"), [
                { value: "none", label: t("notAssigned") },
                ...counselors.map((c) => ({ value: c.id, label: c.name })),
              ], t("notAssigned"))}

              <FormField control={form.control} name="leadType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("leadType")}</FormLabel>
                  <div className="flex gap-2">
                    {([["cold", "priorityCold"], ["warm", "priorityWarm"], ["hot", "priorityHot"]] as const).map(([val, k]) => {
                      const active = field.value === val;
                      return (
                        <button key={val} type="button" onClick={() => field.onChange(val)}
                          className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-semibold uppercase tracking-wide transition-colors",
                            active
                              ? val === "hot" ? "border-destructive bg-destructive/10 text-destructive"
                                : val === "warm" ? "border-warning bg-warning/15 text-warning"
                                : "border-chart-3 bg-chart-3/10 text-chart-3"
                              : "text-muted-foreground hover:bg-muted/40")}>
                          {active && <Check className="size-3.5" />}
                          {t(k)}
                        </button>
                      );
                    })}
                  </div>
                </FormItem>
              )} />

              <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                <span className="text-muted-foreground">{t("liveScore")}</span>
                <span className="font-semibold tabular-nums text-foreground">{score.score}</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer actions (full width) ─────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5 lg:col-span-2">
          <p className={cn("inline-flex items-center gap-2 text-sm", canSubmit ? "text-muted-foreground" : "text-warning")}>
            {!canSubmit && <AlertTriangle className="size-4" />}
            {canSubmit ? t("readyToCreate") : t("addPhoneWhatsApp")}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => router.push(`${basePath}/leads`)}>
              {t("cancel")}
            </Button>
            <Button type="button" variant="outline" onClick={() => submit(true)}
              disabled={!canSubmit || form.formState.isSubmitting}>
              {t("saveAndAdd")}
            </Button>
            <Button type="button" onClick={() => submit(false)}
              disabled={!canSubmit || form.formState.isSubmitting} className="gap-1.5">
              {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {t("saveLead")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
