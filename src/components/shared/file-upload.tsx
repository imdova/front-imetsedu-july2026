"use client";

import * as React from "react";
import { FileText, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  accept?: string;
  fileName?: string;
  className?: string;
}

/**
 * Drag-or-browse file picker (PDF by default). POSTs the selected file to the
 * upload service and stores the returned CDN URL; spinner while in flight.
 */
export function FileUpload({
  value,
  onChange,
  label = "Drag & drop or browse",
  hint = "PDF only",
  accept = "application/pdf,.pdf",
  fileName,
  className,
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [localName, setLocalName] = React.useState(fileName ?? "");

  const handleFile = async (file?: File) => {
    if (!file || busy) return;
    setBusy(true);
    const res = await dal.upload.uploadFile(file);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error || "Upload failed");
      return;
    }
    setLocalName(file.name);
    onChange(res.data.url);
  };

  if (value) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4",
          className,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {localName || fileName || "Uploaded file"}
            </p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            onChange("");
            setLocalName("");
          }}
          aria-label="Remove file"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 px-4 py-8 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70",
        dragOver && "border-primary bg-primary/5",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
        {busy ? <Loader2 className="size-5 animate-spin" /> : <FileText className="size-5" />}
      </span>
      <span className="text-sm font-medium text-foreground">{busy ? "Uploading…" : label}</span>
      <span className="text-xs">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
}
