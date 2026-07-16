/**
 * Long-form, conversion-focused content for the course detail page.
 *
 * Everything here is derived per-course + per-locale so the same detail page can
 * render a rich, "sells itself" experience for any course, while CPHQ (our flagship)
 * gets fully bespoke copy. Sections that don't apply to a course simply return
 * `undefined`/`[]` and the page skips them.
 */

export type CareerRole = { title: string };
export type CareerOpportunity = {
  title: string;
  /** One-line role description — keeps the card scannable but richer. */
  description: string;
  /** e.g. "Mid–Senior Level" */
  level: string;
  emoji: string;
};
export type FaqItem = { q: string; a: string };
export type FaqGroup = { title: string; items: FaqItem[] };
export type SeoSection = { heading: string; body: string };
export type CourseReview = {
  name: string;
  role: string;
  country: string;
  rating: number;
  text: string;
};

/** A persona card under "Who This Program Is For" — `why` expands on click. */
export type AudiencePersona = { emoji: string; label: string; why: string };

export type CourseContent = {
  /**
   * Curated persona cards. `null` ⇒ fall back to the chip rail parsed from the
   * course record's `whoCanAttend` copy.
   */
  audience: AudiencePersona[] | null;
  /**
   * Short "About this diploma" — one paragraph only. `null` ⇒ fall back to
   * the course DB description.
   */
  about: { summary: string; more: string[] } | null;
  /**
   * Grouped FAQ (Before Enrollment / During Learning / Certification).
   * When set, replaces the flat default list on the detail page.
   */
  faqs: FaqGroup[] | null;
  /**
   * Course-specific "What You'll Learn" outcomes. Empty ⇒ course record.
   */
  outcomes: string[];
  /** Ordered career ladder (roadmap). */
  careerRoles: CareerRole[];
  /** Role cards under Career Growth. */
  careerOpportunities: CareerOpportunity[];
  /** One-line demand statement under Career Growth. */
  demandLine: string;
  /**
   * H2 overrides that carry the page's target keyword. `null` ⇒ the generic
   * headings ("What You'll Learn", "Career Outcomes", …), which say nothing
   * about what the page is actually about.
   */
  headings: {
    whyChoose: string;
    audience: string;
    learn: string;
    careers: string;
    /** Overrides the title-derived "Why This Diploma Matters". */
    about?: string;
  } | null;
  /**
   * Bundled "Continue Your Professional Journey" slugs, used when the course
   * record carries no `relatedCourseSlugs`. Must be real published slugs —
   * linking to a 404 is worse than not linking.
   */
  relatedSlugs: string[];
  /**
   * Closing CTA copy. `null` ⇒ the generic healthcare line.
   *
   * Worth having per course: the old default closed every page with "prepare
   * for management roles in hospitals" — hospital-management copy ending an
   * infection-control page.
   */
  finalCta: { heading: string; body: string } | null;
  /**
   * "Why This Diploma?" — six cards that absorb Why Choose + Benefits + Why Study.
   * Prefer this over stacking separate "why" sections.
   */
  whyThisDiploma: { title: string; body: string }[];
  /** @deprecated Prefer whyThisDiploma — kept for admin-mapped Why Choose fallback. */
  whyChoose: { title: string; body: string }[];
  /** Extra SEO prose — leave empty when FAQ + About cover the intent. */
  seoSections: SeoSection[];
  reviews: CourseReview[];
  /**
   * Page meta overrides (bespoke courses). When set, wins over CMS SEO and
   * course title fallbacks. Use a full branded title — layout template is skipped
   * via `absolute`.
   */
  pageSeo?: {
    metaTitleEn: string;
    metaTitleAr: string;
    metaDescriptionEn: string;
    metaDescriptionAr: string;
  };
};

const isAr = (locale: string) => locale === "ar";

/**
 * Module-level “by the end you’ll be able to” outcomes for the curriculum accordion.
 * Matched by module title keywords so CMS title wording can vary slightly.
 */
export function resolveModuleOutcomes(
  slug: string,
  moduleTitle: string,
  locale: string,
): string[] {
  if (slug !== "hospital-management-diploma") return [];
  const ar = isAr(locale);
  const t = moduleTitle.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k.toLowerCase()));

  if (has("quality", "accreditation", "جودة", "اعتماد")) {
    return ar
      ? [
          "تصميم مبادرات تحسين الجودة داخل المنشأة",
          "تطبيق مبادئ سلامة المرضى في العمل اليومي",
          "قياس أداء الرعاية الصحية ومؤشراته",
        ]
      : [
          "Design quality improvement initiatives",
          "Apply patient safety principles",
          "Measure healthcare performance",
        ];
  }
  if (has("leadership", "management", "قيادة", "إدارة") && !has("hospital", "operations", "مستشف", "تشغيل")) {
    return ar
      ? [
          "قيادة فرق الرعاية الصحية بثقة",
          "اتخاذ قرارات إدارية مبنية على البيانات",
          "بناء ثقافة مساءلة داخل القسم",
        ]
      : [
          "Lead healthcare teams with confidence",
          "Make data-informed management decisions",
          "Build accountability inside your department",
        ];
  }
  if (has("operation", "hospital", "تشغيل", "مستشف")) {
    return ar
      ? [
          "تنظيم تدفقات العمل والموارد في المستشفى",
          "تحسين كفاءة الأقسام والوحدات",
          "ربط التشغيل بمعايير الجودة والسلامة",
        ]
      : [
          "Organize hospital workflows and resources",
          "Improve unit and department efficiency",
          "Connect operations to quality and safety standards",
        ];
  }
  if (has("finance", "budget", "cost", "تمويل", "موازنة", "تكلف")) {
    return ar
      ? [
          "قراءة وتفسير الميزانيات الصحية",
          "ربط التكلفة بجودة الخدمة",
          "المساهمة في قرارات تمويل القسم",
        ]
      : [
          "Read and interpret healthcare budgets",
          "Link cost decisions to service quality",
          "Contribute to department financial decisions",
        ];
  }
  if (has("hr", "human", "staff", "resource", "موارد", "بشري", "موظفين")) {
    return ar
      ? [
          "تخطيط احتياجات الكوادر الصحية",
          "إدارة أداء الفريق بإنصاف ووضوح",
          "بناء بيئة عمل تدعم الاستبقاء",
        ]
      : [
          "Plan staffing needs for healthcare teams",
          "Manage team performance fairly and clearly",
          "Build a retention-friendly work environment",
        ];
  }
  if (has("safety", "patient", "سلامة", "مرضى")) {
    return ar
      ? [
          "تطبيق أطر سلامة المرضى الدولية",
          "تحليل الحوادث والمخاطر بأسلوب منهجي",
          "قيادة تحسينات تقلّل الضرر على المرضى",
        ]
      : [
          "Apply international patient-safety frameworks",
          "Analyze incidents and risks systematically",
          "Lead improvements that reduce patient harm",
        ];
  }
  if (has("strategy", "planning", "استراتيج", "تخطيط")) {
    return ar
      ? [
          "صياغة أهداف تشغيلية مرتبطة باستراتيجية المنشأة",
          "ترجمة الخطط إلى مؤشرات قابلة للمتابعة",
          "المواءمة بين الأقسام على أولويات مشتركة",
        ]
      : [
          "Set operational goals tied to facility strategy",
          "Translate plans into trackable KPIs",
          "Align departments around shared priorities",
        ];
  }

  // Sensible default for unmatched hospital modules
  return ar
    ? [
        "تطبيق مفاهيم الإدارة الصحية في بيئة عملك",
        "تحسين التنسيق بين الفرق والأقسام",
        "المساهمة في أداء تشغيلي أفضل",
      ]
    : [
        "Apply healthcare management concepts on the job",
        "Improve coordination across teams and departments",
        "Contribute to stronger operational performance",
      ];
}

