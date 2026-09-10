import { Award, Briefcase, Clock3, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import type { InstructorLookup } from "@/types";

/** LinkedIn glyph — lucide-react dropped brand icons, so inline the logo. */
function LinkedinGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/** How many fit the grid without leaving a ragged final row. */
const MAX_SHOWN = 4;

function linkedinOf(person: InstructorLookup): string | undefined {
  return person.socialLinks?.find((s) => /linkedin/i.test(s.key))?.value?.trim() || undefined;
}

/**
 * The faculty strip on the home page and /about.
 *
 * Every field here comes from a stored instructor record, and the section
 * renders nothing at all when there are none.
 *
 * It used to render four hard-coded people — invented names, stock photographs
 * of real strangers used as their portraits, each attributed to a real named
 * hospital (King Faisal Specialist, Cleveland Clinic Abu Dhabi, Mediclinic,
 * Jordan University Hospital), with a "LinkedIn" button that went to
 * linkedin.com. That is a fabricated credential claim about named institutions
 * on the site's two highest-traffic pages, and it is the exact thing
 * `InstructorLookup` warns against: never assert a credential, an affiliation
 * or a number of years that is not stored against this person.
 *
 * So there is no sample data and no placeholder path. An empty roster shows an
 * empty page — the same decision /instructors already makes when it de-indexes
 * itself, and the same one the market pages make with testimonials. Fill the
 * roster in Admin → Instructors and this section appears on its own.
 */
export async function HealthcareFacultySection({
  faculty,
}: {
  /** Overridable for a page that has already fetched the roster. */
  faculty?: InstructorLookup[];
}) {
  const t = await getTranslations("Marketing");

  let people = faculty;
  if (!people) {
    // A failed fetch is treated as an empty roster: the section disappears
    // rather than falling back to anything.
    const res = await dal.lookups.fetchInstructors().catch(() => null);
    people = res && res.ok ? res.data : [];
  }

  if (people.length === 0) return null;

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
          <Button
            asChild
            variant="ghost"
            className="hidden gap-1.5 text-[#0b3fa8] hover:bg-[#0b3fa8]/10 hover:text-[#0a2f7a] sm:inline-flex"
          >
            <Link href="/instructors">
              {t("viewAllInstructors")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {people.slice(0, MAX_SHOWN).map((person) => {
            const href = `/instructors/${person.slug || person.id}`;
            const role = person.title || person.specialty;
            const linkedin = linkedinOf(person);

            return (
              <article
                key={person.id}
                className="group flex h-full flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/35 hover:shadow-md"
              >
                <Link href={href} className="flex flex-col items-center text-center">
                  <Avatar className="size-24 border-4 border-white shadow-lg ring-2 ring-[#0b3fa8]/30">
                    {/* Only a stored portrait. No stock photograph stands in for
                        a person who has not supplied one. */}
                    {person.avatarUrl && (
                      <AvatarImage src={person.avatarUrl} alt={person.label} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-[#0b3fa8] text-xl font-semibold text-white">
                      {getInitials(person.label)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="mt-4 text-base font-bold text-[#0a2f7a] group-hover:underline">
                    {person.label}
                  </h3>
                </Link>

                {/* Each row appears only when that field is filled in — an
                    instructor with a name and nothing else renders a card with
                    a name and nothing else. */}
                <dl className="mt-4 flex-1 space-y-2.5 text-sm">
                  {role && (
                    <div>
                      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        <Briefcase className="size-3.5 shrink-0 text-[#0b3fa8]" aria-hidden />
                        {t("facultyPosition")}
                      </dt>
                      <dd className="ps-[22px] font-medium text-slate-700">{role}</dd>
                    </div>
                  )}

                  {typeof person.yearsOfExperience === "number" && (
                    <div>
                      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        <Clock3 className="size-3.5 shrink-0 text-[#0b3fa8]" aria-hidden />
                        {t("facultyExperience")}
                      </dt>
                      <dd className="ps-[22px] font-medium text-slate-700">
                        {person.yearsOfExperience}+
                      </dd>
                    </div>
                  )}

                  {person.certificates && person.certificates.length > 0 && (
                    <div>
                      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        <Award className="size-3.5 shrink-0 text-[#0b3fa8]" aria-hidden />
                        {t("facultyCertificates")}
                      </dt>
                      <dd className="ps-[22px] font-medium text-slate-700">
                        {person.certificates.slice(0, 3).join(" · ")}
                      </dd>
                    </div>
                  )}
                </dl>

                {/* A real stored profile URL, or no button. The previous version
                    linked every card to linkedin.com's home page. */}
                {linkedin ? (
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0b3fa8]/20 bg-[#0b3fa8]/5 px-3 py-2.5 text-sm font-semibold text-[#0b3fa8] transition hover:bg-[#0b3fa8] hover:text-white"
                  >
                    <LinkedinGlyph className="size-4" />
                    {t("facultyLinkedIn")}
                  </a>
                ) : (
                  <Link
                    href={href}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#0b3fa8]/20 bg-[#0b3fa8]/5 px-3 py-2.5 text-sm font-semibold text-[#0b3fa8] transition hover:bg-[#0b3fa8] hover:text-white"
                  >
                    {t("facultyViewProfile")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
