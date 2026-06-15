"use client";

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
import { AuthCard } from "@/features/auth/components/auth-card";
import { SocialButtons } from "@/features/auth/components/social-buttons";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});
type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const tc = useTranslations("Common");
  const router = useRouter();
  const { setUser } = useAuth();

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (values: Values) => {
    const res = await authDal.register({ name: values.name, email: values.email, password: values.password });
    if (!res.ok) {
      toast.error(res.error || t("registerFailed"));
      return;
    }
    const user = toAuthUser(res.data);
    setUser(user);
    persistSessionCookie(user);
    if (res.data.refresh_token) persistRefreshToken(res.data.refresh_token);
    toast.success(t("accountCreated"));
    router.push(homeForRole(user.role));
  };

  return (
    <AuthCard
      title={t("registerTitle")}
      subtitle={t("registerSubtitle")}
      footer={
        <>
          {t("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {tc("signIn")}
          </Link>
        </>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{tc("fullName")}</Label>
          <Input id="name" {...form.register("name")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{tc("email")}</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">{tc("password")}</Label>
          <Input id="password" type="password" {...form.register("password")} />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {tc("signUp")}
        </Button>
        <p className="text-center text-xs text-muted-foreground">{t("agreeTerms")}</p>
      </form>
      <div className="mt-5">
        <SocialButtons />
      </div>
    </AuthCard>
  );
}