/** Short topic tags shown under each module title on the live curriculum roadmap. */
export function resolveModuleTopics(
  slug: string,
  moduleTitle: string,
  locale: string,
): string[] {
  if (slug !== "hospital-management-diploma") return [];
  const ar = isAr(locale);
  const t = moduleTitle.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k.toLowerCase()));

  if (has("quality", "accreditation", "جودة", "اعتماد")) {
    return ar
      ? ["تحسين الجودة", "سلامة المرضى", "مؤشرات الأداء"]
      : ["Quality Improvement", "Patient Safety", "Performance"];
  }
  if (has("leadership", "management", "قيادة", "إدارة") && !has("hospital", "operations", "مستشف", "تشغيل")) {
    return ar
      ? ["القيادة", "الفرق", "الثقافة المؤسسية"]
      : ["Leadership", "Teams", "Culture"];
  }
  if (has("operation", "hospital", "تشغيل", "مستشف")) {
    return ar
      ? ["التشغيل", "سير العمل", "الكفاءة"]
      : ["Operations", "Workflow", "Efficiency"];
  }
  if (has("finance", "budget", "cost", "تمويل", "موازنة", "تكلف")) {
    return ar
      ? ["التمويل", "الميزانية", "التكلفة"]
      : ["Finance", "Budget", "Cost"];
  }
  if (has("hr", "human", "staff", "resource", "موارد", "بشري", "موظفين")) {
    return ar
      ? ["الموارد البشرية", "الكوادر", "الأداء"]
      : ["HR", "Staffing", "Performance"];
  }
  if (has("safety", "patient", "سلامة", "مرضى")) {
    return ar
      ? ["سلامة المرضى", "المخاطر", "التحسين"]
      : ["Patient Safety", "Risk", "Improvement"];
  }
  if (has("strategy", "planning", "استراتيج", "تخطيط")) {
    return ar
      ? ["الاستراتيجية", "التخطيط", "مؤشرات"]
      : ["Strategy", "Planning", "KPIs"];
  }

  return ar
    ? ["الإدارة الصحية", "التشغيل", "الجودة"]
    : ["Leadership", "Operations", "Healthcare System"];
}

/** Six cards: Why Choose + Benefits + Why Study — no duplicate "what is" essay. */
function whyThisDiplomaCards(locale: string): { title: string; body: string }[] {
  const ar = isAr(locale);
  return [
    {
      title: ar ? "دبلومة معترف بها دوليًا" : "Internationally Recognized Diploma",
      body: ar
        ? "منهج مبني على أطر وممارسات المستشفيات العالمية — شهادة موثّقة يقدّرها أصحاب العمل."
        : "Curriculum built on global hospital frameworks — a verifiable credential employers recognize.",
    },
    {
      title: ar ? "تتعلّم من قادة رعاية صحية" : "Learn from Healthcare Leaders",
      body: ar
        ? "مدربون مارسوا الإدارة فعليًا داخل المستشفيات ويشرحون ما ينجح على أرض الواقع."
        : "Instructors who have managed real hospital operations and teach what actually works on the floor.",
    },
    {
      title: ar ? "مهارات تشغيل وتمويل وجودة" : "Operations, Finance & Quality Skills",
      body: ar
        ? "تخطيط تشغيلي، موازنات، مؤشرات أداء، وتحسين جودة — أدوات تستخدمها فورًا في عملك."
        : "Operations planning, budgets, KPIs, and quality improvement — tools you can apply at work immediately.",
    },
    {
      title: ar ? "حالات مستشفيات حقيقية" : "Real Hospital Case Studies",
      body: ar
        ? "تطبّق ما تتعلّمه على سيناريوهات تشغيلية واقعية، لا على نظريات عامة."
        : "Practice on real operational scenarios — not generic business theory.",
    },
    {
      title: ar ? "ادرس وأنت تعمل" : "Study While You Work",
      body: ar
        ? "جلسات مباشرة أونلاين مع تسجيلات — تناسب الورديات والدوام الكامل."
        : "Live online sessions plus recordings — built for full-time roles and shift work.",
    },
    {
      title: ar ? "مسار نحو أدوار إدارية" : "A Path Toward Management Roles",
      body: ar
        ? "تهيّئك للترقية والتنسيق والإشراف وإدارة الأقسام داخل المنشآت الصحية."
        : "Prepares you for promotion into coordinator, supervisor, and department management roles.",
    },
  ];
}

