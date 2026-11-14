"use client";

import * as React from "react";
import { KeyRound, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { VdoAccount } from "@/lib/dal/video-library";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Editing = { mode: "add" } | { mode: "edit"; account: VdoAccount };

/**
 * Manage the VdoCipher accounts the platform can use. The secret is write-only:
 * it is sent to the backend (which checks it against VdoCipher before saving) and
 * only a masked hint ever comes back.
 */
export function AccountsDialog({
  open, onOpenChange, accounts, onChanged,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: VdoAccount[];
  onChanged: () => void;
}) {
  const { confirm, Confirmation } = useConfirm();
  const [editing, setEditing] = React.useState<Editing | null>(null);
  const [label, setLabel] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const begin = (e: Editing) => {
    setEditing(e);
    setLabel(e.mode === "edit" ? e.account.label : "");
    setSecret("");
    setError(null);
  };

  const save = async () => {
    if (!editing) return;
    const name = label.trim();
    const key = secret.trim();
    if (!name || (editing.mode === "add" && !key)) return;
    setSaving(true);
    setError(null);
    const r = editing.mode === "add"
      ? await dal.videoLibrary.addAccount(name, key)
      : await dal.videoLibrary.editAccount(editing.account.id, { label: name, ...(key ? { secret: key } : {}) });
    setSaving(false);
    if (!r.ok) { setError(r.error); return; }
    toast.success(editing.mode === "add" ? "VdoCipher account added" : "VdoCipher account updated");
    setEditing(null);
    onChanged();
  };

  const remove = async (a: VdoAccount) => {
    const yes = await confirm({
      title: "Remove VdoCipher account",
      description: `“${a.label}” will be removed from this platform. Its videos stay on VdoCipher, but lectures that use them will stop playing until the account is added again.`,
      confirmText: "Remove", variant: "destructive",
    });
    if (!yes) return;
    const r = await dal.videoLibrary.removeAccount(a.id);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Account removed");
    onChanged();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>VdoCipher accounts</DialogTitle>
          <DialogDescription>
            Add more than one VdoCipher API secret. Lectures keep working whichever account holds the video — playback finds the right one automatically.
          </DialogDescription>
        </DialogHeader>

        {editing ? (
          <form onSubmit={(e) => { e.preventDefault(); void save(); }} className="space-y-3">
            <Input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Account name (e.g. Main, Archive)" maxLength={80} aria-label="Account name" />
            <Input
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              type="password"
              autoComplete="off"
              placeholder={editing.mode === "edit" ? `API secret — leave blank to keep ${editing.account.secretHint}` : "API secret"}
              aria-label="API secret"
            />
            <p className="text-xs text-muted-foreground">The secret is checked against VdoCipher when you save, then stored on the server — it is never shown again.</p>
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/5 p-2 text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" disabled={saving} onClick={() => setEditing(null)}>Back</Button>
              <Button type="submit" disabled={saving || !label.trim() || (editing.mode === "add" && !secret.trim())}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : null}{editing.mode === "add" ? "Add account" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <ul className="space-y-2">
              {accounts.length === 0 && <li className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">No accounts yet.</li>}
              {accounts.map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><KeyRound className="size-4" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-medium">{a.label}{a.builtin && <Badge variant="secondary">Default</Badge>}</p>
                    <p className="font-mono text-xs text-muted-foreground">{a.secretHint}</p>
                    {a.builtin && <p className="text-xs text-muted-foreground">Set in Site Settings / server environment.</p>}
                  </div>
                  {!a.builtin && (
                    <>
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => begin({ mode: "edit", account: a })} aria-label={`Edit ${a.label}`}><Pencil className="size-4" /></Button>
                      <Button type="button" variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => remove(a)} aria-label={`Remove ${a.label}`}><Trash2 className="size-4" /></Button>
                    </>
                  )}
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button type="button" onClick={() => begin({ mode: "add" })}><Plus className="size-4" /> Add account</Button>
            </DialogFooter>
          </>
        )}
        {Confirmation}
      </DialogContent>
    </Dialog>
  );
}
