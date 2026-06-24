"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.142 1.595 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.582 0 11.940-5.359 11.943-11.893a11.821 11.821 0 00-3.416-8.452" />
    </svg>
  );
}

/**
 * Floating WhatsApp action button. Animates in shortly after load (smart entry),
 * pulses to draw attention, and expands a label on hover (desktop). Opens a chat
 * with the given number, optionally pre-filling a message.
 */
export function WhatsAppFab({
  phone,
  message,
  label = "تواصل معنا عبر واتساب",
  className,
}: {
  phone: string;
  message?: string;
  label?: string;
  className?: string;
}) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const t = window.setTimeout(() => setShow(true), 600);
    return () => window.clearTimeout(t);
  }, []);

  const href = `https://wa.me/${phone.replace(/\D/g, "")}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      dir="ltr"
      className={cn(
        "group fixed bottom-24 right-4 z-50 flex items-center gap-2 transition-all duration-500 ease-out lg:bottom-6",
        show ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
        className,
      )}
    >
      {/* hover label (desktop) */}
      <span className="pointer-events-none hidden max-w-0 overflow-hidden whitespace-nowrap rounded-full bg-[#0b2545] py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:max-w-[220px] group-hover:px-4 group-hover:opacity-100 lg:inline-block" dir="rtl">
        {label}
      </span>

      <span className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl ring-4 ring-[#25D366]/20 transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        {/* attention pulse */}
        <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40" aria-hidden="true" />
        <WhatsAppIcon className="relative size-7" />
      </span>
    </a>
  );
}
