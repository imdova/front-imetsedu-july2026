import { getTranslations } from "next-intl/server";
import {
  LayoutDashboard, Award, Smartphone, PlayCircle, FileText, Video, MessagesSquare,
  type LucideIcon,
} from "lucide-react";

/**
 * Platform preview — "Explore Our Campus". Each tile is a labelled preview slot.
 * Drop a real screenshot into `image` (public path) to replace the placeholder.
 */
const PREVIEWS: { icon: LucideIcon; key: string; image?: string; wide?: boolean }[] = [
  { icon: LayoutDashboard, key: "campusDashboard", wide: true },
  { icon: Award, key: "campusCertificates" },
  { icon: Smartphone, key: "campusMobile" },
  { icon: PlayCircle, key: "campusRecordings" },
  { icon: FileText, key: "campusAssignments" },
  { icon: Video, key: "campusLive" },
  { icon: MessagesSquare, key: "campusDiscussion" },
];

export async function ExploreCampusSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-white to-blue-50/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3fa8]">{t("campusLabel")}</p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{t("campusTitle")}</h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t("campusSubtitle")}</p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEWS.map((p) => (
            <figure
              key={p.key}
              className={`group overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${p.wide ? "lg:col-span-2" : ""}`}
            >
              {/* Screenshot slot */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[radial-gradient(120%_120%_at_20%_0%,#e8f0ff_0%,#dbe7ff_55%,#c7d8ff_100%)]">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt={t(p.key)} className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center">
                    <span className="grid size-14 place-items-center rounded-2xl bg-white/70 text-[#0b3fa8] shadow-sm ring-1 ring-[#0b3fa8]/15">
                      <p.icon className="size-7" />
                    </span>
                  </span>
                )}
              </div>
              <figcaption className="flex items-center gap-2.5 px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#0b3fa8]/10 text-[#0b3fa8]"><p.icon className="size-4" /></span>
                <span className="font-heading text-sm font-bold text-[#0a2f7a]">{t(p.key)}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
