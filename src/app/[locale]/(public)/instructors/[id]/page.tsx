import { notFound } from "next/navigation";
import { Star, Briefcase, GraduationCap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/features/marketing/components/course-card";

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
  const instructor = instructors.find((i) => i.id === id);
  if (!instructor) notFound();

  const courses = (coursesRes.ok ? coursesRes.data : []).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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
