import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Languages,
  Star,
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
    { value: "18.4K", label: t("heroStat1") },
    { value: "38", label: t("heroStat2") },
    { value: "64", label: t("heroStat3") },
    { value: "92%", label: t("heroStat4") },
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
      <MarketingHero stats={stats} />

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
                className="group flex items-center justify-between rounded-xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div>
                  <p className="font-medium">{cat.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("coursesCount", { count: cat.subcategories.length * 4 })}
                  </p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <Section title={t("whyTitle")} subtitle={t("whySubtitle")} centered>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-heading text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
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
                className="flex flex-col items-center rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
              >
                <Avatar className="size-16 border">
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                    {getInitials(ins.label)}
                  </AvatarFallback>
                </Avatar>
                <p className="mt-3 font-medium">{ins.label}</p>
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
            <figure key={tt.name} className="flex flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
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

      <OrganizationsSection />
      <CareerCtaSection />
    </>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
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
