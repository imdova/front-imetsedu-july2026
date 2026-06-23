import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import {
  ArrowRight, GraduationCap, Sparkles, CheckCircle2, Award, Users, Star, Clock,
  PlayCircle, BookOpen, ShieldCheck, Stethoscope, Quote,
} from "lucide-react";

import { resolveSeoMetadata } from "@/lib/public-seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseApplyForm } from "@/features/marketing/components/course-apply-form";

const PATH = "/lp/free-courses";
const COURSE = "Free Healthcare Courses";

const STAT_ICONS = [Users, GraduationCap, Award, Star];
const STEP_ICONS = [Users, BookOpen, Award];

type Copy = {
  badge: string; h1a: string; h1b: string; sub: string; ctaApply: string; ctaBrowse: string;
  facts: string[]; formEyebrow: string;
  stats: { value: string; label: string }[];
  coursesTitle: string; coursesSub: string; courses: { title: string; tag: string; desc: string }[];
  howTitle: string; steps: { title: string; body: string }[];
  whyTitle: string; why: { title: string; body: string }[];
  testimonialsTitle: string; testimonials: { quote: string; name: string; role: string }[];
  faqTitle: string; faqs: { q: string; a: string }[];
  applyTitle: string; applySub: string; applyBullets: string[]; sticky: string;
};

const EN: Copy = {
  badge: "For nurses, doctors, pharmacists & allied health",
  h1a: "Start learning for free —", h1b: "no payment, real certificates.",
  sub: "Get instant access to free healthcare courses: exam foundations, medical English, CV & interview skills and more. Finish a course, earn a certificate, and see where a full program could take you.",
  ctaApply: "Get free access", ctaBrowse: "Browse the courses",
  facts: ["100% free", "Certificate of completion", "Self-paced", "Mentor Q&A"],
  formEyebrow: "Create your free account",
  stats: [
    { value: "12,000+", label: "Learners enrolled" }, { value: "20+", label: "Free courses" },
    { value: "Free", label: "Certificate included" }, { value: "4.9/5", label: "Average rating" },
  ],
  coursesTitle: "Free courses you can start today",
  coursesSub: "Short, practical and built for working healthcare professionals.",
  courses: [
    { title: "Gulf Licensing Exams 101", tag: "2 hrs", desc: "How SCFHS, DHA, DOH, MOH & QCHP work and how to prepare." },
    { title: "Medical English for the Gulf", tag: "3 hrs", desc: "The clinical English you need for exams, interviews and the ward." },
    { title: "Build a Healthcare CV", tag: "1.5 hrs", desc: "A recruiter-ready CV template plus before/after examples." },
    { title: "Ace the Interview", tag: "2 hrs", desc: "Clinical scenarios, common questions and OSCE-style practice." },
    { title: "Infection Control Basics", tag: "1 hr", desc: "Core IPC principles every Gulf hospital expects you to know." },
    { title: "Patient Safety Essentials", tag: "1 hr", desc: "Foundations of safe, quality care — with a completion certificate." },
  ],
  howTitle: "How it works",
  steps: [
    { title: "Create a free account", body: "Sign up in 60 seconds — no card, no commitment." },
    { title: "Learn at your pace", body: "Watch lessons, take quizzes and ask mentors questions." },
    { title: "Earn your certificate", body: "Finish a course and download a shareable certificate." },
  ],
  whyTitle: "Why learners start here",
  why: [
    { title: "Truly free", body: "Full courses with no hidden fees — start and finish at no cost." },
    { title: "Built for the Gulf", body: "Content by clinicians who passed these exams and work in KSA, UAE & Qatar." },
    { title: "Real certificates", body: "Earn a certificate of completion you can add to your CV and LinkedIn." },
    { title: "A clear next step", body: "Ready for more? Roll your progress into a full licensing & placement program." },
  ],
  testimonialsTitle: "Loved by healthcare professionals",
  testimonials: [
    { quote: "I started with the free licensing course just to test it — it was so good I enrolled in the full program a week later.", name: "Mariam A.", role: "Staff Nurse" },
    { quote: "The medical English course alone made my interviews so much easier. And it cost me nothing.", name: "Dr. Omar K.", role: "GP" },
    { quote: "Finally a free CV course that's actually for healthcare. Recruiters started replying.", name: "Hala S.", role: "Pharmacist" },
  ],
  faqTitle: "Questions, answered",
  faqs: [
    { q: "Are the courses really free?", a: "Yes — these courses are completely free to start and finish, including the certificate of completion. No card required." },
    { q: "Do I get a certificate?", a: "Yes. Complete a course and you can download a shareable certificate of completion for your CV and LinkedIn." },
    { q: "Who are the courses for?", a: "Nurses, doctors, pharmacists, dentists and allied health professionals — especially those planning to work in the Gulf." },
    { q: "What happens after the free courses?", a: "If you want full exam prep, DataFlow help and job placement, an advisor can roll your progress into our complete licensing program — entirely your choice." },
  ],
  applyTitle: "Create your free account",
  applySub: "Sign up in 60 seconds and get instant access to the free courses. An advisor can also recommend the best track for your goals — free, no obligation.",
  applyBullets: ["Instant access to 20+ free courses", "Certificate of completion included", "Optional advisor call — no pressure"],
  sticky: "Get free access",
};

