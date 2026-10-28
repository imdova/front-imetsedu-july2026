"use client";

import * as React from "react";
import { CheckCircle2, Film, Loader2, UploadCloud, X, XCircle } from "lucide-react";

import { dal } from "@/lib/dal";
import type { UploadCredentials } from "@/lib/dal/video-library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Status = "queued" | "uploading" | "done" | "error";
interface Item { id: string; file: File; title: string; progress: number; status: Status; error?: string }

const stripExt = (name: string) => name.replace(/\.[^.]+$/, "");
const mb = (bytes: number) => (bytes / (1024 * 1024)).toFixed(bytes > 100 * 1024 * 1024 ? 0 : 1);

/**
 * VdoCipher takes the file directly: we ask our backend for short-lived upload
 * credentials (so the API secret never reaches the browser), then POST the file
 * to the storage link they return. `file` must be the LAST form field.
 */
function postToStorage(creds: UploadCredentials, file: File, onProgress: (pct: number) => void): Promise<void> {
  const { uploadLink, ...fields } = creds.clientPayload;
  return new Promise((resolve, reject) => {
    const form = new FormData();
    for (const [k, v] of Object.entries(fields)) form.append(k, v);
    form.append("success_action_status", "201");
    form.append("success_action_redirect", "");
    form.append("file", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadLink);
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload rejected (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(form);
  });
}

export function UploadDialog({
  open, onOpenChange, folderId, folderName, onFinished,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId: string;
  folderName: string;
  /** Called once a run finishes with at least one successful upload. */
  onFinished: () => void;
}) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [running, setRunning] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const patch = (id: string, p: Partial<Item>) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const addFiles = (list: FileList | File[]) => {
    const videos = Array.from(list).filter((f) => f.type.startsWith("video/") || /\.(mp4|mov|mkv|avi|webm|m4v|wmv|flv|mpg|mpeg)$/i.test(f.name));
    setItems((prev) => [
      ...prev,
      ...videos.map((file) => ({ id: `${file.name}-${file.size}-${crypto.randomUUID()}`, file, title: stripExt(file.name), progress: 0, status: "queued" as Status })),
    ]);
  };

  const start = async () => {
    setRunning(true);
    let uploaded = 0;
    // One at a time: browsers and S3 handle a few big parallel uploads badly.
    for (const item of items.filter((i) => i.status === "queued" || i.status === "error")) {
      patch(item.id, { status: "uploading", progress: 0, error: undefined });
      const cred = await dal.videoLibrary.requestUpload(item.title.trim() || stripExt(item.file.name), folderId);
      if (!cred.ok) { patch(item.id, { status: "error", error: cred.error }); continue; }
      try {
        await postToStorage(cred.data, item.file, (progress) => patch(item.id, { progress }));
        patch(item.id, { status: "done", progress: 100 });
        uploaded++;
      } catch (e) {
        patch(item.id, { status: "error", error: e instanceof Error ? e.message : "Upload failed" });
      }
    }
    setRunning(false);
    if (uploaded > 0) onFinished();
  };

  const close = (next: boolean) => {
    if (running) return; // closing mid-upload would orphan the request
    if (!next) setItems((prev) => prev.filter((i) => i.status !== "done"));
    onOpenChange(next);
  };

  const pending = items.filter((i) => i.status === "queued" || i.status === "error").length;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload videos</DialogTitle>
          <DialogDescription>Uploading to <span className="font-medium text-foreground">{folderName}</span>. Keep this window open until every file shows done.</DialogDescription>
        </DialogHeader>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (!running) addFiles(e.dataTransfer.files); }}
          className={cn("flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition", dragging ? "border-primary bg-primary/5" : "border-border")}
        >
          <UploadCloud className="size-8 text-muted-foreground" />
          <p className="text-sm">Drag videos here or</p>
          <Button type="button" variant="outline" size="sm" disabled={running} onClick={() => inputRef.current?.click()}>Choose files</Button>
          <input ref={inputRef} type="file" accept="video/*" multiple hidden onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
        </div>

        {items.length > 0 && (
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {items.map((i) => (
              <li key={i.id} className="rounded-lg border p-2.5">
                <div className="flex items-center gap-2">
                  <Film className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    value={i.title}
                    onChange={(e) => patch(i.id, { title: e.target.value })}
                    disabled={running || i.status === "done"}
                    aria-label="Video title"
                    className="h-8 text-sm"
                  />
                  <span className="shrink-0 text-xs text-muted-foreground">{mb(i.file.size)} MB</span>
                  {i.status === "done" && <CheckCircle2 className="size-4 shrink-0 text-green-600" />}
                  {i.status === "error" && <XCircle className="size-4 shrink-0 text-destructive" />}
                  {i.status === "uploading" && <Loader2 className="size-4 shrink-0 animate-spin text-primary" />}
                  {(i.status === "queued" || i.status === "error") && !running && (
                    <Button type="button" variant="ghost" size="icon-sm" aria-label="Remove" onClick={() => setItems((p) => p.filter((x) => x.id !== i.id))}><X className="size-4" /></Button>
                  )}
                </div>
                {(i.status === "uploading" || i.status === "done") && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary transition-[width]" style={{ width: `${i.progress}%` }} />
                  </div>
                )}
                {i.status === "error" && <p className="mt-1.5 text-xs text-destructive">{i.error}</p>}
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" disabled={running} onClick={() => close(false)}>{items.some((i) => i.status === "done") ? "Close" : "Cancel"}</Button>
          <Button type="button" disabled={running || pending === 0} onClick={start}>
            {running ? <><Loader2 className="size-4 animate-spin" /> Uploading…</> : `Upload ${pending || ""} video${pending === 1 ? "" : "s"}`.replace("Upload  ", "Upload ")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
