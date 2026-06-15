import { getTranslations } from "next-intl/server";

interface LegalSection {
  title: string;
  text: string;
}

export async function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  const t = await getTranslations("Pages");
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t("lastUpdated")}</p>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground">{t("legalIntro")}</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-heading text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-base leading-relaxed text-muted-foreground">{s.text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
