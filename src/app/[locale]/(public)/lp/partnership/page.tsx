import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  Handshake,
  Globe2,
  CheckCircle2,
  GraduationCap,
  Building2,
  Award,
  Users,
  BookOpen,
  Microscope,
  Sparkles,
  ShieldCheck,
  Layers,
} from "lucide-react";

import { resolveSeoMetadata } from "@/lib/public-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PartnershipForm } from "@/features/marketing/components/partnership-form";

const PATH = "/lp/partnership";

const MODEL_ICONS = [GraduationCap, Award, Users, BookOpen, Building2, Microscope];
const WHY_ICONS = [Globe2, ShieldCheck, Layers, Users];

type Copy = {
  badge: string;
  h1a: string;
  h1b: string;
  sub: string;
  ctaPartner: string;
  ctaModels: string;
  facts: string[];
  formEyebrow: string;
  whyTitle: string;
  whySub: string;
  why: { title: string; body: string }[];
  modelsTitle: string;
  modelsSub: string;
  models: { title: string; body: string }[];
  audienceTitle: string;
  audience: string[];
  stepsTitle: string;
  steps: { title: string; body: string }[];
  ctaBandTitle: string;
  ctaBandSub: string;
  applyTitle: string;
  applySub: string;
  applyBullets: string[];
};

const EN: Copy = {
  badge: "IMETS Global Partnerships",
  h1a: "Partner with IMETS Medical School —",
  h1b: "grow healthcare talent together.",
  sub: "We work with hospitals, universities, training institutes, ministries and employers across the world to deliver accredited healthcare training, co-branded programs, and workforce development at scale.",
  ctaPartner: "Start a partnership",
  ctaModels: "See partnership models",
  facts: ["Worldwide", "Hospitals & universities", "Accredited training", "Bilingual (AR + EN)"],
  formEyebrow: "Tell us about your organization",
  whyTitle: "Why organizations partner with IMETS",
  whySub: "A proven healthcare-education partner built for scale and quality.",
  why: [
    { title: "Global reach, local delivery", body: "Programs delivered online and on-site across the Gulf, Egypt, Africa and beyond — in Arabic and English." },
    { title: "Quality you can stand behind", body: "Curricula built on international healthcare standards and taught by practicing clinicians and consultants." },
    { title: "Flexible partnership models", body: "From co-branded diplomas to licensing our content — we shape the model around your goals." },
    { title: "Real workforce outcomes", body: "Training tied to career progression, accreditation readiness and measurable skill gains for your people." },
  ],
  modelsTitle: "Ways we can partner",
  modelsSub: "Pick one, or combine several — every partnership is designed around your needs.",
  models: [
    { title: "Accredited training delivery", body: "Bring IMETS diplomas and certification prep to your staff or students, delivered live online or on-site." },
    { title: "Co-branded programs", body: "Design and launch jointly branded programs that carry both institutions' names." },
    { title: "Student placement & internships", body: "Connect your learners to clinical placements, internships and career pathways." },
    { title: "Faculty & instructor exchange", body: "Share expert instructors and guest faculty across institutions." },
    { title: "Corporate & staff upskilling", body: "Upskill an entire department or workforce with tailored cohorts and reporting." },
    { title: "Content licensing & research", body: "License IMETS course content, or collaborate on healthcare-education research." },
  ],
  audienceTitle: "Who we partner with",
  audience: [
    "Hospitals & health systems",
    "Universities & colleges",
    "Training institutes & academies",
    "Ministries & regulators",
    "Clinics & medical groups",
    "Employers & corporates",
  ],
  stepsTitle: "How a partnership starts",
  steps: [
    { title: "Share your goals", body: "Send us a short partnership request with your organization and objectives." },
    { title: "Discovery call", body: "A partnerships advisor explores fit and the right model with you." },
    { title: "Proposal & agreement", body: "We shape a tailored proposal, scope and agreement together." },
    { title: "Launch & scale", body: "We deliver, measure outcomes, and grow the partnership over time." },
  ],
  ctaBandTitle: "Building healthcare talent — together",
  ctaBandSub: "Join the hospitals and institutions already partnering with IMETS Medical School.",
  applyTitle: "Start a partnership",
  applySub: "Send us your details and a partnerships advisor will reach out within two business days to explore how we can work together — no obligation.",
  applyBullets: [
    "A partnership model shaped around your goals",
    "Accredited, bilingual healthcare training",
    "A dedicated partnerships advisor",
  ],
};

