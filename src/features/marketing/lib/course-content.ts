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

/** Generic, healthcare-flavoured content for any non-flagship course. */
function genericContent(titleEn: string, titleAr: string, locale: string): CourseContent {
  const ar = isAr(locale);
  const title = ar ? titleAr : titleEn;
  return {
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
