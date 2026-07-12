import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { BRAND } from "@/constants/navigation";
import { BrandImage } from "@/components/shared/brand-image";

export async function PublicFooter({ logoLight }: { logoLight?: string }) {
  const tm = await getTranslations("Marketing");
  const tn = await getTranslations("Nav");

  const cols = [
    {
      title: tm("footerColAcademics"),
      links: [
        { label: tm("footerPrograms"), href: "/courses" },
        { label: tm("footerFaculty"), href: "/instructors" },
        { label: tm("footerResearch"), href: "/blog" },
      ],
    },
    {
      title: tm("footerColAdmissions"),
      links: [
        { label: tm("footerAdmissions"), href: "/register" },
        { label: tm("footerStudentServices"), href: "/help" },
        { label: tm("footerCareerCenter"), href: "/careers" },
        { label: tm("footerCertVerify"), href: "/verify-certificate" },
      ],
    },
    {
      title: tm("footerColResources"),
      links: [
        { label: tm("footerResources"), href: "/help" },
        { label: tm("footerNews"), href: "/blog" },
        { label: tn("navContact"), href: "/contact" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border/70 bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr_1fr_1fr] lg:px-8">
        <div className="space-y-3">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandImage
              kind="footer"
              alt={BRAND.fullName}
              className="h-9 max-w-40 object-contain"
              fallback={
                logoLight ? (
                  <img src={logoLight} alt={BRAND.fullName} className="h-9 max-w-40 object-contain" />
                ) : (
                  <>
                    <span className="grid size-9 place-items-center rounded-xl bg-linear-to-br from-primary to-[oklch(0.62_0.19_286)] text-white">
                      <GraduationCap className="size-5" />
                    </span>
                    <span className="text-base font-semibold">{BRAND.fullName}</span>
                  </>
                )
              }
            />
          </Link>
          <p className="max-w-xs text-sm text-muted-foreground">
            {tm("footerTagline")}
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title} className="space-y-3">
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>© {BRAND.fullName}. {tm("footerRights")}</span>
          <nav aria-label="Legal" className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/policy/terms" className="transition-colors hover:text-foreground">{tm("footerTermsLink")}</Link>
            <Link href="/policy/enrollment" className="transition-colors hover:text-foreground">{tm("footerEnrollmentLink")}</Link>
            <Link href="/policy/refund" className="transition-colors hover:text-foreground">{tm("footerRefundLink")}</Link>
            <Link href="/policy/privacy" className="transition-colors hover:text-foreground">{tm("footerPrivacyLink")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
