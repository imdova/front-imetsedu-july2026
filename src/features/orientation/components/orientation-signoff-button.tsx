"use client";

import * as React from "react";
import { Award, Loader2, Undo2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { track } from "@/features/orientation/lib/track";

/** Team-lead sign-off for one rep, from the Team progress table. */
export function OrientationSignOffButton({
  userId,
  name,
  signedOff,
  canSignOff,
}: {
  userId: string;
  name: string;
  signedOff: boolean;
  /** Only someone who has started the training can be signed off. */
  canSignOff: boolean;
}) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();
  const [busy, setBusy] = React.useState(false);

  const run = async (next: boolean) => {
    if (!next) {
      const ok = await confirm({
        title: `Withdraw ${name || "this person"}'s sign-off?`,
        description: "Their journey goes back to waiting for sign-off. Their lessons, quiz and task stay as they are.",
        confirmText: "Withdraw",
        variant: "destructive",
      });
      if (!ok) return;
    }
    setBusy(true);
    const res = await dal.orientation.signOffOrientation(userId, next);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    if (next) track("orientation_signed_off", { userId });
    toast.success(next ? `${name || "They"} signed off — they've been notified.` : "Sign-off withdrawn.");
    router.refresh();
  };

  return (
    <>
      {Confirmation}
      {signedOff ? (
        <Button size="sm" variant="ghost" className="h-8 gap-1.5 text-muted-foreground" disabled={busy} onClick={() => run(false)}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Undo2 className="size-3.5" />}
          Withdraw
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="h-8 gap-1.5" disabled={busy || !canSignOff} onClick={() => run(true)}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Award className="size-3.5" />}
          Sign off
        </Button>
      )}
    </>
  );
}
