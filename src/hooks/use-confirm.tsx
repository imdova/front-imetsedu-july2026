"use client";

import * as React from "react";
import { ConfirmModal, type ConfirmModalProps } from "@/components/ui/confirm-modal";

type ConfirmOptions = Omit<ConfirmModalProps, "isOpen" | "onClose" | "onConfirm">;

interface PendingConfirm extends ConfirmOptions {
  resolver: (value: boolean) => void;
}

export function useConfirm() {
  const [state, setState] = React.useState<PendingConfirm | null>(null);
  const [loading, setLoading] = React.useState(false);

  const confirm = React.useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => {
        setState({ ...options, resolver: resolve });
      }),
    [],
  );

  const handleClose = React.useCallback(() => {
    state?.resolver(false);
    setState(null);
    setLoading(false);
  }, [state]);

  const handleConfirm = React.useCallback(async () => {
    if (!state) return;
    setLoading(true);
    state.resolver(true);
    setState(null);
    setLoading(false);
  }, [state]);

  const Confirmation = state ? (
    <ConfirmModal
      isOpen
      onClose={handleClose}
      onConfirm={handleConfirm}
      loading={loading}
      {...state}
    />
  ) : null;

  return { confirm, Confirmation };
}
