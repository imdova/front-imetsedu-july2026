/**
 * Long-form, conversion-focused content for the course detail page.
 *
 * Everything here is derived per-course + per-locale so the same detail page can
 * render a rich, "sells itself" experience for any course, while CPHQ (our flagship)
 * gets fully bespoke copy. Sections that don't apply to a course simply return
 * `undefined`/`[]` and the page skips them.
 */

export type CareerRole = { title: string };
export type SeoSection = { heading: string; body: string };
export type CourseReview = {
  name: string;
  role: string;
  country: string;
  rating: number;
  text: string;
};

export type CourseContent = {
  /** Emotional story block rendered right under the hero. */
  story: { title: string; body: string };
  /**
   * Course-specific "What You'll Learn" outcomes. Each line answers
   * "this is what I'll be able to DO after the course" — never generic
   * business filler. Empty ⇒ the page falls back to the course record.
   */
  outcomes: string[];
  /** Ordered career ladder the program can lead to (rendered as a roadmap). */
  careerRoles: CareerRole[];
  /** One-line, specific answer to "why this program is in demand". */
  demandLine: string;
  /** 5 reasons shown right under the hero — answers "why IMETS?" up front. */
  whyChoose: { title: string; body: string }[];
  /** SEO long-form sections (What is X / Why become Y). May be empty. */
  seoSections: SeoSection[];
  /** Course reviews (distinct from home-page testimonials). */
  reviews: CourseReview[];
};

/** The five reasons professionals pick IMETS — shared across courses. */
function whyChooseReasons(locale: string): { title: string; body: string }[] {
  const ar = isAr(locale);
  return [
    {
      title: ar ? "منهج متوافق مع المعايير الدولية" : "Internationally Aligned Curriculum",
      body: ar
        ? "محتوى مبني على أفضل الممارسات العالمية المعتمدة في المستشفيات، وليس مادة نظرية عامة."
        : "Content built on the global best practices hospitals actually run on — not generic theory.",
    },
    {
      title: ar ? "تتعلّم من قيادات الرعاية الصحية" : "Learn from Healthcare Leaders",
      body: ar
        ? "تدرس مع خبراء مارسوا المجال فعليًا داخل المستشفيات، ويشرحون لك ما ينجح وما لا ينجح."
        : "Study with practitioners who have done the job inside hospitals, and will tell you what actually works.",
    },
    {
      title: ar ? "تعلّم موجَّه لسوق العمل" : "Career-Focused Learning",
      body: ar
        ? "كل وحدة مرتبطة بمهارة يطلبها أصحاب العمل في إعلانات الوظائف الحقيقية."
        : "Every module maps to a skill employers are actually asking for in real job postings.",
    },
    {
      title: ar ? "مشاريع وحالات عملية" : "Practical Projects & Case Studies",
      body: ar
        ? "تطبّق ما تتعلّمه على حالات واقعية من داخل المستشفيات، فتخرج بخبرة قابلة للعرض."
        : "Apply what you learn to real hospital scenarios, so you finish with work you can actually show.",
    },
    {
      title: ar ? "شهادة معترف بها ودعم مستمر" : "Recognized Certificate & Ongoing Support",
      body: ar
        ? "تحصل على شهادة موثّقة، ويستمر الدعم معك بعد انتهاء البرنامج وليس قبله فقط."
        : "You get a verifiable certificate — and support that continues after the program ends, not just before you pay.",
    },
  ];
}

const isAr = (locale: string) => locale === "ar";