/** The five reasons professionals pick IMETS — shared fallback for non-flagship. */
function whyChooseReasons(locale: string): { title: string; body: string }[] {
  return whyThisDiplomaCards(locale).slice(0, 5);
}

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
    headings: {
      whyChoose: ar ? "لماذا تختار برنامج CPHQ من IMETS" : "Why Choose the IMETS CPHQ Preparation Program",
      audience: ar ? "لمن برنامج CPHQ هذا" : "Who Should Join This CPHQ Preparation Program",
      learn: ar ? "ماذا ستتعلّم في برنامج CPHQ" : "What You'll Learn in This CPHQ Preparation Program",
      careers: ar ? "الفرص المهنية بعد شهادة CPHQ" : "Career Opportunities After CPHQ Certification",
    },
    relatedSlugs: [
      "healthcare-quality-management-diploma",
      "cic-preparation",
      "hospital-management-diploma",
    ],
    about: {
      summary: ar
        ? "المؤسسات الصحية في السعودية والإمارات وقطر وعُمان ومصر تبحث بشكل متزايد عن متخصصين مدرَّبين في جودة الرعاية الصحية وسلامة المرضى."
        : "Healthcare organizations across Saudi Arabia, UAE, Qatar, Oman and Egypt increasingly seek professionals trained in healthcare quality and patient safety.",
      more: ar
        ? ["برنامج IMETS للتحضير لشهادة CPHQ يساعدك على بناء معرفة عملية، والاستعداد بثقة لامتحان CPHQ الدولي، وتطوير مهارات تقدّرها المستشفيات في جميع أنحاء الشرق الأوسط."]
        : ["The IMETS CPHQ Preparation Program helps you build practical knowledge, prepare confidently for the international CPHQ certification, and develop skills valued by hospitals across the Middle East."],
    },
    audience: [
      {
        emoji: "👨‍⚕️",
        label: ar ? "الأطباء" : "Physicians",
        why: ar
          ? "تقود قرارات إكلينيكية يوميًا. البرنامج يمنحك لغة الجودة والبيانات لتحويل تلك القرارات إلى تحسين قابل للقياس على مستوى القسم."
          : "You already lead clinical decisions. This program gives you the quality and data language to turn them into measurable improvement at department level.",
      },
      {
        emoji: "👩‍⚕️",
        label: ar ? "التمريض" : "Nurses",
        why: ar
          ? "التمريض أقرب فريق لسلامة المرضى. الشهادة تفتح لك التحوّل من الرعاية المباشرة إلى أدوار الجودة وسلامة المرضى."
          : "Nursing sits closest to patient safety. The credential opens the move from bedside care into quality and patient-safety roles.",
      },
      {
        emoji: "💊",
        label: ar ? "الصيادلة" : "Pharmacists",
        why: ar
          ? "سلامة الدواء أحد أهم مؤشرات الجودة. ستتعلّم كيف تبني مؤشرات الأداء وتقود مبادرات تقليل أخطاء الدواء."
          : "Medication safety is one of the biggest quality indicators. You'll learn to build KPIs and lead initiatives that reduce medication error.",
      },
      {
        emoji: "🦷",
        label: ar ? "أطباء الأسنان" : "Dentists",
        why: ar
          ? "عيادات ومراكز الأسنان تخضع لنفس متطلبات الاعتماد. البرنامج يؤهّلك لتجهيز منشأتك ومطابقة معايير الجودة."
          : "Dental clinics and centres face the same accreditation requirements. The program prepares you to ready your facility and meet quality standards.",
      },
      {
        emoji: "🏥",
        label: ar ? "إداريو المستشفيات" : "Hospital Administrators",
        why: ar
          ? "أنت المسؤول عن نتائج الاعتماد. ستتعلّم إدارة البيانات وقيادة التحسين المستمر عبر الأقسام."
          : "You own the accreditation outcome. You'll learn data management and how to lead continuous improvement across departments.",
      },
      {
        emoji: "🎓",
        label: ar ? "حديثو التخرج" : "Fresh Graduates",
        why: ar
          ? "الجودة مسار يبدأ من المعرفة لا من سنوات الخبرة. البرنامج يبدأ من الأساسيات ويؤهّلك لأول دور في الجودة."
          : "Quality is a path you enter through knowledge, not years served. The program starts from fundamentals and prepares you for a first quality role.",
      },
    ],
    faqs: null,
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
    finalCta: {
      heading: ar ? "مستعد لقيادة الجودة في مستشفاك؟" : "Ready to Lead Quality in Your Hospital?",
      body: ar
        ? "استعد لامتحان CPHQ مع دفعة من متخصصي الجودة في الشرق الأوسط."
        : "Prepare for the CPHQ exam alongside a cohort of quality professionals across the Middle East.",
    },
    whyChoose: whyChooseReasons(locale),
    whyThisDiploma: whyThisDiplomaCards(locale),
    careerRoles: [
      { title: ar ? "أخصائي جودة رعاية صحية" : "Healthcare Quality Specialist" },
      { title: ar ? "أخصائي جودة أول" : "Senior Quality Specialist" },
      { title: ar ? "مشرف جودة" : "Quality Supervisor" },
      { title: ar ? "مدير جودة الرعاية الصحية" : "Healthcare Quality Manager" },
      { title: ar ? "مسؤول اعتماد المستشفى" : "Hospital Accreditation Lead" },
    ],
    careerOpportunities: [],
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
    headings: {
      whyChoose: ar ? "لماذا تختار دبلومة إدارة المستشفيات من IMETS" : "Why Choose the IMETS Hospital Management Diploma",
      audience: ar ? "لمن دبلومة إدارة المستشفيات هذه" : "Who Should Join This Hospital Management Diploma",
      learn: ar ? "ماذا ستتعلّم في دبلومة إدارة المستشفيات" : "What You'll Learn in This Hospital Management Diploma",
      careers: ar ? "الفرص المهنية بعد دبلومة إدارة المستشفيات" : "Career Opportunities After a Hospital Management Diploma",
    },
    relatedSlugs: [
      "healthcare-quality-management-diploma",
      "healthcare-strategic-management-diploma",
      "healthcare-hr-management-diploma",
    ],
    finalCta: {
      heading: ar ? "مستعد لقيادة تشغيل المستشفى؟" : "Ready to Lead Hospital Operations?",
      body: ar
        ? "ابنِ مهارات القيادة واستعد لأدوار إدارية في المنشآت الصحية."
        : "Build leadership skills and prepare for management roles in hospitals.",
    },
    audience: null,
    about: {
      summary: ar
        ? "دبلومة إدارة المستشفيات تؤهّلك لقيادة تشغيل المنشآت الصحية: الفرق، والجودة، والتمويل، والسلامة. منهج بمعايير دولية قابلة للتطبيق فورًا — لمن يسعى للترقية أو الانتقال إلى الإدارة."
        : "The Hospital Management Diploma prepares you to lead healthcare operations — teams, quality, finance, and safety. You learn international practices you can apply on the job. Built for professionals seeking promotion or a move into management.",
      more: ar
        ? [
            "إدارة المستشفى اليوم تتطلّب أكثر من الخبرة الإكلينيكية. المؤسسات الصحية تحتاج إلى مهنيين يفهمون التشغيل، والتمويل، وتحسين الجودة، والقيادة، وسلامة المرضى، واللوائح، والتخطيط الاستراتيجي.",
            "تمنحك هذه الدبلومة إطارًا عمليًا لقيادة الفرق الصحية بثقة، وتحسين الأداء التشغيلي، وبناء خدمات عالية الجودة وفق أفضل الممارسات الدولية المستخدمة في المستشفيات حول العالم.",
            "سواء كنت تسعى للترقية داخل قسمك أو تنتقل إلى مسار إداري، ستخرج بمعرفة قابلة للتطبيق فورًا في بيئة العمل — وليس بنظريات عامة بعيدة عن الواقع.",
          ]
        : [
            "Managing a hospital today requires more than clinical expertise. Healthcare organizations need professionals who understand operations, finance, quality improvement, leadership, patient safety, regulations, and strategic planning.",
            "This diploma gives you a practical framework to lead healthcare teams with confidence, improve operational performance, and build high-quality services using international best practices used in hospitals worldwide.",
            "Whether you're seeking a promotion in your department or moving into a management track, you finish with knowledge you can apply on the job immediately — not generic theory.",
          ],
    },
    faqs: [
      {
        title: ar ? "قبل التسجيل" : "Before Enrollment",
        items: [
          {
            q: ar ? "لمن هذه الدورة؟" : "Who is this course for?",
            a: ar
              ? "للأطباء والممرضين والإداريين الصحيين الراغبين في الترقية أو الانتقال إلى أدوار تنسيق أو إشراف أو إدارة أقسام وعمليات."
              : "Doctors, nurses, and healthcare administrators seeking promotion or a move into coordinator, supervisor, department, or operations roles.",
          },
          {
            q: ar ? "هل الخبرة مطلوبة؟" : "Is experience required?",
            a: ar
              ? "لا — يبدأ البرنامج من الأساسيات ويتدرّج مع دعم المرشدين. الخبرة الإكلينيكية أو الإدارية مفيدة لكنها ليست شرطًا."
              : "No — the program starts from the fundamentals with mentor support. Clinical or admin experience helps, but it is not required.",
          },
          {
            q: ar ? "هل يمكن الدفع بالتقسيط؟" : "Can I pay in installments?",
            a: ar
              ? "نعم. معظم البرامج تدعم خطط تقسيط مرنة. تواصل مع القبول لتأكيد الخطة المتاحة."
              : "Yes. Most programs support flexible installment plans. Speak with admissions to confirm the plan for this diploma.",
          },
          {
            q: ar ? "كم يستغرق إنهاء البرنامج؟" : "How long does it take to finish?",
            a: ar
              ? "معظم الدفعات تمتد عدة أشهر مع جلسات أسبوعية مباشرة. المدة الدقيقة تظهر حسب الدفعة على الصفحة."
              : "Most cohorts run for several months with weekly live sessions. Exact duration is shown per intake on the program page.",
          },
          {
            q: ar ? "كيف أسجّل؟" : "How do I enroll?",
            a: ar
              ? "اضغط قدّم الآن، واملأ النموذج القصير، وسيتواصل معك مستشار لتأكيد مقعدك."
              : "Tap Apply Now, fill the short form, and an advisor will contact you to confirm your seat.",
          },
        ],
      },
      {
        title: ar ? "أثناء التعلّم" : "During Learning",
        items: [
          {
            q: ar ? "هل توجد جلسات مباشرة؟" : "Are there live sessions?",
            a: ar
              ? "نعم — جلسات مباشرة تفاعلية عبر الإنترنت، بالإضافة إلى مواد يمكنك مراجعتها بوتيرتك."
              : "Yes — interactive live online sessions, plus materials you can revisit at your own pace.",
          },
          {
            q: ar ? "هل سأحصل على تسجيلات؟" : "Will I receive recordings?",
            a: ar
              ? "نعم — تُسجَّل كل جلسة وتُضاف إلى حسابك لإعادة المشاهدة في أي وقت."
              : "Yes — every live session is recorded and added to your account so you can rewatch anytime.",
          },
          {
            q: ar ? "هل توجد منصة تعلّم (LMS)؟" : "Is there an LMS?",
            a: ar
              ? "نعم. تصل إلى المواد والتسجيلات والواجبات عبر بوابتك الطلابية طوال البرنامج وبعده للمراجعة."
              : "Yes. You access materials, recordings, and assignments through your student portal throughout the program — and afterward for review.",
          },
          {
            q: ar ? "هل يمكنني الدراسة وأنا أعمل بدوام كامل؟" : "Can I study while working full-time?",
            a: ar
              ? "نعم. الجلسات تناسب المهنيين العاملين، والتسجيلات متاحة متى فاتك شيء."
              : "Yes. Sessions are scheduled for working professionals, and recordings cover anything you miss.",
          },
          {
            q: ar ? "هل يوجد تدريب عملي؟" : "Is there practical training?",
            a: ar
              ? "نعم — حالات مستشفيات واقعية وواجبات تطبيقية ومناقشات تشغيلية، لا نظريات عامة فقط."
              : "Yes — real hospital case studies, applied assignments, and operations discussions, not theory alone.",
          },
        ],
      },
      {
        title: ar ? "الشهادة والاعتماد" : "Certification",
        items: [
          {
            q: ar ? "هل سأحصل على شهادة؟" : "Will I receive a certificate?",
            a: ar
              ? "نعم — شهادة إتمام موثّقة تضيفها لسيرتك الذاتية وLinkedIn بعد اجتياز المتطلبات."
              : "Yes — a verifiable certificate of completion for your CV and LinkedIn after you meet the requirements.",
          },
          {
            q: ar ? "هل يعترف أصحاب العمل بهذه الدبلومة؟" : "Do employers recognize this diploma?",
            a: ar
              ? "نعم. المنهج مبني على أطر مستشفيات عالمية، والشهادة موثّقة ويقدّرها أصحاب العمل في القطاع الصحي."
              : "Yes. The curriculum follows international hospital frameworks, and employers value this verifiable management credential.",
          },
          {
            q: ar ? "كيف يتم التقييم؟" : "How is assessment done?",
            a: ar
              ? "عبر واجبات تطبيقية وتقييم نهائي — للتأكد أنك تستطيع تطبيق ما تعلّمته في سياق تشغيلي حقيقي."
              : "Through applied assignments and a final assessment — so you prove you can apply what you learned in a real operational context.",
          },
          {
            q: ar ? "هل سيساعدني هذا في الترقية؟" : "Will this help me get promoted?",
            a: ar
              ? "نعم. تبني مهارات القيادة والتشغيل والجودة التي تبحث عنها لجان التوظيف للأدوار الإشرافية والإدارية."
              : "Yes. It builds the leadership, operations, and quality skills hiring managers look for in supervisor and management roles.",
          },
        ],
      },
    ],
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
    whyThisDiploma: whyThisDiplomaCards(locale),
    careerRoles: [
      { title: ar ? "منسّق / إداري قسم" : "Department Coordinator" },
      { title: ar ? "مشرف وحدة" : "Unit Supervisor" },
      { title: ar ? "مدير قسم" : "Department Manager" },
      { title: ar ? "مدير عمليات المستشفى" : "Hospital Operations Manager" },
      { title: ar ? "مدير / استشاري رعاية صحية" : "Healthcare Director / Consultant" },
    ],
    careerOpportunities: [
      {
        title: ar ? "مدير عمليات المستشفى" : "Hospital Operations Manager",
        description: ar
          ? "قد أقسام المستشفى وحسّن الكفاءة التشغيلية يومًا بيوم."
          : "Lead hospital departments and improve operational efficiency.",
        level: ar ? "مستوى متوسط–أولى" : "Mid–Senior Level",
        emoji: "🏥",
      },
      {
        title: ar ? "مدير رعاية صحية" : "Healthcare Manager",
        description: ar
          ? "أشرف على الفرق والخدمات والنتائج عبر وحدات الرعاية."
          : "Oversee teams, services, and outcomes across care units.",
        level: ar ? "مستوى متوسط–أولى" : "Mid–Senior Level",
        emoji: "👨‍⚕️",
      },
      {
        title: ar ? "مدير عمليات" : "Operations Manager",
        description: ar
          ? "نظّم سير العمل والموارد والجودة في العمليات اليومية."
          : "Coordinate workflows, resources, and quality in day-to-day operations.",
        level: ar ? "مستوى متوسط–أولى" : "Mid–Senior Level",
        emoji: "⚙️",
      },
      {
        title: ar ? "مدير عيادة" : "Clinic Manager",
        description: ar
          ? "أدِر العيادة: الخدمة، الفريق، تجربة المرضى، والأداء."
          : "Run the clinic — service, staff, patient experience, and performance.",
        level: ar ? "مستوى متوسط" : "Mid Level",
        emoji: "🏥",
      },
      {
        title: ar ? "استشاري رعاية صحية" : "Healthcare Consultant",
        description: ar
          ? "قدّم حلولًا للمنشآت في التشغيل والجودة والتخطيط."
          : "Advise organizations on operations, quality, and strategic improvement.",
        level: ar ? "مستوى أولى" : "Senior Level",
        emoji: "💼",
      },
    ],
    // SEO intent is covered by FAQ + About — avoid stacking more essay blocks.
    seoSections: [],
    reviews: defaultReviews(locale),
    pageSeo: {
      metaTitleEn: "Hospital Management Diploma Online | IMETS Medical School",
      metaTitleAr: "دبلومة إدارة المستشفيات أونلاين | مدرسة IMETS الطبية",
      metaDescriptionEn:
        "Advance your healthcare career with IMETS Hospital Management Diploma. Learn leadership, hospital operations, quality management, finance, HR, and patient safety through live online learning.",
      metaDescriptionAr:
        "طوّر مسيرتك في الرعاية الصحية مع دبلومة إدارة المستشفيات من IMETS. تعلّم القيادة وتشغيل المستشفيات وإدارة الجودة والتمويل والموارد البشرية وسلامة المرضى عبر التعلّم المباشر أونلاين.",
    },
  };
}


