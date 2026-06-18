"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Search, Loader2, Check, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import type { Lead } from "@/lib/db/crm";
import { dal } from "@/lib/dal";
import { cn, getInitials } from "@/lib/utils";
import { Button, type buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { VariantProps } from "class-variance-authority";

interface AddStudentDialogProps extends VariantProps<typeof buttonVariants> {
  groupId: string;
  className?: string;
  children: React.ReactNode;
  onAdded?: () => void;
}

/** Search-and-pick-a-lead dialog wired to POST /groups/:id/students/:leadId. */
export function AddStudentDialog({ groupId, className, variant, size, children, onAdded }: AddStudentDialogProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [results, setResults] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    const id = setTimeout(async () => {
      const res = await dal.crm.fetchLeads({ search });
      if (res.ok) setResults(res.data);
      setLoading(false);
    }, 250);
    return () => clearTimeout(id);
  }, [open, search]);

  React.useEffect(() => {
    if (!open) {
      setSearch("");
      setResults([]);
      setSelected(new Set());
    }
  }, [open]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const submit = async () => {
    if (!selected.size) return;
    setSubmitting(true);
    const ids = Array.from(selected);
    const results = await Promise.all(ids.map((leadId) => dal.groups.addLeadToGroup(groupId, leadId)));
    setSubmitting(false);
    const failed = results.filter((r) => !r.ok).length;
    const added = ids.length - failed;
    if (added > 0) {
      toast.success(t("gdStudentsAdded", { n: added }));
      setOpen(false);
      onAdded?.();
      router.refresh();
    }
    if (failed > 0) toast.error(t("gdStudentsAddFailed", { n: failed }));
  };

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-base">
              <UserPlus className="size-4 text-primary" />
              {t("gdAddStudentTitle")}
            </DialogTitle>
            <DialogDescription>{t("gdAddStudentDesc")}</DialogDescription>
          </DialogHeader>

          <div className="px-6 py-3">
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("gdSearchStudent")}
                className="ps-9"
              />
            </div>
          </div>

          <ul className="max-h-72 overflow-y-auto px-2 pb-2">
            {loading ? (
              <li className="grid place-items-center py-10 text-muted-foreground"><Loader2 className="size-5 animate-spin" /></li>
            ) : results.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">{t("gdNoLeadsFound")}</li>
            ) : (
              results.map((lead) => {
                const checked = selected.has(lead.id);
                return (
                  <li key={lead.id}>
                    <button
                      type="button"
                      onClick={() => toggle(lead.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-start text-sm transition-colors hover:bg-muted/60",
                        checked && "bg-primary/5",
                      )}
                    >
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(lead.fullName)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p className="truncate font-medium">{lead.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{lead.email || lead.phone}</p>
                      </span>
                      <span
                        className={cn(
                          "grid size-4 shrink-0 place-items-center rounded border transition-colors",
                          checked ? "border-primary bg-primary text-primary-foreground" : "border-input",
                        )}
                      >
                        {checked && <Check className="size-3" />}
                      </span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <DialogFooter className="border-t bg-muted/30 px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              {t("gdCancel")}
            </Button>
            <Button type="button" onClick={submit} disabled={!selected.size || submitting} className="gap-1.5">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {t("gdAddStudentConfirm", { n: selected.size })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
