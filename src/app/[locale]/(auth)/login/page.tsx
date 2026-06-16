"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/store";
import * as authDal from "@/lib/dal/auth";
import { toAuthUser, homeForRole, persistSessionCookie, persistRefreshToken } from "@/lib/auth-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthCard } from "@/features/auth/components/auth-card";
import { SocialButtons } from "@/features/auth/components/social-buttons";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const router = useRouter();
  const { setUser } = useAuth();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "admin@imetsedu.com", password: "" },
  });

  const onSubmit = async (values: Values) => {
    const res = await authDal.login(values.email, values.password);
    if (!res.ok) {
      toast.error(res.error || t("loginFailed"));
      return;
    }
    // Fetch full profile with the token passed explicitly — mirrors old codebase:
    // AuthDAL.getCurrentUser(result.data.access_token)
    // This is critical: the token isn't in Zustand yet so getProfile() must
    // receive it as a parameter, otherwise staffRole comes back empty and the
    // user is incorrectly mapped as "student" instead of "staff".
    const profileResult = await authDal.getProfile(res.data.access_token);
    const profile = profileResult.ok ? profileResult.data : null;
    const user = toAuthUser(res.data, profile);
    setUser(user);
    persistSessionCookie(user);
    if (res.data.refresh_token) persistRefreshToken(res.data.refresh_token);
    toast.success(t("loggedIn"));
    const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
    router.push(next && next.startsWith("/") ? next : homeForRole(user.role));
  };

  return (
    <AuthCard
      title={t("loginTitle")}
      subtitle={t("loginSubtitle")}
      footer={
        <>
          {t("noAccount")}{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            {tc("signUp")}
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{tc("email")}</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{tc("password")}</Label>
          <Input id="password" type="password" {...form.register("password")} />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox defaultChecked /> {t("rememberMe")}
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            {t("forgotLink")}
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {tc("signIn")}
        </Button>
      </form>
      <div className="mt-5">
        <SocialButtons />
      </div>
    </AuthCard>
  );
}