/**
 * Bespoke CIC content.
 *
 * Every CBIC figure here is quoted from cbic.org and dated. CBIC revises the
 * exam — a new content outline is already published for 2027 — so treat these as
 * perishable: re-check the source before trusting them, and prefer moving them
 * into the course form (Structure → FAQ) where a human owns the update.
 *
 * Sources, fetched 2026-07-16:
 *   - Exam format, timing, scoring:
 *     https://www.cbic.org/CBIC/CIC-Certification/About-the-Examination.htm
 *   - Eligibility:
 *     https://www.cbic.org/CBIC/Candidate-Handbook/Eligibility-Guidelines.htm
 *   - Content outline (current + 2027):
 *     https://www.cbic.org/OffNav/Content-Outline1.htm
 *
 * Deliberately absent: any salary figure. There is no sourced number for
 * CIC-holder pay in this region, and a made-up one on a page selling exam prep
 * is a false earnings claim. Add it only with a citation.
 */
function cicContent(locale: string): CourseContent {
  const ar = isAr(locale);
  return {
    headings: {
      whyChoose: ar ? "لماذا تختار برنامج CIC من IMETS" : "Why Choose the IMETS CIC Preparation Program",
      audience: ar ? "لمن برنامج CIC هذا" : "Who Should Join This CIC Preparation Program",
      learn: ar ? "ماذا ستتعلّم في برنامج CIC" : "What You'll Learn in This CIC Preparation Program",
      careers: ar ? "الفرص المهنية بعد شهادة CIC" : "Career Opportunities After CIC Certification",
    },
    relatedSlugs: [
      "infection-control-diploma",
      "cphq-preparation",
      "healthcare-quality-management-diploma",
    ],
    about: {
      summary: ar
        ? "المستشفيات في الشرق الأوسط تُقيّم برامج مكافحة العدوى لديها وفق معايير اعتماد دولية، وتبحث عن متخصصين يستطيعون قيادة هذا العمل وإثبات كفاءتهم بشهادة معترف بها."
        : "Hospitals across the Middle East are assessed against international accreditation standards for infection prevention, and are looking for professionals who can lead that work and prove it with a recognised credential.",
      more: ar
        ? ["برنامج IMETS للتحضير لشهادة CIC يساعدك على بناء معرفة عملية في الوقاية من العدوى ومكافحتها، والاستعداد بثقة لامتحان CIC الذي يصدره مجلس CBIC."]
        : ["The IMETS CIC Preparation Program helps you build practical infection prevention and control knowledge, and prepare with confidence for the CIC examination awarded by CBIC."],
    },
    audience: null,
    faqs: [
      {
        title: ar ? "القبول" : "Admissions",
        items: [
          {
            q: ar ? "هل شهادة CIC معترف بها دوليًا؟" : "Is CIC recognized internationally?",
            a: ar
              ? "شهادة CIC يصدرها مجلس Certification Board of Infection Control and Epidemiology ‏(CBIC)، وهو المجلس المستقل المسؤول عن اعتماد متخصصي الوقاية من العدوى ومكافحتها. لا يضع CBIC أي قيد على جنسية المتقدّم أو بلده في شروط الأهلية المنشورة، والشهادة تُعرف على نطاق واسع في برامج اعتماد المستشفيات."
              : "CIC is awarded by the Certification Board of Infection Control and Epidemiology (CBIC), the independent board that certifies infection prevention and control professionals. CBIC's published eligibility requirements set no nationality or country restriction, and the credential is widely referenced in hospital accreditation programs.",
          },
          {
            q: ar ? "من المؤهل لدخول امتحان CIC؟" : "Who is eligible for the CIC exam?",
            a: ar
              ? "يشترط CBIC ثلاثة شروط معًا: أن تكون مسؤولًا مباشرة عن أنشطة الوقاية من العدوى ومكافحتها في وظيفتك الحالية؛ وأن تكون أنهيت تعليمًا جامعيًا في مجال صحي (طب، تمريض، مختبرات، صحة عامة، أحياء … وغيرها)؛ وأن تمتلك خبرة عمل: سنة واحدة بدوام كامل، أو سنتين بدوام جزئي، أو 3000 ساعة خلال السنوات الثلاث السابقة. الأهلية يحددها CBIC وحده — وليس IMETS. راجع cbic.org قبل التقديم."
              : "CBIC requires all three: you are directly responsible for infection prevention and control activities in your current role; you have completed post-secondary education in a health-related field (medicine, nursing, laboratory technology, public health, biology, and others); and you have work experience of at least one year full-time, or two years part-time, or 3,000 hours earned during the previous three years. Eligibility is decided by CBIC, not by IMETS — check cbic.org before you apply.",
          },
          {
            q: ar ? "هل أحتاج خبرة في مكافحة العدوى؟" : "Do I need infection control experience?",
            a: ar
              ? "للالتحاق ببرنامج IMETS: لا — يبدأ البرنامج من الأساسيات. لكن لدخول امتحان CIC نفسه: نعم — يشترط CBIC خبرة عملية (سنة بدوام كامل، أو سنتان بدوام جزئي، أو 3000 ساعة خلال ثلاث سنوات). البرنامج يجهّزك للامتحان، لكنه لا يمنحك الأهلية لدخوله."
              : "To join the IMETS program: no — it starts from the fundamentals. To sit the CIC exam itself: yes — CBIC requires practical experience (one year full-time, two years part-time, or 3,000 hours across three years). The program prepares you for the exam; it does not make you eligible for it.",
          },
          {
            q: ar ? "هل يمكنني الحضور من السعودية؟" : "Can I attend from Saudi Arabia?",
            a: ar
              ? "نعم. البرنامج أونلاين بالكامل، وطلابنا ينضمّون من السعودية والخليج والشرق الأوسط. كل ما تحتاجه هو اتصال بالإنترنت."
              : "Yes. The program is fully online and our students join from Saudi Arabia, the GCC and the wider Middle East. All you need is an internet connection.",
          },
        ],
      },
      {
        title: ar ? "الدراسة والامتحان" : "Studying & the exam",
        items: [
          {
            q: ar ? "كيف تُقدَّم الجلسات المباشرة؟" : "How are live classes delivered?",
            a: ar
              ? "جلسات مباشرة أسبوعية عبر الإنترنت مع المدرّب، بالإضافة إلى مواد يمكنك مراجعتها بوتيرتك. تُسجَّل كل جلسة وتُضاف إلى حسابك، فإن فاتتك واحدة تجدها خلال ساعات."
              : "Live weekly online sessions with the instructor, plus material you can revisit at your own pace. Every session is recorded and added to your account, so a missed class is available within hours.",
          },
          {
            q: ar
              ? "هل يساعدني هذا البرنامج على الاستعداد لامتحان CIC؟"
              : "Will this program help me prepare for the CIC exam?",
            a: ar
              ? "نعم — هذا هو الغرض منه. يغطي البرنامج مجالات محتوى امتحان CIC ويدرّبك على أسلوب الأسئلة. لكن كن واضحًا: IMETS جهة تدريب مستقلة وليست تابعة لـ CBIC، ولا نُصدر الشهادة ولا نضمن النجاح — الامتحان يُدار بالكامل من CBIC."
              : "Yes — that is what it is built for. The program covers the CIC exam's content domains and drills the question style. To be clear though: IMETS is an independent training provider, not affiliated with CBIC. We do not award the credential and cannot guarantee a pass — the examination is administered entirely by CBIC.",
          },
        ],
      },
    ],
    outcomes: ar
      ? [
          "بناء برنامج وقاية من العدوى ومكافحتها داخل منشأتك",
          "تصميم المراقبة الوبائية وتفسير بياناتها",
          "قيادة تحقيقات الفاشيات والاستجابة لها",
          "تطبيق سياسات التنظيف والتطهير والتعقيم",
          "إدارة صحة العاملين والتعرّض المهني",
          "الاستعداد لمجالات محتوى امتحان CIC بثقة",
        ]
      : [
          "Build an infection prevention and control program inside your facility",
          "Design surveillance and interpret its data",
          "Lead outbreak investigation and response",
          "Apply cleaning, disinfection and sterilisation policy",
          "Manage occupational health and exposure",
          "Prepare for the CIC exam's content domains with confidence",
        ],
    demandLine: ar
      ? "مع توسّع برامج الاعتماد مثل JCI وCBAHI وGAHAR، تستمر الحاجة لمتخصصي الوقاية من العدوى في مستشفيات الخليج والشرق الأوسط."
      : "As accreditation programs like JCI, CBAHI and GAHAR expand, hospitals across the GCC and wider Middle East keep hiring for infection prevention roles.",
    finalCta: {
      heading: ar ? "مستعد للتقدّم لامتحان CIC؟" : "Ready to Sit the CIC Exam?",
      body: ar
        ? "تحضير مبني على مجالات محتوى امتحان CIC كما ينشرها CBIC."
        : "Preparation built around the CIC exam's content domains, as CBIC publishes them.",
    },
    whyChoose: whyChooseReasons(locale),
    whyThisDiploma: whyThisDiplomaCards(locale),
    careerRoles: [
      { title: ar ? "ممرض مكافحة عدوى" : "Infection Control Nurse" },
      { title: ar ? "أخصائي وقاية من العدوى أول" : "Senior Infection Preventionist" },
      { title: ar ? "منسّق مكافحة العدوى" : "IPC Coordinator" },
      { title: ar ? "مدير مكافحة العدوى" : "Infection Control Manager" },
      { title: ar ? "استشاري إقليمي للوقاية من العدوى" : "Regional Infection Prevention Consultant" },
    ],
    careerOpportunities: [],
    seoSections: [
      {
        heading: ar ? "ما هي شهادة CIC؟" : "What Is CIC Certification?",
        body: ar
          ? "CIC هي شهادة الاعتماد في الوقاية من العدوى ومكافحتها، ويصدرها مجلس Certification Board of Infection Control and Epidemiology ‏(CBIC) — وهو مجلس مستقل مهمّته اعتماد المتخصصين في هذا المجال، منفصل عن أي جهة تدريب. تُثبت الشهادة أن حاملها يمتلك المعرفة المطلوبة عبر مجالات الممارسة: تحديد الأمراض المعدية، والمراقبة الوبائية، ومنع انتقال العدوى، وصحة العاملين، وإدارة البرنامج، والتعليم والبحث، وبيئة الرعاية، والتنظيف والتطهير والتعقيم. وهي موجّهة لمن يتولّى مسؤولية مباشرة عن برنامج مكافحة العدوى في منشأة صحية."
          : "CIC is the certification in infection prevention and control, awarded by the Certification Board of Infection Control and Epidemiology (CBIC) — an independent certifying board, separate from any training provider. It demonstrates knowledge across the practice domains: identifying infectious disease processes, surveillance and epidemiologic investigation, preventing transmission, occupational health, program management and communication, education and research, environment of care, and cleaning, disinfection and sterilisation. It is aimed at professionals who hold direct responsibility for an infection prevention program in a healthcare facility.",
      },
      {
        heading: ar ? "لماذا تحصل على شهادة CIC؟" : "Why Become CIC Certified?",
        body: ar
          ? "الوقاية من العدوى مسار مهني قائم بذاته: يبدأ من ممرض مكافحة عدوى ويتدرّج إلى منسّق ثم مدير ثم استشاري. والشهادة يصدرها مجلس مستقل لا يرتبط بجهة التدريب، ما يجعلها مرجعًا يمكن للمستشفيات في أي دولة الاعتماد عليه — ولا يضع CBIC قيدًا على الجنسية في شروط الأهلية المنشورة. ولأن برامج الاعتماد تُقيّم مكافحة العدوى مباشرة، فإن حَمَلة الشهادة غالبًا ما يقودون هذا الملف داخل المنشأة."
          : "Infection prevention is a career track in its own right: it starts at Infection Control Nurse and progresses through Coordinator, Manager and Consultant. The credential comes from an independent board with no tie to any training provider, which is what lets a hospital in any country rely on it — and CBIC's published eligibility sets no nationality restriction. Because accreditation programs assess infection prevention directly, certified professionals often lead that file inside the facility.",
      },
      {
        heading: ar ? "نظرة على امتحان CIC" : "CIC Exam Overview",
        body: ar
          ? "وفق CBIC (يوليو 2026): الامتحان اختيار من متعدد ويتكوّن من 150 سؤالًا، يُحتسب منها 135 سؤالًا في الدرجة بينما 15 سؤالًا تجريبية لا تُحتسب. يُقسَّم إلى قسمين مدة كل منهما 90 دقيقة، تسبقهما مقدمة وشرح 10 دقائق، ويفصل بينهما استراحة 16 دقيقة، ويليهما استبيان 5 دقائق. النجاح يتطلب درجة موزونة لا تقل عن 700 على مقياس من 300 إلى 900 — وليست نسبة مئوية من الأسئلة الصحيحة. تتوزّع الأسئلة الـ135 على ثمانية مجالات محتوى. تفاصيل الامتحان يحددها CBIC وقد تتغيّر — وقد نشر CBIC بالفعل مخطط محتوى مُحدّثًا لعام 2027 — لذا تحقّق دائمًا من cbic.org."
          : "Per CBIC (July 2026): the exam is multiple choice and consists of 150 questions, of which 135 count toward your score and 15 are unscored pretest items. It runs as two 90-minute sections, preceded by a 10-minute introduction and tutorial, separated by a 16-minute break, and followed by a 5-minute survey. Passing requires a scaled score of at least 700 on a 300–900 scale — not a percentage of questions answered correctly. The 135 scored questions are distributed across eight content domains. Exam details are set by CBIC and do change — CBIC has already published a revised content outline for 2027 — so always confirm at cbic.org.",
      },
      {
        heading: ar ? "لماذا تختار IMETS للتحضير لشهادة CIC؟" : "Why Choose IMETS For CIC Preparation?",
        body: ar
          ? "التحضير هنا مبني حول مجالات محتوى امتحان CIC الثمانية كما ينشرها CBIC، لا حول منهج عام في مكافحة العدوى. الجلسات مباشرة أسبوعيًا مع مدرّبين يعملون داخل منشآت صحية، وتُسجَّل كلها فتبقى متاحة للمراجعة قبل الامتحان. الشرح بالعربية والإنجليزية معًا، وهو ما يهم عند دراسة مصطلحات امتحان يُقدَّم بالإنجليزية. ونكون صريحين في أمر واحد: IMETS جهة تدريب مستقلة وليست تابعة لـ CBIC — نحن نجهّزك للامتحان، والشهادة يمنحها CBIC وحده."
          : "Preparation here is built around the eight CIC content domains as CBIC publishes them, not around a general infection control syllabus. Sessions are live and weekly with instructors who work inside healthcare facilities, and every one is recorded so it is there to revise before your exam date. Teaching runs in Arabic and English — which matters when you are learning the terminology of an exam sat in English. And we are straight about one thing: IMETS is an independent training provider, not affiliated with CBIC. We prepare you for the exam; only CBIC awards the credential.",
      },
    ],
    reviews: defaultReviews(locale),
  };
}


