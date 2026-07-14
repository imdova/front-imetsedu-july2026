"use client";

import * as React from "react";
import { Loader2, AlertTriangle } from "lucide-react";

/** Minimal typing for the slice of the PayPal JS SDK we use. */
type PayPalOrderActions = {
  order: {
    create: (opts: Record<string, unknown>) => Promise<string>;
    capture: () => Promise<PayPalCapture>;
  };
};

export type PayPalCapture = {
  id?: string;
  status?: string;
  payer?: { name?: { given_name?: string; surname?: string }; email_address?: string };
  purchase_units?: Array<{
    payments?: { captures?: Array<{ id?: string; status?: string }> };
  }>;
};

type PayPalButtonInstance = { render: (el: HTMLElement) => Promise<void>; close?: () => void };
type PayPalSdk = {
  Buttons: (opts: Record<string, unknown>) => PayPalButtonInstance;
  FUNDING: Record<string, string>;
};

declare global {
  interface Window {
    paypal?: PayPalSdk;
  }
}

let sdkPromise: Promise<void> | null = null;

/** Inject the PayPal JS SDK once; subsequent calls reuse the same promise. */
function loadPaypalSdk(clientId: string, currency: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.paypal) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    const q = new URLSearchParams({
      "client-id": clientId,
      currency,
      intent: "capture",
      components: "buttons",
      "disable-funding": "paylater,credit",
    });
    s.src = `https://www.paypal.com/sdk/js?${q.toString()}`;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      sdkPromise = null;
      reject(new Error("Failed to load PayPal SDK"));
    };
    document.body.appendChild(s);
  });
  return sdkPromise;
}

export function PaypalButton({
  clientId,
  currency,
  amount,
  description,
  funding,
  label = "pay",
  labels,
  onPaid,
  onError,
}: {
  clientId: string;
  currency: string;
  amount: number;
  description: string;
  /** Restrict to a single funding source. Omit to show all eligible ones. */
  funding?: "paypal" | "card";
  /** PayPal button label (e.g. "pay", "buynow", "checkout"). */
  label?: string;
  labels: { loading: string; failed: string };
  onPaid: (capture: PayPalCapture) => void;
  onError: (message: string) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [loading, setLoading] = React.useState(true);
  const [failed, setFailed] = React.useState(false);

  // Latest-value refs so live amount/callback changes don't force a button re-render.
  const amountRef = React.useRef(amount);
  const descRef = React.useRef(description);
  const onPaidRef = React.useRef(onPaid);
  const onErrorRef = React.useRef(onError);
  React.useEffect(() => {
    amountRef.current = amount;
    descRef.current = description;
    onPaidRef.current = onPaid;
    onErrorRef.current = onError;
  });

  React.useEffect(() => {
    let cancelled = false;
    let instance: PayPalButtonInstance | null = null;

    loadPaypalSdk(clientId, currency)
      .then(() => {
        if (cancelled || !ref.current || !window.paypal) return;
        ref.current.innerHTML = "";
        const fundingSource =
          funding === "card"
            ? window.paypal.FUNDING.CARD
            : funding === "paypal"
              ? window.paypal.FUNDING.PAYPAL
              : undefined;

        instance = window.paypal.Buttons({
          ...(fundingSource ? { fundingSource } : {}),
          style: {
            layout: "vertical",
            shape: "rect",
            color: funding === "card" ? "black" : "gold",
            label,
            height: 48,
          },
          createOrder: (_data: unknown, actions: PayPalOrderActions) =>
            actions.order.create({
              purchase_units: [
                {
                  amount: { value: amountRef.current.toFixed(2), currency_code: currency },
                  description: descRef.current.slice(0, 127),
                },
              ],
              application_context: { shipping_preference: "NO_SHIPPING" },
            }),
          onApprove: async (_data: unknown, actions: PayPalOrderActions) => {
            const capture = await actions.order.capture();
            if (!cancelled) onPaidRef.current(capture);
          },
          onError: () => {
            if (!cancelled) onErrorRef.current("payment-error");
          },
        });

        instance
          .render(ref.current)
          .then(() => {
            if (!cancelled) setLoading(false);
          })
          .catch(() => {
            if (!cancelled) {
              setFailed(true);
              setLoading(false);
            }
          });
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      try {
        instance?.close?.();
      } catch {
        /* ignore */
      }
    };
  }, [clientId, currency, funding, label]);

  return (
    <div className="relative min-h-[52px]">
      {loading && !failed && (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-4 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {labels.loading}
        </div>
      )}
      {failed && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" /> {labels.failed}
        </div>
      )}
      <div ref={ref} className={failed ? "hidden" : ""} />
    </div>
  );
}
