"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { countries } from "@/constants/countries";

interface PhoneCodeSelectProps {
  value: string;
  onChange: (dial: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PhoneCodeSelect({ value, onChange, disabled, className }: PhoneCodeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const selected = countries.find((c) => c.dial === value) ?? countries[0];

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-[108px] shrink-0 items-center gap-1.5 rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-2xs transition-[color,box-shadow,border-color] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="flex-1 text-start tabular-nums">{selected.dial}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" side="bottom" className="w-64 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Command>
          <CommandInput placeholder="Search country or code…" />
          <CommandList>
            <CommandEmpty>No results</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.dial} ${c.code}`}
                  onSelect={() => { onChange(c.dial); setOpen(false); }}
                  data-checked={c.dial === value}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{c.dial}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
