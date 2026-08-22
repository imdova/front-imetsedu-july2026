"use client";
/* eslint-disable @next/next/no-img-element -- local preview of the chosen photo */

import * as React from "react";
import { Camera, CheckCircle2, GraduationCap, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { JoinInfo } from "@/lib/dal/graduates";
import { countries } from "@/constants/countries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

/** Student self-submission: photo, first/last name, country (dropdown), speciality. */
export function GraduateJoinForm({ slug, cohort }: { slug: string; cohort: JoinInfo }) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [country, setCountry] = React.useState(cohort.country || "");
  const [speciality, setSpeciality] = React.useState("");
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Please choose an image (JPG or PNG)"); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Image is too large (max 8MB)"); return; }
    if (preview) URL.revokeObjectURL(preview);
    setPhoto(f); setPreview(URL.createObjectURL(f));
  };

  const canSubmit = firstName.trim() && lastName.trim() && !!photo && !submitting;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !photo) return;
    setSubmitting(true);
    const r = await dal.graduates.submitGraduate(slug, {
      firstName: firstName.trim(), lastName: lastName.trim(), country, speciality: speciality.trim(), photo,
    });
    setSubmitting(false);
    if (!r.ok) { toast.error(r.error); return; }
    setDone(r.data.name);
  };

  const program = [cohort.programTitle, cohort.programTitleAccent].filter(Boolean).join(" ");

  if (done) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-success/12 text-success"><CheckCircle2 className="size-8" /></span>
        <h1 className="mt-4 font-heading text-2xl font-bold">Thank you, {done}!</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your details were added to <span className="font-medium text-foreground">{cohort.name}</span>. The gallery is updated once the IMETS team reviews and publishes it.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-6" /></span>
        <div>
          <h1 className="font-heading text-2xl font-bold leading-tight">{cohort.name}</h1>
          {program && <p className="mt-1 text-sm text-muted-foreground">{program} — add your photo and details to the graduation gallery.</p>}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {/* Photo */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => fileRef.current?.click()}
            className={cn("relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-2 bg-muted/40 text-muted-foreground transition hover:border-primary", preview ? "border-amber-400" : "border-dashed border-border")}>
            {preview ? <img src={preview} alt="" className="size-full object-cover" /> : <Camera className="size-7" />}
          </button>
          <div>
            <Label>Your photo <span className="text-destructive">*</span></Label>
            <p className="mt-1 text-xs text-muted-foreground">A clear, front-facing portrait (square works best). JPG or PNG, max 8MB.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2 gap-1.5" onClick={() => fileRef.current?.click()}>
              <Camera className="size-4" /> {photo ? "Change photo" : "Choose photo"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>First name <span className="text-destructive">*</span></Label>
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Marwa" required />
          </div>
          <div className="space-y-1.5">
            <Label>Last name <span className="text-destructive">*</span></Label>
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Ismail" required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
              <SelectContent position="popper" className="max-h-72">
                {countries.map((c) => <SelectItem key={c.code} value={c.name}>{c.flag} {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Speciality</Label>
            <Input value={speciality} onChange={(e) => setSpeciality(e.target.value)} placeholder="e.g. Nursing, Pharmacy, Quality Officer" />
          </div>
        </div>

        <Button type="submit" className="w-full gap-1.5" disabled={!canSubmit}>
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Submit my details
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">By submitting you agree that your name and photo may appear on the public graduation gallery.</p>
      </div>
    </form>
  );
}