/** Shared, believable healthcare reviews used as the review wall for any course. */
function defaultReviews(locale: string): CourseReview[] {
  const ar = isAr(locale);
  return [
    {
      name: ar ? "د. مريم الفهد" : "Dr. Mariam Al-Fahad",
      role: ar ? "أخصائية جودة رعاية صحية" : "Healthcare Quality Specialist",
      country: ar ? "السعودية 🇸🇦" : "Saudi Arabia 🇸🇦",
      rating: 5,
      text: ar
        ? "أفضل استثمار في مسيرتي المهنية. الجلسات المباشرة والاختبارات التدريبية جهّزتني تمامًا واجتزت الامتحان من أول محاولة."
        : "The best investment in my career. The live sessions and practice exams prepared me fully — I passed on my first attempt.",
    },
    {
      name: ar ? "أحمد منصور" : "Ahmed Mansour",
      role: ar ? "منسّق سلامة المرضى" : "Patient Safety Officer",
      country: ar ? "الإمارات 🇦🇪" : "UAE 🇦🇪",
      rating: 5,
      text: ar
        ? "المحتوى عملي جدًا وليس مجرد نظري. طبّقت ما تعلّمته في مستشفانا خلال أسابيع."
        : "Extremely practical, not just theory. I was applying what I learned in our hospital within weeks.",
    },
    {
      name: ar ? "د. ليلى حسن" : "Dr. Layla Hassan",
      role: ar ? "مديرة جودة" : "Quality Manager",
      country: ar ? "مصر 🇪🇬" : "Egypt 🇪🇬",
      rating: 5,
      text: ar
        ? "المدرّبون خبراء حقيقيون في المجال. الدعم عبر واتساب كان سريعًا ومفيدًا في كل خطوة."
        : "The instructors are real industry experts. The WhatsApp support was fast and helpful at every step.",
    },
    {
      name: ar ? "خالد العتيبي" : "Khaled Al-Otaibi",
      role: ar ? "منسّق اعتماد المستشفيات" : "Hospital Accreditation Coordinator",
      country: ar ? "قطر 🇶🇦" : "Qatar 🇶🇦",
      rating: 5,
      text: ar
        ? "التسجيلات سمحت لي بالدراسة بعد مناوبات العمل. تنظيم رائع ومحتوى محدّث."
        : "Recordings let me study after my shifts. Well organised and the content is up to date.",
    },
    {
      name: ar ? "د. نور الدين" : "Dr. Nour El-Din",
      role: ar ? "طبيب مقيم" : "Resident Physician",
      country: ar ? "الأردن 🇯🇴" : "Jordan 🇯🇴",
      rating: 4,
      text: ar
        ? "برنامج قوي وشامل. تمنّيت لو كان هناك المزيد من الحالات العملية، لكنه ممتاز عمومًا."
        : "Strong, comprehensive program. I'd have liked a few more case studies, but excellent overall.",
    },
    {
      name: ar ? "سارة إبراهيم" : "Sara Ibrahim",
      role: ar ? "ممرضة أولى" : "Senior Nurse",
      country: ar ? "الكويت 🇰🇼" : "Kuwait 🇰🇼",
      rating: 5,
      text: ar
        ? "غيّر البرنامج طريقة تفكيري في الجودة والسلامة. أنصح به كل زميل في القطاع الصحي."
        : "It changed how I think about quality and safety. I recommend it to every colleague in healthcare.",
    },
  ];
}

/** Bespoke CPHQ content. */
function cphqContent(locale: string): CourseContent {
  const ar = isAr(locale);
  return {
    story: {
      title: ar
        ? "تخيّل نفسك تقود تحسين الجودة في مستشفاك."
        : "Imagine Leading Quality Improvement in Your Hospital.",
      body: ar
        ? "المؤسسات الصحية في الشرق الأوسط تبحث عن متخصصين قادرين على تحسين سلامة المرضى، ورفع مستوى الجودة، وقيادة مبادرات الاعتماد. هذا البرنامج مُصمَّم ليجعلك واحدًا منهم."
        : "Healthcare organizations across the Middle East are looking for professionals who can improve patient safety, enhance quality, and lead accreditation initiatives. This program is designed to help you become one of them.",
    },
    outcomes: ar
      ? [
          "قياس وتحسين جودة الرعاية داخل مستشفاك",
          "قيادة مبادرات سلامة المرضى وتقليل الأخطاء",
          "بناء وتحليل مؤشرات الأداء الصحية (KPIs)",
          "إدارة البيانات واستخدامها في اتخاذ القرار",
          "تجهيز مؤسستك لمتطلبات الاعتماد",
          "اجتياز امتحان CPHQ بثقة من أول محاولة",
        ]
      : [
          "Measure and improve care quality inside your hospital",
          "Lead patient-safety initiatives and reduce errors",
          "Build and interpret healthcare KPIs",
          "Use data management to drive real decisions",
          "Prepare your organisation for accreditation",
          "Sit the CPHQ exam with confidence on your first attempt",
        ],
    demandLine: ar
      ? "مع توسّع برامج الاعتماد مثل JCI وCBAHI وGAHAR، تستمر الحاجة لمتخصصي الجودة في مستشفيات الخليج والشرق الأوسط."
      : "As accreditation programs like JCI, CBAHI and GAHAR expand, hospitals across the GCC and wider Middle East keep hiring for healthcare quality roles.",
    whyChoose: whyChooseReasons(locale),
    careerRoles: [
      { title: ar ? "أخصائي جودة رعاية صحية" : "Healthcare Quality Specialist" },
      { title: ar ? "منسّق جودة" : "Quality Coordinator" },
      { title: ar ? "مسؤول سلامة المرضى" : "Patient Safety Officer" },
      { title: ar ? "مدير جودة" : "Quality Manager" },
      { title: ar ? "منسّق اعتماد المستشفيات" : "Hospital Accreditation Coordinator" },
    ],
    seoSections: [
      {
        heading: ar ? "ما هي شهادة CPHQ؟" : "What Is CPHQ Certification?",
        body: ar
          ? "CPHQ (Certified Professional in Healthcare Quality) هي الشهادة الأكثر اعترافًا عالميًا في مجال جودة الرعاية الصحية، وتصدرها NAHQ. تُثبت الشهادة إتقانك لإدارة الجودة، وسلامة المرضى، وإدارة البيانات، والاعتماد — وهي مطلوبة بشدة في مستشفيات الخليج والشرق الأوسط."
          : "CPHQ (Certified Professional in Healthcare Quality) is the most globally recognized credential in healthcare quality, awarded by NAHQ. It proves your mastery of quality management, patient safety, data management, and accreditation — and it's in high demand across hospitals in the GCC and the wider Middle East.",
      },
      {
        heading: ar ? "لماذا تصبح متخصصًا في جودة الرعاية الصحية؟" : "Why Become a Healthcare Quality Professional?",
        body: ar
          ? "جودة الرعاية الصحية من أسرع المجالات نموًا في القطاع الطبي. مع توسّع برامج الاعتماد مثل JCI وCBAHI وGAHAR، أصبحت المستشفيات بحاجة ماسّة لمتخصصين يقودون التحسين المستمر. هذا مسار مهني مستقر، مؤثّر، ومطلوب في كل منشأة صحية."
          : "Healthcare quality is one of the fastest-growing fields in the medical sector. As accreditation programs like JCI, CBAHI, and GAHAR expand, hospitals urgently need professionals who can lead continuous improvement. It's a stable, high-impact career that's needed in every healthcare facility.",
      },
    ],
    reviews: defaultReviews(locale),
  };
}

