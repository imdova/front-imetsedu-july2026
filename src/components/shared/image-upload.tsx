"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  className?: string;
}

/**
 * Drag-or-browse image picker. POSTs the selected file to the upload service
 * and stores the returned CDN URL; shows a spinner while the upload is in
 * flight and surfaces failures via a toast.
 */
export function ImageUpload({
  value,
  onChange,
  label = "Drag & drop or browse",
  hint = "JPG or PNG · 1280×720 recommended",
  className,
}: ImageUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const handleFile = async (file?: File) => {
    if (!file || !file.type.startsWith("image/") || busy) return;
    setBusy(true);
    const res = await dal.upload.uploadFile(file);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error || "Upload failed");
      return;
    }
    onChange(res.data.url);
  };

  if (value) {
    return (
      <div
        className={cn(
          "group relative aspect-video w-full overflow-hidden rounded-xl border bg-muted",
          className,
        )}
      >
        <Image src={value} alt="Course cover" fill className="object-cover" />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute end-2 top-2 size-8 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onChange("")}
          aria-label="Remove image"
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
        "flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70",
        dragOver && "border-primary bg-primary/5",
        className,
      )}
    >
      <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
        {busy ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
      </span>
      <span className="text-sm font-medium text-foreground">{busy ? "Uploading…" : label}</span>
      <span className="text-xs">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </button>
  );
}