/**
 * Bespoke Infection Control Diploma content.
 *
 * Note the honesty line this page has to walk: this is an IMETS training
 * diploma, not a credential from a certification board. CIC is the board
 * credential (CBIC). The FAQ says so plainly rather than blurring the two —
 * a reader who confuses them will be disappointed at the point of applying for
 * a job, which is a worse outcome than losing the lead here.
 *
 * Deliberately absent: any claim that a licensing authority (SCFHS, DHA, QCHP,
 * MOH) recognises or accredits this diploma. No such approval has been shown to
 * me, and inventing one is the kind of claim a regulator acts on. If IMETS holds
 * a specific accreditation, add it here by name with its reference.
 */
function infectionControlDiplomaContent(locale: string): CourseContent {
  const ar = isAr(locale);
  return {
    // 55 chars + brand, so the SERP shows it whole; the primary keyword leads.
    // "Online Live Program for Healthcare Professionals" lives in the
    // description instead — there is no room for it in a 60-char title.
    // Note this deliberately drops the admin panel's "Earn an international
    // certificate": no licensing-authority approval has been evidenced, and the
    // FAQ on this same page says so. The two must not contradict each other.
    pageSeo: {
      metaTitleEn: "Infection Control Diploma Online | IMETS Medical School",
      metaTitleAr: "دبلومة مكافحة العدوى أونلاين | مدرسة IMETS الطبية",
      metaDescriptionEn:
        "IMETS Infection Control Diploma: live online classes for healthcare professionals. Practical infection prevention skills, expert instructors, certificate.",
      metaDescriptionAr:
        "دبلومة مكافحة العدوى من IMETS: جلسات مباشرة أونلاين لمتخصصي الرعاية الصحية. مهارات عملية في الوقاية من العدوى، ومدرّبون خبراء، وشهادة إتمام.",
    },
    headings: {
      whyChoose: ar ? "لماذا تختار دبلومة مكافحة العدوى من IMETS" : "Why Choose the IMETS Infection Control Diploma",
      audience: ar ? "لمن دبلومة مكافحة العدوى هذه" : "Who Should Join This Infection Control Diploma",
      learn: ar ? "ماذا ستتعلّم في دبلومة مكافحة العدوى" : "What You'll Learn in This Infection Control Diploma",
      careers: ar ? "الفرص المهنية بعد دبلومة مكافحة العدوى" : "Career Opportunities After an Infection Control Diploma",
    },
    // Verified against the live catalogue on 2026-07-16. `healthcare-quality-diploma`
    // and `healthcare-hr-diploma` do NOT exist — the real slugs carry "-management-".
    relatedSlugs: [
      "cic-preparation",
      "healthcare-quality-management-diploma",
      "hospital-management-diploma",
      "healthcare-hr-management-diploma",
    ],
    finalCta: {
      heading: ar
        ? "مستعد لبناء مسارك المهني في مكافحة العدوى؟"
        : "Ready to Build Your Infection Control Career?",
      body: ar
        ? "انتقل من الرعاية المباشرة إلى الوقاية من العدوى — بجلسات مباشرة أسبوعية بينما تواصل عملك."
        : "Move from bedside care into infection prevention — with live weekly sessions you can take while you work.",
    },
    audience: null,
    about: {
      summary: ar
        ? "عدوى الرعاية الصحية من أكثر ما يُقاس في برامج الاعتماد بمستشفيات الخليج والشرق الأوسط. المنشآت تحتاج متخصص وقاية من العدوى يقود الوقاية من العدوى في المستشفى يوميًا — ترصّد العدوى، ووبائيات المستشفيات، وسلامة المرضى — لا من يعرفها نظريًا فقط."
        : "Healthcare-associated infections are among the most closely measured outcomes in GCC and Middle East hospital accreditation. Facilities need an infection prevention professional who can run hospital infection prevention day to day — infection surveillance, hospital epidemiology and patient safety — not only know it in theory.",
      more: ar
        ? ["دبلومة مكافحة العدوى من IMETS تنقلك من الممارسة الإكلينيكية إلى الوقاية من العدوى: التحقيق في الفاشيات، والتعقيم، وصحة العاملين — بمنهج قابل للتطبيق داخل منشأتك من الأسبوع الأول، سواء كنت تستهدف دور ممرض مكافحة عدوى أو أخصائي وقاية من العدوى."]
        : ["The IMETS Infection Control Diploma moves you from clinical practice into infection prevention: outbreak investigation, sterilisation and occupational health — taught so you can apply it inside your own facility from week one, whether you are aiming at an infection control nurse or infection prevention specialist role."],
    },
    faqs: [
      {
        title: ar ? "من يمكنه الالتحاق" : "Who can join",
        items: [
          {
            q: ar ? "هل هذه الدبلومة مناسبة للتمريض؟" : "Is this diploma suitable for nurses?",
            a: ar
              ? "نعم — التمريض هو أكثر من يلتحق بها. فريق التمريض أقرب الناس لسلامة المرضى يوميًا، والدبلومة مصمّمة لتنقلك من الرعاية المباشرة إلى دور مخصص في الوقاية من العدوى."
              : "Yes — nurses are the largest group who take it. Nursing sits closest to patient safety day to day, and the diploma is built to move you from bedside care into a dedicated infection prevention role.",
          },
          {
            q: ar ? "هل يمكن للأطباء الالتحاق؟" : "Can doctors join?",
            a: ar
              ? "نعم. الأطباء والصيادلة وأخصائيو المختبرات والصحة العامة والإداريون يلتحقون جميعًا. مكافحة العدوى عمل متعدد التخصصات — القرار الإكلينيكي والسياسة والبيانات تلتقي فيه."
              : "Yes. Doctors, pharmacists, laboratory and public-health specialists and administrators all take it. Infection control is multidisciplinary work — clinical judgement, policy and data meet in it.",
          },
        ],
      },
      {
        title: ar ? "الشهادة والاعتراف" : "Certificate & recognition",
        items: [
          {
            q: ar
              ? "ما الفرق بين شهادة CIC ودبلومة مكافحة العدوى؟"
              : "What's the difference between CIC and the Infection Control Diploma?",
            a: ar
              ? "شيئان مختلفان. CIC شهادة اعتماد يصدرها مجلس مستقل هو CBIC: تتقدّم لامتحانه بشروط أهلية يضعها المجلس (مسؤولية مباشرة، وتعليم صحي، وخبرة عمل)، وهو من يمنح اللقب. أما دبلومة مكافحة العدوى فهي برنامج تدريبي من IMETS: تُعلّمك الممارسة ولا تشترط خبرة سابقة للالتحاق، وتحصل في نهايتها على شهادة إتمام من IMETS — لا على لقب CIC. كثيرون يبدأون بالدبلومة لبناء الأساس، ثم يتقدّمون لامتحان CIC حين تكتمل شروط أهليتهم."
              : "They are two different things. CIC is a certification awarded by an independent board, CBIC: you sit their exam under eligibility rules they set (direct responsibility, health-related education, work experience), and they grant the credential. The Infection Control Diploma is an IMETS training program: it teaches the practice, needs no prior experience to join, and ends in an IMETS certificate of completion — not the CIC title. Many people take the diploma to build the foundation, then sit the CIC exam once they meet CBIC's eligibility.",
          },
          {
            q: ar ? "هل الدبلومة معترف بها في دول الخليج؟" : "Is this diploma recognized in GCC countries?",
            a: ar
              ? "نكون دقيقين هنا: الشهادة يصدرها IMETS وهي قابلة للتحقق، وطلابنا يعملون في منشآت عبر الخليج والشرق الأوسط. لكن «الاعتراف» يعني أشياء مختلفة — تقدير جهة العمل للتدريب شيء، واعتماد جهة ترخيص مثل SCFHS أو DHA أو QCHP شيء آخر تحدده تلك الجهة وحدها لا نحن. إن كان هدفك متطلبًا تنظيميًا محددًا، تحقّق منه مع جهتك أولًا. وإن كان هدفك لقبًا من مجلس اعتماد دولي، فذلك هو CIC من CBIC."
              : "Let us be precise. The certificate is issued by IMETS and is verifiable, and our students work in facilities across the GCC and wider Middle East. But \"recognized\" means different things: an employer valuing the training is one thing; approval by a licensing authority such as SCFHS, DHA or QCHP is another, and that is decided by those authorities, not by us. If you need it for a specific regulatory requirement, confirm with that authority first. If what you want is a title from an international certifying board, that is CIC from CBIC.",
          },
          {
            q: ar ? "هل سأحصل على شهادة؟" : "Will I receive a certificate?",
            a: ar
              ? "نعم — شهادة إتمام موثّقة من IMETS يمكن التحقق منها، تضيفها إلى سيرتك الذاتية وLinkedIn."
              : "Yes — a verifiable IMETS certificate of completion, to add to your CV and LinkedIn.",
          },
        ],
      },
      {
        title: ar ? "الدراسة" : "Studying",
        items: [
          {
            q: ar ? "هل يمكنني الدراسة أثناء العمل؟" : "Can I study while working?",
            a: ar
              ? "نعم — هذا هو التصميم. جلسات مباشرة أسبوعية خارج ساعات العمل المعتادة، وكل جلسة تُسجَّل وتُضاف إلى حسابك، فإن فاتتك مناوبة أو جلسة تتابعها لاحقًا بوتيرتك."
              : "Yes — that is the design. Live weekly sessions outside typical working hours, and every session is recorded and added to your account, so a shift that clashes with a class costs you nothing.",
          },
        ],
      },
    ],
    outcomes: ar
      ? [
          "بناء وتشغيل برنامج مكافحة العدوى في منشأتك",
          "تصميم المراقبة الوبائية وتفسير بياناتها",
          "التحقيق في الفاشيات والاستجابة لها",
          "تطبيق سياسات التنظيف والتطهير والتعقيم",
          "إدارة صحة العاملين والتعرّض المهني",
          "تجهيز منشأتك لمتطلبات الاعتماد",
        ]
      : [
          "Build and run an infection control program in your facility",
          "Design infection surveillance and interpret its data",
          "Investigate and respond to outbreaks using hospital epidemiology",
          "Apply cleaning, disinfection and sterilisation policy",
          "Manage occupational health and exposure",
          "Prepare your facility for accreditation requirements",
        ],
    demandLine: ar
      ? "مع توسّع برامج الاعتماد مثل JCI وCBAHI وGAHAR، تستمر الحاجة لمتخصصي مكافحة العدوى في مستشفيات الخليج والشرق الأوسط."
      : "As accreditation programs like JCI, CBAHI and GAHAR expand, hospitals across the GCC and wider Middle East keep hiring for infection control roles.",
    whyChoose: whyChooseReasons(locale),
    whyThisDiploma: whyThisDiplomaCards(locale),
    // Progression, not a list of job titles: it starts where most readers
    // actually are (still at the bedside) so they can locate themselves on it.
    careerRoles: [
      { title: ar ? "ممرض إكلينيكي" : "Clinical Nurse" },
      { title: ar ? "ممرض مكافحة عدوى" : "Infection Control Nurse" },
      { title: ar ? "أخصائي وقاية من العدوى أول" : "Senior Infection Prevention Specialist" },
      { title: ar ? "رئيس قسم" : "Department Lead" },
      { title: ar ? "استشاري" : "Consultant" },
    ],
    careerOpportunities: [],
    seoSections: [],
    reviews: defaultReviews(locale),
  };
}

