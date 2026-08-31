"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CalendarDays, Plus, Trash2 } from "lucide-react";

import type { CourseFormValues, CourseIntakeValues } from "@/validations/course-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormSection } from "./form-section";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

/** Local yyyy-mm-dd for "today" — avoids the UTC shift `toISOString` introduces. */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Cohort intakes — the scheduled runs of this course.
 *
 * Future intakes drive the "Next intake" line on the public page and the
 * `hasCourseInstance` node that makes the page eligible for Google's Course
 * rich result. Past intakes stay stored (they are history) but are excluded
 * from the markup automatically, so a stale row can never mislead.
 */
export function IntakesSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const intakes = watch("intakes") ?? [];
  const today = todayKey();

  const add = () => {
    const item: CourseIntakeValues = {
      startDate: "",
      endDate: "",
      dayOfWeek: "",
      sessionTime: "",
      timezone: "Africa/Cairo",
      weeklyHours: 0,
      sessionDurationMinutes: 0,
      seatsAvailable: 0,
      status: "open",
    };
    setValue("intakes", [...intakes, item], { shouldDirty: true });
  };

  const patch = (index: number, next: Partial<CourseIntakeValues>) =>
    setValue(
      "intakes",
      intakes.map((x, i) => (i === index ? { ...x, ...next } : x)),
      { shouldDirty: true },
    );

  const remove = (index: number) =>
    setValue(
      "intakes",
      intakes.filter((_, i) => i !== index),
      { shouldDirty: true },
    );

  return (
    <FormSection
      title={t("secIntakes")}
      description={t("secIntakesDesc")}
      action={
        <Button type="button" size="sm" className="gap-1.5" onClick={add}>
          <Plus className="size-4" /> {t("addIntake")}
        </Button>
      }
    >
      {intakes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center text-muted-foreground">
          <CalendarDays className="size-8 opacity-50" />
          <p className="text-sm">{t("noIntakes")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {intakes.map((intake, index) => {
            const isPast = !!intake.startDate && intake.startDate < today;
            return (
              <div key={index} className="space-y-3 rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    {isPast && <Badge variant="secondary">{t("intakePast")}</Badge>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label={t("removeIntake")}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label={t("intakeStart")}>
                    <Input
                      type="date"
                      value={intake.startDate}
                      onChange={(e) => patch(index, { startDate: e.target.value })}
                    />
                  </Field>
                  <Field label={t("intakeEnd")}>
                    <Input
                      type="date"
                      value={intake.endDate}
                      min={intake.startDate || undefined}
                      onChange={(e) => patch(index, { endDate: e.target.value })}
                    />
                  </Field>
                  <Field label={t("intakeDay")}>
                    <Select
                      value={intake.dayOfWeek || undefined}
                      onValueChange={(v) => patch(index, { dayOfWeek: v })}
                    >
                      <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label={t("intakeTime")}>
                    <Input
                      type="time"
                      value={intake.sessionTime}
                      onChange={(e) => patch(index, { sessionTime: e.target.value })}
                    />
                  </Field>
                  <Field label={t("intakeTimezone")}>
                    <Input
                      value={intake.timezone}
                      onChange={(e) => patch(index, { timezone: e.target.value })}
                      placeholder="Africa/Cairo"
                      className="font-mono text-sm"
                    />
                  </Field>
                  <Field label={t("intakeWeeklyHours")}>
                    <Input
                      type="number"
                      min={0}
                      step="0.5"
                      value={intake.weeklyHours || ""}
                      onChange={(e) => patch(index, { weeklyHours: Number(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label={t("intakeSessionMinutes")}>
                    <Input
                      type="number"
                      min={0}
                      value={intake.sessionDurationMinutes || ""}
                      onChange={(e) => patch(index, { sessionDurationMinutes: Number(e.target.value) || 0 })}
                    />
                  </Field>
                  <Field label={t("intakeSeats")}>
                    <Input
                      type="number"
                      min={0}
                      value={intake.seatsAvailable || ""}
                      onChange={(e) => patch(index, { seatsAvailable: Number(e.target.value) || 0 })}
                      placeholder="—"
                    />
                  </Field>
                  <Field label={t("intakeStatus")}>
                    <Select
                      value={intake.status}
                      onValueChange={(v) => patch(index, { status: v as CourseIntakeValues["status"] })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">open</SelectItem>
                        <SelectItem value="closed">closed</SelectItem>
                        <SelectItem value="full">full</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </FormSection>
  );
}

/**
 * The remaining `Course` schema.org properties, none of which had a home in the
 * form before. Blank fields are omitted from the markup rather than emitted empty.
 */
export function StructuredDataSection() {
  const { watch, setValue, register } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const teachesEn = watch("teachesEn") ?? [];
  const teachesAr = watch("teachesAr") ?? [];

  const setLines = (name: "teachesEn" | "teachesAr", text: string) =>
    setValue(
      name,
      text.split("\n").map((s) => s.trim()).filter(Boolean),
      { shouldDirty: true },
    );

  return (
    <FormSection title={t("secStructured")} description={t("secStructuredDesc")}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("courseCode")}>
            <Input {...register("courseCode")} placeholder={t("courseCodePh")} className="font-mono text-sm" />
          </Field>
          <Field label={t("educationalLevel")}>
            <Input {...register("educationalLevel")} placeholder="Beginner / Intermediate / Advanced" />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("credentialAwarded")}>
            <Input {...register("credentialAwardedEn")} placeholder={t("credentialAwardedPh")} />
          </Field>
          <Field label={t("credentialAwardedArLabel")}>
            <Input dir="rtl" {...register("credentialAwardedAr")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("prerequisites")}>
            <Textarea rows={2} {...register("prerequisitesEn")} placeholder={t("prerequisitesPh")} />
          </Field>
          <Field label={t("prerequisitesArLabel")}>
            <Textarea rows={2} dir="rtl" {...register("prerequisitesAr")} />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("teaches")} hint={t("teachesHint")}>
            <Textarea
              rows={4}
              defaultValue={teachesEn.join("\n")}
              onBlur={(e) => setLines("teachesEn", e.target.value)}
            />
          </Field>
          <Field label={t("teachesArLabel")}>
            <Textarea
              rows={4}
              dir="rtl"
              defaultValue={teachesAr.join("\n")}
              onBlur={(e) => setLines("teachesAr", e.target.value)}
            />
          </Field>
        </div>
      </div>
    </FormSection>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
