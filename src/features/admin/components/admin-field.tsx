"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Labelled input used inside admin create dialogs. */
export function AdminField({
  label, value, onChange, type, dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} type={type} dir={dir} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
