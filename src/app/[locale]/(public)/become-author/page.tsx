import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Globe2,
  Layers,
  MessageCircle,
  Newspaper,
  PenTool,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import type { BlogTaxonomyCategory } from "@/lib/dal/blog";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbLd, localeUrl, staticPageMeta } from "@/lib/seo";
import {
  AuthorApplicationForm,
  type InterestGroup,
} from "@/features/marketing/components/author-application-form";

const PATH = "/become-author";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  return staticPageMeta({
    // The layout appends the brand, so the title must not repeat "IMETS" itself.
    title: ar ? "كن كاتبًا في الرعاية الصحية" : "Become a Healthcare Author",
    description: ar
      ? "لمهنيي الرعاية الصحية: انشر أدلة عملية مبنية على الأدلة في الجودة والاعتماد ومكافحة العدوى والإدارة — باسمك."
      : "Healthcare professionals: publish practical, evidence-based guides on quality, accreditation, infection control and management — under your name.",
    path: PATH,
    locale,
  });
}

/**
 * "Write for IMETS" — recruits healthcare professionals as blog authors.
 *
 * Every number on this page is live: the published-guide count, the sections and
 * the topics all come from the blog itself. Nothing here is a reader figure, a
 * payment promise or a named contributor, because none of those exist yet and a
 * recruiting page is the worst place to invent them — the people it persuades
 * are exactly the ones who would later find out.
 */
