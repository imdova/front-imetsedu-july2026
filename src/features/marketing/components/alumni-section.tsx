import { getTranslations } from "next-intl/server";
import { ArrowRight, MapPin } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/**
 * Meet Our Graduates — real people from the graduation cohorts.
 *
 * This section used to list six invented alumni ("Noura Al-Harbi, Quality
 * Coordinator, Saudi Arabia", and five more) under a heading that called them
 * real outcomes. The site has an entire Graduates module holding actual
 * cohorts — real names, real professions, real countries, real photographs —
 * so the invented list was not even filling a data gap. It is now sourced from
 * that module, and renders nothing when no published cohort has graduates.
 *
 * One thing the data does NOT support: a post-course job title. A graduate
 * record stores the profession they arrived with, not a promotion they got
 * afterwards. So the card shows profession, country and the programme they
 * completed, and the copy claims exactly that and no more.
 */

/** Cards that fill the grid without leaving a ragged final row. */
const MAX_SHOWN = 6;
/** Cohorts to open for names. Enough for a spread of programmes, few enough
 *  that the home page does not fan out into a dozen requests. */
const MAX_COHORTS = 3;
const PER_COHORT = 2;

interface AlumniCard {
  key: string;
  name: string;
  profession: string;
  country: string;
  program: string;
  photoUrl: string;
  cohortSlug: string;
}

async function collectAlumni(): Promise<AlumniCard[]> {
  const listRes = await dal.graduates.fetchPublishedCohorts().catch(() => null);
  if (!listRes || !listRes.ok) return [];

  /*
   * The public list endpoint returns counts and preview photos but not the
   * graduates themselves, so the names come from the per-cohort detail call.
   * Only cohorts that actually have graduates are opened.
   */
  const candidates = listRes.data.filter((c) => c.graduatesCount > 0).slice(0, MAX_COHORTS);

  const details = await Promise.all(
    candidates.map((c) => dal.graduates.fetchPublishedCohort(c.slug).catch(() => null)),
  );

  const out: AlumniCard[] = [];
  for (const res of details) {
    if (!res || !res.ok) continue;
    const cohort = res.data;
    const program = [cohort.programTitle, cohort.programTitleAccent].filter(Boolean).join(" ").trim();
    for (const g of cohort.graduates.slice(0, PER_COHORT)) {
      if (!g.name?.trim()) continue;
      out.push({
        key: g.id || `${cohort.slug}-${g.name}`,
        name: g.name.replace(/\s+/g, " ").trim(),
        profession: g.title?.trim() ?? "",
        country: g.country?.trim() ?? "",
        program,
        photoUrl: g.photoUrl ?? "",
        cohortSlug: cohort.slug,
      });
    }
  }
  return out.slice(0, MAX_SHOWN);
}

export async function AlumniSection() {
  const t = await getTranslations("Marketing");
  const alumni = await collectAlumni();

  if (alumni.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
          {t("alumniTitle")}
        </h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t("alumniSubtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {alumni.map((a) => (
          <Link
            key={a.key}
            href={`/graduates/${a.cohortSlug}`}
            className="group flex flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/30 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-14 border-2 border-white shadow ring-2 ring-[#0b3fa8]/20">
                {a.photoUrl && <AvatarImage src={a.photoUrl} alt={a.name} className="object-cover" />}
                <AvatarFallback className="bg-[#0b3fa8] text-base font-semibold text-white">
                  {getInitials(a.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-bold text-[#0a2f7a] group-hover:underline">
                  {a.name}
                </p>
                {a.profession && (
                  <p className="truncate text-sm font-semibold text-[#0b3fa8]">{a.profession}</p>
                )}
                {a.country && (
                  <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {a.country}
                  </p>
                )}
              </div>
            </div>
            {a.program && (
              <div className="mt-4 border-t border-blue-50 pt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {t("alumniProgram")}
                </span>
                <p className="mt-0.5 inline-flex rounded-full bg-[#0b3fa8]/10 px-3 py-1 text-xs font-bold text-[#0b3fa8]">
                  {a.program}
                </p>
              </div>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/graduates"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0b3fa8] transition-all hover:gap-2.5"
        >
          {t("alumniViewAll")}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
