"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

/**
 * A VdoCipher video.
 *
 * Playback needs a short-lived OTP that only the server can mint (the API
 * secret must never reach the browser), so every video costs one round trip to
 * `/api/vdocipher/otp` before the iframe can be built.
 *
 * Lived inside the student lesson page until the Sales Orientation needed the
 * same player; it is shared rather than copied so the OTP handling has one
 * home.
 */
export function VdoCipherPlayer({
  videoId,
  title,
  className,
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [creds, setCreds] = React.useState<{ otp: string; playbackInfo: string } | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

  // Clearing the previous video's credentials is a reset — do it in render so a
  // new videoId never paints against the old OTP.
  useResetOnChange([videoId], () => {
    setCreds(null);
    setErr(null);
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/vdocipher/otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoId }),
        });
        if (cancelled) return;
        if (!res.ok) {
          setErr("Failed to load video");
          return;
        }
        const data = (await res.json()) as { otp?: string; playbackInfo?: string };
        if (!data.otp || !data.playbackInfo) {
          setErr("Invalid video credentials");
          return;
        }
        setCreds({ otp: data.otp, playbackInfo: data.playbackInfo });
      } catch {
        if (!cancelled) setErr("Failed to load video");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  if (err) {
    return (
      <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-white/80", className)}>
        <p className="text-sm">{err}</p>
      </div>
    );
  }
  if (!creds) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center", className)}>
        <Loader2 className="size-8 animate-spin text-white/60" />
      </div>
    );
  }

  const src = `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(creds.otp)}&playbackInfo=${encodeURIComponent(creds.playbackInfo)}`;
  return (
    <iframe
      title={title}
      src={src}
      className={cn("h-full w-full border-0", className)}
      allow="encrypted-media"
      allowFullScreen
    />
  );
}
