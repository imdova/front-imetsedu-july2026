import type { Metadata } from "next";
import { Star, Video, ThumbsUp, MessageCircle, ChevronRight } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { ReviewsShowcase } from "@/features/marketing/components/reviews-showcase";
import { SITE_NAME, seoAlternates, socialMeta } from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "ar" ? "قصص نجاح طلابنا" : "Student Success Stories";
  const description =
    locale === "ar"
      ? "شاهد آراء وتجارب خريجي IMETS بالفيديو وتوصياتهم على فيسبوك وواتساب ومناقشات مشاريع التخرج."
      : `Real student reviews and success stories from ${SITE_NAME} — video testimonials, Facebook & WhatsApp recommendations, and graduation project discussions.`;
  return mergeSeo("/reviews", {
    title,
    description,
    alternates: seoAlternates("/reviews", locale),
    ...socialMeta({ title: `${title} · ${SITE_NAME}`, description, path: "/reviews", locale }),
  });
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);

  const res = await dal.studentReviews.fetchPublicReviews();
  const reviews = res.ok ? res.data : [];

  const videoCount = reviews.filter((r) => r.kind === "video" || r.kind === "graduation").length;
  const fbCount = reviews.filter((r) => r.kind === "facebook").length;
  const waCount = reviews.filter((r) => r.kind === "whatsapp").length;

  const stats = [
    { icon: Star, value: "4.9", label: tr("Average rating", "متوسط التقييم") },
    { icon: Video, value: `${videoCount || 0}`, label: tr("Video stories", "قصص بالفيديو") },
    { icon: ThumbsUp, value: `${fbCount || 0}`, label: tr("Facebook reviews", "تقييمات فيسبوك") },
    { icon: MessageCircle, value: `${waCount || 0}`, label: tr("WhatsApp reviews", "تقييمات واتساب") },
  ];

  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">{tr("Home", "الرئيسية")}</Link>
          <ChevronRight className="size-3.5 rtl:rotate-180" />
          <span className="text-foreground">{tr("Success Stories", "قصص النجاح")}</span>
        </nav>

        {/* Hero */}
        <section className="marketing-gradient-bg overflow-hidden rounded-[2rem] px-6 py-10 shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:px-10 sm:py-12" dir={ar ? "rtl" : "ltr"}>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
              <Star className="size-4 fill-current" /> {tr("Student Success", "نجاح الطلاب")}
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {tr("Real Stories From Real Graduates", "قصص حقيقية من خريجين حقيقيين")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-blue-50/90 sm:text-lg">
              {tr(
                "Video testimonials, Facebook & WhatsApp recommendations, and graduation project discussions — straight from the healthcare professionals who trained with us.",
                "آراء بالفيديو، وتوصيات على فيسبوك وواتساب، ومناقشات مشاريع التخرج — من المتخصصين في الرعاية الصحية الذين تدرّبوا معنا.",
              )}
            </p>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-inset ring-white/15 backdrop-blur">
                <span className="flex items-center gap-1.5 text-amber-300"><s.icon className="size-4" /></span>
                <p className="mt-1.5 font-heading text-2xl font-bold text-white tabular-nums">{s.value}</p>
                <p className="text-xs text-blue-100/80">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Showcase */}
        <div className="py-14">
          <ReviewsShowcase reviews={reviews} locale={locale} />
        </div>

        {/* CTA */}
        <section className="mb-14 marketing-gradient-bg overflow-hidden rounded-[2rem] px-6 py-10 text-center shadow-xl ring-1 ring-inset ring-white/10 sm:px-10">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl text-balance">
            {tr("Your success story starts here", "قصة نجاحك تبدأ من هنا")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-50/90">
            {tr("Join thousands of healthcare professionals advancing their careers with IMETS.", "انضم إلى آلاف المتخصصين في الرعاية الصحية الذين يطوّرون مسيرتهم مع IMETS.")}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/courses" className="inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#0b3fa8] transition-transform hover:-translate-y-0.5">
              {tr("Browse programs", "تصفّح البرامج")}
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-inset ring-white/25 hover:bg-white/15">
              {tr("Talk to an advisor", "تحدّث مع مستشار")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