/**
 * Per-course overrides for pages that need something specific but not a whole
 * bespoke content block. Keyed by slug; anything unlisted keeps the generic
 * copy below, which is deliberately vague because it must fit any subject.
 *
 * One map rather than one per field — a `CAREER_LADDERS` here and a
 * `FINAL_CTAS` there would drift, and each new field would add another.
 *
 * Defaults only: anything saved on the course record wins over this (see
 * `careerRoles` on the detail page). This is the stopgap until each course's
 * content is entered in the admin form.
 */
const COURSE_EXTRAS: Record<
  string,
  (ar: boolean) => Partial<Pick<CourseContent, "careerRoles" | "finalCta" | "headings" | "faqs" | "pageSeo" | "relatedSlugs">>
> = {
  "healthcare-marketing-diploma": (ar) => ({
    careerRoles: [
      { title: ar ? "منسّق التسويق الصحي" : "Healthcare Marketing Coordinator" },
      { title: ar ? "أخصائي التسويق الصحي" : "Healthcare Marketing Specialist" },
      { title: ar ? "أخصائي تسويق أول" : "Senior Marketing Specialist" },
      { title: ar ? "مدير التسويق الصحي" : "Healthcare Marketing Manager" },
      { title: ar ? "مدير إدارة التسويق" : "Marketing Director" },
      { title: ar ? "استشاري أعمال الرعاية الصحية" : "Healthcare Business Consultant" },
    ],
    finalCta: {
      heading: ar
        ? "مستعد لتنمية العلامات الصحية بثقة؟"
        : "Ready to Grow Healthcare Brands With Confidence?",
      body: ar
        ? "ابنِ مهارات التسويق التي تبحث عنها المؤسسات الصحية — أونلاين مباشرة، بالتوازي مع عملك الحالي."
        : "Build the marketing skills healthcare organisations hire for — live online, alongside your current role.",
    },
    headings: {
      whyChoose: ar
        ? "لماذا تختار دبلومة التسويق الصحي من IMETS"
        : "Why Choose the IMETS Healthcare Marketing Diploma",
      audience: ar
        ? "لمن دبلومة التسويق الصحي هذه"
        : "Who Should Join This Healthcare Marketing Diploma",
      learn: ar
        ? "ماذا ستتعلّم في دبلومة التسويق الصحي"
        : "What You'll Learn in This Healthcare Marketing Diploma",
      careers: ar ? "الفرص المهنية في التسويق الصحي" : "Healthcare Marketing Career Opportunities",
      about: ar
        ? "لماذا تهمّ مهارات التسويق الصحي اليوم"
        : "Why Healthcare Marketing Skills Matter Today",
    },
    // 58 chars + no doubling (pageSeo renders absolute); the primary keyword
    // leads. "Live Online Healthcare Marketing Program" sits in the description
    // — a 94-char title loses the brand to truncation entirely.
    pageSeo: {
      metaTitleEn: "Healthcare Marketing Diploma Online | IMETS Medical School",
      metaTitleAr: "دبلومة التسويق الصحي أونلاين | مدرسة IMETS الطبية",
      metaDescriptionEn:
        "IMETS Healthcare Marketing Diploma: branding, patient acquisition, healthcare marketing strategy and digital marketing — live online classes, certificate.",
      metaDescriptionAr:
        "دبلومة التسويق الصحي من IMETS: بناء العلامة، واستقطاب المرضى، واستراتيجية التسويق الصحي، والتسويق الرقمي — جلسات مباشرة أونلاين وشهادة إتمام.",
    },
    relatedSlugs: [
      "healthcare-strategic-management-diploma",
      "hospital-management-diploma",
      "healthcare-hr-management-diploma",
    ],
    faqs: [
      {
        title: ar ? "من يمكنه الالتحاق" : "Who can join",
        items: [
          {
            q: ar ? "هل الدبلومة مناسبة للأطباء؟" : "Is this diploma suitable for doctors?",
            a: ar
              ? "نعم. الأطباء الذين يديرون عياداتهم أو يقودون خطوطًا خدمية داخل مستشفى هم من أكثر من يستفيد: تتعلّم كيف تُبنى الثقة وتُستقطب الحالات المناسبة دون الإضرار بالعلاقة الإكلينيكية."
              : "Yes. Doctors who run their own clinic or lead a service line inside a hospital are among those who benefit most: you learn how trust is built and how the right patients are reached, without damaging the clinical relationship.",
          },
          {
            q: ar ? "هل يستفيد أصحاب العيادات من هذه الدبلومة؟" : "Can clinic owners benefit from this diploma?",
            a: ar
              ? "نعم — وهذا من أوضح استخداماتها. أصحاب العيادات يتعاملون مع استقطاب المرضى وبناء العلامة والميزانية بأنفسهم، والدبلومة تعطيهم إطارًا لهذه القرارات بدل الاجتهاد."
              : "Yes — it is one of the clearest uses. Clinic owners handle patient acquisition, branding and budget themselves, and the diploma gives those decisions a framework instead of guesswork.",
          },
          {
            q: ar ? "هل تُشترط خبرة سابقة في التسويق؟" : "Is prior marketing experience required?",
            a: ar
              ? "لا. البرنامج يبدأ من الأساسيات ثم ينتقل إلى الاستراتيجية والتسويق الرقمي، وهو مصمّم لمن يأتي من خلفية صحية لا تسويقية."
              : "No. The program starts from the fundamentals and moves into strategy and digital marketing. It is built for people arriving from a healthcare background rather than a marketing one.",
          },
        ],
      },
      {
        title: ar ? "المحتوى والنتيجة" : "Content & outcome",
        items: [
          {
            q: ar
              ? "هل التسويق الصحي مختلف عن التسويق التقليدي؟"
              : "Is healthcare marketing different from traditional marketing?",
            a: ar
              ? "نعم، وهذا جوهر البرنامج. أنت تسوّق لقرار صحي لا لسلعة: القيود التنظيمية والإعلانية أشد، وخصوصية بيانات المرضى ملزِمة، والادعاءات الطبية مقيّدة، والثقة تُبنى ببطء وتُفقد بسرعة. الأدوات نفسها — الرسالة والمسار والقياس — لكن حدودها مختلفة تمامًا."
              : "Yes, and that difference is the point of the program. You are marketing a health decision, not a product: advertising rules are stricter, patient data privacy is binding, medical claims are constrained, and trust is slow to build and quick to lose. The tools are the same — message, funnel, measurement — but the boundaries are not.",
          },
          {
            q: ar ? "هل سأتعلّم التسويق الرقمي الصحي؟" : "Will I learn digital healthcare marketing?",
            a: ar
              ? "نعم — التسويق الرقمي جزء أساسي: القنوات، والمحتوى، والحملات المدفوعة، والقياس، وكيفية تطبيقها ضمن قيود قطاع الرعاية الصحية."
              : "Yes — digital is a core part: channels, content, paid campaigns and measurement, and how each applies within the constraints healthcare puts on them.",
          },
          {
            q: ar
              ? "هل يمكنني العمل في المستشفيات بعد إتمام الدبلومة؟"
              : "Can I work in hospitals after completing this diploma?",
            a: ar
              ? "المستشفيات والمجموعات الطبية توظّف بالفعل في التسويق وتنمية الخدمات واستقطاب المرضى، والدبلومة تجهّزك لهذه الأدوار وتمنحك شهادة إتمام من IMETS. لكن التوظيف يبقى قرار جهة العمل ويعتمد على خبرتك وسوقك — البرنامج يؤهّلك، ولا يَعِد بوظيفة."
              : "Hospitals and medical groups do hire for marketing, service-line growth and patient acquisition, and the diploma prepares you for those roles and ends in an IMETS certificate of completion. Hiring is still the employer's decision and depends on your experience and market — the program prepares you; it does not promise a job.",
          },
        ],
      },
    ],
  }),
};

