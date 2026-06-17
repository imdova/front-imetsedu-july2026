"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/store";
import { persistSessionCookie } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StaffProfileState {
  name: string;
  email: string;
  image: string;
  roleTitle: string;
}

export function StaffProfileForm() {
  const t = useTranslations("Staff");
  const tc = useTranslations("Common");
  const ts = useTranslations("Student");
  const { user, setUser } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<StaffProfileState>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.avatarUrl ?? "",
    roleTitle: user?.staffRole?.title ?? "",
  });
  const [baseline, setBaseline] = React.useState<StaffProfileState>(form);
  const [busy, setBusy] = React.useState(false);
  const [photoUploading, setPhotoUploading] = React.useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    void dal.auth.getProfile().then((res) => {
      if (cancelled || !res.ok) {
        setLoading(false);
        return;
      }
      const next: StaffProfileState = {
        name: res.data.name ?? "",
        email: res.data.email ?? "",
        image: res.data.image ?? res.data.avatarUrl ?? "",
        roleTitle: res.data.staffRole?.title ?? "",
      };
      setForm(next);
      setBaseline(next);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const dirty = JSON.stringify(form) !== JSON.stringify(baseline);

  const syncUser = (patch: Partial<StaffProfileState>) => {
    if (!user) return;
    const updated = {
      ...user,
      name: patch.name ?? user.name,
      avatarUrl: patch.image || undefined,
    };
    setUser(updated);
    persistSessionCookie(updated);
  };

  const save = async () => {
    setBusy(true);
    const res = await dal.auth.updateProfile({ name: form.name.trim(), image: form.image || undefined });
    setBusy(false);
    if (res.ok) {
      const next = {
        ...form,
        name: res.data.name,
        image: res.data.image ?? res.data.avatarUrl ?? form.image,
      };
      setForm(next);
      setBaseline(next);
      syncUser(next);
      toast.success(ts("profileUpdated"));
    } else {
      toast.error(res.error);
    }
  };

  const discard = () => setForm(baseline);

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(ts("photoInvalidType"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(ts("photoTooLarge"));
      return;
    }
    setPhotoUploading(true);
    const up = await dal.upload.uploadFile(file);
    if (!up.ok) {
      setPhotoUploading(false);
      toast.error(up.error);
      return;
    }
    const next = { ...form, image: up.data.url };
    setForm(next);
    const res = await dal.auth.updateProfile({ name: next.name.trim(), image: up.data.url });
    setPhotoUploading(false);
    if (res.ok) {
      setBaseline(next);
      syncUser(next);
      toast.success(ts("photoUpdated"));
    } else {
      toast.error(res.error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" disabled={!dirty || busy} onClick={discard}>{ts("discard")}</Button>
        <Button disabled={!dirty || busy} onClick={save}>{ts("saveChanges")}</Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            <Avatar className="size-20 border">
              {form.image ? <AvatarImage src={form.image} alt={form.name} /> : null}
              <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
                {getInitials(form.name || "Staff")}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              aria-label={ts("changePhoto")}
              disabled={photoUploading}
              onClick={() => photoInputRef.current?.click()}
              className="absolute -bottom-1 -end-1 grid size-7 place-items-center rounded-full border bg-background text-muted-foreground shadow-sm hover:text-foreground disabled:opacity-60"
            >
              {photoUploading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void uploadPhoto(file);
                e.target.value = "";
              }}
            />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <h2 className="text-xl font-bold tracking-tight">{form.name || "—"}</h2>
            <p className="text-sm text-muted-foreground">{form.email}</p>
            {form.roleTitle && (
              <Badge variant="secondary" className="font-medium">{form.roleTitle}</Badge>
            )}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <User className="size-4" />
          </span>
          <div>
            <h3 className="font-semibold">{t("personalInfo")}</h3>
            <p className="text-sm text-muted-foreground">{t("profileSubtitle")}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{tc("fullName")}</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>{tc("email")}</Label>
            <Input type="email" value={form.email} readOnly className="bg-muted/30" />
          </div>
        </div>
      </section>
    </div>
  );
}