const AR: Copy = {
  badge: "للممرضين والأطباء والصيادلة والمهن الصحية",
  h1a: "ابدأ التعلّم مجانًا —", h1b: "دون دفع، وبشهادات حقيقية.",
  sub: "احصل على وصول فوري لدورات صحية مجانية: أساسيات الامتحانات، الإنجليزية الطبية، مهارات السيرة الذاتية والمقابلات وأكثر. أكمل دورة، واحصل على شهادة، واكتشف إلى أين يمكن أن يأخذك البرنامج الكامل.",
  ctaApply: "احصل على وصول مجاني", ctaBrowse: "تصفّح الدورات",
  facts: ["مجاني 100%", "شهادة إتمام", "بوتيرتك الخاصة", "أسئلة وأجوبة مع مرشد"],
  formEyebrow: "أنشئ حسابك المجاني",
  stats: [
    { value: "+12,000", label: "متعلّم مسجّل" }, { value: "+20", label: "دورة مجانية" },
    { value: "مجانًا", label: "شهادة مضمّنة" }, { value: "4.9/5", label: "متوسط التقييم" },
  ],
  coursesTitle: "دورات مجانية يمكنك بدؤها اليوم",
  coursesSub: "قصيرة وعملية ومصمّمة للمهنيين الصحيين العاملين.",
  courses: [
    { title: "امتحانات الترخيص الخليجية 101", tag: "ساعتان", desc: "كيف تعمل امتحانات SCFHS وDHA وDOH وMOH وQCHP وكيف تستعد لها." },
    { title: "الإنجليزية الطبية للخليج", tag: "3 ساعات", desc: "الإنجليزية السريرية التي تحتاجها للامتحانات والمقابلات والعمل." },
    { title: "بناء سيرة ذاتية صحية", tag: "1.5 ساعة", desc: "قالب سيرة ذاتية جاهز للتوظيف مع أمثلة قبل/بعد." },
    { title: "تألّق في المقابلة", tag: "ساعتان", desc: "سيناريوهات سريرية وأسئلة شائعة وتدريب بأسلوب OSCE." },
    { title: "أساسيات مكافحة العدوى", tag: "ساعة", desc: "مبادئ IPC الأساسية التي تتوقعها كل مستشفيات الخليج." },
    { title: "أساسيات سلامة المرضى", tag: "ساعة", desc: "أسس الرعاية الآمنة عالية الجودة — مع شهادة إتمام." },
  ],
  howTitle: "كيف تعمل",
  steps: [
    { title: "أنشئ حسابًا مجانيًا", body: "سجّل في 60 ثانية — دون بطاقة ودون التزام." },
    { title: "تعلّم بوتيرتك", body: "شاهد الدروس وحلّ الاختبارات واسأل المرشدين." },
    { title: "احصل على شهادتك", body: "أكمل الدورة ونزّل شهادة قابلة للمشاركة." },
  ],
  whyTitle: "لماذا يبدأ المتعلّمون من هنا",
  why: [
    { title: "مجاني فعلاً", body: "دورات كاملة دون رسوم خفية — ابدأ وأكمل دون تكلفة." },
    { title: "مصمَّم للخليج", body: "محتوى من أطباء اجتازوا هذه الامتحانات ويعملون في السعودية والإمارات وقطر." },
    { title: "شهادات حقيقية", body: "احصل على شهادة إتمام تضيفها لسيرتك الذاتية وLinkedIn." },
    { title: "خطوة تالية واضحة", body: "جاهز للمزيد؟ حوّل تقدّمك إلى برنامج ترخيص وتوظيف كامل." },
  ],
  testimonialsTitle: "محبوب من المتخصصين الصحيين",
  testimonials: [
    { quote: "بدأت بالدورة المجانية للترخيص لمجرد التجربة — كانت رائعة فالتحقت بالبرنامج الكامل بعد أسبوع.", name: "مريم أ.", role: "ممرضة" },
    { quote: "دورة الإنجليزية الطبية وحدها سهّلت مقابلاتي كثيرًا. ولم تكلّفني شيئًا.", name: "د. عمر ك.", role: "طبيب عام" },
    { quote: "أخيرًا دورة سيرة ذاتية مجانية مخصّصة للقطاع الصحي. بدأ المسؤولون بالرد.", name: "هالة س.", role: "صيدلانية" },
  ],
  faqTitle: "إجابات لكل ما تسأل",
  faqs: [
    { q: "هل الدورات مجانية فعلاً؟", a: "نعم — هذه الدورات مجانية تمامًا للبدء والإكمال، بما في ذلك شهادة الإتمام. دون بطاقة." },
    { q: "هل أحصل على شهادة؟", a: "نعم. أكمل الدورة وبإمكانك تنزيل شهادة إتمام قابلة للمشاركة لسيرتك الذاتية وLinkedIn." },
    { q: "لمن هذه الدورات؟", a: "للممرضين والأطباء والصيادلة وأطباء الأسنان والمهن الصحية — خاصة من يخطط للعمل في الخليج." },
    { q: "ماذا بعد الدورات المجانية؟", a: "إن أردت التحضير الكامل للامتحان ومساعدة DataFlow والتوظيف، يمكن للمستشار تحويل تقدّمك إلى برنامج الترخيص الكامل — بمحض اختيارك." },
  ],
  applyTitle: "أنشئ حسابك المجاني",
  applySub: "سجّل في 60 ثانية واحصل على وصول فوري للدورات المجانية. يمكن للمستشار أيضًا أن يوصي بأفضل مسار لأهدافك — مجانًا ودون التزام.",
  applyBullets: ["وصول فوري لأكثر من 20 دورة مجانية", "شهادة إتمام مضمّنة", "مكالمة استشارية اختيارية — دون ضغط"],
  sticky: "احصل على وصول مجاني",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const ar = locale === "ar";
  const admin = await resolveSeoMetadata(PATH).catch(() => ({} as Metadata));
  return {
    ...admin,
    title: ar ? "دورات صحية مجانية بشهادات | IMETS" : "Free Healthcare Courses with Certificates | IMETS",
    description: ar
      ? "دورات صحية مجانية للممرضين والأطباء والصيادلة: أساسيات الامتحانات، الإنجليزية الطبية، السيرة الذاتية والمقابلات — مع شهادة إتمام. سجّل مجانًا."
      : "Free healthcare courses for nurses, doctors and pharmacists: exam foundations, medical English, CV & interviews — with a completion certificate. Sign up free.",
  };
}

