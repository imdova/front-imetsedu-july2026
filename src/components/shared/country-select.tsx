"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { countries, countryName, type Country } from "@/constants/countries";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Country picker with a real flag, searchable by name (English or Arabic) or
 * ISO code. The value stored is the English country name, which is what the
 * API and every admin screen already read.
 *
 * The flags are images, not the regional-indicator emoji the rest of the app
 * uses: Windows ships no flag glyphs, so `🇪🇬` renders there as a small "EG"
 * box — on the machines a good share of applicants are using, the emoji is not
 * a flag at all. The emoji is kept as the image's `alt`, so a blocked or failed
 * image degrades to it rather than to nothing.
 */
function Flag({ country }: { country: Country }) {
  const code = country.code.toLowerCase();
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      width={20}
      height={14}
      loading="lazy"
      decoding="async"
      alt={country.flag}
      className="h-[14px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/5"
    />
  );
}

export function CountrySelect({
  value,
  onChange,
  locale = "en",
  placeholder = "Select a country",
  searchPlaceholder = "Search…",
  emptyText = "No country found",
  disabled,
  className,
}: {
  /** The country's English name, or "" when nothing is picked. */
  value: string;
  onChange: (name: string) => void;
  locale?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = countries.find((c) => c.name === value);

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-2xs transition-[color,box-shadow,border-color] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            {selected && <Flag country={selected} />}
            <span className="truncate">
              {selected ? countryName(selected, locale) : placeholder}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      {/* The search box keeps focus on open, unlike the other selects in this
          codebase: 228 countries is a list you type into, not one you scroll. */}
      <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput autoFocus placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  /* Searchable by both names and the ISO code; cmdk matches on
                     this string, while the row below is what gets rendered. */
                  value={`${c.name} ${c.nameAr ?? ""} ${c.code}`}
                  onSelect={() => {
                    onChange(c.name === value ? "" : c.name);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <Flag country={c} />
                  <span className="min-w-0 flex-1 truncate">{countryName(c, locale)}</span>
                  {c.name === value && <Check className="size-4 shrink-0" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
