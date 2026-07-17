"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, FileText, Loader2, Send, Upload, X } from "lucide-react";

import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

/**
 * "Teach at IMETS" application form.
 *
 * This used to be a placebo: `setTimeout(600)` → success toast → `reset()`, with
 * no request anywhere. Every applicant was told their application was received
 * and it was silently dropped. It now POSTs to `/instructor-applications`, and
 * only reports success when the server actually accepts it.
 *
 * `fields` are the school's real course categories, passed in from the server —
 * not a hand-written list that would drift from what IMETS actually teaches.
 */
/** Max CV size. Mirrors the server's limit so the user is told before the upload
 *  rather than after it fails. The server is still the one enforcing it. */
const MAX_CV_BYTES = 5 * 1024 * 1024;

export function BecomeForm({ fields = [] }: { fields?: { value: string; label: string }[] }) {
  const t = useTranslations("Marketing");
  const tc = useTranslations("Common");
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [picked, setPicked] = React.useState<string[]>([]);
  const [cv, setCv] = React.useState<{ url: string; name: string } | null>(null);
  const [cvBusy, setCvBusy] = React.useState(false);
  const cvInput = React.useRef<HTMLInputElement>(null);

  const toggleField = (v: string) =>
    setPicked((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  async function onCvChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Checked here for a fast, clear message; the server re-checks the mimetype
    // AND the file's magic bytes, because `accept` and `type` are both trivially
    // bypassed.
    if (file.type !== "application/pdf") {
      toast.error(t("becomeCvTypeError"));
      if (cvInput.current) cvInput.current.value = "";
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      toast.error(t("becomeCvSizeError"));
      if (cvInput.current) cvInput.current.value = "";
      return;
    }
    setCvBusy(true);
    const res = await dal.instructorApplications.uploadCv(file);
    setCvBusy(false);
    if (!res.ok) {
      toast.error(res.error || t("becomeCvError"));
      if (cvInput.current) cvInput.current.value = "";
      return;
    }
    setCv({ url: res.data.url, name: file.name });
    toast.success(t("becomeCvUploaded"));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const str = (k: string) => String(data.get(k) ?? "").trim();

    setSubmitting(true);
    const res = await dal.instructorApplications.submitApplication({
      fullName: str("fullName"),
      email: str("email"),
      phone: str("phone") || undefined,
      country: str("country") || undefined,
      expertise: str("expertise"),
      yearsExperience: str("yearsExperience") ? Number(str("yearsExperience")) : undefined,
      currentRole: str("currentRole") || undefined,
      linkedIn: str("linkedIn") || undefined,
      // Normally the chips; free text only when the catalogue failed to load.
      topics: fields.length
        ? picked.length
          ? picked
          : undefined
        : str("topics")
          ? str("topics").split(",").map((x) => x.trim()).filter(Boolean)
          : undefined,
      bio: str("bio"),
      cvUrl: cv?.url || undefined,
    });
    setSubmitting(false);

    if (!res.ok) {
      // Say so. The old version could not fail, which is why nobody noticed.
      toast.error(res.error || t("becomeError"));
      return;
    }
    setDone(true);
    toast.success(t("becomeApplied"));
    form.reset();
    setPicked([]);
    setCv(null);
  }

  if (done) {
    return (
      <div
        id="apply"
        className="scroll-mt-24 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-8 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="size-6" />
        </span>
        <p className="mt-4 font-heading text-xl font-bold text-foreground">
          {t("becomeThanksTitle")}
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {t("becomeThanksBody")}
        </p>
        <Button variant="outline" className="mt-5" onClick={() => setDone(false)}>
          {t("becomeAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form
      id="apply"
      onSubmit={onSubmit}
      className="scroll-mt-24 space-y-4 rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-7"
    >
      <div>
        <p className="font-heading text-lg font-bold">{t("becomeFormTitle")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t("becomeFormLead")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="fullName" label={tc("fullName")} required />
        <Field id="email" label={tc("email")} type="email" required />
        <Field id="phone" label={t("becomePhone")} type="tel" />
        <Field id="country" label={t("becomeCountry")} placeholder={t("becomeCountryPh")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field id="expertise" label={t("becomeExpertise")} placeholder={t("becomeExpertisePh")} required />
        <Field id="yearsExperience" label={t("becomeYears")} type="number" min={0} placeholder="8" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="currentRole" label={t("becomeCurrentRole")} placeholder={t("becomeCurrentRolePh")} />
        <Field id="linkedIn" label={t("becomeLinkedIn")} type="url" placeholder="https://linkedin.com/in/…" />
      </div>

      {/* No chips means the category fetch failed — ask in free text rather than
          silently dropping the question. */}
      {fields.length === 0 ? (
        <Field id="topics" label={t("becomeTopics")} placeholder={t("becomeTopicsPh")} />
      ) : (
        <div className="space-y-1.5">
          <span className="text-sm font-medium">{t("becomeFields")}</span>
          <p className="text-xs text-muted-foreground">{t("becomeFieldsHint")}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {fields.map((f) => {
              const on = picked.includes(f.value);
              return (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleField(f.value)}
                  className={
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition-colors " +
                    (on
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-card text-muted-foreground ring-border hover:text-foreground")
                  }
                >
                  {on && <CheckCircle2 className="size-3.5" />}
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CV — optional. The hero says no CV is needed to start the conversation,
          so requiring one here would contradict the page. */}
      <div className="space-y-1.5">
        <span className="text-sm font-medium">{t("becomeCv")}</span>
        <input
          ref={cvInput}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          onChange={onCvChange}
        />
        {cv ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <FileText className="size-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span className="min-w-0 flex-1 truncate">{cv.name}</span>
            <button
              type="button"
              aria-label={t("becomeCvRemove")}
              onClick={() => {
                setCv(null);
                if (cvInput.current) cvInput.current.value = "";
              }}
              className="shrink-0 text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={cvBusy}
            onClick={() => cvInput.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-60"
          >
            {cvBusy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {cvBusy ? tc("uploading") : t("becomeCvCta")}
          </button>
        )}
        <p className="text-[11px] text-muted-foreground">{t("becomeCvHint")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">
          {t("becomeBio")} <span className="text-destructive">*</span>
        </Label>
        <Textarea id="bio" name="bio" rows={5} required placeholder={t("becomeBioPh")} />
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full gap-2">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {submitting ? tc("sending") : t("becomeApply")}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">{t("becomePrivacy")}</p>
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
