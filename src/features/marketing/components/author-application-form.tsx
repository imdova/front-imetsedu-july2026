"use client";

import * as React from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, ChevronDown, Loader2, Send } from "lucide-react";

import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { countries } from "@/constants/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneCodeSelect } from "@/components/shared/phone-code-select";

/** One blog section and the topics under it, straight from the live taxonomy. */
export interface InterestGroup {
  category: string;
  label: string;
  topics: { value: string; label: string }[];
}

/** The stored value is the English label, so admin filtering is language-independent. */
const PROFESSIONS: { value: string; ar: string }[] = [
  { value: "Physician", ar: "طبيب" },
  { value: "Nurse", ar: "ممرض / ممرضة" },
  { value: "Pharmacist", ar: "صيدلي" },
  { value: "Dentist", ar: "طبيب أسنان" },
  { value: "Allied health professional", ar: "أخصائي مهن صحية مساندة" },
  { value: "Quality & patient safety professional", ar: "أخصائي جودة وسلامة مرضى" },
  { value: "Infection prevention professional", ar: "أخصائي مكافحة عدوى" },
  { value: "Healthcare manager / administrator", ar: "مدير / إداري رعاية صحية" },
  { value: "Academic / researcher", ar: "أكاديمي / باحث" },
  { value: "Other", ar: "أخرى" },
];

/** Mirrors the server's DTO so the applicant hears about it before the request, not after. */
const BIO_MIN = 40;
const BIO_MAX = 3000;
const WHATSAPP = /^\+[1-9]\d{6,14}$/;

/**
 * "Write for IMETS" application form.
 *
 * Areas of interest come from the real blog taxonomy, passed in by the server —
 * a hand-written list here would drift from what the blog actually publishes.
 * If the taxonomy fails to load, the question falls back to free text rather
 * than silently disappearing.
 */
