"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

/** Upload-an-icon field: uploads via the upload service and reports back the stored URL. */
export function IconUploadField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const t = useTranslations("Admin");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const res = await dal.upload.uploadFile(file);
    setUploading(false);
    if (res.ok) onChange(res.data.url);
    else toast.error(res.error);
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className={cn("grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted/20")}>
          {uploading ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="size-full object-contain" />
          ) : (
            <UploadCloud className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <UploadCloud className="size-4" />
            {t("catUploadIcon")}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-medium text-destructive hover:underline"
            >
              {t("catRemoveIcon")}
            </button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
