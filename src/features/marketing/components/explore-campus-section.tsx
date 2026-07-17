import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  LayoutDashboard,
  Award,
  Smartphone,
  PlayCircle,
  FileText,
  Video,
  MessagesSquare,
  type LucideIcon,
} from "lucide-react";

import { CAMPUS_PREVIEW_IMAGES } from "@/features/marketing/lib/campus-preview-images";

const PREVIEWS: {
  icon: LucideIcon;
  key: string;
  image: string;
  wide?: boolean;
  objectPosition?: string;
}[] = [
  {
    icon: LayoutDashboard,
    key: "campusDashboard",
    image: CAMPUS_PREVIEW_IMAGES.dashboard,
    wide: true,
    objectPosition: "center top",
  },
  {
    icon: Award,
    key: "campusCertificates",
    image: CAMPUS_PREVIEW_IMAGES.certificates,
    objectPosition: "center",
  },
  {
    icon: Smartphone,
    key: "campusMobile",
    image: CAMPUS_PREVIEW_IMAGES.mobile,
    objectPosition: "center",
  },
  {
    icon: PlayCircle,
    key: "campusRecordings",
    image: CAMPUS_PREVIEW_IMAGES.recordings,
    objectPosition: "center",
  },
  {
    icon: FileText,
    key: "campusAssignments",
    image: CAMPUS_PREVIEW_IMAGES.assignments,
    objectPosition: "center",
  },
  {
    icon: Video,
    key: "campusLive",
    image: CAMPUS_PREVIEW_IMAGES.live,
    objectPosition: "center",
  },
  {
    icon: MessagesSquare,
    key: "campusDiscussion",
    image: CAMPUS_PREVIEW_IMAGES.discussion,
    objectPosition: "center",
  },
];

export async function ExploreCampusSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-white to-blue-50/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3fa8]">
            {t("campusLabel")}
          </p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
            {t("campusTitle")}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {t("campusSubtitle")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PREVIEWS.map((p) => (
            <figure
              key={p.key}
              className={`group overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${p.wide ? "lg:col-span-2" : ""}`}
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={p.image}
                  alt={t(p.key)}
                  fill
                  sizes={
                    p.wide
                      ? "(max-width: 1024px) 100vw, 66vw"
                      : "(max-width: 1024px) 50vw, 33vw"
                  }
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: p.objectPosition }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#051a4a]/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
              <figcaption className="flex items-center gap-2.5 px-4 py-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#0b3fa8]/10 text-[#0b3fa8]">
                  <p.icon className="size-4" />
                </span>
                <span className="font-heading text-sm font-bold text-[#0a2f7a]">
                  {t(p.key)}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
