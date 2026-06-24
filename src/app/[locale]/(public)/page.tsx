import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Languages,
  Star,
  Layers,
  Quote,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CourseCard } from "@/features/marketing/components/course-card";
import { MarketingHero } from "@/features/marketing/components/marketing-hero";
import {
  CareerCtaSection,
  HowItWorksSection,
  OrganizationsSection,
  PartnersSection,
} from "@/features/marketing/components/home-marketing-sections";
import { SITE_NAME, seoAlternates, socialMeta, metaDescription } from "@/lib/seo";
import { resolveSeoMetadata } from "@/lib/public-seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  const title = `${SITE_NAME} — ${t("heroTitle")}`;
  const description = metaDescription(t("heroSubtitle"));
  // Admin-managed SEO (settings + "/" page override) spread underneath so it
  // contributes fields the i18n defaults don't set (e.g. a site-wide noindex);
  // best-effort and never overrides the localized title/description below.
  const adminMeta = await resolveSeoMetadata("/").catch(() => ({} as Metadata));
  return {
    ...adminMeta,
    title,
    description,
    alternates: seoAlternates("/", locale),
    ...socialMeta({ title, description, path: "/", locale }),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  const [coursesRes, categoriesRes, instructorsRes] = await Promise.all([
    dal.courses.fetchCourses(),
    dal.lookups.fetchCategories(),
    dal.lookups.fetchInstructors(),
  ]);
  const courses = (coursesRes.ok ? coursesRes.data : []).slice(0, 4);
  const categories = categoriesRes.ok ? categoriesRes.data : [];
  const instructors = (instructorsRes.ok ? instructorsRes.data : []).slice(0, 4);

  const stats = [
    { value: "18.4K", label: t("heroStat1"), icon: Users },
    { value: "38", label: t("heroStat2"), icon: GraduationCap },
    { value: "64", label: t("heroStat3"), icon: BookOpen },
    { value: "92%", label: t("heroStat4"), icon: TrendingUp },
  ];

  const features = [
    { icon: GraduationCap, title: t("feature1Title"), desc: t("feature1Desc") },
    { icon: ShieldCheck, title: t("feature2Title"), desc: t("feature2Desc") },
    { icon: Star, title: t("feature3Title"), desc: t("feature3Desc") },
    { icon: Languages, title: t("feature4Title"), desc: t("feature4Desc") },
  ];

  const testimonials = [
    { name: "Sara Khalil", role: "Financial Analyst, Riyadh", quote: "The financial modeling program was rigorous and directly applicable. I was promoted within three months of finishing." },
    { name: "Omar Haddad", role: "Product Manager, Dubai", quote: "Bilingual delivery made it easy for my whole team to follow. The instructors are genuine practitioners." },
    { name: "Layla Mansour", role: "HR Director, Cairo", quote: "Verifiable certificates gave my qualifications real weight with employers. Highly recommended." },
  ];

  return (
    <>
      <MarketingHero stats={stats} videoId="SSlmmUH2Ado" />

      {/* Featured courses */}
      <Section title={t("featuredTitle")} subtitle={t("featuredSubtitle")}
        action={<Button asChild variant="ghost" className="gap-1.5"><Link href="/courses">{t("viewAllCourses")}<ArrowRight className="size-4 rtl:rotate-180" /></Link></Button>}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </Section>

      {/* Categories */}
      <section className="border-y border-border/70 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Heading title={t("categoriesTitle")} subtitle={t("categoriesSubtitle")} />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href="/courses"
                className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Layers className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{cat.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("coursesCount", { count: cat.subcategories.length * 4 })}
                  </p>
                </div>
                <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <Section title={t("whyTitle")} subtitle={t("whySubtitle")} centered>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-warning/40 hover:shadow-md"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-warning/20 to-warning/5 text-warning ring-1 ring-warning/25 transition-transform group-hover:scale-105">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <HowItWorksSection />

      {/* Instructors */}
      <section className="border-y border-border/70 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <Heading title={t("instructorsTitle")} subtitle={t("instructorsSubtitle")} />
            <Button asChild variant="ghost" className="hidden gap-1.5 sm:inline-flex">
              <Link href="/instructors">{t("viewAllInstructors")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {instructors.map((ins) => (
              <Link
                key={ins.id}
                href={`/instructors/${ins.id}`}
                className="group flex flex-col items-center rounded-2xl border border-border/60 bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
              >
                <Avatar className="size-16 ring-2 ring-primary/15 ring-offset-2 ring-offset-card transition-transform group-hover:scale-105">
                  <AvatarFallback className="bg-gradient-to-br from-primary/15 to-primary/5 text-lg font-semibold text-primary">
                    {getInitials(ins.label)}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-4 font-semibold">{ins.label}</p>
                <p className="text-sm text-muted-foreground">{ins.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Section title={t("testimonialsTitle")} centered>
        <div className="grid gap-6 lg:grid-cols-3">
          {testimonials.map((tt) => (
            <figure key={tt.name} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
              <Quote className="absolute end-5 top-5 size-10 text-warning/20 transition-colors group-hover:text-warning/30" />
              <div className="relative flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="relative mt-4 flex-1 text-sm leading-relaxed text-foreground">
                “{tt.quote}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <Avatar className="size-10 border">
                  <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                    {getInitials(tt.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{tt.name}</p>
                  <p className="text-xs text-muted-foreground">{tt.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <PartnersSection />

      <OrganizationsSection />
      <CareerCtaSection />
    </>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-2.5">
      <h2 className="text-balance font-heading text-2xl font-bold tracking-[-0.01em] sm:text-3xl lg:text-[2rem]">
        {title}
      </h2>
      {subtitle && <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Section({
  title,
  subtitle,
  action,
  centered,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  centered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div
        className={
          centered
            ? "mx-auto max-w-2xl text-center"
            : "flex items-end justify-between gap-4"
        }
      >
        <Heading title={title} subtitle={subtitle} />
        {action}
      </div>
      <div className="mt-10">{children}</div>
    </section>
  );
}
