"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Camera, KeyRound, Loader2, Mail, User } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/store";
import { persistSessionCookie } from "@/lib/auth-session";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── helpers ─────────────────────────────────────────────────────────────────

interface ProfileState {
  name: string;
  email: string;
  image: string;
  roleTitle: string;
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

// ─── Avatar card (shared across tabs) ───────────────────────────────────────

function ProfileCard({
  profile,
  photoUploading,
  onUpload,
}: {
  profile: ProfileState;
  photoUploading: boolean;
  onUpload: (file: File) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const ts = useTranslations("Student");

  return (
    <div className="rounded-2xl border border-border/60 bg-card px-6 py-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-5">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Avatar className="size-20 ring-2 ring-primary/20 ring-offset-2 ring-offset-card">
            {profile.image ? <AvatarImage src={profile.image} alt={profile.name} /> : null}
            <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
              {getInitials(profile.name || "Staff")}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            aria-label={ts("changePhoto")}
            disabled={photoUploading}
            onClick={() => inputRef.current?.click()}
            className="absolute -bottom-1 -end-1 grid size-7 place-items-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground disabled:opacity-60"
          >
            {photoUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Camera className="size-4" />
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              e.target.value = "";
            }}
          />
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight">{profile.name || "—"}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
          {profile.roleTitle && (
            <Badge variant="secondary" className="font-medium">
              {profile.roleTitle}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Personal info ───────────────────────────────────────────────────────

function PersonalInfoTab({
  profile,
  onUpdated,
}: {
  profile: ProfileState;
  onUpdated: (next: ProfileState) => void;
}) {
  const t = useTranslations("Staff");
  const tc = useTranslations("Common");
  const ts = useTranslations("Student");

  const [name, setName] = React.useState(profile.name);
  const [busy, setBusy] = React.useState(false);
  const dirty = name.trim() !== profile.name.trim();

  const save = async () => {
    setBusy(true);
    const res = await dal.auth.updateProfile({ name: name.trim(), image: profile.image || undefined });
    setBusy(false);
    if (res.ok) {
      const next: ProfileState = {
        ...profile,
        name: res.data.name ?? name,
        image: res.data.image ?? res.data.avatarUrl ?? profile.image,
      };
      onUpdated(next);
      toast.success(ts("profileUpdated"));
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-5">
      <FieldRow label={tc("fullName")}>
        <Input
          id="profile-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={tc("fullName")}
        />
      </FieldRow>

      <FieldRow label={tc("email")}>
        <Input type="email" value={profile.email} readOnly className="bg-muted/30 cursor-not-allowed" />
        <p className="text-xs text-muted-foreground">{t("emailDesc")}</p>
      </FieldRow>

      <div className="flex justify-end gap-2 pt-1">
        <Button
          id="profile-save-btn"
          disabled={!dirty || busy}
          onClick={save}
          className="gap-1.5"
        >
          {busy && <Loader2 className="size-4 animate-spin" />}
          {ts("saveChanges")}
        </Button>
      </div>
    </div>
  );
}

// ─── Tab: Email ───────────────────────────────────────────────────────────────

function EmailTab({
  currentEmail,
  onEmailChanged,
}: {
  currentEmail: string;
  onEmailChanged: (newEmail: string) => void;
}) {
  const t = useTranslations("Staff");

  const [newEmail, setNewEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !password) {
      toast.error(t("fillRequired"));
      return;
    }
    setBusy(true);
    const res = await dal.auth.changeEmail(newEmail.trim(), password);
    setBusy(false);
    if (res.ok) {
      onEmailChanged(res.data.email ?? newEmail.trim());
      toast.success(t("emailChanged"));
      setNewEmail("");
      setPassword("");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <FieldRow label={t("currentEmail")}>
        <Input type="email" value={currentEmail} readOnly className="bg-muted/30 cursor-not-allowed" />
      </FieldRow>

      <Separator />

      <FieldRow label={t("newEmail")}>
        <Input
          id="new-email"
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />
      </FieldRow>

      <FieldRow label={t("currentPasswordLabel")}>
        <div className="relative">
          <Input
            id="email-password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="pe-10"
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground hover:text-foreground"
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>
      </FieldRow>

      <div className="flex justify-end pt-1">
        <Button id="change-email-btn" type="submit" disabled={busy} className="gap-1.5">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {t("changeEmailBtn")}
        </Button>
      </div>
    </form>
  );
}

// ─── Tab: Password ────────────────────────────────────────────────────────────

function PasswordTab() {
  const t = useTranslations("Staff");

  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next) {
      toast.error(t("fillRequired"));
      return;
    }
    if (next !== confirm) {
      toast.error(t("passwordsDontMatch"));
      return;
    }
    setBusy(true);
    const res = await dal.auth.changePassword(current, next, confirm);

    setBusy(false);
    if (res.ok) {
      toast.success(t("passwordChanged"));
      setCurrent("");
      setNext("");
      setConfirm("");
    } else {
      toast.error(res.error);
    }
  };

  const fieldType = showAll ? "text" : "password";

  return (
    <form onSubmit={submit} className="space-y-5">
      <FieldRow label={t("currentPasswordLabel")}>
        <Input
          id="current-password"
          type={fieldType}
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
        />
      </FieldRow>

      <Separator />

      <FieldRow label={t("newPasswordLabel")}>
        <Input
          id="new-password"
          type={fieldType}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
        />
      </FieldRow>

      <FieldRow label={t("confirmPasswordLabel")}>
        <Input
          id="confirm-password"
          type={fieldType}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </FieldRow>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => setShowAll((s) => !s)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showAll ? "Hide" : "Show"} passwords
        </button>
        <Button id="change-password-btn" type="submit" disabled={busy} className="gap-1.5">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {t("changePasswordBtn")}
        </Button>
      </div>
    </form>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function StaffProfileSettings() {
  const t = useTranslations("Staff");
  const ts = useTranslations("Student");
  const { user, setUser } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState<ProfileState>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.avatarUrl ?? "",
    roleTitle: user?.staffRole?.title ?? "",
  });
  const [photoUploading, setPhotoUploading] = React.useState(false);

  // Fetch fresh profile on mount
  React.useEffect(() => {
    let cancelled = false;
    void dal.auth.getProfile().then((res) => {
      if (cancelled || !res.ok) {
        setLoading(false);
        return;
      }
      setProfile({
        name: res.data.name ?? "",
        email: res.data.email ?? "",
        image: res.data.image ?? res.data.avatarUrl ?? "",
        roleTitle: res.data.staffRole?.title ?? "",
      });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const syncUser = (patch: Partial<Pick<ProfileState, "name" | "image" | "email">>) => {
    if (!user) return;
    const updated = {
      ...user,
      name: patch.name ?? user.name,
      email: patch.email ?? user.email,
      avatarUrl: patch.image !== undefined ? patch.image || undefined : user.avatarUrl,
    };
    setUser(updated);
    persistSessionCookie(updated);
  };

  const handleProfileUpdated = (next: ProfileState) => {
    setProfile(next);
    syncUser({ name: next.name, image: next.image });
  };

  const handleEmailChanged = (newEmail: string) => {
    const next = { ...profile, email: newEmail };
    setProfile(next);
    syncUser({ email: newEmail });
  };

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
    const res = await dal.auth.updateProfile({ name: profile.name.trim(), image: up.data.url });
    setPhotoUploading(false);
    if (res.ok) {
      const next: ProfileState = {
        ...profile,
        image: up.data.url,
        name: res.data.name ?? profile.name,
      };
      setProfile(next);
      syncUser({ image: up.data.url });
      toast.success(ts("photoUpdated"));
    } else {
      toast.error(res.error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile card header */}
      <ProfileCard
        profile={profile}
        photoUploading={photoUploading}
        onUpload={(file) => void uploadPhoto(file)}
      />

      {/* Tabbed settings */}
      <Tabs defaultValue="info" className="space-y-5">
        <TabsList className="h-10 w-full rounded-xl sm:w-auto">
          <TabsTrigger value="info" id="tab-info" className="gap-1.5">
            <User className="size-3.5" />
            {t("personalInfo")}
          </TabsTrigger>
          <TabsTrigger value="email" id="tab-email" className="gap-1.5">
            <Mail className="size-3.5" />
            {t("emailTitle")}
          </TabsTrigger>
          <TabsTrigger value="password" id="tab-password" className="gap-1.5">
            <KeyRound className="size-3.5" />
            {t("passwordTitle")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-4" />
                </span>
                {t("personalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PersonalInfoTab profile={profile} onUpdated={handleProfileUpdated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Mail className="size-4" />
                </span>
                {t("emailTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-5 text-sm text-muted-foreground">{t("emailDesc")}</p>
              <EmailTab currentEmail={profile.email} onEmailChanged={handleEmailChanged} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <KeyRound className="size-4" />
                </span>
                {t("passwordTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-5 text-sm text-muted-foreground">{t("passwordDesc")}</p>
              <PasswordTab />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
