import { getTranslations } from "next-intl/server";
import { MapPin } from "lucide-react";

import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

/** Meet Our Alumni — stronger than plain testimonials. Replace with real
 * alumni (photo, current job, country, program) when available. */
const ALUMNI = [
  { name: "Noura Al-Harbi", job: "Quality Coordinator", country: "Saudi Arabia", program: "CPHQ" },
  { name: "Dr. Khaled Farouk", job: "Infection Control Lead", country: "UAE", program: "CIC" },
  { name: "Sara Mansour", job: "Quality Manager", country: "Egypt", program: "Healthcare Quality Diploma" },
  { name: "Dr. Omar Al-Mutairi", job: "Hospital Operations Director", country: "Saudi Arabia", program: "Hospital Management" },
  { name: "Layla Hassan", job: "Medication Safety Officer", country: "Jordan", program: "Patient Safety" },
  { name: "Dr. Ahmed Nabil", job: "Accreditation Specialist", country: "Egypt", program: "CPHQ" },
];

export async function AlumniSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{t("alumniTitle")}</h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t("alumniSubtitle")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ALUMNI.map((a) => (
          <div key={a.name} className="flex flex-col rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/30 hover:shadow-md">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 border-2 border-white shadow ring-2 ring-[#0b3fa8]/20">
                <AvatarFallback className="bg-[#0b3fa8] text-base font-semibold text-white">{getInitials(a.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-heading text-base font-bold text-[#0a2f7a]">{a.name}</p>
                <p className="truncate text-sm font-semibold text-[#0b3fa8]">{a.job}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3.5" /> {a.country}</p>
              </div>
            </div>
            <div className="mt-4 border-t border-blue-50 pt-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{t("alumniProgram")}</span>
              <p className="mt-0.5 inline-flex rounded-full bg-[#0b3fa8]/10 px-3 py-1 text-xs font-bold text-[#0b3fa8]">{a.program}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