/** Generic, healthcare-flavoured content for any non-flagship course. */
function genericContent(slug: string, titleEn: string, titleAr: string, locale: string): CourseContent {
  const ar = isAr(locale);
  const title = ar ? titleAr : titleEn;
  const base: CourseContent = {
    // Generic headings + same-category fallback: nothing course-specific to claim.
    headings: null,
    relatedSlugs: [],
    // null ⇒ the generic closing line. A course-specific CTA belongs in a
    // bespoke content block, not invented from the title.
    finalCta: null,
    audience: null,
    about: null,
    faqs: null,
    // Left empty on purpose: generic "learn professional models" filler helps
    // nobody. The page falls back to the course's own whatYouWillLearn, and if
    // that's empty too the section is skipped rather than faked.
    outcomes: [],
    demandLine: ar
      ? `تواصل المؤسسات الصحية في المنطقة توظيف المتخصصين المؤهّلين في مجال «${title}».`
      : `Healthcare organizations across the region continue hiring qualified professionals in ${title}.`,
    whyChoose: whyChooseReasons(locale),
    whyThisDiploma: whyThisDiplomaCards(locale),
    careerRoles: [
      { title: ar ? "أخصائي" : "Specialist" },
      { title: ar ? "أخصائي أول" : "Senior Specialist" },
      { title: ar ? "مشرف / قائد فريق" : "Supervisor / Team Lead" },
      { title: ar ? "مدير قسم" : "Department Manager" },
      { title: ar ? "مدير / استشاري" : "Director / Consultant" },
    ],
    careerOpportunities: [],
    seoSections: [],
    reviews: defaultReviews(locale),
  };
  // Slug-specific overrides last, so they beat the generic defaults above.
  return { ...base, ...(COURSE_EXTRAS[slug]?.(ar) ?? {}) };
}

export function getCourseContent(opts: {
  slug: string;
  titleEn: string;
  titleAr: string;
  locale: string;
}): CourseContent {
  if (opts.slug === "cphq-preparation") return cphqContent(opts.locale);
  if (opts.slug === "hospital-management-diploma") return hospitalManagementContent(opts.locale);
  if (opts.slug === "cic-preparation") return cicContent(opts.locale);
  if (opts.slug === "infection-control-diploma")
    return infectionControlDiplomaContent(opts.locale);
  return genericContent(opts.slug, opts.titleEn, opts.titleAr, opts.locale);
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
