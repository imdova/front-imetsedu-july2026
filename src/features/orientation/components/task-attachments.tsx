"use client";

import * as React from "react";
import { FileText, ImageIcon, Loader2, Mic, Paperclip, Square, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { OrientationTaskAttachment } from "@/lib/dal/orientation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";

/** Matches the platform upload endpoint's limit. */
const MAX_BYTES = 10 * 1024 * 1024;
/** Voice notes stop on their own after this long. */
const MAX_VOICE_SECONDS = 5 * 60;

const FILE_EXTENSIONS = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp", "gif", "heic"];
const FILE_ACCEPT =
  ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif,.heic,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*";

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** The first recording format this browser supports (Chrome/Firefox: webm or ogg; Safari: mp4). */
function pickAudioType(): { mime: string; ext: string } {
  const candidates = [
    { mime: "audio/webm;codecs=opus", ext: "webm" },
    { mime: "audio/webm", ext: "webm" },
    { mime: "audio/ogg;codecs=opus", ext: "ogg" },
    { mime: "audio/mp4", ext: "m4a" },
  ];
  if (typeof MediaRecorder === "undefined") return { mime: "", ext: "webm" };
  return candidates.find((c) => MediaRecorder.isTypeSupported(c.mime)) ?? { mime: "", ext: "webm" };
}

/**
 * Attachments on a task answer: files (PDF, Word, images) and voice notes
 * recorded in the browser. Each one is uploaded through the platform and
 * handed to `onChange` straight away, so a recording is attached the moment
 * it stops — nothing to save to disk first.
 */
export function TaskAttachments({
  items,
  allowFiles,
  allowVoice,
  disabled,
  onChange,
}: {
  items: OrientationTaskAttachment[];
  allowFiles: boolean;
  allowVoice: boolean;
  disabled?: boolean;
  onChange: (next: OrientationTaskAttachment[]) => Promise<boolean>;
}) {
  const { t, locale } = useOrientationT();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState<string | null>(null);

  const add = async (file: File, extra: Partial<OrientationTaskAttachment> & { kind: "file" | "voice" }) => {
    if (file.size > MAX_BYTES) {
      toast.error(t("attach.tooBig"));
      return;
    }
    setUploading(extra.kind === "voice" ? t("attach.uploadingVoice") : t("attach.uploadingFile", { name: file.name }));
    const res = await dal.upload.uploadFile(file);
    if (!res.ok) {
      setUploading(null);
      toast.error(t("attach.failed", { error: res.error }));
      return;
    }
    const attachment: OrientationTaskAttachment = {
      url: res.data.url,
      name: extra.name ?? file.name,
      mime: file.type || extra.mime || "",
      size: file.size,
      ...extra,
    };
    const saved = await onChange([...items, attachment]);
    setUploading(null);
    if (saved) toast.success(extra.kind === "voice" ? t("attach.voiceSent") : t("attach.fileSent"));
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!FILE_EXTENSIONS.includes(ext)) {
      toast.error(t("attach.badType"));
      return;
    }
    await add(file, { kind: "file" });
  };

  const remove = async (url: string) => {
    await onChange(items.filter((a) => a.url !== url));
  };

  if (!allowFiles && !allowVoice) return null;

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-1.5 text-sm font-bold">
          <Paperclip className="size-4 text-primary" />
          {t("attach.title")} {items.length > 0 && <span className="font-normal text-muted-foreground">({num(items.length)})</span>}
        </h4>
        <div className="flex flex-wrap gap-2">
          {allowFiles && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={disabled || !!uploading || items.length >= 20}
                onClick={() => fileRef.current?.click()}
              >
                <Paperclip className="size-3.5" />
                {t("attach.upload")}
              </Button>
              <input ref={fileRef} type="file" accept={FILE_ACCEPT} className="hidden" onChange={onFile} />
            </>
          )}
          {allowVoice && (
            <VoiceRecorder
              disabled={disabled || !!uploading || items.length >= 20}
              onRecorded={(file, durationSec) =>
                add(file, {
                  kind: "voice",
                  name: t("attach.voiceName", {
                    date: new Date().toLocaleString(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    }),
                  }),
                  durationSec,
                })
              }
            />
          )}
        </div>
      </div>

      <p className="mt-1 text-[11px] text-muted-foreground">
        {[allowFiles && t("attach.hintFiles"), allowVoice && t("attach.hintVoice")].filter(Boolean).join(" · ")}
      </p>

      {uploading && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-primary/[0.06] p-2.5 text-xs text-primary" role="status">
          <Loader2 className="size-3.5 animate-spin" />
          {uploading}
        </p>
      )}

      {items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {items.map((a) => (
            <li key={a.url} className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/40 p-2.5">
              <AttachmentView attachment={a} />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="ms-auto size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled || !!uploading}
                onClick={() => remove(a.url)}
                title={t("attach.remove")}
                aria-label={t("attach.remove")}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** One attachment: an audio player for voice notes, an icon + link for files. Shared with the admin review page. */
export function AttachmentView({ attachment: a }: { attachment: OrientationTaskAttachment }) {
  const { t } = useOrientationT();
  if (a.kind === "voice") {
    return (
      <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Mic className="size-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium" dir="auto">
            {a.name || t("attach.voiceNote")}
          </span>
          {!!a.durationSec && <span className="block text-[11px] text-muted-foreground" dir="ltr">{formatDuration(a.durationSec)}</span>}
        </span>
        <audio controls preload="none" src={a.url} className="h-9 min-w-[220px] flex-1" />
      </span>
    );
  }
  const isImage = a.mime.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic)(\?|$)/i.test(a.url);
  const Icon = isImage ? ImageIcon : FileText;
  return (
    <a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 flex-1 items-center gap-2 hover:text-primary"
    >
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- user upload on S3, shown as a small thumbnail
        <img src={a.url} alt="" className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-border" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium" dir="auto">
          {a.name || t("attach.file")}
        </span>
        {a.size > 0 && <span className="block text-[11px] text-muted-foreground" dir="ltr">{formatBytes(a.size)}</span>}
      </span>
    </a>
  );
}

function VoiceRecorder({
  disabled,
  onRecorded,
}: {
  disabled?: boolean;
  onRecorded: (file: File, durationSec: number) => void;
}) {
  const { t } = useOrientationT();
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(0);
  const recorderRef = React.useRef<MediaRecorder | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = React.useRef(0);
  const cancelledRef = React.useRef(false);

  const cleanup = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, []);

  // Never leave the microphone on if the learner navigates away mid-recording.
  React.useEffect(
    () => () => {
      cancelledRef.current = true;
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
      cleanup();
    },
    [cleanup],
  );

  const stop = React.useCallback((cancel = false) => {
    cancelledRef.current = cancel;
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  const start = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error(t("attach.noRecorder"));
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      toast.error(t("attach.micDenied"));
      return;
    }
    const { mime, ext } = pickAudioType();
    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    streamRef.current = stream;
    recorderRef.current = recorder;
    chunksRef.current = [];
    cancelledRef.current = false;
    startedAtRef.current = Date.now();

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
      const type = recorder.mimeType || mime || "audio/webm";
      const blob = new Blob(chunksRef.current, { type });
      cleanup();
      setRecording(false);
      setSeconds(0);
      if (cancelledRef.current || blob.size === 0) return;
      if (durationSec < 1) {
        toast.error(t("attach.tooShort"));
        return;
      }
      onRecorded(new File([blob], `voice-note-${Date.now()}.${ext}`, { type: type.split(";")[0] }), durationSec);
    };

    recorder.start(1000);
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
      setSeconds(elapsed);
      if (elapsed >= MAX_VOICE_SECONDS) stop();
    }, 500);
  };

  if (!recording) {
    return (
      <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={disabled} onClick={start}>
        <Mic className="size-3.5" />
        {t("attach.record")}
      </Button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-2 py-1 ring-1 ring-destructive/30">
      <span className="size-2 animate-pulse rounded-full bg-destructive motion-reduce:animate-none" aria-hidden="true" />
      <span className={cn("text-xs font-semibold tabular-nums text-destructive")} dir="ltr">
        {formatDuration(seconds)}
      </span>
      <Button type="button" size="sm" className="h-7 gap-1 bg-destructive px-2 text-white hover:bg-destructive/90" onClick={() => stop(false)}>
        <Square className="size-3" />
        {t("attach.stopSend")}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="size-7"
        onClick={() => stop(true)}
        title={t("attach.cancel")}
        aria-label={t("attach.cancel")}
      >
        <X className="size-3.5" />
      </Button>
    </span>
  );
}
