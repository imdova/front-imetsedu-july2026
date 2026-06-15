"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  className?: string;
}

/**
 * Repeatable chip input (SEO keywords field). Enter or comma commits a tag;
 * Backspace on an empty input removes the last one. Duplicates are ignored.
 */
export function TagsInput({
  value,
  onChange,
  placeholder = "Add a keyword",
  dir = "ltr",
  className,
}: TagsInputProps) {
  const [draft, setDraft] = React.useState("");

  const commit = (raw: string) => {
    const tag = raw.trim();
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const remove = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div
      dir={dir}
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-background p-1.5 focus-within:ring-2 focus-within:ring-ring/40",
        className,
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 ps-2.5">
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            className="rounded-full opacity-60 hover:opacity-100"
            aria-label={`Remove ${tag}`}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            remove(value[value.length - 1]);
          }
        }}
        onBlur={() => commit(draft)}
        placeholder={placeholder}
        className="h-7 flex-1 border-0 bg-transparent p-0 px-1.5 shadow-none focus-visible:ring-0 dark:bg-transparent"
      />
    </div>
  );
}