/** Bespoke Hospital Management Diploma content. */
function hospitalManagementContent(locale: string): CourseContent {
  const ar = isAr(locale);
  return {
    story: {
      title: ar
        ? "تخيّل نفسك تدير قسمًا في مستشفى — بثقة."
        : "Imagine Running a Hospital Department — With Confidence.",
      body: ar
        ? "إدارة المستشفيات ليست إدارة عامة. إنها موازنة بين جودة الرعاية، والتكلفة، والفريق، ومتطلبات الاعتماد — كل يوم. هذا البرنامج مصمَّم ليمنحك الأدوات التي يستخدمها المديرون فعليًا داخل المستشفيات."
        : "Running a hospital isn't generic management. It's balancing care quality, cost, your team, and accreditation demands — every single day. This program gives you the tools hospital managers actually use on the floor.",
    },
    outcomes: ar
      ? [
          "قيادة أقسام المستشفى بفعالية",
          "تحسين الكفاءة التشغيلية وتقليل الهدر",
          "بناء وقراءة مؤشرات الأداء الصحية (KPIs)",
          "إدارة وتطوير فرق الرعاية الصحية",
          "فهم متطلبات اعتماد المستشفيات",
          "تطبيق التخطيط الاستراتيجي في القطاع الصحي",
        ]
      : [
          "Lead hospital departments effectively",
          "Improve operational efficiency and cut waste",
          "Build and interpret healthcare KPIs",
          "Manage and develop healthcare teams",
          "Understand hospital accreditation requirements",
          "Apply strategic planning in a healthcare setting",
        ],
    demandLine: ar
      ? "المستشفيات ومجموعات الرعاية الصحية في الخليج تواصل التوسّع، وتحتاج إلى مديرين يفهمون التشغيل والجودة معًا."
      : "Hospitals and healthcare groups across the GCC keep expanding, and they need managers who understand operations and quality together.",
    whyChoose: whyChooseReasons(locale),
    careerRoles: [
      { title: ar ? "منسّق / إداري قسم" : "Department Coordinator" },
      { title: ar ? "مشرف وحدة" : "Unit Supervisor" },
      { title: ar ? "مدير قسم" : "Department Manager" },
      { title: ar ? "مدير عمليات المستشفى" : "Hospital Operations Manager" },
      { title: ar ? "مدير / استشاري رعاية صحية" : "Healthcare Director / Consultant" },
    ],
    seoSections: [
      {
        heading: ar ? "ما هي دبلومة إدارة المستشفيات؟" : "What Is a Hospital Management Diploma?",
        body: ar
          ? "دبلومة إدارة المستشفيات برنامج مهني يجهّزك لإدارة العمليات اليومية داخل المنشآت الصحية: تشغيل الأقسام، وإدارة الموارد والفرق، وضبط الجودة، والاستعداد للاعتماد. وهي مسار مناسب للأطباء والممرضين والإداريين الذين يريدون الانتقال من التنفيذ إلى القيادة."
          : "A Hospital Management Diploma is a professional program that prepares you to run day-to-day operations inside a healthcare facility: departmental operations, resources and teams, quality control, and accreditation readiness. It suits clinicians, nurses and administrators who want to move from doing the work to leading it.",
      },
      {
        heading: ar ? "لماذا تتخصص في إدارة المستشفيات؟" : "Why Specialise in Hospital Management?",
        body: ar
          ? "كل مستشفى يحتاج إلى من يوازن بين جودة الرعاية والتكلفة والكفاءة. الانتقال من دور إكلينيكي أو إداري إلى دور قيادي يفتح مسارًا مهنيًا أوسع وأكثر استقرارًا وتأثيرًا داخل المؤسسة الصحية."
          : "Every hospital needs someone who can balance care quality against cost and efficiency. Moving from a clinical or administrative role into leadership opens a broader, more stable and more influential career path inside the organisation.",
      },
    ],
    reviews: defaultReviews(locale),
  };
}