export default async function FreeCoursesLandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const c = locale === "ar" ? AR : EN;
  const trackPath = locale === "ar" ? "/ar/lp/free-courses" : PATH;
  const lang = locale === "ar" ? "ar" : "en";

  const itemListLd = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: COURSE,
    itemListElement: c.courses.map((co, i) => ({
      "@type": "ListItem", position: i + 1,
      item: { "@type": "Course", name: co.title, description: co.desc, provider: { "@type": "Organization", name: "IMETS" } },
    })),
  };
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="pb-24 lg:pb-0">
      <JsonLd data={[itemListLd, faqLd]} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-20 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Stethoscope className="size-3.5" /> {c.badge}
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {c.h1a} <span className="text-primary">{c.h1b}</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground">{c.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-1.5"><a href="#apply">{c.ctaApply} <ArrowRight className="size-4 rtl:rotate-180" /></a></Button>
              <Button asChild size="lg" variant="outline"><a href="#courses">{c.ctaBrowse}</a></Button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {c.facts.map((f) => <li key={f} className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-4 text-success" /> {f}</li>)}
            </ul>
          </div>
          <div className="lg:ps-4">
            <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"><Sparkles className="size-4" /> {c.formEyebrow}</p>
            <CourseApplyForm path={trackPath} courseName={COURSE} lang={lang} />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border/60 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {c.stats.map((s, i) => {
            const Icon = STAT_ICONS[i];
            return (
              <div key={s.label} className="text-center">
                <Icon className="mx-auto mb-2 size-6 opacity-90" />
                <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="text-sm opacity-90">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Free courses */}
      <section id="courses" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{c.coursesTitle}</h2>
          <p className="mt-3 text-muted-foreground">{c.coursesSub}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.courses.map((co) => (
            <Card key={co.title} className="h-full">
              <CardContent className="space-y-3 py-6">
                <div className="flex items-center justify-between">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><PlayCircle className="size-5" /></div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"><Clock className="size-3" /> {co.tag}</span>
                </div>
                <h3 className="font-semibold">{co.title}</h3>
                <p className="text-sm text-muted-foreground">{co.desc}</p>
                <a href="#apply" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">{c.ctaApply} <ArrowRight className="size-3.5 rtl:rotate-180" /></a>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{c.howTitle}</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {c.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div key={s.title} className="rounded-xl border border-border/70 bg-card p-5 text-center">
                  <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Icon className="size-6" /></div>
                  <h3 className="mt-3 font-semibold">{i + 1}. {s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mx-auto mb-10 max-w-2xl text-center text-3xl font-bold tracking-tight">{c.whyTitle}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {c.why.map((w, i) => {
            const Icon = [ShieldCheck, GraduationCap, Award, ArrowRight][i];
            return (
              <div key={w.title} className="space-y-2">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
                <h3 className="font-semibold">{w.title}</h3>
                <p className="text-sm text-muted-foreground">{w.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">{c.testimonialsTitle}</h2>
          <div className="grid gap-5 lg:grid-cols-3">
            {c.testimonials.map((t) => (
              <Card key={t.name} className="h-full">
                <CardContent className="flex h-full flex-col gap-4 py-6">
                  <Quote className="size-6 text-primary/40" />
                  <p className="flex-1 text-sm leading-relaxed text-foreground/90">{t.quote}</p>
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10 font-semibold text-primary">{t.name.charAt(0)}</span>
                    <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.role}</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">{c.faqTitle}</h2>
        <div className="space-y-3">
          {c.faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border/70 bg-card px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {f.q}
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Apply */}
      <section id="apply" className="border-t border-border/60 bg-gradient-to-b from-background to-primary/5">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">{c.applyTitle}</h2>
            <p className="text-muted-foreground">{c.applySub}</p>
            <ul className="space-y-2 text-sm">
              {c.applyBullets.map((b) => <li key={b} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4 text-success" /> {b}</li>)}
            </ul>
          </div>
          <CourseApplyForm path={trackPath} courseName={COURSE} lang={lang} />
        </div>
      </section>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 p-3 backdrop-blur lg:hidden">
        <Button asChild size="lg" className="w-full gap-1.5"><a href="#apply">{c.sticky} <ArrowRight className="size-4 rtl:rotate-180" /></a></Button>
      </div>
    </div>
  );
}
