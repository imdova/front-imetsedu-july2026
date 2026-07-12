import { Building2, Briefcase, Clock3, BookOpen, ArrowRight } from "lucide-react";

/** LinkedIn glyph — lucide-react dropped brand icons, so inline the logo. */
function LinkedinGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";

export interface FacultyMember {
  name: string;
  position: string;
  hospital: string;
  yearsExperience: number;
  courses: string[];
  photo: string;
  linkedinUrl: string;
}

/** Curated healthcare faculty for the home trust section. */
export const HOME_FACULTY: FacultyMember[] = [
  {
    name: "Dr. Sara Al-Khalid",
    position: "Director of Quality & Patient Safety",
    hospital: "King Faisal Specialist Hospital",
    yearsExperience: 14,
    courses: ["CPHQ Preparation", "Patient Safety"],
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces&q=80",
    linkedinUrl: "https://www.linkedin.com/",
  },
  {
    name: "Dr. Ahmed Mansour",
    position: "Quality Manager",
    hospital: "Ain Shams University Hospitals",
    yearsExperience: 12,
    courses: ["Healthcare Quality", "Accreditation"],
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces&q=80",
    linkedinUrl: "https://www.linkedin.com/",
  },
  {
    name: "Noura Al-Otaibi, RN",
    position: "Infection Control Lead",
    hospital: "Cleveland Clinic Abu Dhabi",
    yearsExperience: 11,
    courses: ["Infection Control", "Patient Safety"],
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=faces&q=80",
    linkedinUrl: "https://www.linkedin.com/",
  },
  {
    name: "Dr. Layla Hassan",
    position: "Clinical Governance Consultant",
    hospital: "Jordan University Hospital",
    yearsExperience: 15,
    courses: ["Hospital Management", "Healthcare Leadership"],
    photo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=faces&q=80",
    linkedinUrl: "https://www.linkedin.com/",
  },
];

export async function HealthcareFacultySection({
  faculty = HOME_FACULTY,
}: {
  faculty?: FacultyMember[];
}) {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-white to-blue-50/70">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2.5">
            <h2 className="text-balance font-heading text-2xl font-bold tracking-[-0.01em] text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
              {t("instructorsTitle")}
            </h2>
            <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              {t("instructorsSubtitle")}
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden gap-1.5 text-[#0b3fa8] hover:bg-[#0b3fa8]/10 hover:text-[#0a2f7a] sm:inline-flex">
            <Link href="/instructors">
              {t("viewAllInstructors")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {faculty.map((member) => (
            <article
              key={member.name}
              className="group flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/35 hover:shadow-md"
            >
              <div className="flex flex-col items-center text-center">
                <Avatar className="size-24 border-4 border-white shadow-lg ring-2 ring-[#0b3fa8]/30">
                  <AvatarImage src={member.photo} alt={member.name} className="object-cover" />
                  <AvatarFallback className="bg-[#0b3fa8] text-xl font-semibold text-white">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-4 text-base font-bold text-[#0a2f7a]">{member.name}</h3>
              </div>

              <dl className="mt-4 flex-1 space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <Briefcase className="mt-0.5 size-4 shrink-0 text-[#0b3fa8]" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("facultyPosition")}</dt>
                    <dd className="font-medium text-slate-700">{member.position}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-[#0b3fa8]" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("facultyHospital")}</dt>
                    <dd className="font-medium text-slate-700">{member.hospital}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-[#0b3fa8]" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("facultyExperience")}</dt>
                    <dd className="font-medium text-slate-700">{member.yearsExperience}+</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <BookOpen className="mt-0.5 size-4 shrink-0 text-[#0b3fa8]" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("facultyCourses")}</dt>
                    <dd className="font-medium text-slate-700">{member.courses.join(" · ")}</dd>
                  </div>
                </div>
              </dl>

              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0b3fa8]/20 bg-[#0b3fa8]/5 px-3 py-2.5 text-sm font-semibold text-[#0b3fa8] transition hover:bg-[#0b3fa8] hover:text-white"
              >
                <LinkedinGlyph className="size-4" />
                {t("facultyLinkedIn")}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