export default async function BecomeAuthorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);

  const [taxRes, postsRes] = await Promise.all([
    dal.blog.fetchPublicTaxonomy(),
    dal.blog.fetchPublicArticles({ limit: 200 }),
  ]);
  const posts = postsRes.ok ? postsRes.data.data : [];
  const taxonomy: BlogTaxonomyCategory[] = taxRes.ok ? taxRes.data : [];

  /*
   * Only sections that actually publish something. The taxonomy holds an empty
   * "Healthcare" category whose two subcategories duplicate another section —
   * one of them misspelled — and inviting authors to pick those would be the
   * first thing an applicant sees. If the article fetch failed we can't tell
   * which sections are live, so nothing is filtered rather than everything.
   */
  const publishedIn = new Set(posts.map((p) => (p.category ?? "").trim()).filter(Boolean));
  const sections = postsRes.ok ? taxonomy.filter((c) => publishedIn.has(c.name)) : taxonomy;

  const interests: InterestGroup[] = sections.map((c) => ({
    category: c.name,
    label: c.name,
    topics: (c.subcategories.length ? c.subcategories : [{ id: c.id, name: c.name, slug: c.slug }]).map(
      (s) => ({ value: s.name, label: s.name }),
    ),
  }));
  const topicCount = interests.reduce((n, g) => n + g.topics.length, 0);

  const stats = [
    { value: posts.length, label: tr("published guides", "دليل منشور"), icon: Newspaper },
    { value: sections.length, label: tr("blog sections", "أقسام"), icon: Layers },
    { value: topicCount, label: tr("topics to write on", "موضوع للكتابة"), icon: BookOpen },
  ].filter((s) => s.value > 0);

  const reasons = [
    {
      icon: PenTool,
      title: tr("Published under your name", "منشور باسمك"),
      body: tr(
        "Your articles carry your name and professional title, so the work builds your reputation — not just ours.",
        "تحمل مقالاتك اسمك ومسمّاك المهني، فيبني العمل سمعتك أنت لا سمعتنا فقط.",
      ),
    },
    {
      icon: Users,
      title: tr("Written for your peers", "مكتوب لزملائك"),
      body: tr(
        "We write for doctors, nurses, pharmacists and quality staff across Egypt and the Gulf facing challenges you've already worked through.",
        "نكتب للأطباء والممرضين والصيادلة وكوادر الجودة في مصر والخليج ممّن يواجهون تحديات سبق أن تعاملت معها.",
      ),
    },
    {
      icon: ShieldCheck,
      title: tr("An editor on your side", "محرّر إلى جانبك"),
      body: tr(
        "Every draft goes through editorial review for clarity, accuracy and structure. You bring the expertise; we help with the polish.",
        "تمرّ كل مسودة بمراجعة تحريرية للوضوح والدقة والبناء. أنت تقدّم الخبرة، ونحن نساعد في الصقل.",
      ),
    },
    {
      icon: Globe2,
      title: tr("Guides that stay useful", "أدلة تبقى مفيدة"),
      body: tr(
        "We publish in-depth guides meant to be found and referenced for years — not news that expires next week.",
        "ننشر أدلة معمّقة يُرجع إليها لسنوات — لا أخبارًا تنتهي صلاحيتها الأسبوع المقبل.",
      ),
    },
  ];

  const lookingFor = [
    tr(
      "Working healthcare professionals with hands-on experience in the topic you want to write about",
      "مهنيو رعاية صحية ممارسون لديهم خبرة عملية في الموضوع الذي يريدون الكتابة عنه",
    ),
    tr(
      "People who can explain a standard, a process or an exam clearly to a colleague",
      "من يستطيع شرح معيار أو إجراء أو امتحان بوضوح لزميل",
    ),
    tr(
      "An original perspective drawn from real practice in Egypt or the Gulf",
      "رؤية أصيلة مستمدة من ممارسة حقيقية في مصر أو الخليج",
    ),
    tr(
      "A commitment to accuracy — standards and sources, not opinion",
      "الالتزام بالدقة — المعايير والمصادر لا الآراء",
    ),
  ];

  const steps = [
    {
      title: tr("Apply", "قدّم"),
      body: tr("Tell us about your background and the topics you know best.", "حدّثنا عن خلفيتك والمواضيع التي تُتقنها."),
    },
    {
      title: tr("Agree a topic", "اتفقوا على موضوع"),
      body: tr(
        "Our editorial team reviews your application and contacts you on WhatsApp to agree your first article.",
        "يراجع فريقنا التحريري طلبك ويتواصل معك عبر واتساب للاتفاق على مقالك الأول.",
      ),
    },
    {
      title: tr("Write and publish", "اكتب وانشر"),
      body: tr(
        "You write, we edit with you, and the article is published under your name.",
        "تكتب، ونحرّر معك، ويُنشر المقال باسمك.",
      ),
    },
  ];

  const standards = [
    tr("Original — not published anywhere else", "أصيل — غير منشور في مكان آخر"),
    tr("Evidence-based, with sources cited", "مبني على الأدلة مع ذكر المصادر"),
    tr("Educational, not promotional", "تعليمي لا ترويجي"),
    tr("Accurate to current standards and exam blueprints", "دقيق وفق المعايير وخطط الامتحانات الحالية"),
  ];

  const previewSection = sections[0]?.name ?? tr("Healthcare Quality", "جودة الرعاية الصحية");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: tr("Home", "الرئيسية"), url: localeUrl("/", locale) },
            { name: tr("Blog", "المدونة"), url: localeUrl("/blog", locale) },
            { name: tr("Write for IMETS", "اكتب مع IMETS"), url: localeUrl(PATH, locale) },
          ]),
        ]}
      />

      {/* Hero — the ask above the fold, the form beside it. */}
      <section className="relative isolate overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/[0.07] via-background to-background">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 start-[-10%] -z-10 size-[34rem] rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-48 end-[-8%] -z-10 size-[30rem] rounded-full bg-sky-400/10 blur-3xl" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,theme(colors.slate.400/0.18)_1px,transparent_0)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]"
        />

        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div className="lg:sticky lg:top-24">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-primary ring-1 ring-primary/15">
                <Sparkles className="size-3.5" />
                {tr("Write for IMETS", "اكتب مع IMETS")}
              </span>
              <h1 className="mt-5 font-heading text-4xl font-bold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-[3.35rem]">
                {tr("Share what you know with the professionals ", "شارك خبرتك مع المهنيين ")}
                <span className="bg-gradient-to-r from-primary to-sky-500 bg-clip-text text-transparent">
                  {tr("who need it", "الذين يحتاجونها")}
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {tr(
                  "The IMETS blog publishes practical, evidence-based guides on quality, accreditation, infection control and healthcare management. If you do this work every day, we want to publish your perspective — under your name.",
                  "تنشر مدونة IMETS أدلة عملية مبنية على الأدلة في الجودة والاعتماد ومكافحة العدوى وإدارة الرعاية الصحية. إن كنت تمارس هذا العمل يوميًا، فنحن نريد أن ننشر رؤيتك — باسمك.",
                )}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20" asChild>
                  <a href="#apply">
                    {tr("Apply to write", "قدّم طلبك للكتابة")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#what-we-publish">{tr("See what we publish", "اطّلع على ما ننشره")}</a>
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                {tr(
                  "Takes about three minutes. No writing samples needed to apply.",
                  "يستغرق نحو ثلاث دقائق. لا تحتاج نماذج كتابة للتقديم.",
                )}
              </p>

              {stats.length > 0 && (
                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-2xl border border-border/60 bg-card/70 p-4 backdrop-blur">
                      <s.icon className="size-4 text-primary" />
                      <dd className="mt-2 font-heading text-2xl font-bold tabular-nums">{s.value}</dd>
                      <dt className="text-xs leading-snug text-muted-foreground">{s.label}</dt>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            <AuthorApplicationForm locale={locale} interests={interests} />
          </div>
        </div>
      </section>

      {/* Why write with us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{tr("Why write with us", "لماذا تكتب معنا")}</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {tr("Your expertise, given the reach it deserves", "خبرتك، بالوصول الذي تستحقه")}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r) => (
            <article
              key={r.title}
              className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              <div aria-hidden="true" className="absolute -end-10 -top-10 size-28 rounded-full bg-primary/5 transition-transform group-hover:scale-125" />
              <span className="relative grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary to-sky-500 text-white shadow-md shadow-primary/20">
                <r.icon className="size-5" />
              </span>
              <h3 className="relative mt-5 font-heading text-base font-bold leading-snug">{r.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Byline preview — clearly an illustration, not a contributor. */}
      <section className="border-y border-border/60 bg-slate-50/80 dark:bg-muted/20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {tr("This is where your name goes", "هنا يُكتب اسمك")}
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
              {tr(
                "Healthcare content is judged by who wrote it. A named, credentialed author is what makes a guide trustworthy to the professional reading it — and it's what we want every article on the IMETS blog to have.",
                "يُقيَّم المحتوى الصحي بمن كتبه. الكاتب المعروف بمؤهلاته هو ما يجعل الدليل موثوقًا للمهني الذي يقرؤه — وهذا ما نريده لكل مقال في مدونة IMETS.",
              )}
            </p>
            <ul className="mt-6 space-y-3">
              {standards.map((s) => (
                <li key={s} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-sky-400/10 to-transparent blur-2xl" />
            <div className="rotate-[-1.5deg] rounded-3xl border border-border/70 bg-card p-6 shadow-2xl transition-transform hover:rotate-0">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                  {previewSection}
                </span>
                <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {tr("Preview", "معاينة")}
                </span>
              </div>
              <div className="mt-5 space-y-2" aria-hidden="true">
                <div className="h-4 w-11/12 rounded-full bg-foreground/80" />
                <div className="h-4 w-3/4 rounded-full bg-foreground/80" />
              </div>
              <div className="mt-5 space-y-1.5" aria-hidden="true">
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="h-2 w-2/3 rounded-full bg-muted" />
              </div>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-sm font-bold text-white ring-4 ring-primary/10">
                  {tr("You", "أنت")}
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-sm font-bold">{tr("Your name", "اسمك")}</p>
                  <p className="text-xs text-muted-foreground">{tr("Your professional title", "مسمّاك المهني")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we publish — the live taxonomy, same data the form offers. */}
      {sections.length > 0 && (
        <section id="what-we-publish" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{tr("What we publish", "ما الذي ننشره")}</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {tr("Pick the areas you know best", "اختر المجالات التي تُتقنها")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {tr(
                "These are the sections of the IMETS blog. Choose the topics that match your experience in the form.",
                "هذه أقسام مدونة IMETS. اختر في النموذج المواضيع التي تتوافق مع خبرتك.",
              )}
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((c) => (
              <article
                key={c.id}
                className="flex flex-col rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all hover:border-primary/25 hover:shadow-lg"
              >
                <h3 className="font-heading text-lg font-bold">{c.name}</h3>
                {c.description && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.description}</p>}
                {c.subcategories.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {c.subcategories.map((s) => (
                      <li key={s.id} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/80">
                        {s.name}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Who we're looking for + how it works */}
      <section className="border-y border-border/60 bg-slate-50/80 dark:bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              {tr("Who we're looking for", "من نبحث عنه")}
            </h2>
            <ul className="mt-7 space-y-4">
              {lookingFor.map((l) => (
                <li key={l} className="flex items-start gap-3 text-sm leading-relaxed">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="size-4" />
                  </span>
                  {l}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-3xl font-bold tracking-tight">{tr("How it works", "كيف تسير العملية")}</h2>
            <ol className="relative mt-7 space-y-6 border-s-2 border-dashed border-primary/25 ps-8">
              {steps.map((s, i) => (
                <li key={s.title} className="relative">
                  <span className="absolute -start-[2.65rem] grid size-9 place-items-center rounded-full bg-primary font-heading text-sm font-bold tabular-nums text-primary-foreground shadow-md shadow-primary/25 ring-4 ring-background">
                    {i + 1}
                  </span>
                  <p className="font-heading text-base font-bold">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-xs text-muted-foreground ring-1 ring-border/60">
              <MessageCircle className="size-4 shrink-0 text-emerald-600" />
              {tr(
                "That's why we ask for your WhatsApp number — it's where the conversation happens.",
                "لهذا نطلب رقم واتساب — فهناك يجري التواصل.",
              )}
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="marketing-gradient-bg relative overflow-hidden rounded-[2rem] px-6 py-16 text-center shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 start-1/4 size-72 rounded-full bg-white/10 blur-3xl" />
          <PenTool className="relative mx-auto size-10 text-white/80" />
          <p className="relative mx-auto mt-5 max-w-2xl font-heading text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl">
            {tr("Your experience is someone else's next step", "خبرتك هي الخطوة التالية لزميل آخر")}
          </p>
          <p className="relative mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/75">
            {tr(
              "Apply in a few minutes — our editorial team will be in touch.",
              "قدّم في دقائق — وسيتواصل معك فريقنا التحريري.",
            )}
          </p>
          <Button size="lg" variant="secondary" className="relative mt-8 gap-2" asChild>
            <a href="#apply">
              {tr("Apply to write", "قدّم طلبك للكتابة")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </a>
          </Button>
        </div>
      </section>
    </>
  );
}
