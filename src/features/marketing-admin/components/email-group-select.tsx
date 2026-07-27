"use client";

import * as React from "react";
import { ChevronDown, Users } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { SubscriberGroup } from "@/lib/db/email-marketing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Assigns the subscriber group(s) a page's registration form feeds. Persists as
 * the group's linked `paths` — so a form on `path` auto-joins the checked groups.
 * `groups` is the full group list (fetched once by the parent).
 */
export function EmailGroupSelect({
  path, groups, className,
}: {
  path: string;
  groups: SubscriberGroup[];
  className?: string;
}) {
  const [selected, setSelected] = React.useState<string[]>(
    () => groups.filter((g) => g.paths.includes(path)).map((g) => g.name),
  );
  const [saving, setSaving] = React.useState(false);

  // Keep in sync when the parent's group list loads/refreshes.
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- re-derive from props
    setSelected(groups.filter((g) => g.paths.includes(path)).map((g) => g.name));
  }, [groups, path]);

  const toggle = async (name: string, on: boolean) => {
    const next = on ? [...selected, name] : selected.filter((n) => n !== name);
    setSelected(next);
    setSaving(true);
    const res = await dal.emailMarketing.setPathGroups(path, next);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); setSelected(selected); }
  };

  if (groups.length === 0) {
    return <span className="text-xs text-muted-foreground">No groups</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-8 gap-1.5 font-normal", className)} disabled={saving}>
          <Users className="size-3.5 text-muted-foreground" />
          {selected.length === 0 ? (
            <span className="text-muted-foreground">Assign group</span>
          ) : selected.length === 1 ? (
            <span className="max-w-[120px] truncate">{selected[0]}</span>
          ) : (
            <Badge variant="secondary" className="font-normal">{selected.length} groups</Badge>
          )}
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Send registrants to…</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {groups.map((g) => (
          <DropdownMenuCheckboxItem
            key={g.name}
            checked={selected.includes(g.name)}
            onCheckedChange={(v) => toggle(g.name, !!v)}
            onSelect={(e) => e.preventDefault()}
          >
            {g.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