const AR: Copy = {
  badge: "شراكات IMETS العالمية",
  h1a: "اشترك مع مدرسة IMETS الطبية —",
  h1b: "لنطوّر كوادر الرعاية الصحية معًا.",
  sub: "نعمل مع المستشفيات والجامعات ومعاهد التدريب والوزارات وجهات التوظيف حول العالم لتقديم تدريب صحي معتمد، وبرامج مشتركة العلامة، وتطوير للكوادر على نطاق واسع.",
  ctaPartner: "ابدأ شراكة",
  ctaModels: "شاهد نماذج الشراكة",
  facts: ["حول العالم", "مستشفيات وجامعات", "تدريب معتمد", "عربي + إنجليزي"],
  formEyebrow: "أخبرنا عن مؤسستك",
  whyTitle: "لماذا تختار المؤسسات الشراكة مع IMETS",
  whySub: "شريك موثوق في التعليم الصحي، مبني للاتساع والجودة.",
  why: [
    { title: "انتشار عالمي وتقديم محلي", body: "برامج تُقدَّم أونلاين وحضوريًا عبر الخليج ومصر وإفريقيا وغيرها — بالعربية والإنجليزية." },
    { title: "جودة تثق بها", body: "مناهج مبنية على معايير الرعاية الصحية الدولية ويقدّمها إكلينيكيون واستشاريون ممارسون." },
    { title: "نماذج شراكة مرنة", body: "من الدبلومات مشتركة العلامة إلى ترخيص المحتوى — نصمّم النموذج حول أهدافك." },
    { title: "نتائج حقيقية للكوادر", body: "تدريب مرتبط بالتطور المهني والجاهزية للاعتماد ومكاسب مهارية قابلة للقياس." },
  ],
  modelsTitle: "طرق الشراكة معنا",
  modelsSub: "اختر واحدة أو اجمع بينها — كل شراكة مصمّمة حول احتياجك.",
  models: [
    { title: "تقديم تدريب معتمد", body: "قدّم دبلومات IMETS والتحضير للشهادات لكوادرك أو طلابك، مباشرةً أونلاين أو حضوريًا." },
    { title: "برامج مشتركة العلامة", body: "صمّم وأطلق برامج تحمل اسم المؤسستين معًا." },
    { title: "تنسيب الطلاب والتدريب العملي", body: "اربط متعلّميك بالتدريب العملي والتنسيب والمسارات المهنية." },
    { title: "تبادل هيئة التدريس والمدرّبين", body: "تبادل المدرّبين الخبراء وأعضاء هيئة التدريس الزائرين بين المؤسسات." },
    { title: "تأهيل الكوادر والشركات", body: "طوّر قسمًا كاملًا أو قوة عاملة بدفعات مخصّصة وتقارير أداء." },
    { title: "ترخيص المحتوى والبحث", body: "رخّص محتوى دورات IMETS أو تعاون في أبحاث التعليم الصحي." },
  ],
  audienceTitle: "من نشارك",
  audience: [
    "المستشفيات والأنظمة الصحية",
    "الجامعات والكليات",
    "معاهد وأكاديميات التدريب",
    "الوزارات والجهات التنظيمية",
    "العيادات والمجموعات الطبية",
    "جهات التوظيف والشركات",
  ],
  stepsTitle: "كيف تبدأ الشراكة",
  steps: [
    { title: "شاركنا أهدافك", body: "أرسل طلب شراكة موجزًا يتضمّن مؤسستك وأهدافك." },
    { title: "مكالمة تعارف", body: "يستكشف مستشار الشراكات التوافق والنموذج المناسب معك." },
    { title: "مقترح واتفاق", body: "نصوغ معًا مقترحًا ونطاقًا واتفاقًا مخصّصًا." },
    { title: "الإطلاق والتوسّع", body: "نقدّم البرامج ونقيس النتائج وننمّي الشراكة بمرور الوقت." },
  ],
  ctaBandTitle: "نبني كوادر الرعاية الصحية — معًا",
  ctaBandSub: "انضم إلى المستشفيات والمؤسسات التي تشارك بالفعل مدرسة IMETS الطبية.",
  applyTitle: "ابدأ شراكة",
  applySub: "أرسل بياناتك وسيتواصل معك مستشار الشراكات خلال يومَي عمل لاستكشاف كيف نعمل معًا — دون التزام.",
  applyBullets: [
    "نموذج شراكة مصمّم حول أهدافك",
    "تدريب صحي معتمد بالعربية والإنجليزية",
    "مستشار شراكات مخصّص",
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  const admin = await resolveSeoMetadata(PATH).catch(() => ({}) as Metadata);
  return {
    ...admin,
    title: ar
      ? "شراكة مع IMETS Medical School — للمستشفيات والمؤسسات التعليمية | IMETS"
      : "Partner with IMETS Medical School — Hospitals & Educational Institutions | IMETS",
    description: ar
      ? "اشترك مع مدرسة IMETS الطبية: تدريب صحي معتمد، وبرامج مشتركة، وتطوير للكوادر للمستشفيات والجامعات ومعاهد التدريب حول العالم. ابدأ شراكة."
      : "Partner with IMETS Medical School: accredited healthcare training, co-branded programs and workforce development for hospitals, universities and training institutes worldwide. Start a partnership.",
  };
}

export default async function PartnershipLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const c = ar ? AR : EN;
  const trackPath = ar ? "/ar/lp/partnership" : PATH;
  const lang = ar ? "ar" : "en";

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "IMETS Medical School",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://imetsedu.com",
    description:
      "IMETS Medical School partners with hospitals, universities and training institutes worldwide to deliver accredited healthcare training and workforce development.",
  };

  return (
    <div className="pb-24 lg:pb-0" dir={ar ? "rtl" : "ltr"}>
      <JsonLd data={[orgLd]} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Handshake className="size-3.5" /> {c.badge}
            </span>
            <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {c.h1a} <span className="text-primary">{c.h1b}</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{c.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-1.5">
                <a href="#partner">
                  {c.ctaPartner} <ArrowRight className="size-4 rtl:rotate-180" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#models">{c.ctaModels}</a>
              </Button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {c.facts.map((f) => (
                <li key={f} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-success" /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:ps-4">
            <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" /> {c.formEyebrow}
            </p>
            <PartnershipForm path={trackPath} lang={lang} />
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="font-heading text-3xl font-bold tracking-tight">
            {c.whyTitle}
          </h2>
          <p className="mt-3 text-muted-foreground">{c.whySub}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.why.map((w, i) => {
            const Icon = WHY_ICONS[i] ?? CheckCircle2;
            return (
              <Card key={w.title} className="h-full">
                <CardContent className="space-y-2 py-6">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="font-semibold">{w.title}</h3>
                  <p className="text-sm text-muted-foreground">{w.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Partnership models */}
      <section
        id="models"
        className="scroll-mt-20 border-y border-border/60 bg-muted/30"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              {c.modelsTitle}
            </h2>
            <p className="mt-3 text-muted-foreground">{c.modelsSub}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {c.models.map((m, i) => {
              const Icon = MODEL_ICONS[i] ?? CheckCircle2;
              return (
                <Card key={m.title} className="h-full">
                  <CardContent className="space-y-2 py-6">
                    <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-semibold">{m.title}</h3>
                    <p className="text-sm text-muted-foreground">{m.body}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who we partner with */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-heading text-3xl font-bold tracking-tight">
          {c.audienceTitle}
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.audience.map((a) => (
            <li
              key={a}
              className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Building2 className="size-4" />
              </span>
              <span className="text-sm font-medium">{a}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center font-heading text-3xl font-bold tracking-tight">
            {c.stepsTitle}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {c.steps.map((s, i) => (
              <div
                key={s.title}
                className="rounded-xl border border-border/70 bg-card p-5"
              >
                <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="border-b border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {c.ctaBandTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl opacity-90">{c.ctaBandSub}</p>
          <Button asChild size="lg" variant="secondary" className="mt-6 gap-1.5">
            <a href="#partner">
              {c.ctaPartner} <ArrowRight className="size-4 rtl:rotate-180" />
            </a>
          </Button>
        </div>
      </section>

      {/* Apply */}
      <section
        id="partner"
        className="scroll-mt-20 bg-gradient-to-b from-background to-primary/5"
      >
        <div className="mx-auto grid max-w-5xl items-start gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-4 lg:pt-4">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              {c.applyTitle}
            </h2>
            <p className="text-muted-foreground">{c.applySub}</p>
            <ul className="space-y-2 text-sm">
              {c.applyBullets.map((b) => (
                <li key={b} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-success" /> {b}
                </li>
              ))}
            </ul>
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Handshake className="size-4" /> {c.badge}
            </p>
          </div>
          <PartnershipForm path={trackPath} lang={lang} />
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border/70 bg-background/95 p-3 backdrop-blur lg:hidden">
        <Button asChild size="lg" className="w-full gap-1.5">
          <a href="#partner">
            {c.ctaPartner} <ArrowRight className="size-4 rtl:rotate-180" />
          </a>
        </Button>
      </div>
    </div>
  );
}
