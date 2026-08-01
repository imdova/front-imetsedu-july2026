"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  /** Allow creating a new value by typing a name that isn't in the options. */
  creatable?: boolean;
  /** Optional callback when a brand-new value is created (e.g. to persist it). */
  onCreate?: (value: string) => void;
}

/**
 * Searchable multi-select with selected items shown as removable chips. Powers
 * the course form's Instructors and Tags relations (search + multi-select).
 * With `creatable`, a typed value that matches no option can be added on the fly
 * (used for WhatsApp trigger groups so an empty/new group can be selected).
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  className,
  creatable = false,
  onCreate,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const toggle = (val: string) =>
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
    );

  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v;

  const q = query.trim();
  const ql = q.toLowerCase();
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(ql) || o.value.toLowerCase().includes(ql))
    : options;
  const exists = options.some((o) => o.value.toLowerCase() === ql || o.label.toLowerCase() === ql);
  const showCreate = creatable && !!q && !exists;

  const create = () => {
    if (!q) return;
    if (!value.includes(q)) onChange([...value, q]);
    onCreate?.(q);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setQuery(""); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-10 w-full justify-between gap-2 px-3 py-2 font-normal",
            className,
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            {value.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {value.map((v) => (
              <Badge
                key={v}
                variant="secondary"
                className="gap-1 ps-2.5"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(v);
                }}
              >
                {labelFor(v)}
                <X className="size-3 opacity-60 hover:opacity-100" />
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList>
            {filtered.length === 0 && !showCreate && <CommandEmpty>{emptyText}</CommandEmpty>}
            {showCreate && (
              <CommandGroup>
                <CommandItem value={`__create__${q}`} onSelect={create}>
                  <span className="flex items-center gap-1 text-primary">
                    <span className="text-lg leading-none">+</span> Create “{q}”
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {filtered.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.value}
                  onSelect={() => toggle(o.value)}
                >
                  <Check
                    className={cn(
                      "size-4",
                      value.includes(o.value) ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex flex-col">
                    <span>{o.label}</span>
                    {o.hint && (
                      <span className="text-xs text-muted-foreground">
                        {o.hint}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
