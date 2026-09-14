import type { Metadata } from "next";
import { BadgeCheck, Building2, Globe2, Sparkles, Target, UsersRound } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, localeUrl, staticPageMeta } from "@/lib/seo";
import { VacancySubmissionForm } from "@/features/career-hub/components/vacancy-submission-form";

const PATH = "/careers/post-a-job";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  return staticPageMeta({
    title: ar ? "انشر وظيفة صحية" : "Post a Healthcare Job",
    description: ar
      ? "لجهات العمل في مصر والخليج: أرسل وظيفتك الشاغرة مجانًا، ونطابقها مع خريجي IMETS المؤهلين في الجودة ومكافحة العدوى والإدارة الصحية."
      : "Employers in Egypt and the Gulf: share a vacancy for free and we match it to trained IMETS graduates in quality, infection control and healthcare management.",
    path: PATH,
    locale,
  });
}

/** Employer-facing vacancy form. Submissions land in the admin Career Hub for verification. */
export default async function PostAJobPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);

  const points = [
    {
      icon: Target,
      title: tr("Matched, not just posted", "مطابقة لا مجرد نشر"),
      body: tr(
        "Your role is shown to graduates whose profession, training and interests fit it.",
        "تُعرض وظيفتك على الخريجين الذين تناسبها مهنتهم وتدريبهم واهتماماتهم.",
      ),
    },
    {
      icon: UsersRound,
      title: tr("Trained professionals", "مهنيون مدرَّبون"),
      body: tr(
        "IMETS graduates hold diplomas and certification prep in quality, infection control and healthcare management.",
        "يحمل خريجو IMETS دبلومات وتأهيلًا للشهادات في الجودة ومكافحة العدوى والإدارة الصحية.",
      ),
    },
    {
      icon: BadgeCheck,
      title: tr("Verified before listing", "تحقق قبل النشر"),
      body: tr(
        "We check every vacancy with the employer first, which keeps the board trusted by the people reading it.",
        "نتحقق من كل وظيفة مع جهة العمل أولًا، ما يحافظ على ثقة من يتصفّحون اللوحة.",
      ),
    },
    {
      icon: Globe2,
      title: tr("Egypt and the Gulf", "مصر والخليج"),
      body: tr(
        "Listings cover Egypt, Saudi Arabia, the UAE, Kuwait, Qatar, Oman and Bahrain.",
        "تغطي الوظائف مصر والسعودية والإمارات والكويت وقطر وعُمان والبحرين.",
      ),
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: tr("Home", "الرئيسية"), url: localeUrl("/", locale) },
            { name: tr("Career Hub", "مركز الوظائف"), url: localeUrl("/careers", locale) },
            { name: tr("Post a job", "انشر وظيفة"), url: localeUrl(PATH, locale) },
          ]),
        ]}
      />
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-primary/[0.07] via-background to-background">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 start-[-10%] -z-10 size-[34rem] rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 end-[-8%] -z-10 size-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-primary/15">
                <Building2 className="size-3.5" />
                {tr("For employers", "لجهات العمل")}
              </span>
              <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl">
                {tr("Hire healthcare professionals ", "وظّف كوادر صحية ")}
                <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  {tr("trained for the job", "مؤهلة للوظيفة")}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {tr(
                  "Share your vacancy with the IMETS Career Hub. It's free, and once verified we list it and put it in front of graduates who fit.",
                  "شارك وظيفتك الشاغرة مع مركز وظائف IMETS. الخدمة مجانية، وبعد التحقق ننشرها ونعرضها على الخريجين المناسبين.",
                )}
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {points.map((p) => (
                  <div key={p.title} className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
                    <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-sky-500 text-white shadow-md shadow-primary/20">
                      <p.icon className="size-4" />
                    </span>
                    <h2 className="mt-3 font-heading text-sm font-bold">{p.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                {tr("IMETS never charges candidates to apply.", "لا تفرض IMETS أي رسوم على المتقدمين.")}
              </p>
            </div>

            <VacancySubmissionForm locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
