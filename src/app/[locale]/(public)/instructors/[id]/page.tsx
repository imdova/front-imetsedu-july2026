import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star, Briefcase, GraduationCap, ChevronRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link, redirect } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/features/marketing/components/course-card";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_NAME, seoAlternates, socialMeta, localeUrl, personLd, breadcrumbLd } from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const res = await dal.lookups.fetchInstructors();
  const instructor = res.ok ? res.data.find((i) => (i.slug || i.id) === id || i.id === id) : null;
  if (!instructor) return {};
  const title = instructor.label;
  const description = `${instructor.label}${instructor.title ? ` — ${instructor.title}` : ""}. ${SITE_NAME} instructor.`;
  const path = `/instructors/${instructor.slug || instructor.id}`;
  return mergeSeo(path, {
    title,
    description,
    alternates: seoAlternates(path, locale),
    ...socialMeta({ title: `${title} · ${SITE_NAME}`, description, path, locale, image: instructor.avatarUrl }),
  });
}

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  const [instructorsRes, coursesRes] = await Promise.all([
    dal.lookups.fetchInstructors(),
    dal.courses.fetchCourses(),
  ]);
  const instructors = instructorsRes.ok ? instructorsRes.data : [];
  const instructor = instructors.find((i) => (i.slug || i.id) === id);
  if (!instructor) {
    // Old id-based URL → send it to the clean slug.
    const byId = instructors.find((i) => i.id === id && i.slug && i.slug !== i.id);
    if (byId) redirect({ href: `/instructors/${byId.slug}`, locale });
    notFound();
  }

  const courses = (coursesRes.ok ? coursesRes.data : []).slice(0, 3);

  const url = localeUrl(`/instructors/${instructor.slug || instructor.id}`, locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd
        data={[
          personLd({ name: instructor.label, jobTitle: instructor.title, image: instructor.avatarUrl, url, locale }),
          breadcrumbLd([
            { name: locale === "ar" ? "الرئيسية" : "Home", url: localeUrl("/", locale) },
            { name: locale === "ar" ? "الأساتذة" : "Faculty", url: localeUrl("/instructors", locale) },
            { name: instructor.label, url },
          ]),
        ]}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground">{locale === "ar" ? "الرئيسية" : "Home"}</Link>
        <ChevronRight className="size-3.5 rtl:rotate-180" />
        <Link href="/instructors" className="hover:text-foreground">{locale === "ar" ? "الأساتذة" : "Faculty"}</Link>
        <ChevronRight className="size-3.5 rtl:rotate-180" />
        <span className="line-clamp-1 text-foreground">{instructor.label}</span>
      </nav>

      <div className="flex flex-col items-start gap-6 rounded-2xl border border-border/70 bg-gradient-to-br from-primary/5 to-card p-6 sm:flex-row sm:items-center sm:p-8">
        <Avatar className="size-24 border-2 border-background shadow-md">
          <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">
            {getInitials(instructor.label)}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {instructor.label}
          </h1>
          <p className="text-muted-foreground">{instructor.title}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Badge variant="secondary" className="gap-1">
              <Star className="size-3.5 fill-warning text-warning" /> 4.8
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Briefcase className="size-3.5" /> {t("yearsExperience", { count: 8 })}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <GraduationCap className="size-3.5" /> 12 courses
            </Badge>
          </div>
        </div>
      </div>

      <div className="mt-8 max-w-3xl space-y-4">
        <h2 className="font-heading text-xl font-semibold">{t("aboutInstructor")}</h2>
        <p className="text-muted-foreground">
          {instructor.label} is a seasoned practitioner and educator delivering
          IMETS programs across the MENA region. With deep industry experience and
          a passion for teaching, they help professionals translate theory into
          measurable career outcomes through hands-on, cohort-based learning.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="font-heading text-2xl font-bold tracking-tight">
          {t("coursesByInstructor")}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      </div>
    </div>
  );
}
