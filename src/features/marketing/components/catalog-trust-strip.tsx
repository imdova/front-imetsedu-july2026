import { getTranslations } from "next-intl/server";

const STATS = [
  { value: "18,000+", labelKey: "catalogTrustPros" },
  { value: "15+", labelKey: "catalogTrustCountries" },
  { value: "92%", labelKey: "catalogTrustPass" },
  { value: "38+", labelKey: "catalogTrustExperts" },
] as const;

export async function CatalogTrustStrip() {
  const t = await getTranslations("Marketing");

  return (
    <section
      aria-label={t("catalogTrustLabel")}
      className="mb-10 grid grid-cols-2 gap-3 rounded-2xl border border-blue-100 bg-gradient-to-b from-blue-50/80 to-white p-4 sm:grid-cols-4 sm:gap-4 sm:p-5"
    >
      {STATS.map((stat) => (
        <div key={stat.labelKey} className="text-center sm:px-2">
          <p className="font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">
            {stat.value}
          </p>
          <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
            {t(stat.labelKey)}
          </p>
        </div>
      ))}
    </section>
  );
}