export function AuthorApplicationForm({
  locale,
  interests,
}: {
  locale: string;
  interests: InterestGroup[];
}) {
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);

  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [dial, setDial] = React.useState("+20");
  const dialTouched = React.useRef(false);
  const [nationality, setNationality] = React.useState("");
  const [natOpen, setNatOpen] = React.useState(false);
  const [profession, setProfession] = React.useState("");
  const [picked, setPicked] = React.useState<string[]>([]);
  const [bio, setBio] = React.useState("");

  const nationalityCountry = countries.find((c) => c.name === nationality);

  const toggle = (v: string) =>
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  function pickNationality(name: string) {
    setNationality(name);
    setNatOpen(false);
    // Most applicants' WhatsApp number shares their nationality's code — preselect
    // it, but never overwrite a code they've already chosen themselves.
    const dialForCountry = countries.find((c) => c.name === name)?.dial;
    if (dialForCountry && !dialTouched.current) setDial(dialForCountry);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const str = (k: string) => String(data.get(k) ?? "").trim();

    if (!nationality) {
      toast.error(tr("Please choose your nationality.", "يرجى اختيار الجنسية."));
      return;
    }
    if (!profession) {
      toast.error(tr("Please choose your profession.", "يرجى اختيار المهنة."));
      return;
    }
    // A local trunk zero ("0100...") is dropped: with a country code in front it
    // would produce a number that doesn't exist.
    const local = str("whatsapp").replace(/\D/g, "").replace(/^0+/, "");
    const whatsapp = `${dial}${local}`;
    if (!WHATSAPP.test(whatsapp)) {
      toast.error(tr("Enter a valid WhatsApp number.", "أدخل رقم واتساب صحيحًا."));
      return;
    }
    if (bio.trim().length < BIO_MIN) {
      toast.error(tr(`Your bio needs at least ${BIO_MIN} characters.`, `النبذة تحتاج ${BIO_MIN} حرفًا على الأقل.`));
      return;
    }

    const chosen = interests.length
      ? picked
      : str("topics").split(",").map((s) => s.trim()).filter(Boolean);

    setSubmitting(true);
    const res = await dal.authorApplications.submitApplication({
      fullName: str("fullName"),
      email: str("email"),
      whatsapp,
      nationality,
      profession,
      jobTitle: str("jobTitle"),
      bio: bio.trim(),
      interests: chosen.length ? chosen : undefined,
      website: str("website") || undefined,
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.error || tr("Something went wrong. Please try again.", "حدث خطأ ما. حاول مرة أخرى."));
      return;
    }
    setDone(true);
    form.reset();
    setPicked([]);
    setBio("");
    setNationality("");
    setProfession("");
  }

  if (done) {
    return (
      <div
        id="apply"
        className="scroll-mt-24 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-8 text-center shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="size-7" />
        </span>
        <p className="mt-5 font-heading text-2xl font-bold text-foreground">
          {tr("Application received", "تم استلام طلبك")}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {tr(
            "Thank you. Our editorial team will review it and contact you on WhatsApp.",
            "شكرًا لك. سيراجع فريقنا التحريري طلبك ويتواصل معك عبر واتساب.",
          )}
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          {tr("Submit another application", "إرسال طلب آخر")}
        </Button>
      </div>
    );
  }

  return (
    <form
      id="apply"
      onSubmit={onSubmit}
      className="relative scroll-mt-24 space-y-4 rounded-3xl border border-border/70 bg-card/95 p-6 shadow-xl shadow-primary/5 backdrop-blur sm:p-7"
    >
      {/* Honeypot: off-screen and hidden from assistive tech. People never see it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <p className="font-heading text-xl font-bold">{tr("Apply to write", "قدّم طلب الكتابة")}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {tr("Tell us who you are and what you'd like to write about.", "عرّفنا بنفسك وبما تودّ الكتابة عنه.")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="fullName" label={tr("Full name", "الاسم الكامل")} autoComplete="name" required />
        <Field id="email" label={tr("Email", "البريد الإلكتروني")} type="email" autoComplete="email" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp">
          {tr("WhatsApp number", "رقم واتساب")} <span className="text-destructive">*</span>
        </Label>
        {/* Code picker stays on the left in both directions — phone numbers read LTR. */}
        <div className="flex gap-2" dir="ltr">
          <PhoneCodeSelect
            value={dial}
            onChange={(d) => {
              dialTouched.current = true;
              setDial(d);
            }}
          />
          <Input
            id="whatsapp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="100 881 5007"
            required
          />
        </div>
        <p className="text-[11px] text-muted-foreground">
          {tr("With country code — this is how we'll contact you.", "مع رمز الدولة — سنتواصل معك عليه.")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>
            {tr("Nationality", "الجنسية")} <span className="text-destructive">*</span>
          </Label>
          <Popover open={natOpen} onOpenChange={setNatOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-expanded={natOpen}
                className="flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-sm shadow-2xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20"
              >
                {nationalityCountry ? (
                  <>
                    <span className="text-base leading-none">{nationalityCountry.flag}</span>
                    <span className="flex-1 truncate text-start">{nationalityCountry.name}</span>
                  </>
                ) : (
                  <span className="flex-1 text-start text-muted-foreground">
                    {tr("Select nationality", "اختر الجنسية")}
                  </span>
                )}
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-72 p-0">
              <Command>
                <CommandInput placeholder={tr("Search countries…", "ابحث عن دولة…")} />
                <CommandList>
                  <CommandEmpty>{tr("No results", "لا توجد نتائج")}</CommandEmpty>
                  <CommandGroup>
                    {countries.map((c) => (
                      <CommandItem key={c.code} value={`${c.name} ${c.code}`} onSelect={() => pickNationality(c.name)}>
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="flex-1 truncate">{c.name}</span>
                        {nationality === c.name && <Check className="size-4 text-primary" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1.5">
          <Label>
            {tr("Profession", "المهنة")} <span className="text-destructive">*</span>
          </Label>
          <Select value={profession} onValueChange={setProfession}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={tr("Select profession", "اختر المهنة")} />
            </SelectTrigger>
            <SelectContent>
              {PROFESSIONS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {ar ? p.ar : p.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Field
        id="jobTitle"
        label={tr("Current job title", "المسمّى الوظيفي الحالي")}
        placeholder={tr("e.g. Head of Quality", "مثال: رئيس قسم الجودة")}
        autoComplete="organization-title"
        required
      />

      {interests.length === 0 ? (
        <Field
          id="topics"
          label={tr("Topics you'd like to write about (comma-separated)", "المواضيع التي تودّ الكتابة عنها (افصل بفاصلة)")}
        />
      ) : (
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">{tr("Areas of interest", "مجالات الاهتمام")}</span>
            <p className="text-xs text-muted-foreground">{tr("Pick all that apply.", "اختر كل ما ينطبق.")}</p>
          </div>
          <div className="max-h-64 space-y-3 overflow-y-auto rounded-2xl border border-border/60 bg-muted/30 p-3">
            {interests.map((g) => (
              <div key={g.category}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.topics.map((t) => {
                    const on = picked.includes(t.value);
                    return (
                      <button
                        key={t.value}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(t.value)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-all",
                          on
                            ? "bg-primary text-primary-foreground shadow-sm ring-primary"
                            : "bg-card text-muted-foreground ring-border hover:text-foreground hover:ring-primary/40",
                        )}
                      >
                        {on && <Check className="size-3.5" />}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <Label htmlFor="bio">
            {tr("Professional bio", "نبذة مهنية")} <span className="text-destructive">*</span>
          </Label>
          <span
            className={cn(
              "text-[11px] tabular-nums",
              bio.trim().length >= BIO_MIN ? "text-emerald-600" : "text-muted-foreground",
            )}
          >
            {bio.trim().length}/{BIO_MIN}+
          </span>
        </div>
        <Textarea
          id="bio"
          name="bio"
          rows={5}
          required
          maxLength={BIO_MAX}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={tr(
            "Your experience, credentials and what you'd like to write about.",
            "خبرتك ومؤهلاتك وما تودّ الكتابة عنه.",
          )}
        />
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full gap-2">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:-scale-x-100" />}
        {submitting ? tr("Sending…", "جارٍ الإرسال…") : tr("Submit application", "إرسال الطلب")}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        {tr(
          "We use these details only to review your application and contact you.",
          "نستخدم هذه البيانات فقط لمراجعة طلبك والتواصل معك.",
        )}
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  required,
  ...rest
}: {
  id: string;
  label: string;
  required?: boolean;
} & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input id={id} name={id} required={required} {...rest} />
    </div>
  );
}
