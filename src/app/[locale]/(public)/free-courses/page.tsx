import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Sparkles, PlayCircle, GraduationCap } from "lucide-react";

import { dal } from "@/lib/dal";
import { mergeSeo } from "@/lib/public-seo";
import { seoAlternates, socialMeta, localeUrl, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { FreeProgramCard } from "@/features/free-courses/components/free-program-card";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = tr(
    locale,
    "Free Healthcare Courses — Watch Free Lectures Online",
    "كورسات رعاية صحية مجانية — شاهد محاضرات مجانية أونلاين",
  );
  const description = tr(
    locale,
    "Watch free healthcare lectures online — hospital management, healthcare quality, infection control and more. Free access, no payment required.",
    "شاهد محاضرات مجانية في الرعاية الصحية أونلاين — إدارة المستشفيات، وجودة الرعاية، ومكافحة العدوى وغيرها. وصول مجاني بالكامل.",
  );
  return mergeSeo("/free-courses", {
    title,
    description,
    alternates: seoAlternates("/free-courses", locale),
    ...socialMeta({ title, description, path: "/free-courses", locale }),
  });
}

export default async function FreeCoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const res = await dal.freeCourses.fetchFreePrograms();
  const programs = res.ok ? res.data : [];

  return (
    <>
      {programs.length > 0 && (
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              name: tr(locale, "Free Healthcare Courses", "كورسات رعاية صحية مجانية"),
              itemListElement: programs.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                  "@type": "Course",
                  name: (locale === "ar" ? p.titleAr : p.titleEn) || p.titleEn,
                  description: (locale === "ar" ? p.descriptionAr : p.descriptionEn) || undefined,
                  url: localeUrl(`/free-courses/${p.slug}`, locale),
                  provider: { "@type": "EducationalOrganization", name: SITE_NAME },
                  // Free courses must declare a zero-price offer to be eligible
                  // for Google's course rich results.
                  offers: { "@type": "Offer", price: 0, priceCurrency: "EGP", category: "Free" },
                },
              })),
            },
          ]}
        />
      )}

      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles className="size-3.5" /> {tr(locale, "100% FREE", "مجاني ١٠٠٪")}
          </span>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {tr(locale, "Free Healthcare Courses", "كورسات رعاية صحية مجانية")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {tr(
              locale,
              "Real lectures from our programs — free to watch. Pick a topic, tell us where to send your access, and start learning.",
              "محاضرات حقيقية من برامجنا — مجانية تمامًا. اختر موضوعًا، أخبرنا أين نرسل رابط الوصول، وابدأ التعلّم.",
            )}
          </p>
        </div>

        {programs.length === 0 ? (
          <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <GraduationCap className="size-7" />
            </span>
            <p className="font-medium">{tr(locale, "Free courses are coming soon", "الكورسات المجانية قريبًا")}</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              {tr(
                locale,
                "We're putting the finishing touches on our free lectures. Check back shortly.",
                "نضع اللمسات الأخيرة على محاضراتنا المجانية. تابعنا قريبًا.",
              )}
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <FreeProgramCard key={p.id} locale={locale} program={p} />
            ))}
          </div>
        )}

        {programs.length > 0 && (
          <p className="mt-10 flex items-center justify-center gap-1.5 text-center text-sm text-muted-foreground">
            <PlayCircle className="size-4" />
            {tr(
              locale,
              "No payment, no card — just complete a short form once.",
              "بدون دفع وبدون بطاقة — فقط أكمل نموذجًا قصيرًا مرة واحدة.",
            )}
          </p>
        )}
      </div>
    </>
  );
}
