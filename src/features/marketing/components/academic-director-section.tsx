import { getTranslations } from "next-intl/server";
import { Quote, GraduationCap } from "lucide-react";

/** Letter from the Academic Director — an institutional trust signal. */
export async function AcademicDirectorSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-blue-50/50">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[220px_1fr] lg:px-8">
        <div className="mx-auto text-center">
          {/* Photo placeholder — swap for a real portrait */}
          <span className="mx-auto grid size-28 place-items-center rounded-2xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15"><GraduationCap className="size-12" /></span>
          <p className="mt-3 font-heading text-sm font-bold text-[#0a2f7a]">{t("adName")}</p>
          <p className="text-xs font-semibold text-[#0b3fa8]">{t("adRole")}</p>
          {/* Signature placeholder */}
          <p className="mt-2 font-heading text-lg italic text-[#0a2f7a]/70">{t("adSignature")}</p>
        </div>
        <div>
          <Quote className="size-8 text-[#0b3fa8]/25" />
          <h2 className="mt-2 font-heading text-xl font-bold tracking-tight text-[#0a2f7a] sm:text-2xl">{t("adTitle")}</h2>
          <p className="mt-3 text-lg italic leading-relaxed text-slate-600">“{t("adQuote")}”</p>
        </div>
      </div>
    </section>
  );
}
