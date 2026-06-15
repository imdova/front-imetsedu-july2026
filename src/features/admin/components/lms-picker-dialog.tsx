"use client";

import * as React from "react";
import { Search, Plus, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

/** Generic search-and-pick dialog reused by the LMS groups + students tabs. */
export function PickerDialog({
  open, onOpenChange, title, description, empty, busy, items, onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  empty: string;
  busy: boolean;
  items: { id: string; primary: string; secondary?: string }[];
  onPick: (id: string) => void;
}) {
  const [q, setQ] = React.useState("");
  const list = items.filter(
    (i) => i.primary.toLowerCase().includes(q.toLowerCase()) || (i.secondary ?? "").toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQ(""); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="ps-9" />
        </div>
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {list.length ? list.map((i) => (
            <li key={i.id}>
              <button
                type="button"
                disabled={busy}
                onClick={() => onPick(i.id)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start text-sm hover:bg-muted/50 disabled:opacity-50"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{i.primary}</span>
                  {i.secondary && <span className="block truncate text-xs text-muted-foreground">{i.secondary}</span>}
                </span>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4 text-primary" />}
              </button>
            </li>
          )) : <li className="py-8 text-center text-sm text-muted-foreground">{empty}</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
