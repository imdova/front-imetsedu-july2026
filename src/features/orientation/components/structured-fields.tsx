"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/* eslint-disable @typescript-eslint/no-explicit-any -- a schema-driven editor over loose JSON */

/**
 * A small schema-driven form over plain JSON objects.
 *
 * Every orientation module has a different shape (threads of messages, rules
 * with good/bad lines, scenarios with options…). Rather than one hand-built
 * form per module, each is described as a `Field[]` and rendered here — adding
 * a field to a module is one line in the spec, not a new form.
 */
export type Field =
  | { kind: "text"; key: string; label: string; multiline?: boolean; hint?: string; ltr?: boolean }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[]; hint?: string }
  | { kind: "boolean"; key: string; label: string; hint?: string }
  | { kind: "strings"; key: string; label: string; hint?: string }
  | {
      kind: "list";
      key: string;
      label: string;
      hint?: string;
      item: Field[];
      itemTitle: (item: any, index: number) => string;
      newItem: () => Record<string, unknown>;
      /** The module can't render with fewer. */
      minItems?: number;
    }
  | { kind: "group"; key: string; label: string; hint?: string; fields: Field[] };

type Obj = Record<string, any>;

export function FieldsEditor({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Obj;
  onChange: (next: Obj) => void;
}) {
  const set = (key: string, v: unknown) => onChange({ ...value, [key]: v });
  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <FieldControl key={f.key} field={f} value={value?.[f.key]} onChange={(v) => set(f.key, v)} />
      ))}
    </div>
  );
}

function Label({ label, hint }: { label: string; hint?: string }) {
  return (
    <span className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
      <span className="text-xs font-semibold">{label}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </span>
  );
}

function FieldControl({ field, value, onChange }: { field: Field; value: any; onChange: (v: unknown) => void }) {
  switch (field.kind) {
    case "text":
      return (
        <label className="block">
          <Label label={field.label} hint={field.hint} />
          {field.multiline ? (
            <Textarea
              dir={field.ltr ? "ltr" : "auto"}
              rows={3}
              value={value ?? ""}
              onChange={(e) => onChange(e.target.value)}
              className="leading-relaxed"
            />
          ) : (
            <Input dir={field.ltr ? "ltr" : "auto"} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
          )}
        </label>
      );
    case "select":
      return (
        <label className="block">
          <Label label={field.label} hint={field.hint} />
          <select
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {!field.options.some((o) => o.value === value) && value && <option value={value}>{value}</option>}
            {field.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      );
    case "boolean":
      return (
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2">
          <span>
            <span className="block text-xs font-semibold">{field.label}</span>
            {field.hint && <span className="block text-[11px] text-muted-foreground">{field.hint}</span>}
          </span>
          <Switch checked={!!value} onCheckedChange={(v) => onChange(v)} />
        </label>
      );
    case "strings":
      return (
        <label className="block">
          <Label label={field.label} hint={field.hint ?? "One per line"} />
          <Textarea
            dir="auto"
            rows={3}
            value={Array.isArray(value) ? value.join("\n") : ""}
            onChange={(e) => onChange(e.target.value.split("\n"))}
            onBlur={(e) =>
              onChange(
                e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          />
        </label>
      );
    case "group":
      return (
        <fieldset className="rounded-xl border border-border/70 p-3">
          <legend className="px-1 text-xs font-bold">{field.label}</legend>
          {field.hint && <p className="mb-2 text-[11px] text-muted-foreground">{field.hint}</p>}
          <FieldsEditor fields={field.fields} value={value ?? {}} onChange={onChange} />
        </fieldset>
      );
    case "list":
      return <ListControl field={field} value={Array.isArray(value) ? value : []} onChange={onChange} />;
  }
}

function ListControl({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { kind: "list" }>;
  value: Obj[];
  onChange: (v: Obj[]) => void;
}) {
  const [open, setOpen] = React.useState<number | null>(null);
  const min = field.minItems ?? 0;

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(open === i ? j : open === j ? i : open);
  };

  return (
    <div>
      <Label label={`${field.label} (${value.length})`} hint={field.hint} />
      <div className="space-y-1.5">
        {value.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={cn("rounded-xl border bg-card", isOpen ? "border-primary/40" : "border-border/70")}>
              <div className="flex items-center gap-1 pe-1">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-start text-sm"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span dir="auto" className="min-w-0 flex-1 truncate">
                    {field.itemTitle(item, i) || <span className="text-muted-foreground">Untitled</span>}
                  </span>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                <Button type="button" size="icon" variant="ghost" className="size-7" disabled={i === 0} onClick={() => move(i, -1)} title="Move up">
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                  title="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  disabled={value.length <= min}
                  onClick={() => {
                    onChange(value.filter((_, j) => j !== i));
                    setOpen(null);
                  }}
                  title={value.length <= min ? `Keep at least ${min}` : "Remove"}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {isOpen && (
                <div className="border-t border-border/60 p-3">
                  <FieldsEditor
                    fields={field.item}
                    value={item}
                    onChange={(next) => onChange(value.map((x, j) => (j === i ? next : x)))}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="mt-2 gap-1.5"
        onClick={() => {
          onChange([...value, field.newItem()]);
          setOpen(value.length);
        }}
      >
        <Plus className="size-3.5" /> Add
      </Button>
    </div>
  );
}
