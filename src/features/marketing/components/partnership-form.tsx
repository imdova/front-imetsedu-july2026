"use client";

import * as React from "react";
import {
  Building2,
  CheckCircle2,
  Globe,
  Loader2,
  Mail,
  Phone,
  Send,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Partnership enquiry form for the /lp/partnership landing page.
 *
 * Educational organizations and hospitals worldwide submit a partnership
 * request. It captures the enquiry through the same public funnel every landing
 * page uses (`dal.landing.captureLead`), so the lead lands in Admin → Marketing
 * with the full organization detail packed into the `interest` field (the
 * public ExamLead schema has no dedicated org/website/message columns, so the
 * detail is preserved as a readable structured summary rather than dropped).
 * Also fires the browser-side Meta Lead event, deduped against the server CAPI.
 */

const COUNTRY_CODES = [
  { code: "+20", iso: "eg" },
  { code: "+966", iso: "sa" },
  { code: "+971", iso: "ae" },
  { code: "+965", iso: "kw" },
  { code: "+974", iso: "qa" },
  { code: "+973", iso: "bh" },
  { code: "+968", iso: "om" },
  { code: "+962", iso: "jo" },
  { code: "+1", iso: "us" },
  { code: "+44", iso: "gb" },
  { code: "+33", iso: "fr" },
  { code: "+49", iso: "de" },
  { code: "+91", iso: "in" },
  { code: "+234", iso: "ng" },
  { code: "+254", iso: "ke" },
  { code: "+92", iso: "pk" },
  { code: "+60", iso: "my" },
  { code: "+62", iso: "id" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (s: string) => s.replace(/\D/g, "");

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

type Lang = "en" | "ar";

const COPY = {
  en: {
    title: "Start a partnership",
    lead: "Tell us about your organization and an IMETS partnerships advisor will reach out within two business days.",
    org: "Organization name",
    orgPh: "e.g. King Fahd Medical City",
    type: "Organization type",
    typePh: "Select type",
    types: [
      "Hospital",
      "Clinic / Medical Center",
      "University / College",
      "Training Institute",
      "Government / Ministry",
      "Company / Employer",
      "Other",
    ],
    contact: "Contact person",
    contactPh: "Full name",
    role: "Job title",
    rolePh: "e.g. Training Director",
    email: "Work email",
    emailPh: "you@organization.com",
    phone: "Phone / WhatsApp",
    phonePh: "10 1234 5678",
    country: "Country",
    countryPh: "e.g. Saudi Arabia",
    website: "Website",
    websitePh: "https://…",
    interests: "How would you like to partner?",
    interestsHint: "Select all that apply.",
    interestOptions: [
      "Accredited training delivery",
      "Co-branded programs",
      "Student placement & internships",
      "Faculty / instructor exchange",
      "Corporate / staff upskilling",
      "Licensing IMETS content",
      "Research collaboration",
      "Other",
    ],
    message: "Anything else?",
    messagePh: "Tell us about your goals, size, timeline…",
    submit: "Submit partnership request",
    sending: "Sending…",
    privacy: "We'll only use your details to discuss a partnership. No spam.",
    errName: "Please enter the contact person's name.",
    errOrg: "Please enter your organization name.",
    errType: "Please select your organization type.",
    errEmail: "Enter a valid work email.",
    errPhone: "Enter a valid phone number.",
    errCountry: "Please enter your country.",
    fail: "Something went wrong. Please try again.",
    doneTitle: "Thank you",
    doneBody:
      "Your partnership request has been received. An IMETS partnerships advisor will contact you within two business days.",
    another: "Submit another",
  },
  ar: {
    title: "ابدأ شراكة",
    lead: "أخبرنا عن مؤسستك وسيتواصل معك مستشار الشراكات في IMETS خلال يومَي عمل.",
    org: "اسم المؤسسة",
    orgPh: "مثال: مدينة الملك فهد الطبية",
    type: "نوع المؤسسة",
    typePh: "اختر النوع",
    types: [
      "مستشفى",
      "عيادة / مركز طبي",
      "جامعة / كلية",
      "معهد تدريب",
      "جهة حكومية / وزارة",
      "شركة / جهة توظيف",
      "أخرى",
    ],
    contact: "الشخص المسؤول",
    contactPh: "الاسم الكامل",
    role: "المسمّى الوظيفي",
    rolePh: "مثال: مدير التدريب",
    email: "البريد الإلكتروني للعمل",
    emailPh: "you@organization.com",
    phone: "الهاتف / واتساب",
    phonePh: "10 1234 5678",
    country: "الدولة",
    countryPh: "مثال: السعودية",
    website: "الموقع الإلكتروني",
    websitePh: "https://…",
    interests: "كيف تودّ الشراكة؟",
    interestsHint: "اختر كل ما ينطبق.",
    interestOptions: [
      "تقديم تدريب معتمد",
      "برامج مشتركة العلامة",
      "تنسيب الطلاب والتدريب العملي",
      "تبادل أعضاء هيئة التدريس / المدرّبين",
      "تأهيل وتطوير الكوادر",
      "ترخيص محتوى IMETS",
      "تعاون بحثي",
      "أخرى",
    ],
    message: "أي شيء آخر؟",
    messagePh: "أخبرنا عن أهدافك وحجم المؤسسة والإطار الزمني…",
    submit: "أرسل طلب الشراكة",
    sending: "جارٍ الإرسال…",
    privacy: "سنستخدم بياناتك فقط لمناقشة الشراكة. بدون رسائل مزعجة.",
    errName: "من فضلك أدخل اسم الشخص المسؤول.",
    errOrg: "من فضلك أدخل اسم المؤسسة.",
    errType: "من فضلك اختر نوع المؤسسة.",
    errEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
    errPhone: "أدخل رقم هاتف صحيحًا.",
    errCountry: "من فضلك أدخل الدولة.",
    fail: "حدث خطأ ما. حاول مرة أخرى.",
    doneTitle: "شكرًا لك",
    doneBody:
      "تم استلام طلب الشراكة. سيتواصل معك مستشار الشراكات في IMETS خلال يومَي عمل.",
    another: "إرسال طلب آخر",
  },
} satisfies Record<Lang, Record<string, unknown>>;

export function PartnershipForm({
  path,
  lang = "en",
}: {
  path: string;
  lang?: Lang;
}) {
  const t = COPY[lang];
  const ar = lang === "ar";

  const [form, setForm] = React.useState({
    org: "",
    type: "",
    contact: "",
    role: "",
    email: "",
    code: "+20",
    phone: "",
    country: "",
    website: "",
    message: "",
  });
  const [interests, setInterests] = React.useState<string[]>([]);
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    dal.landing.trackLanding(path, "view").catch(() => {});
  }, [path]);

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));
  const toggleInterest = (v: string) =>
    setInterests((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  const orgOk = form.org.trim().length >= 2;
  const typeOk = !!form.type;
  const nameOk = form.contact.trim().length >= 2;
  const emailOk = EMAIL_RE.test(form.email.trim());
  const phoneOk = digits(form.phone).length >= 7;
  const countryOk = form.country.trim().length >= 2;
  const isValid = orgOk && typeOk && nameOk && emailOk && phoneOk && countryOk;

  const err = {
    org: touched && !orgOk ? t.errOrg : "",
    type: touched && !typeOk ? t.errType : "",
    contact: touched && !nameOk ? t.errName : "",
    email: touched && !emailOk ? t.errEmail : "",
    phone: touched && !phoneOk ? t.errPhone : "",
    country: touched && !countryOk ? t.errCountry : "",
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setTouched(true);
      return;
    }
    setSubmitting(true);
    const whatsapp = `${form.code} ${digits(form.phone)}`;

    // Pack the full partnership detail into `interest` so nothing is lost — the
    // public lead schema has no org/website/message columns.
    const summary = [
      "Partnership request",
      `Organization: ${form.org.trim()} (${form.type})`,
      form.role.trim() && `Contact role: ${form.role.trim()}`,
      `Country: ${form.country.trim()}`,
      form.website.trim() && `Website: ${form.website.trim()}`,
      interests.length && `Interested in: ${interests.join(", ")}`,
      form.message.trim() && `Message: ${form.message.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");

    const fb = fbLeadContext();
    const res = await dal.landing.captureLead({
      name: form.contact.trim(),
      email: form.email.trim(),
      whatsapp,
      profession: form.type, // organization type
      interest: summary,
      region: form.country.trim(),
      path,
      ...fb,
    });
    setSubmitting(false);

    if (!res.ok) {
      toast.error(res.error || t.fail);
      return;
    }
    setDone(true);
    dal.landing.trackLanding(path, "click").catch(() => {});
    fireBrowserLead(fb.eventId, { content_name: "Partnership" });
  };

  if (done) {
    return (
      <Card
        id="partner"
        dir={ar ? "rtl" : "ltr"}
        className="scroll-mt-24 border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20"
      >
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="size-6" />
          </span>
          <h3 className="font-heading text-xl font-bold">{t.doneTitle}</h3>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t.doneBody}
          </p>
          <Button variant="outline" className="mt-2" onClick={() => setDone(false)}>
            {t.another}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="partner" className="scroll-mt-24 shadow-lg shadow-primary/5">
      <CardContent className="py-6">
        <div className="mb-4">
          <p className="font-heading text-lg font-bold">{t.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.lead}</p>
        </div>

        <form
          onSubmit={submit}
          dir={ar ? "rtl" : "ltr"}
          className="grid gap-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.org} required error={err.org}>
              <InputIcon icon={Building2}>
                <Input
                  className="ps-9"
                  value={form.org}
                  onChange={(e) => set("org", e.target.value)}
                  placeholder={t.orgPh}
                />
              </InputIcon>
            </Field>

            <Field label={t.type} required error={err.type}>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.typePh} />
                </SelectTrigger>
                <SelectContent>
                  {t.types.map((x) => (
                    <SelectItem key={x} value={x}>
                      {x}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label={t.contact} required error={err.contact}>
              <InputIcon icon={User}>
                <Input
                  className="ps-9"
                  value={form.contact}
                  onChange={(e) => set("contact", e.target.value)}
                  placeholder={t.contactPh}
                  autoComplete="name"
                />
              </InputIcon>
            </Field>

            <Field label={t.role}>
              <Input
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder={t.rolePh}
              />
            </Field>

            <Field label={t.email} required error={err.email}>
              <InputIcon icon={Mail}>
                <Input
                  className="ps-9"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder={t.emailPh}
                  autoComplete="email"
                />
              </InputIcon>
            </Field>

            <Field label={t.country} required error={err.country}>
              <InputIcon icon={Globe}>
                <Input
                  className="ps-9"
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder={t.countryPh}
                  autoComplete="country-name"
                />
              </InputIcon>
            </Field>
          </div>

          <Field label={t.phone} required error={err.phone}>
            <div className="flex gap-2" dir="ltr">
              <Select value={form.code} onValueChange={(v) => set("code", v)}>
                <SelectTrigger className="w-28 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code + c.iso} value={c.code}>
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
                  className="ps-9"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) =>
                    set("phone", e.target.value.replace(/[^\d\s]/g, ""))
                  }
                  placeholder={t.phonePh}
                  autoComplete="tel-national"
                />
              </InputIcon>
            </div>
          </Field>

          <Field label={t.website}>
            <Input
              type="url"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder={t.websitePh}
              dir="ltr"
            />
          </Field>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              {t.interests}
            </Label>
            <p className="text-xs text-muted-foreground/80">{t.interestsHint}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              {t.interestOptions.map((opt) => {
                const on = interests.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleInterest(opt)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors",
                      on
                        ? "bg-primary text-primary-foreground ring-primary"
                        : "bg-card text-muted-foreground ring-border hover:text-foreground",
                    )}
                  >
                    {on && <CheckCircle2 className="size-3.5" />}
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          <Field label={t.message}>
            <Textarea
              rows={4}
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              placeholder={t.messagePh}
            />
          </Field>

          <Button
            type="submit"
            size="lg"
            className="mt-1 w-full gap-1.5"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {submitting ? t.sending : t.submit}
          </Button>
          <p className="text-center text-[11px] text-muted-foreground">
            {t.privacy}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function InputIcon({
  icon: Icon,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative", className)}>
      <Icon className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
      {children}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