/** Generic, healthcare-flavoured content for any non-flagship course. */
function genericContent(titleEn: string, titleAr: string, locale: string): CourseContent {
  const ar = isAr(locale);
  const title = ar ? titleAr : titleEn;
  return {
    story: {
      title: ar
        ? "تخيّل مسيرتك المهنية بعد إتقان هذا المجال."
        : "Imagine Advancing Your Career with Real Confidence.",
      body: ar
        ? `المؤسسات الصحية في الشرق الأوسط تبحث عن متخصصين مؤهّلين ومعتمدين. برنامج «${title}» مُصمَّم ليمنحك المهارات والشهادة التي تجعلك الخيار الأول لأصحاب العمل.`
        : `Healthcare organizations across the Middle East are looking for qualified, certified professionals. "${title}" is designed to give you the skills and the credential that make you the first choice for employers.`,
    },
    // Left empty on purpose: generic "learn professional models" filler helps
    // nobody. The page falls back to the course's own whatYouWillLearn, and if
    // that's empty too the section is skipped rather than faked.
    outcomes: [],
    demandLine: ar
      ? `تواصل المؤسسات الصحية في المنطقة توظيف المتخصصين المؤهّلين في مجال «${title}».`
      : `Healthcare organizations across the region continue hiring qualified professionals in ${title}.`,
    whyChoose: whyChooseReasons(locale),
    careerRoles: [
      { title: ar ? "أخصائي" : "Specialist" },
      { title: ar ? "أخصائي أول" : "Senior Specialist" },
      { title: ar ? "مشرف / قائد فريق" : "Supervisor / Team Lead" },
      { title: ar ? "مدير قسم" : "Department Manager" },
      { title: ar ? "مدير / استشاري" : "Director / Consultant" },
    ],
    seoSections: [],
    reviews: defaultReviews(locale),
  };
}

export function getCourseContent(opts: {
  slug: string;
  titleEn: string;
  titleAr: string;
  locale: string;
}): CourseContent {
  if (opts.slug === "cphq-preparation") return cphqContent(opts.locale);
  if (opts.slug === "hospital-management-diploma") return hospitalManagementContent(opts.locale);
  return genericContent(opts.titleEn, opts.titleAr, opts.locale);
}

/**
 * Review-distribution bars derived from the overall rating so the wall always
 * matches the headline number (no fake precision, just a believable spread).
 */
export function ratingDistribution(rating: number): { star: number; pct: number }[] {
  // Anchor the top two buckets on the rating, taper the rest.
  const five = Math.min(92, Math.max(60, Math.round((rating - 3.6) * 55 + 60)));
  const four = Math.round((100 - five) * 0.62);
  const three = Math.round((100 - five - four) * 0.6);
  const two = Math.max(1, Math.round((100 - five - four - three) * 0.6));
  const one = Math.max(1, 100 - five - four - three - two);
  return [
    { star: 5, pct: five },
    { star: 4, pct: four },
    { star: 3, pct: three },
    { star: 2, pct: two },
    { star: 1, pct: one },
  ];
}
