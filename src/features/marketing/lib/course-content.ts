/**
 * Long-form, conversion-focused content for the course detail page.
 *
 * Everything here is derived per-course + per-locale so the same detail page can
 * render a rich, "sells itself" experience for any course, while CPHQ (our flagship)
 * gets fully bespoke copy. Sections that don't apply to a course simply return
 * `undefined`/`[]` and the page skips them.
 */

export type CareerRole = {
  title: string;
  /** One line on what the role does. Optional — a title-only rung is valid. */
  description?: string;
};
export type CareerOpportunity = {
  title: string;
  /** One-line role description — keeps the card scannable but richer. */
  description: string;
  /** e.g. "Mid–Senior Level" */
  level: string;
  emoji: string;
};
export type FaqItem = { q: string; a: string; group?: string };
export type FaqGroup = { title: string; items: FaqItem[] };
/**
 * A Knowledge Center topic group (one numbered timeline card). `key` matches the
 * `group` on the `knowledgeCenter` FaqItems that belong to it; `emoji` is the
 * per-topic icon (emojis, not lucide, so the data can cross the server→client
 * boundary). Order in the array = order of the cards.
 */
export type KnowledgeGroup = { key: string; en: string; ar: string; emoji: string };
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
   * "Knowledge Center" — an SEO accordion of long (200–300 word) educational
   * answers, all server-rendered so the copy lives in the page HTML while the
   * UI stays short and scannable (each item collapsed by default). Builds
   * topical authority without spinning up extra pages. Optional; omit for most
   * courses.
   */
  knowledgeCenter?: FaqItem[] | null;
  /**
   * Ordered topic groups for the Knowledge Center timeline (label + emoji per
   * card). Each group's `key` matches the `group` on its `knowledgeCenter`
   * items. Program-specific, so every course frames its own topics/icons.
   */
  knowledgeGroups?: KnowledgeGroup[] | null;
  /** Knowledge Center H2 (keyword-first, already localized). */
  knowledgeTitle?: string | null;
  /** One-line intro under the Knowledge Center H2 (already localized). */
  knowledgeIntro?: string | null;
  /** Knowledge Center closing CTA heading (already localized). */
  knowledgeCta?: string | null;
  /**
   * Conversion-focused "Program & Enrollment" FAQ (sales questions) shown as the
   * left column beside the Knowledge Center. Optional; omit for most courses.
   */
  salesFaq?: FaqItem[] | null;
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
  const has = (...keys: string[]) =>
    keys.some((k) => t.includes(k.toLowerCase()));

  // Course-specific matches FIRST. Several course names share the words
  // "hospital" / "management" / "healthcare", so the generic branches further
  // down would otherwise swallow them (e.g. "Advanced Hospital & Strategic
  // Management" would resolve as Operations).
  if (has("fundamental", "أساسيات")) {
    return ar
      ? [
          "قراءة هيكل المستشفى وحوكمته وخطوط التبعية",
          "حساب مؤشرات التشغيل الأساسية (الإشغال، متوسط الإقامة، دوران الأسرّة)",
          "الإلمام بالخدمات المساندة والتأهّب للطوارئ",
        ]
      : [
          "Read a hospital's structure, governance and reporting lines",
          "Calculate core operational metrics (occupancy, ALOS, bed turnover)",
          "Map support services and emergency preparedness",
        ];
  }
  if (has("strategic", "strategy", "استراتيج")) {
    return ar
      ? [
          "بناء خطة استراتيجية متوائمة مع الرؤية والرسالة",
          "تحليل البيئة الداخلية والخارجية (SWOT وPESTLE)",
          "متابعة التنفيذ بمؤشرات الأداء وبطاقة الأداء المتوازن",
        ]
      : [
          "Build a strategic plan aligned to vision and mission",
          "Analyze the internal and external environment (SWOT, PESTLE)",
          "Track execution with KPIs and a Balanced Scorecard",
        ];
  }
  if (has("supply chain", "سلسلة الإمداد", "إمداد")) {
    return ar
      ? [
          "تخطيط المشتريات واختيار المورّدين",
          "ضبط المخزون ومستوياته وتواريخ الصلاحية",
          "ضمان تدفّق المستلزمات إلى نقاط الرعاية",
        ]
      : [
          "Plan procurement and supplier selection",
          "Control inventory levels, stock and expiry",
          "Keep supplies flowing to points of care",
        ];
  }

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
  if (has("hr", "human resource", "موارد بشرية")) {
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
  if (has("financ", "budget", "cost", "تمويل", "موازنة", "تكلف")) {
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
  if (
    has("leadership", "management", "قيادة", "إدارة") &&
    !has("hospital", "operations", "مستشف", "تشغيل")
  ) {
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
  const has = (...keys: string[]) =>
    keys.some((k) => t.includes(k.toLowerCase()));

  // Course-specific matches FIRST — see the note in resolveModuleOutcomes.
  if (has("fundamental", "أساسيات")) {
    return ar
      ? ["أنظمة صحية", "الهيكل والحوكمة", "التشغيل"]
      : ["Health Systems", "Governance", "Operations"];
  }
  if (has("strategic", "strategy", "استراتيج")) {
    return ar
      ? ["الاستراتيجية", "التحليل", "بطاقة الأداء المتوازن"]
      : ["Strategy", "Analysis", "Balanced Scorecard"];
  }
  if (has("supply chain", "سلسلة الإمداد", "إمداد")) {
    return ar
      ? ["المشتريات", "المخزون", "اللوجستيات"]
      : ["Procurement", "Inventory", "Logistics"];
  }

  if (has("quality", "accreditation", "جودة", "اعتماد")) {
    return ar
      ? ["تحسين الجودة", "سلامة المرضى", "مؤشرات الأداء"]
      : ["Quality Improvement", "Patient Safety", "Performance"];
  }
  if (has("hr", "human resource", "موارد بشرية")) {
    return ar
      ? ["الموارد البشرية", "الكوادر", "الأداء"]
      : ["HR", "Staffing", "Performance"];
  }
  if (has("financ", "budget", "cost", "تمويل", "موازنة", "تكلف")) {
    return ar
      ? ["التمويل", "الميزانية", "التكلفة"]
      : ["Finance", "Budget", "Cost"];
  }
  if (
    has("leadership", "management", "قيادة", "إدارة") &&
    !has("hospital", "operations", "مستشف", "تشغيل")
  ) {
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
function whyThisDiplomaCards(
  locale: string,
): { title: string; body: string }[] {
  const ar = isAr(locale);
  return [
    {
      title: ar
        ? "دبلومة معترف بها دوليًا"
        : "Internationally Recognized Diploma",
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
      title: ar
        ? "مهارات تشغيل وتمويل وجودة"
        : "Operations, Finance & Quality Skills",
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
      role: ar
        ? "منسّق اعتماد المستشفيات"
        : "Hospital Accreditation Coordinator",
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
function cphqKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return [
    { key: "certification", en: "Certification", ar: "الشهادة", emoji: "🔖" },
    { key: "eligibility", en: "Eligibility", ar: "الأهلية", emoji: "✅" },
    { key: "exam", en: "The Exam", ar: "الامتحان", emoji: "📝" },
    { key: "career", en: "Career", ar: "المسار المهني", emoji: "💼" },
    { key: "preparation", en: "Preparation", ar: "التحضير", emoji: "📘" },
    { key: "quality", en: "Healthcare Quality", ar: "جودة الرعاية", emoji: "📊" },
  ];
}

function cphqKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar ? "ما هي شهادة CPHQ؟" : "What is the CPHQ Certification?",
      group: "certification",
      a: ar
        ? "شهادة CPHQ (المتخصص المعتمد في جودة الرعاية الصحية) هي المؤهل المعترف به دوليًا للمتخصصين الذين يقودون جودة الرعاية الصحية وسلامة المرضى. تمنحها HQCC — لجنة اعتماد جودة الرعاية الصحية — وهي الذراع المانحة لجمعية NAHQ (الجمعية الوطنية لجودة الرعاية الصحية). والحصول على شهادة CPHQ يؤكّد لأصحاب العمل ومقيّمي الاعتماد والزملاء أنك تفهم علم وممارسة جودة الرعاية الصحية على مستوى احترافي.\n\nصُمّمت شهادة CPHQ لتكون قائمة على الكفاءات، فهي تعكس المسؤوليات الحقيقية لأخصائي جودة الرعاية الصحية: قيادة الجودة وبنيتها، وتحسين الأداء والعمليات، وتحليل البيانات الصحية، وسلامة المرضى، والجاهزية التنظيمية للاعتماد. ولأن شهادة CPHQ تغطّي نطاق جودة الرعاية الصحية كاملًا، أصبحت المؤهل المرجعي في هذا المجال، وكثيرًا ما تُدرَج كمؤهل مطلوب أو مفضّل لأدوار الجودة.\n\nوفي السعودية والإمارات وقطر وعُمان ومصر، تتزايد قيمة شهادة CPHQ مع رفع برامج الاعتماد مثل CBAHI وGAHAR وJCI لسقف توقعاتها. والحصول على شهادة CPHQ من HQCC/NAHQ قد يفتح أبواب المناصب المتقدمة في الجودة وسلامة المرضى، وزيادة الدخل، وتأثيرًا أكبر على نتائج المرضى. كما تُحافَظ شهادة CPHQ عبر التعليم المستمر، فالمؤهل النشط يعكس دائمًا معرفة حديثة في جودة الرعاية الصحية."
        : "The CPHQ Certification (Certified Professional in Healthcare Quality) is the internationally recognized credential for professionals who lead healthcare quality and patient safety. It is awarded by HQCC — the Healthcare Quality Certification Commission — the certifying arm of NAHQ, the National Association for Healthcare Quality. Earning the CPHQ Certification tells employers, accreditation surveyors, and colleagues that you understand the science and practice of healthcare quality at a professional level.\n\nThe CPHQ Certification is competency-based, so it reflects the real responsibilities of a healthcare quality professional: quality leadership and structure, performance and process improvement, health data analytics, patient safety, and regulatory and accreditation readiness. Because the CPHQ Certification spans the full scope of healthcare quality, it has become the benchmark credential in the field and is often listed as a preferred or required qualification for quality roles.\n\nAcross Saudi Arabia, the UAE, Qatar, Oman, and Egypt, hospitals increasingly value the CPHQ Certification as accreditation programs such as CBAHI, GAHAR, and JCI raise their expectations. Holding the CPHQ Certification from HQCC/NAHQ can open doors to senior quality and patient-safety positions, higher earning potential, and greater influence over patient outcomes. The CPHQ Certification is also maintained over time through continuing education, so an active credential always reflects current, up-to-date healthcare quality knowledge.",
    },
    {
      q: ar ? "ما هي NAHQ وHQCC؟" : "What are NAHQ and HQCC?",
      group: "certification",
      a: ar
        ? "NAHQ — الجمعية الوطنية لجودة الرعاية الصحية — هي الهيئة المهنية التي تُعرّف الكفاءات التي تقوم عليها شهادة CPHQ، بينما HQCC (لجنة اعتماد جودة الرعاية الصحية) هي اللجنة المستقلة التي تملك الامتحان وتديره. ومعًا تضعان المعايير وإطار الكفاءات والامتحان الذي يمنح شهادة CPHQ معناها.\n\nوبوصفها الجهة صاحبة السلطة خلف المؤهل، تحافظ NAHQ على نزاهة شهادة CPHQ وقيمتها عالميًا. فهي تضع المحتوى عبر إطار كفاءات جودة الرعاية الصحية من NAHQ، وتُدير الامتحان من خلال HQCC، وتحكم إعادة الاعتماد حتى يُبقي الحاصلون معرفتهم محدّثة. ولأن NAHQ معترف بها دوليًا، تحمل شهادة CPHQ ثقلًا عبر الدول، بما فيها الخليج ومصر.\n\nوعندما يطلب أصحاب العمل شهادة CPHQ، فهم يعتمدون على عملية NAHQ وHQCC الصارمة لتأكيد كفاءة المتخصص في جودة الرعاية الصحية. باختصار، NAHQ/HQCC هي السلطة خلف شهادة CPHQ — وهي سبب الثقة بها كمرجع عالمي. (ملاحظة: IMETS جهة تدريب مستقلة وليست تابعة لـ NAHQ أو HQCC.)"
        : "NAHQ — the National Association for Healthcare Quality — is the professional body that defines the competencies behind the CPHQ Certification, and HQCC, the Healthcare Quality Certification Commission, is the independent commission that owns and administers the exam. Together they develop the standards, the competency framework, and the examination that give the CPHQ Certification its meaning.\n\nAs the authority behind the credential, NAHQ maintains the integrity and value of the CPHQ Certification worldwide. It sets the content through the NAHQ Healthcare Quality Competency Framework, delivers the exam through HQCC, and governs recertification, so certified professionals keep their knowledge current. Because NAHQ is recognized internationally, the CPHQ Certification carries weight across countries, including throughout the Gulf and Egypt.\n\nWhen employers ask for the CPHQ Certification, they are relying on NAHQ and HQCC's rigorous process to confirm a professional's competence in healthcare quality. In short, NAHQ/HQCC is the authority behind the CPHQ Certification — the reason the credential is trusted as a global benchmark. (Note: IMETS is an independent training provider and is not affiliated with NAHQ or HQCC.)",
    },
    {
      q: ar ? "من الذي ينبغي أن يدخل امتحان CPHQ؟" : "Who Should Take the CPHQ Exam?",
      group: "eligibility",
      a: ar
        ? "امتحان CPHQ مُصمّم لأخصائي جودة الرعاية الصحية المستعد لإثبات خبرته بمؤهل معترف به. فإذا كنت تعمل — أو تنتقل — إلى إدارة الجودة أو سلامة المرضى أو الاعتماد أو إدارة المخاطر أو تحسين الأداء، فإن امتحان CPHQ هو الخطوة التالية الطبيعية. ويدخل امتحان CPHQ أطباء وممرضون وصيادلة وأطباء أسنان وإداريو مستشفيات ومحللو بيانات.\n\nلا تفرض NAHQ شروط أهلية صارمة لدخول امتحان CPHQ؛ فهي توصي بنحو عامين من الخبرة في جودة الرعاية الصحية، لكن الامتحان متاح للمتخصصين المستعدين لإثبات الكفاءات. وهذا يجعل شهادة CPHQ في متناول كوادر الجودة ذوي الخبرة والقادمين الجدد المجتهدين في التحضير على حدٍّ سواء.\n\nوالقاسم المشترك بين المتقدّمين لـ امتحان CPHQ هو المسؤولية عن جودة الرعاية الصحية وسلامة المرضى — أو الطموح إليها. فإذا كان عملك اليومي يمسّ مؤشرات الجودة أو الجاهزية للاعتماد أو تحسين العمليات، وتريد اعترافًا رسميًا كأخصائي جودة رعاية صحية، فإن امتحان CPHQ لك."
        : "The CPHQ Exam is designed for the healthcare quality professional ready to prove their expertise with a recognized credential. If you work in — or are moving into — quality management, patient safety, accreditation, risk, or performance improvement, the CPHQ Exam is the natural next step. Physicians, nurses, pharmacists, dentists, hospital administrators, and data analysts all sit the CPHQ Exam.\n\nNAHQ does not impose strict eligibility requirements to sit the CPHQ Exam; it recommends around two years of experience in healthcare quality, but the exam is open to professionals who are ready to demonstrate the competencies. This makes the CPHQ Certification accessible to both experienced quality staff and capable newcomers who prepare thoroughly.\n\nThe common thread among CPHQ Exam candidates is responsibility for — or ambition toward — healthcare quality and patient safety. If your daily work touches quality indicators, accreditation readiness, or process improvement, and you want formal recognition as a healthcare quality professional, the CPHQ Exam is for you.",
    },
    {
      q: ar ? "كيف تجتاز امتحان CPHQ؟" : "How to Pass the CPHQ Exam?",
      group: "exam",
      a: ar
        ? "اجتياز امتحان CPHQ يعتمد على تحضير منظّم لا على الحظ. فامتحان CPHQ اختبار محوسب متعدد الخيارات يغطّي نطاق جودة الرعاية الصحية كاملًا، ولذلك فإن أضمن طريق إلى شهادة CPHQ هو دورة تحضير لشهادة CPHQ مركّزة مع تدرّب مستمر. ابدأ بمراجعة إطار كفاءات جودة الرعاية الصحية من NAHQ، ثم نظّم دراستك حول مجالاته حتى لا يبقى أي جزء من امتحان CPHQ دون تغطية.\n\nولأن امتحان CPHQ يختبر الحكم التطبيقي لا الحفظ، تدرّب على عدد كبير من الأسئلة بأسلوب الامتحان؛ فالدورة الجيدة تشرح سبب صحة كل إجابة، فتبني التفكير الذي يكافئه امتحان CPHQ. وامنح نفسك جدولًا واقعيًا — يستعدّ معظم المتقدّمين خلال عدة أسابيع من الدراسة المنتظمة إلى جانب العمل — وأدِّ امتحانًا تجريبيًا كاملًا واحدًا على الأقل بظروف موقوتة حتى يألف عقلك امتحان CPHQ الحقيقي.\n\nيوم الامتحان، اقرأ كل سؤال في امتحان CPHQ بعناية، واستبعد الخيارات الخاطئة بوضوح، وثِق بتحضيرك. واربط كل سؤال بممارسة الجودة الحقيقية — البيانات والتحسين وسلامة المرضى والاعتماد — لأن شهادة CPHQ مصمّمة لتعكس العمل نفسه. مع دورة تحضير قوية وتدرّب مقصود وثقة بخبرتك، يصبح امتحان CPHQ قابلًا للاجتياز."
        : "Passing the CPHQ Exam takes structured preparation, not luck. The CPHQ Exam is a computer-based, multiple-choice test that covers the full breadth of healthcare quality, so the most reliable route to the CPHQ Certification is a focused CPHQ Preparation Course combined with consistent practice. Start by reviewing the NAHQ Healthcare Quality Competency Framework, then organize your study around its domains so no area of the CPHQ Exam is left uncovered.\n\nBecause the CPHQ Exam tests applied judgment rather than memorization, work through plenty of exam-style questions; a good CPHQ Preparation Course explains why each answer is correct, building the reasoning the CPHQ Exam rewards. Give yourself a realistic timeline — most candidates prepare over several weeks of steady study alongside work — and take at least one full mock exam under timed conditions so the real CPHQ Exam feels familiar.\n\nOn exam day, read each CPHQ Exam question carefully, eliminate clearly wrong options, and trust your preparation. Connect each question to real quality practice — data, improvement, patient safety, accreditation — because the CPHQ Certification is built to reflect the work itself. With a strong CPHQ Preparation Course, deliberate practice, and confidence in your experience, the CPHQ Exam is very passable.",
    },
    {
      q: ar
        ? "ماذا يفعل أخصائي جودة الرعاية الصحية؟"
        : "What Does a Healthcare Quality Professional Do?",
      group: "career",
      a: ar
        ? "يحمي أخصائي جودة الرعاية الصحية المرضى ويقوّي المؤسسة عبر تصميم وتشغيل الأنظمة التي تقيس الرعاية وتحسّنها. ومهمته الأساسية رفع جودة الرعاية الصحية وسلامة المرضى — بتقليل الأخطاء وتحسين النتائج ومساعدة المستشفى على استيفاء معايير الاعتماد مثل CBAHI وGAHAR وJCI.\n\nيوميًا، يجمع أخصائي جودة الرعاية الصحية البيانات الصحية ويحلّلها، ويتتبّع مؤشرات الجودة وقياسات الأداء (KPIs)، ويحدّد أين يلزم تحسين الأداء والعمليات. ويقود مشاريع التحسين بأساليب مثل PDSA وLean وSix Sigma، ويطوّر السياسات، ويدقّق الالتزام، ويثقّف الفرق الإكلينيكية. وعند وقوع حوادث سلامة المرضى يقود تحليل الأسباب الجذرية ويضع ضوابط لمنع تكرارها.\n\nولأن الجودة تمسّ كل قسم، يتعاون أخصائي جودة الرعاية الصحية عبر المؤسسة كلها، محوّلًا البيانات إلى إجراءات وباني ثقافة سلامة. والحصول على شهادة CPHQ يُثبت قدرتك على أداء هذا العمل بمستوى احترافي، ولهذا يفتح أبواب أدوار مثل منسّق الجودة، ومسؤول سلامة المرضى، ومدير الاعتماد، ومدير الجودة."
        : "A healthcare quality professional protects patients and strengthens the organization by designing and running the systems that measure and improve care. The core mission is to raise the quality of care and patient safety — reducing errors, improving outcomes, and helping the hospital meet accreditation standards such as CBAHI, GAHAR, and JCI.\n\nDay to day, the healthcare quality professional collects and analyzes health data, tracks quality indicators and KPIs, and identifies where performance and process improvement is needed. They lead improvement projects using methods such as PDSA, Lean, and Six Sigma, develop policies, audit compliance, and educate clinical teams. When patient-safety events occur, they lead root-cause analysis and put controls in place to prevent recurrence.\n\nBecause quality touches every department, the healthcare quality professional collaborates across the whole organization, turning data into action and building a culture of safety. Earning the CPHQ Certification signals that you can do this work at a professional standard, which is why it opens doors to roles such as Quality Coordinator, Patient Safety Officer, Accreditation Manager, and Director of Quality.",
    },
    {
      q: ar
        ? "ما هي دورة التحضير لشهادة CPHQ؟"
        : "What is the CPHQ Preparation Course?",
      group: "preparation",
      a: ar
        ? "دورة التحضير لشهادة CPHQ هي برنامج تدريبي منظّم يُجهّزك لاجتياز امتحان CPHQ بثقة. فبدلًا من أن تذاكر بمفردك، تنظّم دورة التحضير لشهادة CPHQ إطار كفاءات NAHQ في مسار واضح أسبوعًا بأسبوع، بحيث يُغطّى كل مجال من مجالات امتحان CPHQ بشكل منهجي.\n\nالدورة مصمّمة للمتخصص العامل الذي يحتاج تحضيرًا مركّزًا وفعّالًا إلى جانب عمله بدوام كامل. من خلال دورة التحضير لشهادة CPHQ تراجع المفاهيم الأساسية — قيادة الجودة، وتحليل البيانات الصحية، وتحسين الأداء والعمليات، وسلامة المرضى، والاعتماد — وتتدرّب على أسئلة بأسلوب الامتحان، وتتعلّم كيف يصيغ امتحان CPHQ سيناريوهاته، فتتحوّل المعرفة إلى مهارة جاهزة للامتحان.\n\nصمّمت IMETS دورة التحضير لشهادة CPHQ خصيصًا لمتخصصي الخليج ومصر، مع جلسات مباشرة يقودها خبراء، وتسجيلات، وامتحان تجريبي واقعي لـ امتحان CPHQ. وبنهايتها تكون جاهزًا لدخول امتحان CPHQ وأكثر كفاءةً في دور جودة الرعاية الصحية. باختصار، دورة التحضير لشهادة CPHQ هي الجسر بين خبرتك ونجاحك في امتحان CPHQ. (IMETS جهة تدريب مستقلة تُعِدّك لشهادة CPHQ ولا تمنحها.)"
        : "The CPHQ Preparation Course is a structured training program that gets you ready to pass the CPHQ Exam with confidence. Rather than leaving you to study alone, the CPHQ Preparation Course organizes the NAHQ competency framework into a clear, week-by-week path, so every domain of the CPHQ Exam is covered systematically.\n\nThe course is built for the working professional who needs efficient, focused preparation alongside a full-time job. Through the CPHQ Preparation Course you review core concepts — quality leadership, health data analytics, performance and process improvement, patient safety, and accreditation — practice exam-style questions, and learn how the CPHQ Exam frames scenarios, turning knowledge into exam-ready skill.\n\nIMETS designed its CPHQ Preparation Course specifically for professionals in the Gulf and Egypt, with live expert-led sessions, recordings, and a realistic mock CPHQ Exam. By the end, you are ready to sit the CPHQ Exam and better equipped to perform in a healthcare quality role. In short, the CPHQ Preparation Course is the bridge between your experience and success on the CPHQ Exam. (IMETS is an independent training provider and prepares candidates for, but does not award, the CPHQ Certification.)",
    },
    {
      q: ar
        ? "لماذا تُعدّ جودة الرعاية الصحية مهمة في المستشفيات؟"
        : "Why is Healthcare Quality Important in Hospitals?",
      group: "quality",
      a: ar
        ? "جودة الرعاية الصحية من أهم أسس الرعاية الحديثة، لأنها تُحدّد ما إذا كان المريض يتلقّى علاجًا آمنًا وفعّالًا ومتّسقًا. وجودة الرعاية الصحية القوية تمنع الأخطاء الطبية، وتقلّل الأذى الممكن تجنّبه، وتُقصّر مدة الإقامة، وتحسّن النتائج — بينما الجودة الضعيفة تُكلّف مالًا وثقةً وأرواحًا.\n\nوتعتمد جودة الرعاية الصحية الفعّالة على القياس: تتتبّع المستشفيات مؤشرات الجودة، وتراقب حوادث سلامة المرضى، وتحلّل البيانات الصحية لمعرفة أين يمكن تحسين الرعاية. ثم تحوّل إدارة الجودة تلك الرؤى إلى إجراءات عبر تحسين الأداء والعمليات، والسياسات الموحّدة، وتثقيف الطاقم. وكل عنصر مصمّم لجعل الرعاية الجيدة موثوقة لا عرضية.\n\nوإلى جانب سلامة المرضى، تُعدّ جودة الرعاية الصحية محورية للاعتماد. فبرامج مثل CBAHI وGAHAR وJCI تُقيّم أداء الجودة وسلامة المرضى عن كثب، والنتائج الضعيفة قد تُهدّد الاعتماد. وحين تكون جودة الرعاية الصحية قوية، يكون المرضى أكثر أمانًا، ويعمل الطاقم ضمن أنظمة موثوقة، وتكسب المؤسسة الثقة — لهذا الجودة ليست خيارًا بل ضرورة، ولهذا تحظى شهادة CPHQ بكل هذه القيمة."
        : "Healthcare quality is one of the most important foundations of modern care, because it determines whether patients receive safe, effective, and consistent treatment. Strong healthcare quality prevents medical errors, reduces avoidable harm, shortens length of stay, and improves outcomes — while weak quality costs money, trust, and lives.\n\nEffective healthcare quality relies on measurement: hospitals track quality indicators, monitor patient-safety events, and analyze health data to see where care can improve. Quality management then turns those insights into action through performance and process improvement, standardized policies, and staff education. Every element is designed to make good care reliable rather than accidental.\n\nBeyond patient safety, healthcare quality is central to accreditation. Programs such as CBAHI, GAHAR, and JCI evaluate a hospital's quality and patient-safety performance closely, and weak results can jeopardize accreditation. When healthcare quality is strong, patients are safer, staff work within reliable systems, and the institution earns trust — which is why quality is not optional but essential, and why the CPHQ Certification is so valued.",
    },
    {
      q: ar
        ? "شرح تحسين الجودة وسلامة المرضى"
        : "Quality Improvement & Patient Safety Explained",
      group: "quality",
      a: ar
        ? "تحسين الجودة هو الجهد المنضبط والمستمر لجعل الرعاية أفضل، وسلامة المرضى هي هدفه الأهم. وهو ليس مشروعًا واحدًا، بل دورة متصلة: قياس الأداء الحالي، وتحديد مشكلة، واختبار تغيير، والتحقّق مما إذا نجح — غالبًا بنماذج مثل PDSA وLean وSix Sigma.\n\nوتركّز سلامة المرضى تحديدًا على منع الأذى — أخطاء الدواء، والعدوى المرتبطة بالرعاية الصحية، والسقوط، وغيرها من الأحداث الضائرة. والبرنامج الناضج للجودة يدرس هذه الأحداث دون إلقاء لوم، ويُجري تحليلًا للأسباب الجذرية، ويبني ضمانات في النظام حتى يقلّ احتمال تكرار الخطأ نفسه. ويقود تحليل البيانات الصحية هذا الجهد كلّه، مبيّنًا أين يتركّز الخطر وهل صمدت التحسينات.\n\nومعًا، يشكّل تحسين الجودة وسلامة المرضى جوهر عمل أخصائي جودة الرعاية الصحية وقلب شهادة CPHQ. وتتوقّع جهات الاعتماد من المستشفيات إثبات كليهما، ولهذا فإن المهارات التي تؤكّدها شهادة CPHQ — البيانات والتحسين والسلامة — في طلب متزايد عبر الخليج ومصر."
        : "Quality improvement is the disciplined, ongoing effort to make care better, and patient safety is its most important goal. Rather than a single project, quality improvement is a continuous cycle: measure current performance, identify a problem, test a change, and check whether it worked — often using models such as PDSA, Lean, or Six Sigma.\n\nPatient safety focuses specifically on preventing harm — medication errors, healthcare-associated infections, falls, and other adverse events. A mature quality program studies these events without blame, performs root-cause analysis, and builds safeguards into the system so the same error is less likely to happen again. Health data analytics guides the whole effort, showing where risk concentrates and whether improvements hold.\n\nTogether, quality improvement and patient safety form the core of the healthcare quality professional's work and the heart of the CPHQ Certification. Accreditation bodies expect hospitals to demonstrate both, which is why the skills validated by the CPHQ Certification — data, improvement, and safety — are in growing demand across the Gulf and Egypt.",
    },
  ];
}

/**
 * CPHQ "Program & Enrollment" sales FAQ — conversion questions beside the
 * Knowledge Center. Honest: no invented duration/price, and the certificate
 * answer separates the IMETS certificate from the HQCC/NAHQ-awarded CPHQ.
 */
function cphqSalesFaq(ar: boolean): FaqItem[] {
  return [
    {
      q: ar ? "لمن هذا البرنامج؟" : "Who should join this program?",
      a: ar
        ? "البرنامج مثالي لمتخصصي الرعاية الصحية العاملين في — أو المنتقلين إلى — جودة الرعاية الصحية وسلامة المرضى والاعتماد: الأطباء والممرضون والصيادلة وأطباء الأسنان وإداريو المستشفيات ومحللو البيانات الذين يستعدّون لامتحان CPHQ. وإذا كان دورك يمسّ مؤشرات الجودة أو الجاهزية للاعتماد فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في الجودة."
        : "This program is ideal for healthcare professionals working in — or moving into — healthcare quality, patient safety, and accreditation: physicians, nurses, pharmacists, dentists, hospital administrators, and data analysts preparing for the CPHQ exam. If your role touches quality indicators or accreditation readiness, it is built for you, and fresh graduates aiming for a quality career are welcome too.",
    },
    {
      q: ar ? "هل البرنامج مباشر أم مسجّل؟" : "Is the program live or recorded?",
      a: ar
        ? "كلاهما. يُقدَّم البرنامج عبر جلسات مباشرة أونلاين يقودها خبراء ويمكنك طرح أسئلتك فيها مباشرةً — وتُسجَّل كل جلسة وتُضاف إلى حسابك لتعيد مشاهدتها في أي وقت دون أن يفوتك شيء إذا طرأت وردية أو حالة طارئة."
        : "Both. It is delivered through live, expert-led online sessions where you can ask questions in real time — and every session is recorded and added to your account, so you can rewatch anytime and never miss a thing if a shift or emergency comes up.",
    },
    {
      q: ar ? "هل سأحصل على شهادة؟" : "Will I receive a certificate?",
      a: ar
        ? "نعم. عند إتمام البرنامج تحصل على شهادة إتمام موثّقة من IMETS Medical School تضيفها إلى سيرتك الذاتية وحسابك على LinkedIn. لاحظ أنها شهادة من IMETS — أما مؤهل CPHQ نفسه فتمنحه لجنة HQCC (التابعة لـ NAHQ) بعد اجتياز امتحانه، ودورنا هو إعدادك له."
        : "Yes. On completing the program you receive a verifiable certificate of completion from IMETS Medical School to add to your CV and LinkedIn. Please note this is an IMETS certificate — the CPHQ credential itself is awarded separately by HQCC (part of NAHQ) after you pass its exam; our program prepares you for it.",
    },
    {
      q: ar ? "ما مدة البرنامج؟" : "How long is the program?",
      a: ar
        ? "يمتد البرنامج على عدة أسابيع من الدراسة المنظّمة بدوام جزئي — مزيج من جلسات مباشرة أسبوعية ومواد بوتيرتك تناسب عملًا بدوام كامل، وهو مُوزّع لتغطّي محتوى CPHQ كاملًا دون ضغط. ولمعرفة الجدول القادم وتاريخ البدء بدقة، اضغط «قدّم الآن» وسيؤكّد لك المستشار التفاصيل."
        : "It runs over several weeks of structured, part-time study — a mix of live weekly sessions and self-paced material you can fit around a full-time job, paced so you cover the full CPHQ content without cramming. For the exact upcoming schedule and start date, tap Apply Now and an advisor will confirm the details.",
    },
    {
      q: ar ? "كيف أسجّل؟" : "How do I register?",
      a: ar
        ? "التسجيل بسيط: اضغط «قدّم الآن» واملأ النموذج القصير، وسيتواصل معك مستشار القبول لتأكيد مقعدك والإجابة عن أسئلتك وإتمام التسجيل. ويمكنك أيضًا التواصل معنا عبر واتساب إن فضّلت الحديث أولًا."
        : "Registering is simple: tap Apply Now and fill in the short form, and an admissions advisor will contact you to confirm your seat, answer your questions, and complete enrollment. You can also reach us on WhatsApp if you'd prefer to talk it through first.",
    },
    {
      q: ar ? "ما خيارات الدفع؟" : "What are the payment options?",
      a: ar
        ? "نوفّر خيارات دفع مرنة ويمكننا إصدار الفاتورة بعملتك المحلية. ولضمان الدقة حسب بلدك وأي عروض أو خطط تقسيط حالية، اضغط «قدّم الآن» أو راسلنا عبر واتساب وسيشرح لك المستشار الخيارات المتاحة ويؤكّد الإجمالي."
        : "We offer flexible payment options and can bill in your local currency. To keep things accurate for your country and any current offers or instalment plans, tap Apply Now or message us on WhatsApp and an advisor will walk you through the available options and confirm the total.",
    },
  ];
}

function cphqContent(locale: string): CourseContent {
  const ar = isAr(locale);
  return {
    headings: {
      whyChoose: ar
        ? "لماذا تختار برنامج CPHQ من IMETS"
        : "Why Choose the IMETS CPHQ Preparation Program",
      audience: ar
        ? "لمن برنامج CPHQ هذا"
        : "Who Should Join This CPHQ Preparation Program",
      learn: ar
        ? "ماذا ستتعلّم في برنامج CPHQ"
        : "What You'll Learn in This CPHQ Preparation Program",
      careers: ar
        ? "الفرص المهنية بعد شهادة CPHQ"
        : "Career Opportunities After CPHQ Certification",
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
        ? [
            "برنامج IMETS للتحضير لشهادة CPHQ يساعدك على بناء معرفة عملية، والاستعداد بثقة لامتحان CPHQ الدولي، وتطوير مهارات تقدّرها المستشفيات في جميع أنحاء الشرق الأوسط.",
          ]
        : [
            "The IMETS CPHQ Preparation Program helps you build practical knowledge, prepare confidently for the international CPHQ certification, and develop skills valued by hospitals across the Middle East.",
          ],
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
    // Certification facts are quoted from NAHQ, fetched 2026-07-18:
    //   - Governing body, NCCA accreditation, "held in 60+ countries":
    //     https://nahq.org/credentials/cphq-certified-professional-in-healthcare-quality/
    //   - No formal eligibility (2 yrs recommended), 125 scored + 15 pretest
    //     questions, 3-hour limit, online remote-proctor or test centre via PSI:
    //     https://nahq.org/.../cphq-certified-professional-in-healthcare-quality/apply/
    // Program facts (10 weeks, 8 domains, ONE comprehensive mock + 500+ practice
    // questions) are the live course record's own copy — keep them in step with
    // it. No salary figure: there is no sourced CPHQ pay number for this region.
    faqs: [
      {
        title: ar ? "عن شهادة CPHQ" : "About the CPHQ Certification",
        items: [
          {
            q: ar
              ? "ما هي شهادة CPHQ؟"
              : "What is the CPHQ certification?",
            a: ar
              ? "شهادة CPHQ (أخصائي معتمد في جودة الرعاية الصحية) هي الشهادة المهنية المتخصصة في جودة الرعاية الصحية وسلامة المرضى. تصدرها لجنة Healthcare Quality Certification Commission ‏(HQCC)، ذراع الاعتماد في الجمعية الوطنية لجودة الرعاية الصحية ‏(NAHQ)، وتغطي قيادة الجودة، وسلامة المرضى، وتحسين الأداء والعمليات، وتحليل البيانات الصحية، والعمل التنظيمي والاعتماد."
              : "The Certified Professional in Healthcare Quality (CPHQ) is the professional certification for healthcare quality and patient safety. It is awarded by the Healthcare Quality Certification Commission (HQCC), the certifying arm of the National Association for Healthcare Quality (NAHQ), and covers quality leadership, patient safety, performance and process improvement, health data analytics, and regulatory and accreditation work.",
          },
          {
            q: ar
              ? "هل شهادة CPHQ معترف بها دوليًا؟"
              : "Is CPHQ recognized internationally?",
            a: ar
              ? "نعم. تصف NAHQ شهادة CPHQ بأنها الشهادة المعتمدة الوحيدة في جودة الرعاية الصحية — فهي معتمدة من National Commission for Certifying Agencies ‏(NCCA) — وتذكر أنها يحملها متخصصون في أكثر من 60 دولة. وهي معترف بها على نطاق واسع في مستشفيات الخليج والشرق الأوسط، حيث تُقدّر برامج الاعتماد الكوادر الحاصلة على شهادات في الجودة."
              : "Yes. NAHQ describes CPHQ as the only accredited certification in healthcare quality — it is accredited by the National Commission for Certifying Agencies (NCCA) — and reports that it is held by professionals in more than 60 countries. It is widely recognised across hospitals in the GCC and the wider Middle East, where accreditation programs value quality-certified staff.",
          },
          {
            q: ar
              ? "لمن شهادة CPHQ؟"
              : "Who should take CPHQ?",
            a: ar
              ? "تناسب شهادة CPHQ كل من يعمل في جودة الرعاية الصحية وسلامة المرضى — أو يرغب في الانتقال إليها: الأطباء، والتمريض، والصيادلة، وأطباء الأسنان، وإداريو المستشفيات، وحديثو التخرج الذين يستهدفون أول دور في الجودة. إذا كان عملك يمسّ الاعتماد أو سلامة المرضى أو تحسين الأداء، فإن الشهادة توثّق تلك الخبرة رسميًا."
              : "CPHQ suits anyone who works on — or wants to move into — healthcare quality and patient safety: physicians, nurses, pharmacists, dentists, hospital administrators, and fresh graduates aiming for a first quality role. If your work touches accreditation, patient safety, or performance improvement, the credential formalises that expertise.",
          },
          {
            q: ar
              ? "هل أحتاج خبرة في الجودة؟"
              : "Do I need quality experience?",
            a: ar
              ? "لا. لا تضع NAHQ أي شرط أهلية رسمي لدخول امتحان CPHQ — فهي توصي بنحو عامين من الخبرة في جودة الرعاية الصحية لكنها لا تشترطها. وبرنامجنا مصمَّم بحيث يستطيع الأطباء وحديثو التخرج بلا خلفية في الجودة أن يبدأوا من الأساسيات ويستعدّوا بثقة."
              : "No. NAHQ sets no formal eligibility requirement to sit the CPHQ exam — it recommends around two years of healthcare quality experience but does not require it. Our program is built so that clinicians and fresh graduates with no quality background can start from the fundamentals and prepare with confidence.",
          },
        ],
      },
      {
        title: ar ? "الامتحان" : "The Exam",
        items: [
          {
            q: ar
              ? "ما مدى صعوبة الامتحان؟"
              : "How difficult is the exam?",
            a: ar
              ? "امتحان CPHQ امتحان واحد يُؤدّى على الحاسب: 125 سؤالًا محتسبًا بالإضافة إلى 15 سؤالًا تجريبيًا غير محتسب، بحدٍّ أقصى ثلاث ساعات. وهو يكافئ الاستعداد المنظّم عبر جميع مجالات الجودة لا الحفظ — وهو تحديدًا ما بُني عليه برنامجنا الممتد 10 أسابيع."
              : "The CPHQ is a single computer-based exam: 125 scored questions plus 15 unscored pretest questions, with a three-hour limit. It rewards structured preparation across all the quality domains rather than memorisation — which is exactly what our 10-week program is built around.",
          },
          {
            q: ar
              ? "هل الامتحان أونلاين؟"
              : "Is the exam online?",
            a: ar
              ? "نعم — تتيح NAHQ امتحان CPHQ أونلاين مع مراقب مباشر عن بُعد، أو حضوريًا في مركز اختبار، فتختار ما يناسبك؛ ويُقدَّم عبر شريك الاختبارات PSI. لاحظ أن الامتحان نفسه يُحجَز ويُؤدّى مع NAHQ/PSI — ودور برنامجنا هو إعدادك له، لا عقد الامتحان."
              : "Yes — NAHQ offers the CPHQ exam both online with a live remote proctor and in person at a test center, so you can choose whichever suits you; it is delivered through NAHQ's testing partner, PSI. Note the exam itself is booked and sat with NAHQ/PSI — our program prepares you for it, it does not administer the exam.",
          },
        ],
      },
      {
        title: ar ? "برنامج IMETS" : "The IMETS Program",
        items: [
          {
            q: ar
              ? "كم يستغرق التحضير؟"
              : "How long does preparation take?",
            a: ar
              ? "يمتد برنامج التحضير لشهادة CPHQ لدينا على 10 أسابيع، ويجمع بين جلسات مباشرة يقودها خبراء ومواد ذاتية التعلّم تغطّي مجالات CPHQ الثمانية كاملة. ومعظم المتقدّمين يكونون جاهزين لدخول الامتحان بنهاية البرنامج، بوتيرة تناسب المهنيين العاملين الذين يدرسون إلى جانب عمل بدوام كامل."
              : "Our CPHQ Preparation Program runs for 10 weeks, combining live expert-led sessions with self-paced material covering all eight CPHQ domains. Most candidates are ready to sit the exam by the end of the program, at a pace that suits working professionals studying alongside a full-time job.",
          },
          {
            q: ar
              ? "كم عدد الامتحانات التجريبية المتضمَّنة؟"
              : "How many mock exams are included?",
            a: ar
              ? "يتضمّن البرنامج امتحانًا تجريبيًا شاملًا واحدًا يحاكي الامتحان الحقيقي، بالإضافة إلى بنك من أكثر من 500 سؤال تدريبي بأسلوب الامتحان تعمل عليها أثناء دراسة كل مجال. ومعًا يتيحان لك التدرّب على ظروف الامتحان واكتشاف نقاط ضعفك قبل الموعد الفعلي."
              : "The program includes one full, comprehensive mock exam that mirrors the real test, plus a bank of 500+ exam-style practice questions you work through as you study each domain. Together they let you rehearse exam conditions and find your weak areas before the real thing.",
          },
          {
            q: ar
              ? "هل تساعدني IMETS بعد الدورة؟"
              : "Will IMETS help after the course?",
            a: ar
              ? "نعم. تحتفظ بالوصول إلى تسجيلات الجلسات ومواد الدورة لتواصل المراجعة حتى موعد امتحانك، ويبقى مدرّبونا ومجتمع الطلاب متاحين لأسئلة الامتحان والإرشاد. فالدعم لا يتوقف يوم انتهاء الجلسات المباشرة."
              : "Yes. You keep access to the session recordings and course materials so you can keep revising right up to your exam date, and our instructors and student community stay available for exam questions and guidance. Support doesn't stop the day the live sessions end.",
          },
        ],
      },
    ],
    knowledgeCenter: cphqKnowledgeCenter(ar),
    knowledgeGroups: cphqKnowledgeGroups(ar),
    knowledgeTitle: ar
      ? "مركز معرفة شهادة CPHQ"
      : "CPHQ Certification Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن شهادة CPHQ والأهلية وامتحان NAHQ/HQCC ومسارات جودة الرعاية الصحية وكيفية التحضير بنجاح."
      : "Everything you need to know about the CPHQ certification, eligibility, the NAHQ/HQCC exam, healthcare quality careers, and how to prepare successfully.",
    knowledgeCta: ar
      ? "جاهز لبدء رحلتك نحو شهادة CPHQ؟"
      : "Ready to Start Your CPHQ Journey?",
    salesFaq: cphqSalesFaq(ar),
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
      heading: ar
        ? "مستعد لقيادة الجودة في مستشفاك؟"
        : "Ready to Lead Quality in Your Hospital?",
      body: ar
        ? "استعد لامتحان CPHQ مع دفعة من متخصصي الجودة في الشرق الأوسط."
        : "Prepare for the CPHQ exam alongside a cohort of quality professionals across the Middle East.",
    },
    whyChoose: whyChooseReasons(locale),
    whyThisDiploma: whyThisDiplomaCards(locale),
    careerRoles: [
      {
        title: ar ? "أخصائي جودة رعاية صحية" : "Healthcare Quality Specialist",
      },
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
        heading: ar
          ? "لماذا تصبح متخصصًا في جودة الرعاية الصحية؟"
          : "Why Become a Healthcare Quality Professional?",
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
    knowledgeCenter: hospitalMgmtKnowledgeCenter(ar),
    knowledgeGroups: hospitalMgmtKnowledgeGroups(ar),
    knowledgeTitle: ar
      ? "مركز معرفة إدارة المستشفيات"
      : "Hospital Management Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن دبلومة إدارة المستشفيات — محتواها، ولمن هي، والفرص المهنية التي تفتحها، وشهادة IMETS، ولماذا تهمّ إدارة الرعاية الصحية."
      : "Everything you need to know about the Hospital Management Diploma — what it covers, who it's for, the careers it opens, your IMETS certificate, and why healthcare management matters.",
    knowledgeCta: ar
      ? "جاهز للانتقال إلى قيادة الرعاية الصحية؟"
      : "Ready to Step Into Healthcare Leadership?",
    salesFaq: diplomaSalesFaq(
      ar,
      "This program is ideal for clinicians and administrators moving toward — or already in — a leadership role in healthcare: physicians, nurses, and pharmacists stepping into management, department managers, coordinators, and clinic owners. If you want to lead people, processes, and resources in a healthcare setting, it is built for you, and fresh graduates aiming for a management career are welcome too.",
      "البرنامج مثالي للإكلينيكيين والإداريين المنتقلين إلى — أو العاملين بالفعل في — دور قيادي في الرعاية الصحية: الأطباء والممرضون والصيادلة المنتقلون إلى الإدارة، ومديرو الأقسام والمنسّقون وأصحاب العيادات. وإذا أردت قيادة الأفراد والعمليات والموارد في بيئة صحية فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في الإدارة.",
    ),
    headings: {
      whyChoose: ar
        ? "لماذا تختار دبلومة إدارة المستشفيات من IMETS"
        : "Why Choose the IMETS Hospital Management Diploma",
      audience: ar
        ? "لمن دبلومة إدارة المستشفيات هذه"
        : "Who Should Join This Hospital Management Diploma",
      learn: ar
        ? "ماذا ستتعلّم في دبلومة إدارة المستشفيات"
        : "What You'll Learn in This Hospital Management Diploma",
      careers: ar
        ? "الفرص المهنية بعد دبلومة إدارة المستشفيات"
        : "Career Opportunities After a Hospital Management Diploma",
    },
    relatedSlugs: [
      "healthcare-quality-management-diploma",
      "healthcare-strategic-management-diploma",
      "healthcare-hr-management-diploma",
    ],
    finalCta: {
      heading: ar
        ? "مستعد لقيادة تشغيل المستشفى؟"
        : "Ready to Lead Hospital Operations?",
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
            q: ar
              ? "كم يستغرق إنهاء البرنامج؟"
              : "How long does it take to finish?",
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
            q: ar
              ? "هل يمكنني الدراسة وأنا أعمل بدوام كامل؟"
              : "Can I study while working full-time?",
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
            q: ar
              ? "هل يعترف أصحاب العمل بهذه الدبلومة؟"
              : "Do employers recognize this diploma?",
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
            q: ar
              ? "هل سيساعدني هذا في الترقية؟"
              : "Will this help me get promoted?",
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
      {
        title: ar
          ? "مدير / استشاري رعاية صحية"
          : "Healthcare Director / Consultant",
      },
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
/**
 * CIC "Knowledge Center" — long-form, keyword-rich educational answers shown as
 * a collapsed accordion so the full copy lives in the page HTML (topical
 * authority + natural keyword coverage) while the UI stays short and scannable.
 * English is the SEO payload; Arabic mirrors it for the /ar page. CIC/CBIC facts
 * match `cicContent` above (IMETS is an independent trainer, not CBIC).
 */
function cicKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return [
    { key: "certification", en: "Certification", ar: "الشهادة", emoji: "🔖" },
    { key: "eligibility", en: "Eligibility", ar: "الأهلية", emoji: "✅" },
    { key: "exam", en: "The Exam", ar: "الامتحان", emoji: "📝" },
    { key: "career", en: "Career", ar: "المسار المهني", emoji: "💼" },
    { key: "preparation", en: "Preparation", ar: "التحضير", emoji: "📘" },
    {
      key: "infection-prevention",
      en: "Infection Prevention",
      ar: "الوقاية من العدوى",
      emoji: "🛡️",
    },
  ];
}

function cicKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar ? "ما هي شهادة CIC؟" : "What is the CIC Certification?",
      group: "certification",
      a: ar
        ? "شهادة CIC (شهادة الوقاية من العدوى ومكافحتها) هي المؤهل المعترف به دوليًا للمتخصصين الذين يقودون الوقاية من العدوى. تصدرها CBIC — مجلس اعتماد مكافحة العدوى وعلم الأوبئة — وهي الجهة المستقلة التي تضع شهادة CIC وتديرها. الحصول على شهادة CIC يؤكد لأصحاب العمل والزملاء والمرضى أنك تفهم علم وممارسة الوقاية من العدوى على مستوى متقدم.\n\nصمّمت CBIC شهادة CIC لتكون قائمة على الممارسة، فهي تعكس المسؤوليات الحقيقية لأخصائي الوقاية من العدوى: الترصّد والتحرّي الوبائي، والتنظيف والتطهير والتعقيم، ومنع انتقال العدوى، والصحة المهنية، والإدارة. ولأن شهادة CIC تغطي نطاق الوقاية من العدوى كاملًا، أصبحت المؤهل المرجعي في هذا المجال.\n\nوفي الخليج ومصر والشرق الأوسط، تُدرج المستشفيات شهادة CIC بشكل متزايد كمؤهل مطلوب أو مفضّل لأدوار الوقاية من العدوى، خاصة مع رفع برامج الاعتماد لسقف توقعاتها. والحصول على شهادة CIC من CBIC قد يفتح أبواب المناصب المتقدمة، وزيادة الدخل، وتأثيرًا أكبر على سلامة المرضى. باختصار، شهادة CIC — التي تحكمها CBIC — تُثبت قدرتك على حماية المرضى والطاقم عبر وقاية فعّالة من العدوى."
        : "The CIC Certification (Certification in Infection Prevention and Control) is the internationally recognized credential for professionals who lead infection prevention. It is awarded by CBIC — the Certification Board of Infection Control and Epidemiology — the independent body that develops and administers the CIC Certification. Earning the CIC Certification tells employers, colleagues, and patients that you understand the science and practice of infection prevention at an advanced level.\n\nCBIC designed the CIC Certification to be practice-based, so it reflects the real responsibilities of an infection prevention professional: surveillance and epidemiologic investigation; cleaning, disinfection and sterilization; preventing transmission; occupational health; and management. Because the CIC Certification covers the full scope of infection prevention, it has become the benchmark credential in the field.\n\nAcross the Gulf, Egypt, and the wider Middle East, hospitals increasingly list the CIC Certification as a required or preferred qualification for infection prevention roles, especially as accreditation programs raise their expectations. Holding the CIC Certification from CBIC can open doors to senior infection prevention positions, higher earning potential, and greater influence over patient safety. In short, the CIC Certification — governed by CBIC — validates your ability to protect patients and staff through effective infection prevention. The CIC Certification is also maintained over time through CBIC recertification, so an active CIC Certification always reflects current, up-to-date infection prevention knowledge.",
    },
    {
      q: ar ? "ما هي دورة التحضير لشهادة CIC؟" : "What is the CIC Preparation Course?",
      group: "preparation",
      a: ar
        ? "دورة التحضير لشهادة CIC هي برنامج تدريبي منظّم يُجهّزك لاجتياز امتحان CIC بثقة. فبدلًا من أن تذاكر بمفردك، تنظّم دورة التحضير لشهادة CIC محتوى CBIC كاملًا في مسار واضح أسبوعًا بأسبوع، بحيث يُغطّى كل مجال من مجالات امتحان CIC بشكل منهجي.\n\nالدورة مصمّمة لأخصائي الوقاية من العدوى العامل الذي يحتاج إلى تحضير مركّز وفعّال إلى جانب عمله بدوام كامل. من خلال دورة التحضير لشهادة CIC تُراجع المفاهيم الأساسية، وتتدرّب على أسئلة بأسلوب الامتحان، وتتعلّم كيف يصيغ امتحان CIC سيناريوهاته — فتتحوّل المعرفة إلى مهارة جاهزة للامتحان. والدورة الجيدة لا تحفظ الحقائق فحسب، بل تُنمّي التفكير الذي يستخدمه أخصائي الوقاية من العدوى يوميًا.\n\nصمّمت IMETS دورة التحضير لشهادة CIC خصيصًا لمتخصصي الخليج ومصر، مع جلسات مباشرة يقودها خبراء، وتسجيلات، وامتحان تجريبي واقعي لـ امتحان CIC. وبنهاية دورة التحضير لشهادة CIC يكون أخصائي الوقاية من العدوى جاهزًا لدخول امتحان CIC وأكثر كفاءةً في أداء دوره. باختصار، دورة التحضير لشهادة CIC هي الجسر بين خبرتك كأخصائي وقاية من العدوى ونجاحك في امتحان CIC."
        : "The CIC Preparation Course is a structured training program that gets you ready to pass the CIC Exam with confidence. Rather than leaving you to study alone, the CIC Preparation Course organizes the entire CBIC content outline into a clear, week-by-week path, so every domain of the CIC Exam is covered systematically.\n\nThe course is built for the working Infection Prevention Specialist who needs efficient, focused preparation alongside a full-time job. Through the CIC Preparation Course you review core concepts, work through exam-style practice questions, and learn how the CIC Exam frames scenarios — turning knowledge into exam-ready skill. A good CIC Preparation Course develops the reasoning an Infection Prevention Specialist uses daily, not just recall of facts.\n\nIMETS designed its CIC Preparation Course specifically for professionals in the Gulf and Egypt, with live expert-led sessions, recordings, and a realistic mock CIC Exam. By the end of the CIC Preparation Course, the Infection Prevention Specialist is ready to sit the CIC Exam and better equipped to perform in the role. In short, the CIC Preparation Course is the bridge between your experience as an Infection Prevention Specialist and success on the CIC Exam.",
    },
    {
      q: ar ? "من الذي ينبغي أن يدخل امتحان CIC؟" : "Who Should Take the CIC Exam?",
      group: "eligibility",
      a: ar
        ? "امتحان CIC مُصمّم لأخصائي مكافحة العدوى (Infection Control Professional) المستعد لإثبات خبرته بمؤهل معترف به. فإذا كنت تعمل أخصائي وقاية من العدوى (Infection Prevention Specialist) — سواء في مستشفى أو عيادة أو مرفق رعاية طويلة الأمد أو الصحة العامة — فإن امتحان CIC هو الخطوة التالية الطبيعية في مسارك.\n\nيدخل امتحان CIC ممرضون وأطباء وأخصائيو ميكروبيولوجيا وعلماء مختبرات وممارسو صحة عامة انتقلوا إلى أدوار مكافحة العدوى في المستشفى (Hospital Infection Control). والقاسم المشترك هو المسؤولية المباشرة عن أنشطة الوقاية من العدوى ومكافحتها: فكل من يقود أو يدعم برنامج مكافحة العدوى في المستشفى يستفيد من امتحان CIC.\n\nعادةً ما يمتلك أخصائي مكافحة العدوى المتقدّم لامتحان CIC خبرة عملية في الترصّد واحتياطات العزل والتحقيق في الفاشيات وتثقيف الطاقم. كما أن امتحان CIC مثالي لـ أخصائي الوقاية من العدوى الذي يرغب في الانتقال إلى منصب أعلى في مكافحة العدوى بالمستشفى أو قيادة برنامج كامل. فإذا كان عملك اليومي يمسّ مكافحة العدوى في المستشفى وتريد اعترافًا رسميًا كـ أخصائي مكافحة عدوى، فإن امتحان CIC لك."
        : "The CIC Exam is designed for the Infection Control Professional who is ready to prove their expertise with a recognized credential. If you work as an Infection Prevention Specialist — whether in a hospital, clinic, long-term care facility, or public health setting — the CIC Exam is the natural next step in your career.\n\nNurses, physicians, microbiologists, laboratory scientists, and public health practitioners who have moved into Hospital Infection Control roles all sit the CIC Exam. The common thread is direct responsibility for infection prevention and control activities: anyone leading or supporting a Hospital Infection Control program benefits from the CIC Exam.\n\nAn Infection Control Professional preparing for the CIC Exam typically has hands-on experience in surveillance, isolation precautions, outbreak investigation, and staff education. The CIC Exam is also ideal for the Infection Prevention Specialist who wants to move into a senior Hospital Infection Control position or lead an entire program. If your daily work touches Hospital Infection Control, and you want formal recognition as an Infection Control Professional, the CIC Exam is for you.",
    },
    {
      q: ar ? "ماذا يفعل أخصائي الوقاية من العدوى؟" : "What Does an Infection Prevention Specialist Do?",
      group: "career",
      a: ar
        ? "يحمي أخصائي الوقاية من العدوى (Infection Prevention Specialist) المرضى والطاقم والزوّار عبر تصميم وتشغيل برنامج فعّال للوقاية من العدوى (Infection Prevention Program). ومهمته الأساسية هي خفض العدوى المرتبطة بالرعاية الصحية (Healthcare Associated Infections – HAIs) — أي العدوى التي يكتسبها المرضى أثناء تلقّي الرعاية.\n\nلتحقيق ذلك، يُجري أخصائي الوقاية من العدوى ترصّدًا لاكتشاف العدوى المرتبطة بالرعاية الصحية (HAIs) مبكرًا، ويحقّق في التجمّعات والفاشيات، ويتتبّع الاتجاهات التي تكشف أين يحتاج برنامج الوقاية من العدوى إلى تحسين. ويطوّر يوميًا سياسات لنظافة اليدين واحتياطات العزل والعناية بالأجهزة والتنظيف البيئي، ثم يثقّف الفرق الإكلينيكية لالتزامها.\n\nويعتمد أي برنامج وقاية من العدوى قوي على أخصائي الوقاية من العدوى في مراقبة الالتزام وتدقيق الممارسة ورفع البيانات للإدارة وجهات الاعتماد. وعندما ترتفع العدوى المرتبطة بالرعاية الصحية (HAIs)، يقود أخصائي الوقاية من العدوى الاستجابة: تحديد المصدر، وتطبيق الضوابط، والتحقّق من نجاحها. وهو يتعاون عبر المؤسسة كلها لأن كل قسم يؤثّر في برنامج الوقاية من العدوى. باختصار، يحوّل أخصائي الوقاية من العدوى الأدلّة إلى إجراءات تُبقي العدوى المرتبطة بالرعاية الصحية (HAIs) في أدنى مستوى ممكن."
        : "An Infection Prevention Specialist protects patients, staff, and visitors by designing and running an effective Infection Prevention Program. The core mission of the Infection Prevention Specialist is to reduce Healthcare Associated Infections (HAIs) — infections that patients acquire while receiving care.\n\nTo do this, the Infection Prevention Specialist conducts surveillance to detect Healthcare Associated Infections (HAIs) early, investigates clusters and outbreaks, and tracks trends that reveal where the Infection Prevention Program needs to improve. Day to day, the Infection Prevention Specialist develops policies for hand hygiene, isolation precautions, device care, and environmental cleaning, then educates clinical teams to follow them.\n\nA strong Infection Prevention Program also relies on the Infection Prevention Specialist to monitor compliance, audit practice, and report data to leadership and accreditation bodies. When Healthcare Associated Infections (HAIs) rise, the Infection Prevention Specialist leads the response — identifying the source, implementing controls, and verifying that they work. Because every department affects the Infection Prevention Program, the Infection Prevention Specialist collaborates across the whole organization, turning evidence into action and keeping Healthcare Associated Infections (HAIs) as low as possible. In many hospitals, the Infection Prevention Specialist also supports antimicrobial stewardship and staff safety, extending the reach of the Infection Prevention Program well beyond preventing Healthcare Associated Infections (HAIs) alone.",
    },
    {
      q: ar ? "لماذا تُعدّ مكافحة العدوى مهمة في المستشفيات؟" : "Why is Infection Control Important in Hospitals?",
      group: "infection-prevention",
      a: ar
        ? "مكافحة العدوى (Infection Control) من أهم ضمانات الرعاية الصحية الحديثة، لأن المستشفيات تجمع في مكان واحد مرضى أكثر هشاشة، وإجراءات باضعة، وكائنات مقاومة للأدوية. ومكافحة العدوى الفعّالة في المستشفى (Hospital Infection Control) تمنع العدوى المرتبطة بالرعاية الصحية (Healthcare Associated Infections) التي قد تُطيل الإقامة وترفع التكاليف وتُودي بالأرواح.\n\nوالوقاية من العدوى (Infection Prevention) القوية تحمي المرضى والطاقم المعرّض يوميًا للمُمْرِضات. فبدون مكافحة عدوى محكمة، قد يتحوّل خطأ واحد إلى فاشية تنتشر عبر الأجنحة والعناية المركزة وغرف العمليات. وتخفض مكافحة العدوى في المستشفى العدوى المرتبطة بالرعاية الصحية عبر ممارسات قائمة على الأدلّة: نظافة اليدين، والتقنية المعقّمة، واحتياطات العزل، والحقن الآمن، والتنظيف البيئي — وكلها مصمّمة لكسر سلسلة انتقال العدوى.\n\nوإلى جانب سلامة المرضى، تُعدّ مكافحة العدوى في المستشفى محورية للاعتماد: فبرامج مثل CBAHI وGAHAR وJCI تُقيّم أداء الوقاية من العدوى ومكافحة العدوى عن كثب، والنتائج الضعيفة قد تُهدّد الاعتماد. كما أن العدوى المرتبطة بالرعاية الصحية محرّك رئيسي لمقاومة مضادات الميكروبات، فتدعم مكافحة العدوى الفعّالة ترشيد المضادات الحيوية. وعندما تكون مكافحة العدوى في المستشفى قوية، يتعافى المرضى أسرع، ويبقى الطاقم أكثر أمانًا، وتكسب المؤسسة الثقة. لهذا تُعدّ مكافحة العدوى ضرورةً لا خيارًا."
        : "Infection Control is one of the most important safeguards in modern healthcare, because hospitals concentrate vulnerable patients, invasive procedures, and multidrug-resistant organisms in one place. Effective Hospital Infection Control prevents Healthcare Associated Infections — infections patients acquire during care — which can prolong stays, increase costs, and cost lives.\n\nStrong Infection Prevention protects not only patients but also staff, who face daily exposure to pathogens. Without robust Infection Control, a single lapse can turn into an outbreak that spreads through wards, intensive care units, and operating theatres. Hospital Infection Control reduces Healthcare Associated Infections through evidence-based practices: hand hygiene, sterile technique, isolation precautions, safe injection practices, and environmental cleaning. Every element of Infection Prevention is designed to break the chain of transmission before an infection can take hold.\n\nBeyond patient safety, Hospital Infection Control is central to accreditation: programs such as CBAHI, GAHAR, and JCI evaluate a hospital's Infection Prevention and Infection Control performance closely, and weak results can jeopardize accreditation. Healthcare Associated Infections are also a major driver of antimicrobial resistance, so effective Infection Control supports antibiotic stewardship. When Hospital Infection Control is strong, patients recover faster, staff stay safer, and the institution earns trust — which is why Infection Control is not optional but essential to safe, high-quality care. Strong Hospital Infection Control also shortens hospital stays and reduces antibiotic use, so investing in Infection Prevention and reducing Healthcare Associated Infections protects budgets as well as patients.",
    },
    {
      q: ar ? "كيف تجتاز امتحان CIC؟" : "How to Pass the CIC Exam?",
      group: "exam",
      a: ar
        ? "اجتياز امتحان CIC يعتمد على تحضير منظّم لا على الحظ. فامتحان CIC واسع يغطّي كل مجالات الوقاية من العدوى، ولذلك فإن أضمن طريق إلى شهادة CIC هو دورة تحضير لشهادة CIC مركّزة مع تدرّب مستمر. ابدأ بمراجعة محتوى CBIC، ثم استخدم دورة التحضير لشهادة CIC لتنظيم دراستك حوله حتى لا يبقى أي جزء من امتحان CIC دون تغطية.\n\nولأن امتحان CIC يختبر الحكم التطبيقي لا الحفظ، تدرّب على عدد كبير من الأسئلة بأسلوب الامتحان؛ فالدورة الجيدة تشرح سبب صحة كل إجابة، فتبني التفكير الذي يكافئه امتحان CIC. وامنح نفسك جدولًا واقعيًا — يستعدّ معظم المتقدّمين لـ امتحان CIC خلال عدة أسابيع من الدراسة المنتظمة إلى جانب العمل. وأدِّ امتحانًا تجريبيًا كاملًا واحدًا على الأقل بظروف موقوتة حتى يألف عقلك امتحان CIC الحقيقي؛ وأفضل دورة تحضير لشهادة CIC تتضمّن امتحانًا تجريبيًا شاملًا.\n\nيوم الامتحان، اقرأ كل سؤال في امتحان CIC بعناية، واستبعد الخيارات الخاطئة بوضوح، وثِق بتحضيرك. وتذكّر أن شهادة CIC مصمّمة لتعكس الممارسة الحقيقية، فاربط كل سؤال بما تفعله فعلًا في الوقاية من العدوى. وبعد أن تنجح وتحصل على شهادة CIC، حافظ عليها عبر التعليم المستمر. مع دورة تحضير لشهادة CIC قوية وتدرّب مقصود وثقة بخبرتك، يصبح امتحان CIC قابلًا للاجتياز و شهادة CIC في متناولك."
        : "Passing the CIC Exam takes structured preparation, not luck. The CIC Exam is broad, covering every domain of infection prevention, so the most reliable route to the CIC Certification is a focused CIC Preparation Course combined with consistent practice. Start by reviewing the CBIC content outline, then use a CIC Preparation Course to organize your study around it, so no area of the CIC Exam is left uncovered.\n\nBecause the CIC Exam tests applied judgment rather than memorization, work through plenty of exam-style questions; a good CIC Preparation Course explains why each answer is correct, building the reasoning the CIC Exam rewards. Give yourself a realistic timeline — most candidates prepare for the CIC Exam over several weeks of steady study alongside work. Take at least one full mock exam under timed conditions so the real CIC Exam feels familiar; the best CIC Preparation Course includes a comprehensive mock.\n\nOn exam day, read each CIC Exam question carefully, eliminate clearly wrong options, and trust your preparation. Remember that the CIC Certification is designed to reflect real practice, so connect each CIC Exam question to what you actually do in infection prevention. After you pass and earn the CIC Certification, maintain it through continuing education. With a strong CIC Preparation Course, deliberate practice, and confidence in your experience, the CIC Exam is very passable — and the CIC Certification is well within reach.",
    },
    {
      q: ar ? "ما هي CBIC؟" : "What is CBIC?",
      group: "certification",
      a: ar
        ? "CBIC — مجلس اعتماد مكافحة العدوى وعلم الأوبئة — هي المنظمة المستقلة غير الربحية التي تملك شهادة CIC وتديرها. تضع CBIC المعايير والمحتوى والامتحان الذي يُعرّف شهادة CIC، بما يضمن أن يعكس المؤهل ممارسة حديثة قائمة على الأدلّة في الوقاية من العدوى.\n\nوبوصفها الجهة المانحة، تتحمّل CBIC مسؤولية الحفاظ على نزاهة شهادة CIC وقيمتها عالميًا. فهي تضع شروط الأهلية لـ شهادة CIC، وتُدير الامتحان، وتحكم إعادة الاعتماد حتى يُبقي الحاصلون معرفتهم محدّثة. ولأن CBIC معترف بها دوليًا، تحمل شهادة CIC التي تصدرها ثقلًا عبر الدول، بما فيها الخليج ومصر.\n\nوعندما يطلب أصحاب العمل شهادة CIC، فهم يعتمدون على عملية CBIC الصارمة لتأكيد كفاءة المتخصص. باختصار، CBIC هي الجهة صاحبة السلطة خلف شهادة CIC — وهي السبب في أن يُوثَق بهذا المؤهل كمرجع عالمي في الوقاية من العدوى. (ملاحظة: IMETS جهة تدريب مستقلة وليست تابعة لـ CBIC.)"
        : "CBIC — the Certification Board of Infection Control and Epidemiology — is the independent, non-profit organization that owns and administers the CIC Certification. CBIC develops the standards, content outline, and examination that define the CIC Certification, ensuring the credential reflects current, evidence-based infection prevention practice.\n\nAs the certifying body, CBIC is responsible for maintaining the integrity and value of the CIC Certification worldwide. CBIC sets the eligibility requirements for the CIC Certification, delivers the exam, and governs recertification, so holders keep their knowledge current. Because CBIC is recognized internationally, the CIC Certification it awards carries weight across countries, including throughout the Gulf and Egypt.\n\nWhen employers ask for the CIC Certification, they are relying on CBIC's rigorous process to confirm a professional's competence. In short, CBIC is the authority behind the CIC Certification — the reason the credential is trusted as the global benchmark in infection prevention. (Note: IMETS is an independent training provider and is not affiliated with CBIC.)",
    },
    {
      q: ar ? "شرح برنامج الوقاية من العدوى" : "Infection Prevention Program Explained",
      group: "infection-prevention",
      a: ar
        ? "برنامج الوقاية من العدوى (Infection Prevention Program) هو المنظومة المنظّمة على مستوى المستشفى التي تُبقي المرضى والطاقم بأمان من العدوى. وهو ليس سياسة واحدة، بل إطار منسّق من الترصّد والبروتوكولات والتثقيف والمراقبة يقود مكافحة العدوى في المستشفى (Hospital Infection Control).\n\nفي أساسه، يُحدّد برنامج الوقاية من العدوى كيف تمارس المؤسسة الوقاية من العدوى (Infection Prevention): معايير نظافة اليدين، واحتياطات العزل، وحزم العناية بالأجهزة، والتنظيف والتطهير، والتعامل الآمن مع المستلزمات المعقّمة. والبرنامج الناضج يقيس الأداء باستمرار — يتتبّع معدلات العدوى، ويدقّق الالتزام، ويعيد النتائج للفرق الإكلينيكية حتى تتحسّن مكافحة العدوى في المستشفى بمرور الوقت.\n\nكما يُهيّئ برنامج الوقاية من العدوى المستشفى للفاشيات، بخطوات تصعيد وخطط استجابة واضحة. ولا ينجح دون دعم القيادة والكوادر الكافية وأنظمة البيانات، لأن مكافحة العدوى في المستشفى تحتاج موارد ومساءلة. وتفحص جهات الاعتماد برنامج الوقاية من العدوى عن قرب، فتؤثّر وثائقه ونتائجه مباشرةً في مكانة المستشفى. وكل قسم يُسهم فيه، ولذلك يمتدّ برنامج الوقاية من العدوى عبر المنشأة كلها. وحين يُدار جيدًا، يُرسّخ البرنامج الوقاية من العدوى في الممارسة اليومية ويجعل مكافحة العدوى القوية في المستشفى هي القاعدة."
        : "An Infection Prevention Program is the organized, hospital-wide system that keeps patients and staff safe from infection. Rather than a single policy, the Infection Prevention Program is a coordinated framework of surveillance, protocols, education, and monitoring that drives Hospital Infection Control.\n\nAt its foundation, the Infection Prevention Program defines how the organization practices Infection Prevention: hand hygiene standards, isolation precautions, device-care bundles, cleaning and disinfection, and safe handling of sterile supplies. A mature Infection Prevention Program continuously measures performance — tracking infection rates, auditing compliance, and feeding results back to clinical teams so Hospital Infection Control improves over time.\n\nThe Infection Prevention Program also prepares the hospital for outbreaks, with clear escalation steps and response plans. Leadership support, adequate staffing, and data systems are essential, because Hospital Infection Control cannot succeed without resources and accountability. Accreditation bodies examine the Infection Prevention Program closely, so its documentation and outcomes directly affect a hospital's standing. Every department contributes, which is why the Infection Prevention Program spans the entire facility. Done well, the Infection Prevention Program embeds Infection Prevention into daily practice and makes strong Hospital Infection Control the norm.",
    },
  ];
}

/**
 * CIC "Program & Enrollment" sales FAQ — the conversion questions shown beside
 * the Knowledge Center. Kept short and honest: no invented duration/price, and
 * the certificate answer separates the IMETS certificate from the CBIC-awarded
 * CIC credential.
 */
function cicSalesFaq(ar: boolean): FaqItem[] {
  return [
    {
      q: ar ? "لمن هذا البرنامج؟" : "Who should join this program?",
      a: ar
        ? "البرنامج مثالي لمتخصصي الرعاية الصحية العاملين في الوقاية من العدوى ومكافحتها أو المنتقلين إليها: ممرضو مكافحة العدوى، وكوادر الجودة وسلامة المرضى، والإكلينيكيون الذين يستعدّون لامتحان CIC. وإذا كان دورك يمسّ الوقاية من العدوى في مستشفى أو عيادة فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في مكافحة العدوى."
        : "This program is ideal for healthcare professionals working in — or moving into — infection prevention and control: infection control nurses, quality and patient-safety staff, and clinicians preparing for the CIC exam. If your role touches infection prevention in a hospital or clinic, it is built for you, and fresh graduates aiming for an infection-control career are welcome too.",
    },
    {
      q: ar ? "هل البرنامج مباشر أم مسجّل؟" : "Is the program live or recorded?",
      a: ar
        ? "كلاهما. يُقدَّم البرنامج عبر جلسات مباشرة أونلاين يقودها خبراء ويمكنك طرح أسئلتك فيها مباشرةً — وتُسجَّل كل جلسة وتُضاف إلى حسابك لتعيد مشاهدتها في أي وقت دون أن يفوتك شيء إذا طرأت وردية أو حالة طارئة."
        : "Both. It is delivered through live, expert-led online sessions where you can ask questions in real time — and every session is recorded and added to your account, so you can rewatch anytime and never miss a thing if a shift or emergency comes up.",
    },
    {
      q: ar ? "هل سأحصل على شهادة؟" : "Will I receive a certificate?",
      a: ar
        ? "نعم. عند إتمام البرنامج تحصل على شهادة إتمام موثّقة من IMETS Medical School تضيفها إلى سيرتك الذاتية وحسابك على LinkedIn. لاحظ أنها شهادة من IMETS — أما مؤهل CIC نفسه فيمنحه مجلس CBIC بعد اجتياز امتحانه، ودورنا هو إعدادك له."
        : "Yes. On completing the program you receive a verifiable certificate of completion from IMETS Medical School to add to your CV and LinkedIn. Please note this is an IMETS certificate — the CIC credential itself is awarded separately by CBIC after you pass its exam; our program prepares you for it.",
    },
    {
      q: ar ? "ما مدة البرنامج؟" : "How long is the program?",
      a: ar
        ? "يمتد البرنامج على عدة أسابيع من الدراسة المنظّمة بدوام جزئي — مزيج من جلسات مباشرة أسبوعية ومواد بوتيرتك تناسب عملًا بدوام كامل، وهو مُوزّع لتغطّي محتوى CIC كاملًا دون ضغط. ولمعرفة الجدول القادم وتاريخ البدء بدقة، اضغط «قدّم الآن» وسيؤكّد لك المستشار التفاصيل."
        : "It runs over several weeks of structured, part-time study — a mix of live weekly sessions and self-paced material you can fit around a full-time job, paced so you cover the full CIC content without cramming. For the exact upcoming schedule and start date, tap Apply Now and an advisor will confirm the details.",
    },
    {
      q: ar ? "كيف أسجّل؟" : "How do I register?",
      a: ar
        ? "التسجيل بسيط: اضغط «قدّم الآن» واملأ النموذج القصير، وسيتواصل معك مستشار القبول لتأكيد مقعدك والإجابة عن أسئلتك وإتمام التسجيل. ويمكنك أيضًا التواصل معنا عبر واتساب إن فضّلت الحديث أولًا."
        : "Registering is simple: tap Apply Now and fill in the short form, and an admissions advisor will contact you to confirm your seat, answer your questions, and complete enrollment. You can also reach us on WhatsApp if you'd prefer to talk it through first.",
    },
    {
      q: ar ? "ما خيارات الدفع؟" : "What are the payment options?",
      a: ar
        ? "نوفّر خيارات دفع مرنة ويمكننا إصدار الفاتورة بعملتك المحلية. ولضمان الدقة حسب بلدك وأي عروض أو خطط تقسيط حالية، اضغط «قدّم الآن» أو راسلنا عبر واتساب وسيشرح لك المستشار الخيارات المتاحة ويؤكّد الإجمالي."
        : "We offer flexible payment options and can bill in your local currency. To keep things accurate for your country and any current offers or instalment plans, tap Apply Now or message us on WhatsApp and an advisor will walk you through the available options and confirm the total.",
    },
  ];
}

function cicContent(locale: string): CourseContent {
  const ar = isAr(locale);
  return {
    headings: {
      whyChoose: ar
        ? "لماذا تختار برنامج CIC من IMETS"
        : "Why Choose the IMETS CIC Preparation Program",
      audience: ar
        ? "لمن برنامج CIC هذا"
        : "Who Should Join This CIC Preparation Program",
      learn: ar
        ? "ماذا ستتعلّم في برنامج CIC"
        : "What You'll Learn in This CIC Preparation Program",
      careers: ar
        ? "الفرص المهنية بعد شهادة CIC"
        : "Career Opportunities After CIC Certification",
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
        ? [
            "برنامج IMETS للتحضير لشهادة CIC يساعدك على بناء معرفة عملية في الوقاية من العدوى ومكافحتها، والاستعداد بثقة لامتحان CIC الذي يصدره مجلس CBIC.",
          ]
        : [
            "The IMETS CIC Preparation Program helps you build practical infection prevention and control knowledge, and prepare with confidence for the CIC examination awarded by CBIC.",
          ],
    },
    audience: null,
    faqs: [
      {
        title: ar ? "القبول" : "Admissions",
        items: [
          {
            q: ar
              ? "هل شهادة CIC معترف بها دوليًا؟"
              : "Is CIC recognized internationally?",
            a: ar
              ? "شهادة CIC يصدرها مجلس Certification Board of Infection Control and Epidemiology ‏(CBIC)، وهو المجلس المستقل المسؤول عن اعتماد متخصصي الوقاية من العدوى ومكافحتها. لا يضع CBIC أي قيد على جنسية المتقدّم أو بلده في شروط الأهلية المنشورة، والشهادة تُعرف على نطاق واسع في برامج اعتماد المستشفيات."
              : "CIC is awarded by the Certification Board of Infection Control and Epidemiology (CBIC), the independent board that certifies infection prevention and control professionals. CBIC's published eligibility requirements set no nationality or country restriction, and the credential is widely referenced in hospital accreditation programs.",
          },
          {
            q: ar
              ? "من المؤهل لدخول امتحان CIC؟"
              : "Who is eligible for the CIC exam?",
            a: ar
              ? "يشترط CBIC ثلاثة شروط معًا: أن تكون مسؤولًا مباشرة عن أنشطة الوقاية من العدوى ومكافحتها في وظيفتك الحالية؛ وأن تكون أنهيت تعليمًا جامعيًا في مجال صحي (طب، تمريض، مختبرات، صحة عامة، أحياء … وغيرها)؛ وأن تمتلك خبرة عمل: سنة واحدة بدوام كامل، أو سنتين بدوام جزئي، أو 3000 ساعة خلال السنوات الثلاث السابقة. الأهلية يحددها CBIC وحده — وليس IMETS. راجع cbic.org قبل التقديم."
              : "CBIC requires all three: you are directly responsible for infection prevention and control activities in your current role; you have completed post-secondary education in a health-related field (medicine, nursing, laboratory technology, public health, biology, and others); and you have work experience of at least one year full-time, or two years part-time, or 3,000 hours earned during the previous three years. Eligibility is decided by CBIC, not by IMETS — check cbic.org before you apply.",
          },
          {
            q: ar
              ? "هل أحتاج خبرة في مكافحة العدوى؟"
              : "Do I need infection control experience?",
            a: ar
              ? "للالتحاق ببرنامج IMETS: لا — يبدأ البرنامج من الأساسيات. لكن لدخول امتحان CIC نفسه: نعم — يشترط CBIC خبرة عملية (سنة بدوام كامل، أو سنتان بدوام جزئي، أو 3000 ساعة خلال ثلاث سنوات). البرنامج يجهّزك للامتحان، لكنه لا يمنحك الأهلية لدخوله."
              : "To join the IMETS program: no — it starts from the fundamentals. To sit the CIC exam itself: yes — CBIC requires practical experience (one year full-time, two years part-time, or 3,000 hours across three years). The program prepares you for the exam; it does not make you eligible for it.",
          },
          {
            q: ar
              ? "هل يمكنني الحضور من السعودية؟"
              : "Can I attend from Saudi Arabia?",
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
            q: ar
              ? "كيف تُقدَّم الجلسات المباشرة؟"
              : "How are live classes delivered?",
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
    knowledgeCenter: cicKnowledgeCenter(ar),
    knowledgeGroups: cicKnowledgeGroups(ar),
    knowledgeTitle: ar ? "مركز معرفة شهادة CIC" : "CIC Certification Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن شهادة CIC والأهلية وامتحان CBIC ومسارات الوقاية من العدوى وكيفية التحضير بنجاح."
      : "Everything you need to know about the CIC certification, eligibility, the CBIC exam, infection prevention careers, and how to prepare successfully.",
    knowledgeCta: ar
      ? "جاهز لبدء رحلتك نحو شهادة CIC؟"
      : "Ready to Start Your CIC Journey?",
    salesFaq: cicSalesFaq(ar),
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
      {
        title: ar
          ? "أخصائي وقاية من العدوى أول"
          : "Senior Infection Preventionist",
      },
      { title: ar ? "منسّق مكافحة العدوى" : "IPC Coordinator" },
      { title: ar ? "مدير مكافحة العدوى" : "Infection Control Manager" },
      {
        title: ar
          ? "استشاري إقليمي للوقاية من العدوى"
          : "Regional Infection Prevention Consultant",
      },
    ],
    careerOpportunities: [],
    // Removed 2026-07-20 (user request): the long-form SEO band ("What Is CIC
    // Certification?" / "Why Become CIC Certified?" / "CIC Exam Overview" /
    // "Why Choose IMETS…") duplicated the Knowledge Center, which now covers the
    // same ground in more depth. Empty ⇒ the page skips the section entirely.
    seoSections: [],
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
    knowledgeCenter: infectionControlKnowledgeCenter(ar),
    knowledgeGroups: infectionControlKnowledgeGroups(ar),
    knowledgeTitle: ar
      ? "مركز معرفة مكافحة العدوى"
      : "Infection Control Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن دبلومة مكافحة العدوى — محتواها، ولمن هي، والفرص المهنية التي تفتحها، وشهادة IMETS، ولماذا تهمّ الوقاية من العدوى."
      : "Everything you need to know about the Infection Control Diploma — what it covers, who it's for, the careers it opens, your IMETS certificate, and why infection prevention matters.",
    knowledgeCta: ar
      ? "جاهز لبدء مسارك في مكافحة العدوى؟"
      : "Ready to Start Your Infection Control Career?",
    salesFaq: diplomaSalesFaq(
      ar,
      "This program is ideal for nurses and healthcare professionals working in — or moving into — infection prevention and control: infection control nurses, quality and patient-safety staff, and clinicians who want a structured foundation. If your role touches infection prevention in a hospital or clinic it is built for you, and fresh graduates aiming for an infection-control career are welcome too.",
      "البرنامج مثالي للممرضين ومتخصصي الرعاية الصحية العاملين في — أو المنتقلين إلى — الوقاية من العدوى ومكافحتها: ممرضو مكافحة العدوى، وكوادر الجودة وسلامة المرضى، والإكلينيكيون الراغبون في أساس منظّم. وإذا كان دورك يمسّ الوقاية من العدوى في مستشفى أو عيادة فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في مكافحة العدوى.",
    ),
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
      whyChoose: ar
        ? "لماذا تختار دبلومة مكافحة العدوى من IMETS"
        : "Why Choose the IMETS Infection Control Diploma",
      audience: ar
        ? "لمن دبلومة مكافحة العدوى هذه"
        : "Who Should Join This Infection Control Diploma",
      learn: ar
        ? "ماذا ستتعلّم في دبلومة مكافحة العدوى"
        : "What You'll Learn in This Infection Control Diploma",
      careers: ar
        ? "الفرص المهنية بعد دبلومة مكافحة العدوى"
        : "Career Opportunities After an Infection Control Diploma",
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
        ? [
            "دبلومة مكافحة العدوى من IMETS تنقلك من الممارسة الإكلينيكية إلى الوقاية من العدوى: التحقيق في الفاشيات، والتعقيم، وصحة العاملين — بمنهج قابل للتطبيق داخل منشأتك من الأسبوع الأول، سواء كنت تستهدف دور ممرض مكافحة عدوى أو أخصائي وقاية من العدوى.",
          ]
        : [
            "The IMETS Infection Control Diploma moves you from clinical practice into infection prevention: outbreak investigation, sterilisation and occupational health — taught so you can apply it inside your own facility from week one, whether you are aiming at an infection control nurse or infection prevention specialist role.",
          ],
    },
    faqs: [
      {
        title: ar ? "من يمكنه الالتحاق" : "Who can join",
        items: [
          {
            q: ar
              ? "هل هذه الدبلومة مناسبة للتمريض؟"
              : "Is this diploma suitable for nurses?",
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
            q: ar
              ? "هل الدبلومة معترف بها في دول الخليج؟"
              : "Is this diploma recognized in GCC countries?",
            a: ar
              ? "نكون دقيقين هنا: الشهادة يصدرها IMETS وهي قابلة للتحقق، وطلابنا يعملون في منشآت عبر الخليج والشرق الأوسط. لكن «الاعتراف» يعني أشياء مختلفة — تقدير جهة العمل للتدريب شيء، واعتماد جهة ترخيص مثل SCFHS أو DHA أو QCHP شيء آخر تحدده تلك الجهة وحدها لا نحن. إن كان هدفك متطلبًا تنظيميًا محددًا، تحقّق منه مع جهتك أولًا. وإن كان هدفك لقبًا من مجلس اعتماد دولي، فذلك هو CIC من CBIC."
              : 'Let us be precise. The certificate is issued by IMETS and is verifiable, and our students work in facilities across the GCC and wider Middle East. But "recognized" means different things: an employer valuing the training is one thing; approval by a licensing authority such as SCFHS, DHA or QCHP is another, and that is decided by those authorities, not by us. If you need it for a specific regulatory requirement, confirm with that authority first. If what you want is a title from an international certifying board, that is CIC from CBIC.',
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
            q: ar
              ? "هل يمكنني الدراسة أثناء العمل؟"
              : "Can I study while working?",
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
      {
        title: ar
          ? "أخصائي وقاية من العدوى أول"
          : "Senior Infection Prevention Specialist",
      },
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
/* ================================================================== */
/* Knowledge Center content — IMETS diplomas (IMETS-certificate        */
/* framing; no external accreditation, salary, or job guarantees).     */
/* ================================================================== */

const DIPLOMA_GROUPS = (
  ar: boolean,
  overviewEmoji: string,
  domainKey: string,
  domainEn: string,
  domainAr: string,
  domainEmoji: string,
): KnowledgeGroup[] => [
  { key: "overview", en: "Overview", ar: "نظرة عامة", emoji: overviewEmoji },
  { key: "curriculum", en: "Curriculum", ar: "المنهج", emoji: "📘" },
  { key: "audience", en: "Who Should Enroll", ar: "لمن الدبلومة", emoji: "✅" },
  { key: "career", en: "Career", ar: "المسار المهني", emoji: "💼" },
  { key: "certificate", en: "Certificate", ar: "الشهادة", emoji: "🎓" },
  { key: domainKey, en: domainEn, ar: domainAr, emoji: domainEmoji },
];

/* ---- Infection Control Diploma ---- */
function infectionControlKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return DIPLOMA_GROUPS(ar, "🦠", "practice", "In Practice", "في الممارسة", "🛡️");
}
function infectionControlKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar ? "ما هي دبلومة مكافحة العدوى؟" : "What is the Infection Control Diploma?",
      group: "overview",
      a: ar
        ? "دبلومة مكافحة العدوى هي برنامج تدريبي منظّم من IMETS يبني المعرفة والمهارات العملية اللازمة للوقاية من العدوى ومكافحتها في المنشآت الصحية. تمنحك الدبلومة أساسًا تطبيقيًا متكاملًا في الوقاية من العدوى — من كيفية انتشار العدوى إلى كيفية إيقافها — لتحمي المرضى والطاقم بثقة.\n\nعبر الدبلومة تدرس ركائز مكافحة العدوى في المستشفى: سلسلة العدوى، والاحتياطات القياسية والقائمة على طريقة الانتقال، ونظافة اليدين، والتنظيف والتطهير والتعقيم، وترصّد العدوى المرتبطة بالرعاية الصحية (HAIs)، والاستجابة للفاشيات. وتركّز دبلومة مكافحة العدوى على كيفية عمل هذه الممارسات فعليًا في الأجنحة والعيادات وغرف العمليات لا على النظرية وحدها.\n\nدبلومة مكافحة العدوى مثالية للقادمين الجدد وللعاملين بالفعل في الوقاية من العدوى الراغبين في مؤهل رسمي متكامل، وهي أساس قوي لمن يخطط لاحقًا للحصول على مؤهل CIC الدولي. وعند الإتمام تنال شهادة إتمام موثّقة من IMETS Medical School. (الدبلومة تدريب من IMETS؛ أما شهادة CIC فيمنحها مجلس CBIC بشكل منفصل.)"
        : "The Infection Control Diploma is a structured IMETS training program that builds the practical knowledge and skills needed to prevent and control infection in healthcare settings. It gives you a complete, applied foundation in infection prevention — from how infections spread to how to stop them — so you can protect patients and staff with confidence.\n\nAcross the diploma you study the core pillars of hospital infection control: the chain of infection, standard and transmission-based precautions, hand hygiene, cleaning, disinfection and sterilization, surveillance of healthcare-associated infections (HAIs), and outbreak response. Rather than theory alone, the Infection Control Diploma focuses on how these practices work on real wards, in clinics, and in operating theatres.\n\nThe Infection Control Diploma suits both professionals new to the field and those already working in infection prevention who want a formal, well-rounded qualification, and it lays a strong foundation for anyone later pursuing the international CIC credential. On completion you earn a verifiable certificate of completion from IMETS Medical School. (The diploma is IMETS training; the CIC certification is awarded separately by CBIC.)",
    },
    {
      q: ar ? "ماذا تغطّي دبلومة مكافحة العدوى؟" : "What does the Infection Control Diploma cover?",
      group: "curriculum",
      a: ar
        ? "تغطّي دبلومة مكافحة العدوى نطاق الوقاية من العدوى ومكافحتها كما يُمارَس في المستشفيات الحديثة. تبدأ بالعلم — الكائنات الدقيقة، وسلسلة العدوى، وكيف تتطوّر العدوى المرتبطة بالرعاية الصحية (HAIs) — ثم تنتقل إلى الأنظمة العملية التي تحافظ على سلامة المرضى.\n\nتشمل الوحدات الأساسية الاحتياطات القياسية والقائمة على طريقة الانتقال، وبرامج نظافة اليدين، ومعدّات الحماية الشخصية، والتنظيف والتطهير والتعقيم الآمن للأدوات. كما تغطّي الدبلومة الترصّد: كيفية اكتشاف HAIs وتتبّع معدلات العدوى واستخدام البيانات لدفع التحسين. وتدرس احتياطات العزل، والتنظيف البيئي، والحقن الآمن، والوقاية من عدوى الأجهزة (مثل حزم القسطرة وأجهزة التنفّس).\n\nوأخيرًا تتناول دبلومة مكافحة العدوى التحقيق في الفاشيات والاستجابة لها، وتثقيف الطاقم، وكيف تدعم مكافحة العدوى برامج الاعتماد مثل CBAHI وGAHAR وJCI. وبنهايتها تفهم لا الممارسات الفردية فحسب، بل كيف يتكامل برنامج الوقاية من العدوى المنسّق عبر المنشأة كلها."
        : "The Infection Control Diploma covers the full scope of infection prevention and control as it is practiced in modern hospitals. You begin with the science — microorganisms, the chain of infection, and how healthcare-associated infections (HAIs) develop — then move into the practical systems that keep patients safe.\n\nCore modules include standard and transmission-based precautions, hand hygiene programs, personal protective equipment, and the safe cleaning, disinfection, and sterilization of equipment. The diploma also covers surveillance: how to detect HAIs, track infection rates, and use data to drive improvement. You study isolation precautions, environmental cleaning, safe injection practice, and device-related infection prevention such as catheter and ventilator bundles.\n\nFinally, the Infection Control Diploma addresses outbreak investigation and response, staff education, and how infection control supports accreditation programs such as CBAHI, GAHAR, and JCI. By the end you understand not just individual practices but how a coordinated infection prevention program fits together across a whole facility.",
    },
    {
      q: ar ? "لمن دبلومة مكافحة العدوى؟" : "Who should enroll in the Infection Control Diploma?",
      group: "audience",
      a: ar
        ? "دبلومة مكافحة العدوى مصمّمة لمتخصصي الرعاية الصحية الراغبين في الوقاية من العدوى وحماية المرضى — سواء كنت تدخل المجال أو تقوّي خبرة قائمة. التمريض هو الفئة الأكبر، خاصةً المنتقلين إلى أدوار ممرض مكافحة العدوى أو الممرض المرجعي، لكن الدبلومة تناسب طيفًا واسعًا من الإكلينيكيين.\n\nيستفيد الأطباء والصيادلة وعلماء المختبرات وممارسو الصحة العامة الذين يمسّ عملهم الوقاية من العدوى، وكذلك كوادر الجودة وسلامة المرضى الذين يحتاجون أساسًا متينًا في مكافحة العدوى بالمستشفى. ويستفيد مشرفو النظافة والخدمات المساندة المسؤولون عن التنظيف والتطهير من فهم «السبب» خلف البروتوكولات.\n\nلا تتطلّب دبلومة مكافحة العدوى خلفية متقدّمة للبدء — فهي تبني من الأساسيات إلى الممارسة التطبيقية، لذا نرحّب بالقادمين الجدد وحديثي التخرج الذين يستهدفون مسارًا في مكافحة العدوى. فإذا كان عملك اليومي يمسّ سلامة المرضى وتريد أساسًا منظّمًا ومعترفًا به في الوقاية من العدوى، فهذه الدبلومة لك."
        : "The Infection Control Diploma is designed for healthcare professionals who want to prevent infection and protect patients — whether you are entering the field or strengthening existing experience. Nurses are the largest group, especially those moving into infection control nurse or link-nurse roles, but the diploma suits a wide range of clinicians.\n\nPhysicians, pharmacists, laboratory scientists, and public-health practitioners whose work touches infection prevention all benefit, as do quality and patient-safety staff who need a solid grounding in hospital infection control. Facility and housekeeping supervisors responsible for cleaning and disinfection also gain from understanding the reasoning behind the protocols.\n\nNo advanced background is required to start the Infection Control Diploma — it builds from fundamentals to applied practice, so motivated newcomers and fresh graduates aiming for an infection-control career are welcome. If your daily work touches patient safety and you want a structured, recognized foundation in infection prevention, this diploma is for you.",
    },
    {
      q: ar
        ? "ما الفرص المهنية بعد دبلومة مكافحة العدوى؟"
        : "What career opportunities follow the Infection Control Diploma?",
      group: "career",
      a: ar
        ? "الوقاية من العدوى من أكثر مجالات الرعاية الصحية طلبًا، ودبلومة مكافحة العدوى تساعدك على تهيئة نفسك لها. فالمستشفيات والعيادات ومرافق الرعاية طويلة الأمد وجهات الصحة العامة كلها تحتاج كوادر مدرّبة لتشغيل أنشطة الوقاية من العدوى ومكافحتها، خصوصًا مع ارتفاع معايير الاعتماد في الخليج ومصر.\n\nمع الدبلومة تكون مؤهّلًا لأدوار مثل ممرض مكافحة العدوى، أو ممارس الوقاية من العدوى، أو الممرض المرجعي لمكافحة العدوى داخل الفريق الإكلينيكي. ويمكن لأصحاب الخبرة التقدّم نحو منسّق أو مشرف مكافحة العدوى، لدعم أو قيادة برنامج الوقاية من العدوى في المنشأة. كما تعزّز المهارات مسارات مجاورة في الجودة وسلامة المرضى والاعتماد.\n\nوتبني دبلومة مكافحة العدوى الأساس الذي يستخدمه كثيرون قبل السعي لمؤهل CIC الدولي، الذي قد يوسّع الفرص المتقدّمة أكثر. ويبقى التوظيف والترقّي معتمدين على خبرتك وسوقك المحلي — الدبلومة تُعِدّك وتوثّق تعلّمك، ولا تَعِد بوظيفة بعينها."
        : "Infection prevention is one of the most in-demand areas of healthcare, and the Infection Control Diploma helps you position yourself for it. Hospitals, clinics, long-term care facilities, and public-health bodies all need trained professionals to run infection prevention and control activities, especially as accreditation standards rise across the Gulf and Egypt.\n\nWith the diploma, you are prepared for roles such as infection control nurse, infection prevention practitioner, or infection control link nurse within a clinical team. Experienced professionals can move toward infection control coordinator or supervisor positions, supporting or leading a facility's infection prevention program. The skills also strengthen adjacent careers in quality, patient safety, and accreditation.\n\nThe Infection Control Diploma also builds the foundation many professionals use before pursuing the international CIC credential, which can further expand senior opportunities. Hiring and advancement always depend on your experience and local market — the diploma prepares and certifies your learning; it does not promise a specific job.",
    },
    {
      q: ar ? "ما الشهادة التي ستحصل عليها؟" : "What certificate will you receive?",
      group: "certificate",
      a: ar
        ? "عند إتمام دبلومة مكافحة العدوى تحصل على شهادة إتمام موثّقة يمكن التحقّق منها من IMETS Medical School. توثّق أنك درست وأظهرت الكفاءات الأساسية للوقاية من العدوى ومكافحتها، ويمكنك إضافتها إلى سيرتك الذاتية وحسابك على LinkedIn لإثبات تدريبك.\n\nشهادة IMETS اعتراف بالمعرفة والمهارات التي بنيتها عبر الدبلومة. تصدرها IMETS بوصفها جهة تدريب مستقلة، وهي منفصلة عن أي شهادة مهنية خارجية. وتحديدًا، دبلومة مكافحة العدوى ليست هي مؤهل CIC، الذي يمنحه مجلس CBIC بعد اجتياز امتحانه.\n\nويتعامل كثير من المتخصصين مع دبلومة مكافحة العدوى كأساس قوي ومنظّم، ثم يسعون لاحقًا لشهادة CIC للحصول على مؤهل معترف به دوليًا. وسواء توقّفت عند الدبلومة أو واصلت نحو CIC، يمنحك التدريب مهارات وقاية من العدوى تطبيقية ومحدّثة تقدّرها المستشفيات."
        : "On completing the Infection Control Diploma you receive a verifiable certificate of completion from IMETS Medical School. It documents that you have studied and demonstrated the core competencies of infection prevention and control, and you can add it to your CV and LinkedIn to evidence your training.\n\nThe IMETS certificate recognizes the knowledge and skills you have built through the diploma. It is issued by IMETS as an independent training provider and is separate from any external professional certification. In particular, the Infection Control Diploma is not the same as the CIC credential, which is awarded by CBIC after passing its own examination.\n\nMany professionals treat the Infection Control Diploma as a strong, structured foundation and later pursue the CIC certification to gain an internationally recognized credential. Whether you stop at the diploma or continue toward CIC, the training gives you applied, up-to-date infection prevention skills that hospitals value.",
    },
    {
      q: ar
        ? "لماذا تُعدّ مكافحة العدوى مهمة في المستشفيات؟"
        : "Why is infection control important in hospitals?",
      group: "practice",
      a: ar
        ? "مكافحة العدوى من أهم ضمانات الرعاية الصحية الحديثة، لأن المستشفيات تجمع في مكان واحد مرضى أكثر هشاشة، وإجراءات باضعة، وكائنات مقاومة. ومكافحة العدوى الفعّالة في المستشفى تمنع العدوى المرتبطة بالرعاية الصحية (HAIs) التي قد تُطيل الإقامة وترفع التكاليف وتُودي بالأرواح.\n\nوالوقاية القوية من العدوى تحمي المرضى والطاقم المعرّض يوميًا للمُمْرِضات. فبدون مكافحة عدوى موثوقة، قد يتحوّل خطأ واحد إلى فاشية تنتشر عبر الأجنحة والعناية المركزة. وتخفض مكافحة العدوى في المستشفى معدلات HAIs عبر ممارسات قائمة على الأدلّة — نظافة اليدين، والتقنية المعقّمة، واحتياطات العزل، والحقن الآمن، والتنظيف البيئي — وكلها مصمّمة لكسر سلسلة الانتقال.\n\nومكافحة العدوى محورية للاعتماد أيضًا: فبرامج مثل CBAHI وGAHAR وJCI تفحص أداء الوقاية من العدوى عن كثب. كما أن HAIs محرّك لمقاومة مضادات الميكروبات، فتدعم مكافحة العدوى الجيدة ترشيد المضادات الحيوية. وهذا بالضبط هو العمل التطبيقي الذي تُعِدّك له دبلومة مكافحة العدوى."
        : "Infection control is one of the most important safeguards in modern healthcare, because hospitals bring together vulnerable patients, invasive procedures, and resistant organisms in one place. Effective hospital infection control prevents healthcare-associated infections (HAIs) that can prolong stays, raise costs, and cost lives.\n\nStrong infection prevention protects patients and the staff who face daily exposure to pathogens. Without reliable infection control, a single lapse can become an outbreak that spreads across wards and intensive care. Hospital infection control reduces HAIs through evidence-based practices — hand hygiene, sterile technique, isolation precautions, safe injection, and environmental cleaning — each designed to break the chain of transmission.\n\nInfection control is also central to accreditation: programs such as CBAHI, GAHAR, and JCI examine infection prevention performance closely. HAIs drive antimicrobial resistance too, so good infection control supports antibiotic stewardship. This is exactly the practical work the Infection Control Diploma prepares you to do.",
    },
    {
      q: ar ? "ماذا يفعل ممرض مكافحة العدوى؟" : "What does an infection control nurse do?",
      group: "practice",
      a: ar
        ? "ممرض مكافحة العدوى إكلينيكي يقود العمل اليومي للوقاية من العدوى ومكافحتها في المنشأة الصحية. وهدفه الأساسي خفض العدوى المرتبطة بالرعاية الصحية (HAIs) وحماية المرضى والطاقم، وهو من أكثر الأدوار التي تُعِدّك لها دبلومة مكافحة العدوى.\n\nيوميًا، يُجري ممرض مكافحة العدوى ترصّدًا لاكتشاف العدوى مبكرًا، ويدقّق الالتزام بنظافة اليدين والاحتياطات، ويثقّف الفرق الإكلينيكية حول الممارسة الآمنة. ويساعد في وضع وإنفاذ سياسات العزل والعناية بالأجهزة والتنظيف والتعقيم، ويحقّق في التجمّعات أو الفاشيات عند ارتفاع معدلات العدوى.\n\nكما يتعاون ممرض مكافحة العدوى عبر الأقسام — مع الإكلينيكيين والنظافة والتعقيم المركزي والإدارة — لأن الوقاية من العدوى تمسّ المنشأة كلها. ويرفع البيانات للإدارة وجهات الاعتماد ويقود التحسين المستمر. وتبني دبلومة مكافحة العدوى هذه المهارات بالضبط، محوّلةً الخبرة الإكلينيكية إلى دور مركّز في الوقاية من العدوى."
        : "An infection control nurse is a clinician who leads the day-to-day work of preventing and controlling infection in a healthcare facility. Their core purpose is to reduce healthcare-associated infections (HAIs) and protect both patients and staff, and it is one of the most common roles the Infection Control Diploma prepares you for.\n\nDay to day, an infection control nurse conducts surveillance to detect infections early, audits hand hygiene and precaution compliance, and educates clinical teams on safe practice. They help develop and enforce policies for isolation, device care, cleaning, and sterilization, and they investigate clusters or outbreaks when infection rates rise.\n\nAn infection control nurse also collaborates across departments — with clinicians, housekeeping, sterile services, and management — because infection prevention touches the whole facility. They report data to leadership and accreditation bodies and drive continuous improvement. The Infection Control Diploma builds exactly these skills, turning clinical experience into a focused infection-prevention role.",
    },
  ];
}

/* ---- Hospital Management Diploma ---- */
function hospitalMgmtKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return DIPLOMA_GROUPS(ar, "🏥", "skills", "Management Skills", "مهارات الإدارة", "📊");
}
function hospitalMgmtKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar
        ? "ما هي دبلومة إدارة المستشفيات؟"
        : "What is the Hospital Management Diploma?",
      group: "overview",
      a: ar
        ? "دبلومة إدارة المستشفيات هي برنامج منظّم من IMETS يبني مهارات القيادة والتشغيل والأعمال اللازمة لإدارة المنشآت الصحية بفعالية. تمنح الإكلينيكيين والإداريين أساسًا عمليًا في إدارة المستشفيات — كيف تُنظَّم المستشفيات وتُموَّل وتُقاد — لتنتقل من تقديم الرعاية إلى إدارة الأنظمة التي تقدّمها.\n\nعبر الدبلومة تدرس الوظائف الأساسية لإدارة الرعاية الصحية: التشغيل وسير العمل، والتمويل والموازنات، والموارد البشرية، والجودة وسلامة المرضى، ومهارات القيادة التي تربطها معًا. وتركّز دبلومة إدارة المستشفيات على كيفية عمل هذه الوظائف في المستشفيات والعيادات الحقيقية لا على النظرية وحدها.\n\nتناسب الدبلومة الإكلينيكيين المنتقلين إلى القيادة والإداريين الراغبين في مؤهل رسمي متكامل في إدارة المستشفيات. وعند الإتمام تنال شهادة إتمام موثّقة من IMETS Medical School توثّق كفاءات الإدارة التي بنيتها."
        : "The Hospital Management Diploma is a structured IMETS program that builds the leadership, operational, and business skills needed to run healthcare facilities effectively. It gives clinicians and administrators a practical foundation in hospital management — how hospitals are organized, financed, and led — so you can move from delivering care to managing the systems that deliver it.\n\nAcross the diploma you study the core functions of healthcare administration: operations and workflow, healthcare finance and budgeting, human resources, quality and patient safety, and the leadership skills that hold them together. The Hospital Management Diploma focuses on how these functions work in real hospitals and clinics, not on theory alone.\n\nIt suits both clinical professionals stepping into leadership and administrators who want a formal, well-rounded qualification in hospital management. On completion you earn a verifiable certificate of completion from IMETS Medical School, documenting the management competencies you have built.",
    },
    {
      q: ar
        ? "ماذا تغطّي دبلومة إدارة المستشفيات؟"
        : "What does the Hospital Management Diploma cover?",
      group: "curriculum",
      a: ar
        ? "تغطّي دبلومة إدارة المستشفيات المهارات اللازمة لقيادة منشأة صحية حديثة. تبدأ بكيفية هيكلة المستشفيات وحوكمتها، ثم تنتقل عبر وظائف الإدارة الأساسية التي تُبقيها تعمل.\n\nتشمل المجالات الأساسية تشغيل المستشفى وتدفّق المرضى، والتمويل الصحي والموازنات، وإدارة الإيرادات والتكاليف، والموارد البشرية وتخطيط القوى العاملة، وإدارة الموارد والإمداد. كما تغطّي الدبلومة إدارة الجودة وسلامة المرضى والجاهزية للاعتماد (CBAHI وGAHAR وJCI)، إلى جانب نظم المعلومات الصحية وقياس الأداء عبر مؤشرات الأداء الرئيسية (KPIs).\n\nوطوال البرنامج تركّز دبلومة إدارة المستشفيات على القيادة وإدارة التغيير — كيف تقود الفرق وتحسّن العمليات وتتّخذ قرارات مبنية على البيانات. وبنهايتها تفهم لا كل قسم على حدة، بل كيف يتكامل التشغيل والتمويل والأفراد والجودة لتشغيل مستشفى آمن وفعّال."
        : "The Hospital Management Diploma covers the full range of skills required to lead a modern healthcare facility. You start with how hospitals are structured and governed, then move through the core management functions that keep them running.\n\nCore areas include hospital operations and patient flow, healthcare finance and budgeting, revenue and cost management, human resources and workforce planning, and supply and resource management. The diploma also covers quality management, patient safety, and accreditation readiness (CBAHI, GAHAR, JCI), along with health information systems and performance measurement using KPIs.\n\nThroughout, the Hospital Management Diploma emphasizes leadership and change management — how to lead teams, improve processes, and make data-informed decisions. By the end you understand not just each department in isolation but how operations, finance, people, and quality fit together to run a safe, efficient hospital.",
    },
    {
      q: ar ? "لمن دبلومة إدارة المستشفيات؟" : "Who should enroll in the Hospital Management Diploma?",
      group: "audience",
      a: ar
        ? "دبلومة إدارة المستشفيات مصمّمة لكل من ينتقل إلى — أو يعمل بالفعل في — دور قيادي في الرعاية الصحية. فالأطباء والممرضون والصيادلة وغيرهم من الإكلينيكيين الذين يقودون أقسامًا أو خطوطًا خدمية يكتسبون لغة الإدارة وأدواتها لتحويل الخبرة الإكلينيكية إلى أثر إداري.\n\nيستفيد إداريو المستشفيات ومديرو الأقسام والمنسّقون وقادة الفرق من أساس متكامل ومنظّم في إدارة الرعاية الصحية. كما تناسب الدبلومة العاملين في التمويل أو الموارد البشرية أو الجودة أو التشغيل الراغبين في فهم كيف تتكامل وظيفتهم مع المستشفى الأوسع، وأصحاب العيادات المسؤولين عن إدارة منشآتهم.\n\nلا تتطلّب الدبلومة خلفية إدارية سابقة — فهي تبني من الأساسيات إلى القيادة التطبيقية، لذا نرحّب بالإكلينيكيين الطموحين وحديثي التخرج الذين يستهدفون مسارًا في إدارة الرعاية الصحية. فإذا أردت قيادة الأفراد والعمليات والموارد في بيئة صحية، فهذه الدبلومة لك."
        : "The Hospital Management Diploma is designed for anyone moving toward — or already in — a leadership role in healthcare. Physicians, nurses, pharmacists, and other clinicians who lead departments or service lines gain the management language and tools to turn clinical experience into administrative impact.\n\nHospital administrators, department managers, coordinators, and team leaders benefit from a structured, well-rounded grounding in healthcare administration. The diploma also suits professionals in finance, HR, quality, or operations who want to understand how their function fits into the wider hospital, and clinic owners responsible for running their own facility.\n\nNo prior management background is required — the Hospital Management Diploma builds from fundamentals to applied leadership, so ambitious clinicians and fresh graduates aiming for a healthcare management career are welcome. If you want to lead people, processes, and resources in a healthcare setting, this diploma is for you.",
    },
    {
      q: ar
        ? "ما الفرص المهنية بعد دبلومة إدارة المستشفيات؟"
        : "What career opportunities follow the Hospital Management Diploma?",
      group: "career",
      a: ar
        ? "الرعاية الصحية من أكبر القطاعات وأسرعها نموًا في الخليج ومصر، والطلب على المديرين المهرة دائم. ودبلومة إدارة المستشفيات تساعدك على تهيئة نفسك للأدوار الإدارية والقيادية مع توسّع المنشآت وارتفاع معايير الاعتماد.\n\nمع الدبلومة تكون مؤهّلًا لأدوار مثل إداري مستشفى، أو منسّق تشغيل، أو مدير قسم، أو قائد وحدة/خط خدمي. ويمكن لأصحاب الخبرة التقدّم نحو مدير التشغيل، أو مدير الجودة، أو مناصب على مستوى المدير، بينما ينتقل الإكلينيكيون من أدوار الرعاية المباشرة إلى مسارات الإدارة.\n\nكما تعزّز دبلومة إدارة المستشفيات مسارات مجاورة في التمويل الصحي والموارد البشرية والجودة والاستشارات. ويبقى التوظيف والترقّي معتمدين على خبرتك وسوقك المحلي — الدبلومة تُعِدّك وتوثّق تعلّمك، ولا تَعِد بوظيفة بعينها. وما تمنحه هو الأساس الإداري العملي الذي تُبنى عليه الأدوار القيادية."
        : "Healthcare is one of the largest and fastest-growing employers in the Gulf and Egypt, and skilled managers are in constant demand. The Hospital Management Diploma helps you position yourself for administrative and leadership roles as facilities expand and accreditation standards rise.\n\nWith the diploma you are prepared for roles such as hospital administrator, operations coordinator, department manager, or unit/service-line lead. Experienced professionals can move toward operations manager, quality manager, or director-level positions, while clinicians can transition from bedside roles into management tracks.\n\nThe Hospital Management Diploma also strengthens adjacent paths in healthcare finance, HR, quality, and consulting. Hiring and advancement always depend on your experience and local market — the diploma prepares and certifies your learning; it does not promise a specific job. What it gives you is the practical management foundation that leadership roles are built on.",
    },
    {
      q: ar ? "ما الشهادة التي ستحصل عليها؟" : "What certificate will you receive?",
      group: "certificate",
      a: ar
        ? "عند إتمام دبلومة إدارة المستشفيات تحصل على شهادة إتمام موثّقة يمكن التحقّق منها من IMETS Medical School. توثّق أنك درست وأظهرت الكفاءات الأساسية لإدارة المستشفيات وإدارة الرعاية الصحية، ويمكنك إضافتها إلى سيرتك الذاتية وحسابك على LinkedIn لإثبات تدريبك.\n\nشهادة IMETS اعتراف بمهارات القيادة والتشغيل والأعمال التي بنيتها عبر الدبلومة. تصدرها IMETS بوصفها جهة تدريب مستقلة — علامة على تدريب مهني منظّم ومكتمل لا رخصة خارجية.\n\nوبالنسبة لكثير من المتخصصين، تمثّل دبلومة إدارة المستشفيات خطوة حاسمة من العمل الإكلينيكي أو الإداري إلى القيادة الرسمية. ومع خبرتك، تساعدك الشهادة على تقديم حجة واضحة وموثوقة للأدوار الإدارية عبر المستشفيات والعيادات والمجموعات الصحية."
        : "On completing the Hospital Management Diploma you receive a verifiable certificate of completion from IMETS Medical School. It documents that you have studied and demonstrated the core competencies of hospital management and healthcare administration, and you can add it to your CV and LinkedIn to evidence your training.\n\nThe IMETS certificate recognizes the leadership, operational, and business skills you have built through the diploma. It is issued by IMETS as an independent training provider — a mark of completed, structured professional training rather than an external license.\n\nFor many professionals, the Hospital Management Diploma is a decisive step from clinical or administrative work into formal leadership. Combined with your experience, the certificate helps you present a clear, credible case for management roles across hospitals, clinics, and healthcare groups.",
    },
    {
      q: ar ? "لماذا تُعدّ إدارة المستشفيات مهمة؟" : "Why is hospital management important?",
      group: "skills",
      a: ar
        ? "إدارة المستشفيات هي ما يحوّل التميّز الإكلينيكي إلى مؤسسة فاعلة ومستدامة. فحتى أفضل الأطباء والممرضين لا يستطيعون تقديم رعاية آمنة ومتّسقة دون إدارة فعّالة للتشغيل والتمويل والأفراد والجودة — ولهذا فإن إدارة الرعاية الصحية الماهرة بهذه القيمة.\n\nوإدارة المستشفيات الجيدة تُبقي تدفّق المرضى سلسًا، والموارد مستخدمة بحكمة، والطاقم مدعومًا، بينما تؤدّي الإدارة الضعيفة إلى التأخير والهدر والإرهاق ومخاطر السلامة. والقادة الأقوياء يوائمون الأقسام حول أهداف مشتركة، ويقيسون الأداء بمؤشرات KPIs، ويقودون التحسين المستمر لتعمل المنشأة بكفاءة وأمان.\n\nكما أن إدارة المستشفيات محورية للاعتماد والاستدامة المالية: فبرامج مثل CBAHI وGAHAR وJCI تُقيّم الحوكمة والتشغيل عن كثب، والقرارات المالية والتشغيلية السليمة تُبقي المنشأة قادرة على الاستمرار. وهذه بالضبط القدرات التي صُمّمت دبلومة إدارة المستشفيات لتطويرها."
        : "Hospital management is what turns clinical excellence into a functioning, sustainable organization. Even the best doctors and nurses cannot deliver safe, consistent care without effective management of operations, finance, people, and quality — which is why skilled healthcare administration is so valuable.\n\nGood hospital management keeps patient flow smooth, resources used wisely, and staff supported, while weak management leads to delays, waste, burnout, and safety risks. Strong leaders align departments around shared goals, measure performance with KPIs, and drive continuous improvement so the facility runs efficiently and safely.\n\nHospital management is also central to accreditation and financial sustainability: programs such as CBAHI, GAHAR, and JCI assess governance and operations closely, and sound financial and operational decisions keep a facility viable. These are exactly the capabilities the Hospital Management Diploma is built to develop.",
    },
    {
      q: ar ? "ماذا يفعل إداري المستشفى؟" : "What does a hospital administrator do?",
      group: "skills",
      a: ar
        ? "إداري المستشفى يخطّط وينسّق ويشرف على تشغيل المنشأة الصحية لتقدّم رعاية آمنة وفعّالة. فبدلًا من علاج المرضى مباشرةً، يدير إداري المستشفى الأنظمة والأفراد والموارد التي تجعل العلاج ممكنًا — وهو من أهم الأدوار التي تُعِدّك لها دبلومة إدارة المستشفيات.\n\nيوميًا، يدير إداري المستشفى الموازنات والتمويل، ويشرف على التوظيف وسير العمل، ويضمن حصول الأقسام على ما تحتاجه، ويراقب الأداء مقابل مستهدفات الجودة والسلامة. ويقود تحسين العمليات، ويدعم الجاهزية للاعتماد، ويتّخذ قرارات مبنية على البيانات لموازنة الجودة والتكلفة وإتاحة الخدمة.\n\nكما يتعاون إداري المستشفى عبر المؤسسة كلها — مع القادة الإكلينيكيين والتمويل والموارد البشرية والجودة — لأن الإدارة تمسّ كل قسم. ويحوّل الاستراتيجية إلى تشغيل يومي، ويمثّل المنشأة أمام الجهات التنظيمية وأصحاب المصلحة. وتبني دبلومة إدارة المستشفيات هذه المهارات بالضبط، محوّلةً الخبرة إلى قيادة صحية فعّالة."
        : "A hospital administrator plans, coordinates, and oversees the operations of a healthcare facility so it delivers safe, efficient care. Rather than treating patients directly, the hospital administrator manages the systems, people, and resources that make treatment possible — one of the main roles the Hospital Management Diploma prepares you for.\n\nDay to day, a hospital administrator manages budgets and finances, oversees staffing and workflow, ensures departments have what they need, and monitors performance against quality and safety targets. They lead process improvement, support accreditation readiness, and make data-informed decisions to balance quality, cost, and access.\n\nA hospital administrator also collaborates across the whole organization — with clinical leaders, finance, HR, and quality — because management touches every department. They translate strategy into daily operations and represent the facility to regulators and stakeholders. The Hospital Management Diploma builds exactly these skills, turning experience into effective healthcare leadership.",
    },
  ];
}

/* ---- Healthcare Quality Management Diploma ---- */
function healthcareQualityKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return DIPLOMA_GROUPS(ar, "🩺", "quality", "Quality & Safety", "الجودة والسلامة", "📊");
}
function healthcareQualityKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar
        ? "ما هي دبلومة إدارة جودة الرعاية الصحية؟"
        : "What is the Healthcare Quality Management Diploma?",
      group: "overview",
      a: ar
        ? "دبلومة إدارة جودة الرعاية الصحية هي برنامج منظّم من IMETS يبني المعرفة والمهارات اللازمة لقياس جودة الرعاية وإدارتها وتحسينها. تمنح متخصصي الرعاية الصحية أساسًا عمليًا في جودة الرعاية الصحية — من أنظمة الجودة وسلامة المرضى إلى الاعتماد والبيانات — لتساعد مؤسستك على تقديم رعاية أكثر أمانًا وموثوقية.\n\nعبر الدبلومة تدرس ركائز إدارة جودة الرعاية الصحية: مفاهيم الجودة وأطرها، وتحسين الأداء والعمليات، وسلامة المرضى، والبيانات الصحية ومؤشرات الجودة، والجاهزية للاعتماد (CBAHI وGAHAR وJCI). ويركّز البرنامج على كيفية عمل الجودة في المستشفيات والعيادات الحقيقية لا على النظرية وحدها.\n\nتناسب الدبلومة القادمين الجدد للجودة والعاملين بها بالفعل الراغبين في مؤهل رسمي متكامل، وتبني أساسًا قويًا لمن يخطط لاحقًا لشهادة CPHQ الدولية. وعند الإتمام تنال شهادة إتمام موثّقة من IMETS Medical School. (الدبلومة تدريب من IMETS؛ أما مؤهل CPHQ فتمنحه لجنة HQCC/NAHQ بشكل منفصل.)"
        : "The Healthcare Quality Management Diploma is a structured IMETS program that builds the knowledge and skills needed to measure, manage, and improve the quality of care. It gives healthcare professionals a practical foundation in healthcare quality — from quality systems and patient safety to accreditation and data — so you can help your organization deliver safer, more reliable care.\n\nAcross the diploma you study the core pillars of healthcare quality management: quality concepts and frameworks, performance and process improvement, patient safety, health data and quality indicators, and accreditation readiness (CBAHI, GAHAR, JCI). The program focuses on how quality works in real hospitals and clinics, not on theory alone.\n\nIt suits both professionals new to quality and those already in the field who want a formal, well-rounded qualification, and it builds a strong foundation for anyone later pursuing the international CPHQ certification. On completion you earn a verifiable certificate of completion from IMETS Medical School. (The diploma is IMETS training; the CPHQ credential is awarded separately by HQCC/NAHQ.)",
    },
    {
      q: ar
        ? "ماذا تغطّي دبلومة جودة الرعاية الصحية؟"
        : "What does the Healthcare Quality Management Diploma cover?",
      group: "curriculum",
      a: ar
        ? "تغطّي دبلومة إدارة جودة الرعاية الصحية نطاق جودة الرعاية الصحية كما تُمارَس في المنشآت الحديثة. تبدأ بمفاهيم الجودة وأطرها، ثم تنتقل إلى الأنظمة والأساليب التي تجعل الرعاية الجيدة موثوقة.\n\nتشمل المجالات الأساسية أنظمة إدارة الجودة، وتحسين الأداء والعمليات (بأساليب مثل PDSA وLean وSix Sigma)، وسلامة المرضى وإدارة المخاطر، وتحليل البيانات الصحية — كيفية بناء مؤشرات الجودة وقياسات الأداء (KPIs) وتفسيرها. كما تغطّي الدبلومة معايير الاعتماد والجاهزية للتقييم لبرامج مثل CBAHI وGAHAR وJCI، إلى جانب السياسات والتدقيق وإشراك الطاقم.\n\nوطوال البرنامج تركّز دبلومة جودة الرعاية الصحية على تحويل القياس إلى إجراء: تحديد المشكلات، واختبار التغييرات، وإدامة التحسين. وبنهايتها تفهم لا الأدوات الفردية فحسب، بل كيف يتكامل نظام إدارة الجودة المنسّق عبر المؤسسة كلها."
        : "The Healthcare Quality Management Diploma covers the full scope of healthcare quality as it is practiced in modern facilities. You begin with quality concepts and frameworks, then move into the systems and methods that make good care reliable.\n\nCore areas include quality management systems, performance and process improvement (using methods such as PDSA, Lean, and Six Sigma), patient safety and risk management, and health data analytics — how to build and interpret quality indicators and KPIs. The diploma also covers accreditation standards and survey readiness for programs such as CBAHI, GAHAR, and JCI, along with policy, audit, and staff engagement.\n\nThroughout, the Healthcare Quality Management Diploma emphasizes turning measurement into action: identifying problems, testing changes, and sustaining improvement. By the end you understand not just individual tools but how a coordinated quality management system fits together across a whole organization.",
    },
    {
      q: ar
        ? "لمن دبلومة جودة الرعاية الصحية؟"
        : "Who should enroll in the Healthcare Quality Management Diploma?",
      group: "audience",
      a: ar
        ? "دبلومة إدارة جودة الرعاية الصحية مصمّمة للمتخصصين الراغبين في تحسين الرعاية وسلامة المرضى — سواء كنت تدخل مجال الجودة أو تقوّي خبرة قائمة. الممرضون والأطباء والصيادلة والمهن الصحية المساندة المنتقلون إلى أدوار الجودة أو سلامة المرضى أو الاعتماد هم من أكثر المستفيدين.\n\nيكتسب منسّقو الجودة ومسؤولو سلامة المرضى وكوادر الاعتماد أساسًا متكاملًا ومنظّمًا، بينما يتعلّم إداريو المستشفيات ومديرو الأقسام كيف تدعم الجودة التشغيل والنتائج. كما يجد محللو البيانات وكوادر المخاطر الذين يعملون مع مؤشرات الجودة قيمة في الدبلومة.\n\nلا تتطلّب الدبلومة خلفية متقدّمة للبدء — فهي تبني من الأساسيات إلى الممارسة التطبيقية، لذا نرحّب بالقادمين الجدد وحديثي التخرج الذين يستهدفون مسارًا في الجودة. فإذا كان عملك يمسّ الجودة أو سلامة المرضى أو الاعتماد وتريد أساسًا معترفًا به، فهذه الدبلومة لك."
        : "The Healthcare Quality Management Diploma is designed for professionals who want to improve care and patient safety — whether you are entering quality or strengthening existing experience. Nurses, physicians, pharmacists, and allied health professionals moving into quality, patient-safety, or accreditation roles are among those who benefit most.\n\nQuality coordinators, patient-safety officers, and accreditation staff gain a structured, well-rounded grounding, while hospital administrators and department managers learn how quality supports operations and outcomes. Data analysts and risk professionals who work with quality indicators also find the diploma valuable.\n\nNo advanced background is required to start — the Healthcare Quality Management Diploma builds from fundamentals to applied practice, so motivated newcomers and fresh graduates aiming for a quality career are welcome. If your work touches quality, patient safety, or accreditation and you want a recognized foundation, this diploma is for you.",
    },
    {
      q: ar
        ? "ما الفرص المهنية بعد دبلومة جودة الرعاية الصحية؟"
        : "What career opportunities follow the Healthcare Quality Management Diploma?",
      group: "career",
      a: ar
        ? "جودة الرعاية الصحية أولوية متنامية في الخليج ومصر، والطلب على الكوادر المدرّبة يزداد مع رفع برامج الاعتماد لتوقعاتها. ودبلومة إدارة جودة الرعاية الصحية تساعدك على تهيئة نفسك لأدوار الجودة وسلامة المرضى.\n\nمع الدبلومة تكون مؤهّلًا لأدوار مثل منسّق الجودة، أو مسؤول سلامة المرضى، أو مسؤول الاعتماد، أو أخصائي الجودة. ويمكن لأصحاب الخبرة التقدّم نحو مدير الجودة أو مدير إدارة الجودة، لدعم أو قيادة نظام إدارة الجودة في المنشأة. كما تعزّز المهارات مسارات مجاورة في المخاطر والتشغيل والاعتماد.\n\nوتبني دبلومة جودة الرعاية الصحية الأساس الذي يستخدمه كثيرون قبل السعي لشهادة CPHQ الدولية، التي قد توسّع الفرص المتقدّمة أكثر. ويبقى التوظيف والترقّي معتمدين على خبرتك وسوقك المحلي — الدبلومة تُعِدّك وتوثّق تعلّمك، ولا تَعِد بوظيفة بعينها."
        : "Healthcare quality is a growing priority across the Gulf and Egypt, and trained professionals are in demand as accreditation programs raise expectations. The Healthcare Quality Management Diploma helps you position yourself for quality and patient-safety roles.\n\nWith the diploma you are prepared for roles such as quality coordinator, patient-safety officer, accreditation officer, or quality specialist. Experienced professionals can move toward quality manager or director-of-quality positions, supporting or leading a facility's quality management system. The skills also strengthen adjacent careers in risk, operations, and accreditation.\n\nThe Healthcare Quality Management Diploma also builds the foundation many professionals use before pursuing the international CPHQ certification, which can further expand senior opportunities. Hiring and advancement always depend on your experience and local market — the diploma prepares and certifies your learning; it does not promise a specific job.",
    },
    {
      q: ar ? "ما الشهادة التي ستحصل عليها؟" : "What certificate will you receive?",
      group: "certificate",
      a: ar
        ? "عند إتمام دبلومة إدارة جودة الرعاية الصحية تحصل على شهادة إتمام موثّقة يمكن التحقّق منها من IMETS Medical School. توثّق أنك درست وأظهرت الكفاءات الأساسية لإدارة جودة الرعاية الصحية، ويمكنك إضافتها إلى سيرتك الذاتية وحسابك على LinkedIn لإثبات تدريبك.\n\nشهادة IMETS اعتراف بمهارات الجودة والسلامة والبيانات التي بنيتها عبر الدبلومة. تصدرها IMETS بوصفها جهة تدريب مستقلة، وهي منفصلة عن أي شهادة مهنية خارجية. وتحديدًا، دبلومة جودة الرعاية الصحية ليست هي مؤهل CPHQ، الذي تمنحه لجنة HQCC (التابعة لـ NAHQ) بعد اجتياز امتحانه.\n\nويتعامل كثير من المتخصصين مع الدبلومة كأساس قوي ومنظّم، ثم يسعون لاحقًا لشهادة CPHQ للحصول على مؤهل معترف به دوليًا. وسواء توقّفت عند الدبلومة أو واصلت نحو CPHQ، يمنحك التدريب مهارات جودة رعاية صحية تطبيقية ومحدّثة تقدّرها المستشفيات."
        : "On completing the Healthcare Quality Management Diploma you receive a verifiable certificate of completion from IMETS Medical School. It documents that you have studied and demonstrated the core competencies of healthcare quality management, and you can add it to your CV and LinkedIn to evidence your training.\n\nThe IMETS certificate recognizes the quality, safety, and data skills you have built through the diploma. It is issued by IMETS as an independent training provider and is separate from any external professional certification. In particular, the Healthcare Quality Management Diploma is not the same as the CPHQ credential, which is awarded by HQCC (part of NAHQ) after passing its own examination.\n\nMany professionals treat the diploma as a strong, structured foundation and later pursue the CPHQ certification to gain an internationally recognized credential. Whether you stop at the diploma or continue toward CPHQ, the training gives you applied, up-to-date healthcare quality skills that hospitals value.",
    },
    {
      q: ar
        ? "لماذا تُعدّ جودة الرعاية الصحية مهمة في المستشفيات؟"
        : "Why is healthcare quality important in hospitals?",
      group: "quality",
      a: ar
        ? "جودة الرعاية الصحية من أهم أسس الرعاية الحديثة، لأنها تُحدّد ما إذا كان المريض يتلقّى علاجًا آمنًا وفعّالًا ومتّسقًا. وجودة الرعاية الصحية القوية تمنع الأخطاء الطبية، وتقلّل الأذى الممكن تجنّبه، وتُقصّر مدة الإقامة، وتحسّن النتائج — بينما الجودة الضعيفة تُكلّف مالًا وثقةً وأرواحًا.\n\nوتعتمد جودة الرعاية الصحية الفعّالة على القياس: تتتبّع المستشفيات مؤشرات الجودة، وتراقب حوادث سلامة المرضى، وتحلّل البيانات الصحية لمعرفة أين يمكن تحسين الرعاية. ثم تحوّل إدارة الجودة تلك الرؤى إلى إجراءات عبر تحسين الأداء والعمليات، والسياسات الموحّدة، وتثقيف الطاقم، فتجعل الرعاية الجيدة موثوقة لا عرضية.\n\nوجودة الرعاية الصحية محورية للاعتماد أيضًا: فبرامج مثل CBAHI وGAHAR وJCI تُقيّم أداء الجودة وسلامة المرضى عن كثب، والنتائج الضعيفة قد تُهدّد الاعتماد. وهذا بالضبط هو العمل التطبيقي الذي تُعِدّك دبلومة إدارة جودة الرعاية الصحية لقيادته."
        : "Healthcare quality is one of the most important foundations of modern care, because it determines whether patients receive safe, effective, and consistent treatment. Strong healthcare quality prevents medical errors, reduces avoidable harm, shortens length of stay, and improves outcomes — while weak quality costs money, trust, and lives.\n\nEffective healthcare quality relies on measurement: hospitals track quality indicators, monitor patient-safety events, and analyze health data to see where care can improve. Quality management then turns those insights into action through performance and process improvement, standardized policies, and staff education, making good care reliable rather than accidental.\n\nHealthcare quality is also central to accreditation: programs such as CBAHI, GAHAR, and JCI evaluate quality and patient-safety performance closely, and weak results can jeopardize accreditation. This is exactly the practical work the Healthcare Quality Management Diploma prepares you to lead.",
    },
    {
      q: ar
        ? "ما تحسين الجودة وسلامة المرضى؟"
        : "What are quality improvement and patient safety?",
      group: "quality",
      a: ar
        ? "تحسين الجودة هو الجهد المنضبط والمستمر لجعل الرعاية أفضل، وسلامة المرضى هي هدفه الأهم. وهو ليس مشروعًا واحدًا، بل دورة متصلة: قياس الأداء الحالي، وتحديد مشكلة، واختبار تغيير، والتحقّق مما إذا نجح — غالبًا بنماذج مثل PDSA وLean وSix Sigma.\n\nوتركّز سلامة المرضى تحديدًا على منع الأذى — أخطاء الدواء، والعدوى المرتبطة بالرعاية الصحية، والسقوط، وغيرها من الأحداث الضائرة. والبرنامج الناضج للجودة يدرس هذه الأحداث دون إلقاء لوم، ويُجري تحليلًا للأسباب الجذرية، ويبني ضمانات في النظام حتى يقلّ احتمال تكرار الخطأ نفسه. وتقود البيانات الصحية هذا الجهد كلّه، مبيّنةً أين يتركّز الخطر وهل صمدت التحسينات.\n\nومعًا، يشكّل تحسين الجودة وسلامة المرضى جوهر إدارة جودة الرعاية الصحية وقلب دبلومة إدارة جودة الرعاية الصحية. وتتوقّع جهات الاعتماد من المستشفيات إثبات كليهما، ولهذا فإن هذه المهارات في طلب متزايد عبر الخليج ومصر."
        : "Quality improvement is the disciplined, ongoing effort to make care better, and patient safety is its most important goal. Rather than a single project, quality improvement is a continuous cycle: measure current performance, identify a problem, test a change, and check whether it worked — often using models such as PDSA, Lean, or Six Sigma.\n\nPatient safety focuses specifically on preventing harm — medication errors, healthcare-associated infections, falls, and other adverse events. A mature quality program studies these events without blame, performs root-cause analysis, and builds safeguards into the system so the same error is less likely to happen again. Health data guides the whole effort, showing where risk concentrates and whether improvements hold.\n\nTogether, quality improvement and patient safety form the core of healthcare quality management and the heart of the Healthcare Quality Management Diploma. Accreditation bodies expect hospitals to demonstrate both, which is why these skills are in growing demand across the Gulf and Egypt.",
    },
  ];
}

/* ---- Healthcare Marketing Diploma ---- */
function healthcareMarketingKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return DIPLOMA_GROUPS(ar, "📣", "skills", "Marketing in Healthcare", "التسويق في القطاع الصحي", "📊");
}
function healthcareMarketingKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar ? "ما هي دبلومة التسويق الصحي؟" : "What is the Healthcare Marketing Diploma?",
      group: "overview",
      a: ar
        ? "دبلومة التسويق الصحي هي برنامج منظّم من IMETS يعلّمك كيف تسوّق الخدمات والعلامات والمنشآت الصحية بفعالية وأخلاقية. تمنحك أساسًا عمليًا في التسويق الصحي — من بناء العلامة واستقطاب المرضى إلى التسويق الرقمي — مصمّمًا لقواعد وحساسيات القطاع الطبي الفريدة.\n\nعبر الدبلومة تدرس مجالات التسويق الصحي الأساسية: بناء العلامة، واستقطاب المرضى والاحتفاظ بهم، واستراتيجية التسويق، والمحتوى والقنوات الرقمية، وكيفية قياس النتائج — كلّها ضمن الحدود التنظيمية والأخلاقية التي يفرضها القطاع الصحي. وتركّز دبلومة التسويق الصحي على العيادات والمستشفيات والعلامات الطبية الحقيقية لا على نظرية التسويق العامة.\n\nتناسب الدبلومة القادمين الجدد للتسويق وأصحاب الخبرة الراغبين في مؤهل خاص بالقطاع الصحي. وعند الإتمام تنال شهادة إتمام موثّقة من IMETS Medical School توثّق مهارات التسويق التي بنيتها."
        : "The Healthcare Marketing Diploma is a structured IMETS program that teaches you how to market healthcare services, brands, and facilities effectively and ethically. It gives professionals a practical foundation in healthcare marketing — from branding and patient acquisition to digital marketing — tailored to the unique rules and sensitivities of the medical sector.\n\nAcross the diploma you study the core areas of healthcare marketing: brand building, patient acquisition and retention, marketing strategy, content and digital channels, and how to measure results — all within the regulatory and ethical boundaries healthcare demands. The Healthcare Marketing Diploma focuses on real clinics, hospitals, and medical brands, not generic marketing theory.\n\nIt suits both people new to marketing and those with experience who want a healthcare-specific qualification. On completion you earn a verifiable certificate of completion from IMETS Medical School, documenting the marketing skills you have built.",
    },
    {
      q: ar ? "ماذا تغطّي دبلومة التسويق الصحي؟" : "What does the Healthcare Marketing Diploma cover?",
      group: "curriculum",
      a: ar
        ? "تغطّي دبلومة التسويق الصحي الرحلة الكاملة من الاستراتيجية إلى التنفيذ في القطاع الطبي. تبدأ بما يجعل التسويق الصحي مختلفًا — الثقة والتنظيم وحساسية المريض — ثم تنتقل إلى بناء الحملات الفعّالة وتشغيلها.\n\nتشمل المجالات الأساسية بناء العلامة وتموضعها، واستقطاب المرضى والاحتفاظ بهم، واستراتيجية التسويق وتخطيطه، والتسويق الرقمي — القنوات والمحتوى ووسائل التواصل والحملات المدفوعة والتحليلات. كما تغطّي الدبلومة تجربة المريض، وإدارة السمعة، وكيفية قياس أداء التسويق بمؤشرات واضحة، كلّه ضمن القواعد الإعلانية وخصوصية بيانات المرضى.\n\nوطوال البرنامج تركّز دبلومة التسويق الصحي على تسويق أخلاقي وملتزم يبني الثقة لا الضجيج. وبنهايتها تستطيع تخطيط وتنفيذ استراتيجية تسويق صحي تصل إلى المرضى المناسبين وتنمّي العلامة الطبية بمسؤولية."
        : "The Healthcare Marketing Diploma covers the full journey from strategy to execution in the medical sector. You start with what makes healthcare marketing different — trust, regulation, and patient sensitivity — then move into building and running effective campaigns.\n\nCore areas include brand building and positioning, patient acquisition and retention, marketing strategy and planning, and digital marketing — channels, content, social media, paid campaigns, and analytics. The diploma also covers patient experience, reputation management, and how to measure marketing performance with clear metrics, all within advertising rules and patient-data privacy.\n\nThroughout, the Healthcare Marketing Diploma emphasizes ethical, compliant marketing that builds trust rather than hype. By the end you can plan and execute a healthcare marketing strategy that reaches the right patients and grows a medical brand responsibly.",
    },
    {
      q: ar ? "لمن دبلومة التسويق الصحي؟" : "Who should enroll in the Healthcare Marketing Diploma?",
      group: "audience",
      a: ar
        ? "دبلومة التسويق الصحي مصمّمة لكل من يروّج للخدمات الصحية أو ينمّيها. يستفيد أصحاب العيادات والأطباء الذين يديرون ممارساتهم مباشرةً، إذ يتعلّمون كيف يستقطبون المرضى المناسبين ويبنون الثقة دون الإضرار بالعلاقة الإكلينيكية.\n\nيكتسب كوادر التسويق والتواصل في المستشفيات والمجموعات الطبية والعيادات والصيدليات وشركات التقنية الصحية إطارًا خاصًا بالقطاع الصحي، بينما يتعلّم الإداريون المسؤولون عن نمو الخطوط الخدمية كيف يدعم التسويق العمل. كما تناسب الدبلومة حديثي التخرج من خلفية تسويقية أو صحية الراغبين في دخول القطاع الصحي.\n\nلا تُشترط خبرة تسويقية سابقة — فالدبلومة تبني من الأساسيات إلى الاستراتيجية والتسويق الرقمي، ومصمّمة لمن يأتي من خلفية صحية لا تسويقية. فإذا أردت تنمية علامة صحية أو الانتقال إلى التسويق الصحي، فهذه الدبلومة لك."
        : "The Healthcare Marketing Diploma is designed for anyone who promotes or grows healthcare services. Clinic owners and doctors who run their own practice benefit directly, learning how to attract the right patients and build trust without harming the clinical relationship.\n\nMarketing and communications staff in hospitals, medical groups, clinics, pharmacies, and health-tech companies gain a healthcare-specific framework, while administrators responsible for service-line growth learn how marketing supports the business. Fresh graduates from a marketing or health background who want to enter the healthcare sector are also well suited.\n\nNo prior marketing experience is required — the diploma builds from fundamentals to strategy and digital marketing, designed for people arriving from a healthcare background rather than a marketing one. If you want to grow a healthcare brand or move into healthcare marketing, this diploma is for you.",
    },
    {
      q: ar
        ? "ما الفرص المهنية بعد دبلومة التسويق الصحي؟"
        : "What career opportunities follow the Healthcare Marketing Diploma?",
      group: "career",
      a: ar
        ? "الرعاية الصحية تتوسّع بسرعة في الخليج ومصر، وتتنافس المؤسسات بشكل متزايد على المرضى — ما يجعل مسوّقي القطاع الصحي المهرة ذوي قيمة. ودبلومة التسويق الصحي تساعدك على تهيئة نفسك لأدوار التسويق والنمو في القطاع.\n\nمع الدبلومة تكون مؤهّلًا لأدوار مثل منسّق أو أخصائي تسويق صحي، أو أخصائي تسويق رقمي، أو أدوار المحتوى ووسائل التواصل داخل علامة طبية. ويمكن لأصحاب الخبرة التقدّم نحو مدير التسويق الصحي أو مدير إدارة التسويق، وأصحاب العيادات تسويق ممارساتهم بفعالية أكبر.\n\nكما تعزّز دبلومة التسويق الصحي مسارات مجاورة في تطوير الأعمال وتجربة المريض والتواصل. ويبقى التوظيف والترقّي معتمدين على خبرتك وسوقك المحلي — الدبلومة تُعِدّك وتوثّق تعلّمك، ولا تَعِد بوظيفة بعينها. وما تمنحه هو أساس تسويقي خاص بالقطاع الصحي تُبنى عليه هذه الأدوار."
        : "Healthcare is expanding fast across the Gulf and Egypt, and organizations increasingly compete for patients — making skilled healthcare marketers valuable. The Healthcare Marketing Diploma helps you position yourself for marketing and growth roles in the sector.\n\nWith the diploma you are prepared for roles such as healthcare marketing coordinator or specialist, digital marketing specialist, or content and social-media roles within a medical brand. Experienced professionals can move toward healthcare marketing manager or marketing director positions, and clinic owners can market their own practice more effectively.\n\nThe Healthcare Marketing Diploma also strengthens adjacent paths in business development, patient experience, and communications. Hiring and advancement always depend on your experience and local market — the diploma prepares and certifies your learning; it does not promise a specific job. What it gives you is a healthcare-specific marketing foundation that these roles are built on.",
    },
    {
      q: ar ? "ما الشهادة التي ستحصل عليها؟" : "What certificate will you receive?",
      group: "certificate",
      a: ar
        ? "عند إتمام دبلومة التسويق الصحي تحصل على شهادة إتمام موثّقة يمكن التحقّق منها من IMETS Medical School. توثّق أنك درست وأظهرت الكفاءات الأساسية للتسويق الصحي، ويمكنك إضافتها إلى سيرتك الذاتية وحسابك على LinkedIn لإثبات تدريبك.\n\nشهادة IMETS اعتراف بمهارات بناء العلامة واستقطاب المرضى والتسويق الرقمي التي بنيتها عبر الدبلومة. تصدرها IMETS بوصفها جهة تدريب مستقلة — علامة على تدريب مهني منظّم ومكتمل.\n\nوبالنسبة لكثيرين، تمثّل دبلومة التسويق الصحي خطوة واضحة إلى مجال التسويق الصحي أو وسيلة لتسويق ممارستهم بثقة. ومع خبرتك وأعمالك، تساعدك الشهادة على تقديم حجة موثوقة لأدوار التسويق عبر القطاع الصحي."
        : "On completing the Healthcare Marketing Diploma you receive a verifiable certificate of completion from IMETS Medical School. It documents that you have studied and demonstrated the core competencies of healthcare marketing, and you can add it to your CV and LinkedIn to evidence your training.\n\nThe IMETS certificate recognizes the branding, patient-acquisition, and digital marketing skills you have built through the diploma. It is issued by IMETS as an independent training provider — a mark of completed, structured professional training.\n\nFor many professionals, the Healthcare Marketing Diploma is a clear step into the healthcare marketing field or a way to market their own practice with confidence. Combined with your experience and a portfolio of your work, the certificate helps you present a credible case for marketing roles across the healthcare sector.",
    },
    {
      q: ar
        ? "بماذا يختلف التسويق الصحي ولماذا يهمّ؟"
        : "How is healthcare marketing different, and why does it matter?",
      group: "skills",
      a: ar
        ? "التسويق الصحي مختلف عن التسويق العادي، وفهم هذا الفرق هو جوهر الدبلومة. أنت تسوّق لقرار صحي لا لسلعة: القيود الإعلانية أشدّ، وخصوصية بيانات المرضى ملزِمة، والادعاءات الطبية مقيّدة، والثقة تُبنى ببطء وتُفقد بسرعة.\n\nويهمّ التسويق الصحي لأن جودة الرعاية وحدها لا تملأ عيادة ولا تنمّي خطًا خدميًا — فالمرضى يحتاجون أولًا أن يجدوا مقدّم الخدمة ويفهموه ويثقوا به. والتسويق الصحي الفعّال والأخلاقي يربط المرضى المناسبين بالرعاية المناسبة، ويحسّن تجربة المريض، ويساعد المنشآت على النمو بمسؤولية، بينما يهدر التسويق الضعيف الميزانية أو يضرّ بالسمعة.\n\nوالأدوات نفسها كالتسويق العام — الرسالة والمسار والمحتوى والقياس — لكن حدودها فريدة في القطاع الصحي. وتعلّم العمل ضمن هذه الحدود هو بالضبط ما صُمّمت دبلومة التسويق الصحي لتعليمه."
        : "Healthcare marketing is different from ordinary marketing, and understanding that difference is the heart of the diploma. You are marketing a health decision, not a product: advertising rules are stricter, patient-data privacy is binding, medical claims are constrained, and trust is slow to build and quick to lose.\n\nHealthcare marketing matters because good care alone does not fill a clinic or grow a service line — patients need to find, understand, and trust a provider first. Effective, ethical healthcare marketing connects the right patients to the right care, improves patient experience, and helps facilities grow responsibly, while poor marketing wastes budget or damages reputation.\n\nThe same tools as general marketing apply — message, funnel, content, and measurement — but their boundaries are unique to healthcare. Learning to work within those boundaries is exactly what the Healthcare Marketing Diploma is built to teach.",
    },
    {
      q: ar
        ? "ماذا يفعل مدير التسويق الصحي؟"
        : "What does a healthcare marketing manager do?",
      group: "skills",
      a: ar
        ? "مدير التسويق الصحي يخطّط ويقود كيف تستقطب عيادة أو مستشفى أو علامة طبية المرضى وتحتفظ بهم. فبدلًا من تقديم الرعاية، يبني الاستراتيجية والحملات والقنوات التي تربط المرضى المناسبين بالخدمات المناسبة — وهو من أهم الأدوار التي تُعِدّك لها دبلومة التسويق الصحي.\n\nيوميًا، يطوّر مدير التسويق الصحي الاستراتيجية والميزانية، ويشرف على العلامة والمحتوى، ويدير الحملات الرقمية ووسائل التواصل، ويدير استقطاب المرضى والسمعة. ويتتبّع الأداء بمؤشرات واضحة ويعدّل الحملات لتحسين النتائج، دائمًا ضمن القواعد الإعلانية وخصوصية بيانات المرضى.\n\nكما يتعاون مدير التسويق الصحي عبر المؤسسة — مع القادة الإكلينيكيين والإدارة والخطوط الخدمية — لأن التسويق يجب أن يعكس القدرات والمعايير الحقيقية. ويحوّل أهداف العمل إلى نمو في المرضى بمسؤولية. وتبني دبلومة التسويق الصحي هذه المهارات بالضبط، محوّلةً الاهتمام بالتسويق إلى مسار خاص بالقطاع الصحي."
        : "A healthcare marketing manager plans and leads how a clinic, hospital, or medical brand attracts and retains patients. Rather than delivering care, they build the strategy, campaigns, and channels that connect the right patients to the right services — one of the main roles the Healthcare Marketing Diploma prepares you for.\n\nDay to day, a healthcare marketing manager develops the marketing strategy and budget, oversees branding and content, runs digital and social campaigns, and manages patient acquisition and reputation. They track performance with clear metrics and adjust campaigns to improve results, always within advertising rules and patient-data privacy.\n\nA healthcare marketing manager also collaborates across the organization — with clinical leaders, administration, and service lines — because marketing must reflect real capabilities and standards. They turn business goals into patient growth responsibly. The Healthcare Marketing Diploma builds exactly these skills, turning marketing interest into a healthcare-specific career.",
    },
  ];
}

/* ---- Healthcare HR Management Diploma ---- */
function healthcareHrKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return DIPLOMA_GROUPS(ar, "👥", "skills", "HR in Healthcare", "الموارد البشرية في القطاع الصحي", "📊");
}
function healthcareHrKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar
        ? "ما هي دبلومة إدارة الموارد البشرية الصحية؟"
        : "What is the Healthcare HR Management Diploma?",
      group: "overview",
      a: ar
        ? "دبلومة إدارة الموارد البشرية الصحية هي برنامج منظّم من IMETS يبني المهارات اللازمة لإدارة الأفراد بفعالية في المؤسسات الصحية. تمنح المتخصصين أساسًا عمليًا في الموارد البشرية الصحية — التوظيف، وتخطيط القوى العاملة، وعلاقات الموظفين، والأداء — مصمّمًا لمتطلبات المستشفيات والعيادات.\n\nعبر الدبلومة تدرس وظائف الموارد البشرية الأساسية في بيئة صحية: استقطاب الكفاءات، وتخطيط القوى العاملة، والتدريب والتطوير، وإدارة الأداء، والتعويضات، وعلاقات العمل، إلى جانب التحديات الخاصة بتوظيف الفرق الإكلينيكية وغير الإكلينيكية. وتركّز دبلومة الموارد البشرية الصحية على بيئات المستشفيات والعيادات الحقيقية لا على نظرية الموارد البشرية العامة.\n\nتناسب الدبلومة القادمين الجدد للموارد البشرية وأصحاب الخبرة الراغبين في مؤهل خاص بالقطاع الصحي. وعند الإتمام تنال شهادة إتمام موثّقة من IMETS Medical School توثّق كفاءات الموارد البشرية التي بنيتها."
        : "The Healthcare HR Management Diploma is a structured IMETS program that builds the skills needed to manage people effectively in healthcare organizations. It gives professionals a practical foundation in healthcare human resources — recruitment, workforce planning, employee relations, and performance — tailored to the demands of hospitals and clinics.\n\nAcross the diploma you study the core HR functions in a healthcare setting: talent acquisition, workforce planning, training and development, performance management, compensation, and labor relations, along with the healthcare-specific challenges of staffing clinical and non-clinical teams. The Healthcare HR Management Diploma focuses on real hospital and clinic environments, not generic HR theory.\n\nIt suits both people new to HR and those with experience who want a healthcare-specific qualification. On completion you earn a verifiable certificate of completion from IMETS Medical School, documenting the HR competencies you have built.",
    },
    {
      q: ar
        ? "ماذا تغطّي دبلومة الموارد البشرية الصحية؟"
        : "What does the Healthcare HR Management Diploma cover?",
      group: "curriculum",
      a: ar
        ? "تغطّي دبلومة إدارة الموارد البشرية الصحية دورة الموارد البشرية الكاملة كما تنطبق على المؤسسات الصحية. تبدأ بالدور الاستراتيجي للموارد البشرية في المستشفى، ثم تنتقل عبر الوظائف التي تستقطب القوى العاملة الصحية وتطوّرها وتحتفظ بها.\n\nتشمل المجالات الأساسية استقطاب الكفاءات والتوظيف، وتخطيط القوى العاملة، والتهيئة والتدريب، وإدارة الأداء، والتعويضات والمزايا، وعلاقات الموظفين وإشراكهم. كما تغطّي الدبلومة أساسيات قانون العمل، وسياسات الموارد البشرية، والتحدي الخاص بجدولة الكوادر الإكلينيكية مثل الممرضين والأطباء والاحتفاظ بهم، حيث يشيع النقص والإرهاق.\n\nوطوال البرنامج تركّز دبلومة الموارد البشرية الصحية على بناء قوى عاملة مستقرة ومتحفّزة تدعم رعاية آمنة للمرضى. وبنهايتها تفهم لا كل وظيفة على حدة، بل كيف تتكامل معًا لإبقاء المؤسسة الصحية مزوّدة بالكوادر ومنخرطة."
        : "The Healthcare HR Management Diploma covers the full HR lifecycle as it applies to healthcare organizations. You start with the strategic role of HR in a hospital, then move through the functions that recruit, develop, and retain a healthcare workforce.\n\nCore areas include talent acquisition and recruitment, workforce and staffing planning, onboarding and training, performance management, compensation and benefits, and employee relations and engagement. The diploma also covers labor law fundamentals, HR policies, and the specific challenge of scheduling and retaining clinical staff such as nurses and physicians, where shortages and burnout are common.\n\nThroughout, the Healthcare HR Management Diploma emphasizes building a stable, motivated workforce that supports safe patient care. By the end you understand not just each HR function but how they combine to keep a healthcare organization properly staffed and engaged.",
    },
    {
      q: ar
        ? "لمن دبلومة الموارد البشرية الصحية؟"
        : "Who should enroll in the Healthcare HR Management Diploma?",
      group: "audience",
      a: ar
        ? "دبلومة إدارة الموارد البشرية الصحية مصمّمة لكل من يدير — أو يريد أن يدير — الأفراد في بيئة صحية. يكتسب كوادر الموارد البشرية في المستشفيات والعيادات والمجموعات الطبية إطارًا خاصًا بالقطاع، بينما يتعلّم الإداريون ومديرو الأقسام كيفية إدارة التوظيف والأداء والإشراك في فرقهم.\n\nيستفيد قادة الفرق الإكلينيكية — مثل رؤساء التمريض أو رؤساء الأقسام — الذين يشرفون على الكوادر، وكذلك المتخصصون من خلفية موارد بشرية عامة الراغبون في الانتقال إلى القطاع الصحي. ويكتسب أصحاب العيادات المسؤولون عن توظيف فرقهم وإدارتها منهجًا منظّمًا لقرارات القوى العاملة.\n\nلا تُشترط خلفية متقدّمة في الموارد البشرية — فالدبلومة تبني من الأساسيات إلى الممارسة التطبيقية، لذا نرحّب بالقادمين الجدد وحديثي التخرج الذين يستهدفون مسارًا في الموارد البشرية الصحية. فإذا كان دورك يشمل استقطاب الأفراد أو تطويرهم أو قيادتهم في القطاع الصحي، فهذه الدبلومة لك."
        : "The Healthcare HR Management Diploma is designed for anyone who manages — or wants to manage — people in a healthcare setting. HR staff in hospitals, clinics, and medical groups gain a sector-specific framework, while administrators and department managers learn to handle staffing, performance, and engagement in their teams.\n\nClinical team leaders — such as head nurses or department heads — who supervise staff also benefit, as do professionals from a general HR background who want to move into healthcare. Clinic owners responsible for hiring and managing their own teams gain a structured approach to workforce decisions.\n\nNo advanced HR background is required — the diploma builds from fundamentals to applied practice, so newcomers and fresh graduates aiming for a healthcare HR career are welcome. If your role involves recruiting, developing, or leading people in healthcare, this diploma is for you.",
    },
    {
      q: ar
        ? "ما الفرص المهنية بعد دبلومة الموارد البشرية الصحية؟"
        : "What career opportunities follow the Healthcare HR Management Diploma?",
      group: "career",
      a: ar
        ? "القطاع الصحي كثيف الاعتماد على الأفراد ويواجه ضغوطًا حقيقية في القوى العاملة، لذا فإن الطلب على كوادر الموارد البشرية المهرة مستمر في الخليج ومصر. ودبلومة إدارة الموارد البشرية الصحية تساعدك على تهيئة نفسك لأدوار الموارد البشرية وإدارة الأفراد في القطاع.\n\nمع الدبلومة تكون مؤهّلًا لأدوار مثل منسّق موارد بشرية، أو أخصائي توظيف، أو مسؤول موارد بشرية في مستشفى أو عيادة. ويمكن لأصحاب الخبرة التقدّم نحو مدير موارد بشرية أو شريك أعمال الموارد البشرية، ويمكن للقادة الإكلينيكيين تقوية جانب إدارة الأفراد في أدوارهم. كما تدعم المهارات مسارات في التدريب وتخطيط القوى العاملة والتشغيل.\n\nوتعزّز دبلومة الموارد البشرية الصحية مسارات مجاورة في الإدارة والتطوير المؤسسي. ويبقى التوظيف والترقّي معتمدين على خبرتك وسوقك المحلي — الدبلومة تُعِدّك وتوثّق تعلّمك، ولا تَعِد بوظيفة بعينها. وما تمنحه هو أساس موارد بشرية خاص بالقطاع الصحي تُبنى عليه هذه الأدوار."
        : "Healthcare is a people-intensive sector facing real workforce pressures, so skilled HR professionals are in steady demand across the Gulf and Egypt. The Healthcare HR Management Diploma helps you position yourself for HR and people-management roles in the sector.\n\nWith the diploma you are prepared for roles such as HR coordinator, recruitment specialist, or HR officer in a hospital or clinic. Experienced professionals can move toward HR manager or HR business partner positions, and clinical leaders can strengthen the people-management side of their role. The skills also support careers in training, workforce planning, and operations.\n\nThe Healthcare HR Management Diploma also strengthens adjacent paths in administration and organizational development. Hiring and advancement always depend on your experience and local market — the diploma prepares and certifies your learning; it does not promise a specific job. What it gives you is a healthcare-specific HR foundation that these roles are built on.",
    },
    {
      q: ar ? "ما الشهادة التي ستحصل عليها؟" : "What certificate will you receive?",
      group: "certificate",
      a: ar
        ? "عند إتمام دبلومة إدارة الموارد البشرية الصحية تحصل على شهادة إتمام موثّقة يمكن التحقّق منها من IMETS Medical School. توثّق أنك درست وأظهرت الكفاءات الأساسية لإدارة الموارد البشرية الصحية، ويمكنك إضافتها إلى سيرتك الذاتية وحسابك على LinkedIn لإثبات تدريبك.\n\nشهادة IMETS اعتراف بمهارات التوظيف وتخطيط القوى العاملة وإدارة الأفراد التي بنيتها عبر الدبلومة. تصدرها IMETS بوصفها جهة تدريب مستقلة — علامة على تدريب مهني منظّم ومكتمل.\n\nوبالنسبة لكثيرين، تمثّل دبلومة الموارد البشرية الصحية خطوة واضحة إلى الموارد البشرية الصحية أو وسيلة لإدارة الفرق بفعالية أكبر. ومع خبرتك، تساعدك الشهادة على تقديم حجة موثوقة لأدوار الموارد البشرية وإدارة الأفراد عبر القطاع الصحي."
        : "On completing the Healthcare HR Management Diploma you receive a verifiable certificate of completion from IMETS Medical School. It documents that you have studied and demonstrated the core competencies of healthcare human resources management, and you can add it to your CV and LinkedIn to evidence your training.\n\nThe IMETS certificate recognizes the recruitment, workforce-planning, and people-management skills you have built through the diploma. It is issued by IMETS as an independent training provider — a mark of completed, structured professional training.\n\nFor many professionals, the Healthcare HR Management Diploma is a clear step into healthcare HR or a way to manage teams more effectively. Combined with your experience, the certificate helps you present a credible case for HR and people-management roles across the healthcare sector.",
    },
    {
      q: ar
        ? "لماذا تُعدّ الموارد البشرية مهمة في القطاع الصحي؟"
        : "Why is HR important in healthcare?",
      group: "skills",
      a: ar
        ? "الموارد البشرية حاسمة في القطاع الصحي لأن الأفراد هم من يقدّمون الرعاية — والمستشفى بقوة الفرق التي تديره. وإدارة الموارد البشرية الفعّالة تضمن تزويد المنشآت بالكوادر، واستقطاب الكفاءات الإكلينيكية والمساندة والاحتفاظ بها، وتدريب الفرق ودعمها وإشراكها.\n\nويواجه القطاع الصحي تحديات خاصة بالقوى العاملة: نقص الممرضين والاختصاصيين، والإرهاق المرتفع، والجداول المرهِقة، ومتطلبات الكفاءة والترخيص الصارمة. والإدارة الجيدة للموارد البشرية تعالج ذلك مباشرةً عبر تخطيط القوى العاملة، واستراتيجيات الاحتفاظ، وإدارة الأداء العادلة، وبيئة عمل صحية — بينما تؤدّي الموارد البشرية الضعيفة إلى دوران الموظفين، وفجوات التغطية، ومخاطر على سلامة المرضى.\n\nوترتبط الموارد البشرية بالجودة والامتثال أيضًا: فالاعتماد الصحيح للكوادر، وسجلات التدريب، ومستويات التوظيف تدعم الاعتماد والرعاية الآمنة. وهذه بالضبط القدرات التي صُمّمت دبلومة الموارد البشرية الصحية لتطويرها."
        : "Human resources is critical in healthcare because people deliver care — and a hospital is only as strong as the teams that run it. Effective HR management ensures facilities are properly staffed, that talented clinicians and support staff are recruited and retained, and that teams are trained, supported, and engaged.\n\nHealthcare faces particular workforce challenges: shortages of nurses and specialists, high burnout, demanding schedules, and strict competency and licensing requirements. Good HR management addresses these directly through workforce planning, retention strategies, fair performance management, and a healthy work environment — while weak HR leads to turnover, gaps in coverage, and risks to patient safety.\n\nHR is also tied to quality and compliance: proper credentialing, training records, and staffing levels support accreditation and safe care. These are exactly the capabilities the Healthcare HR Management Diploma is built to develop.",
    },
    {
      q: ar
        ? "ماذا يفعل مدير الموارد البشرية الصحية؟"
        : "What does a healthcare HR manager do?",
      group: "skills",
      a: ar
        ? "مدير الموارد البشرية الصحية يقود كيف يوظّف المستشفى أو العيادة قواه العاملة ويطوّرها ويحتفظ بها. فبدلًا من تقديم الرعاية، يدير أنظمة الأفراد التي تجعل الرعاية الآمنة ممكنة — وهو من أهم الأدوار التي تُعِدّك لها دبلومة الموارد البشرية الصحية.\n\nيوميًا، يشرف مدير الموارد البشرية الصحية على التوظيف والتزويد بالكوادر، ويدير الأداء والتدريب، ويتعامل مع علاقات الموظفين وإشراكهم، ويدير التعويضات والمزايا. ويخطّط القوى العاملة لتلائم الطلب الإكلينيكي، ويعالج النقص ودوران الموظفين، ويضمن استيفاء سجلات الكوادر واعتمادها وسياساتها للمتطلبات.\n\nكما يتعاون مدير الموارد البشرية الصحية عبر المؤسسة — مع القادة الإكلينيكيين والإدارة ومديري الأقسام — لأن التوظيف والأداء يمسّان كل فريق. ويوازن بين احتياجات الموظفين واحتياجات المنشأة. وتبني دبلومة الموارد البشرية الصحية هذه المهارات بالضبط، محوّلةً الاهتمام بالموارد البشرية إلى مسار خاص بالقطاع الصحي."
        : "A healthcare HR manager leads how a hospital or clinic recruits, develops, and retains its workforce. Rather than delivering care, they manage the people systems that make safe care possible — one of the main roles the Healthcare HR Management Diploma prepares you for.\n\nDay to day, a healthcare HR manager oversees recruitment and staffing, manages performance and training, handles employee relations and engagement, and administers compensation and benefits. They plan the workforce to match clinical demand, address shortages and turnover, and ensure staff records, credentialing, and policies meet requirements.\n\nA healthcare HR manager also collaborates across the organization — with clinical leaders, administration, and department managers — because staffing and performance touch every team. They balance the needs of employees with the needs of the facility. The Healthcare HR Management Diploma builds exactly these skills, turning HR interest into a healthcare-specific career.",
    },
  ];
}

/* ---- Healthcare Supply Chain Diploma ---- */
function healthcareSupplyChainKnowledgeGroups(ar: boolean): KnowledgeGroup[] {
  return DIPLOMA_GROUPS(ar, "📦", "skills", "Supply Chain in Healthcare", "سلسلة الإمداد في القطاع الصحي", "📊");
}
function healthcareSupplyChainKnowledgeCenter(ar: boolean): FaqItem[] {
  return [
    {
      q: ar
        ? "ما هي دبلومة سلسلة الإمداد الصحية؟"
        : "What is the Healthcare Supply Chain Diploma?",
      group: "overview",
      a: ar
        ? "دبلومة سلسلة الإمداد الصحية هي برنامج منظّم من IMETS يبني المهارات اللازمة لإدارة تدفّق المستلزمات والأجهزة والأدوية عبر المؤسسة الصحية. تمنح المتخصصين أساسًا عمليًا في إدارة سلسلة الإمداد الصحية — المشتريات، والمخزون، والخدمات اللوجستية، والتوزيع — مصمّمًا لمتطلبات المستشفيات والعيادات.\n\nعبر الدبلومة تدرس المجالات الأساسية لسلسلة الإمداد الصحية: المشتريات والتوريد، وإدارة المخزون، والتخزين، والخدمات اللوجستية والتوزيع، والمناولة الخاصة التي تتطلّبها السلع الطبية، بما فيها سلسلة التبريد والتحكّم في الصلاحية. وتركّز دبلومة سلسلة الإمداد الصحية على تشغيل المستشفيات والعيادات الحقيقي لا على نظرية اللوجستيات العامة.\n\nتناسب الدبلومة القادمين الجدد لسلسلة الإمداد وأصحاب الخبرة الراغبين في مؤهل خاص بالقطاع الصحي. وعند الإتمام تنال شهادة إتمام موثّقة من IMETS Medical School توثّق كفاءات سلسلة الإمداد التي بنيتها."
        : "The Healthcare Supply Chain Diploma is a structured IMETS program that builds the skills needed to manage the flow of medical supplies, equipment, and medicines through a healthcare organization. It gives professionals a practical foundation in healthcare supply chain management — procurement, inventory, logistics, and distribution — tailored to the demands of hospitals and clinics.\n\nAcross the diploma you study the core areas of the healthcare supply chain: procurement and sourcing, inventory and stock management, warehousing, logistics and distribution, and the special handling that medical goods require, including cold-chain and expiry control. The Healthcare Supply Chain Diploma focuses on real hospital and clinic operations, not generic logistics theory.\n\nIt suits both people new to supply chain and those with experience who want a healthcare-specific qualification. On completion you earn a verifiable certificate of completion from IMETS Medical School, documenting the supply-chain competencies you have built.",
    },
    {
      q: ar
        ? "ماذا تغطّي دبلومة سلسلة الإمداد الصحية؟"
        : "What does the Healthcare Supply Chain Diploma cover?",
      group: "curriculum",
      a: ar
        ? "تغطّي دبلومة سلسلة الإمداد الصحية التدفّق الكامل للسلع من المورّد إلى نقطة الرعاية في بيئة صحية. تبدأ بكيفية هيكلة سلسلة الإمداد الصحية، ثم تنتقل عبر الوظائف التي تُبقي المنشآت مزوّدة وتعمل.\n\nتشمل المجالات الأساسية المشتريات وإدارة المورّدين، وضبط المخزون، وتخطيط الطلب والتنبؤ، والتخزين، والخدمات اللوجستية والتوزيع. كما تغطّي الدبلومة المتطلبات الطبية الخاصة بالسلسلة — إدارة سلسلة التبريد، والتحكّم في الصلاحية والتشغيلات، والأجهزة والمستهلكات الطبية، والموازنة بين تجنّب النفاد وضبط التكلفة — إلى جانب البيانات ومؤشرات الأداء والامتثال.\n\nوطوال البرنامج تركّز دبلومة سلسلة الإمداد الصحية على الموثوقية وضبط التكلفة: ضمان توفّر المستلزمات المناسبة في الوقت المناسب دون هدر. وبنهايتها تفهم لا الوظائف الفردية فحسب، بل كيف تتكامل المشتريات والمخزون واللوجستيات لدعم رعاية آمنة وغير منقطعة."
        : "The Healthcare Supply Chain Diploma covers the full flow of goods from supplier to point of care in a healthcare setting. You start with how the healthcare supply chain is structured, then move through the functions that keep facilities stocked and running.\n\nCore areas include procurement and supplier management, inventory and stock control, demand planning and forecasting, warehousing, and logistics and distribution. The diploma also covers the medical-specific requirements of the supply chain — cold-chain management, expiry and lot control, medical equipment and consumables, and the balance between avoiding stockouts and controlling cost — along with data, KPIs, and compliance.\n\nThroughout, the Healthcare Supply Chain Diploma emphasizes reliability and cost control: making sure the right supplies are available at the right time without waste. By the end you understand not just individual functions but how procurement, inventory, and logistics fit together to support safe, uninterrupted care.",
    },
    {
      q: ar
        ? "لمن دبلومة سلسلة الإمداد الصحية؟"
        : "Who should enroll in the Healthcare Supply Chain Diploma?",
      group: "audience",
      a: ar
        ? "دبلومة سلسلة الإمداد الصحية مصمّمة لكل من يدير — أو يريد أن يدير — المستلزمات واللوجستيات في بيئة صحية. يكتسب كوادر المشتريات والمخازن واللوجستيات في المستشفيات والعيادات والصيدليات إطارًا خاصًا بالقطاع، بينما يتعلّم الإداريون المسؤولون عن الموارد كيف تدعم سلسلة الإمداد التشغيل والموازنات.\n\nيستفيد المتخصصون من خلفية سلسلة إمداد أو لوجستيات عامة الراغبون في الانتقال إلى القطاع الصحي، وكذلك كوادر الصيدلة والهندسة الطبية المشاركون في الطلب والمخزون. ويكتسب أصحاب العيادات ومديرو المنشآت المسؤولون عن المشتريات منهجًا منظّمًا للتوريد والمخزون.\n\nلا تُشترط خلفية متقدّمة — فالدبلومة تبني من الأساسيات إلى الممارسة التطبيقية، لذا نرحّب بالقادمين الجدد وحديثي التخرج الذين يستهدفون مسارًا في سلسلة الإمداد الصحية. فإذا كان دورك يمسّ المشتريات أو المخزون أو اللوجستيات في القطاع الصحي، فهذه الدبلومة لك."
        : "The Healthcare Supply Chain Diploma is designed for anyone who manages — or wants to manage — supplies and logistics in a healthcare setting. Procurement, stores, and logistics staff in hospitals, clinics, and pharmacies gain a sector-specific framework, while administrators responsible for resources learn how the supply chain supports operations and budgets.\n\nProfessionals from a general supply-chain or logistics background who want to move into healthcare also benefit, as do pharmacy and biomedical staff involved in ordering and stock. Clinic owners and facility managers responsible for procurement gain a structured approach to sourcing and inventory.\n\nNo advanced background is required — the diploma builds from fundamentals to applied practice, so newcomers and fresh graduates aiming for a healthcare supply-chain career are welcome. If your role touches procurement, inventory, or logistics in healthcare, this diploma is for you.",
    },
    {
      q: ar
        ? "ما الفرص المهنية بعد دبلومة سلسلة الإمداد الصحية؟"
        : "What career opportunities follow the Healthcare Supply Chain Diploma?",
      group: "career",
      a: ar
        ? "تعتمد الرعاية الصحية على تدفّق موثوق للمستلزمات، والطلب على كوادر سلسلة الإمداد المهرة مستمر في الخليج ومصر مع توسّع المنشآت وتزايد ضغوط التكلفة. ودبلومة سلسلة الإمداد الصحية تساعدك على تهيئة نفسك لأدوار المشتريات واللوجستيات في القطاع.\n\nمع الدبلومة تكون مؤهّلًا لأدوار مثل مسؤول مشتريات، أو أخصائي مخزون/مخازن، أو منسّق لوجستيات في مستشفى أو عيادة. ويمكن لأصحاب الخبرة التقدّم نحو مدير سلسلة الإمداد أو مدير المشتريات، لدعم أو قيادة عمليات الإمداد في المنشأة. كما تدعم المهارات مسارات في التشغيل وإدارة المواد.\n\nوتعزّز دبلومة سلسلة الإمداد الصحية مسارات مجاورة في الإدارة والتشغيل. ويبقى التوظيف والترقّي معتمدين على خبرتك وسوقك المحلي — الدبلومة تُعِدّك وتوثّق تعلّمك، ولا تَعِد بوظيفة بعينها. وما تمنحه هو أساس سلسلة إمداد خاص بالقطاع الصحي تُبنى عليه هذه الأدوار."
        : "Healthcare depends on a reliable flow of supplies, and skilled supply-chain professionals are in steady demand across the Gulf and Egypt as facilities expand and cost pressures grow. The Healthcare Supply Chain Diploma helps you position yourself for procurement and logistics roles in the sector.\n\nWith the diploma you are prepared for roles such as procurement officer, inventory or stores specialist, or logistics coordinator in a hospital or clinic. Experienced professionals can move toward supply-chain manager or procurement manager positions, supporting or leading a facility's supply operations. The skills also support careers in operations and materials management.\n\nThe Healthcare Supply Chain Diploma also strengthens adjacent paths in administration and operations. Hiring and advancement always depend on your experience and local market — the diploma prepares and certifies your learning; it does not promise a specific job. What it gives you is a healthcare-specific supply-chain foundation that these roles are built on.",
    },
    {
      q: ar ? "ما الشهادة التي ستحصل عليها؟" : "What certificate will you receive?",
      group: "certificate",
      a: ar
        ? "عند إتمام دبلومة سلسلة الإمداد الصحية تحصل على شهادة إتمام موثّقة يمكن التحقّق منها من IMETS Medical School. توثّق أنك درست وأظهرت الكفاءات الأساسية لإدارة سلسلة الإمداد الصحية، ويمكنك إضافتها إلى سيرتك الذاتية وحسابك على LinkedIn لإثبات تدريبك.\n\nشهادة IMETS اعتراف بمهارات المشتريات والمخزون واللوجستيات التي بنيتها عبر الدبلومة. تصدرها IMETS بوصفها جهة تدريب مستقلة — علامة على تدريب مهني منظّم ومكتمل.\n\nوبالنسبة لكثيرين، تمثّل دبلومة سلسلة الإمداد الصحية خطوة واضحة إلى عمل سلسلة الإمداد الصحية أو وسيلة لإدارة المشتريات والمخزون بفعالية أكبر. ومع خبرتك، تساعدك الشهادة على تقديم حجة موثوقة لأدوار سلسلة الإمداد والمشتريات عبر القطاع الصحي."
        : "On completing the Healthcare Supply Chain Diploma you receive a verifiable certificate of completion from IMETS Medical School. It documents that you have studied and demonstrated the core competencies of healthcare supply chain management, and you can add it to your CV and LinkedIn to evidence your training.\n\nThe IMETS certificate recognizes the procurement, inventory, and logistics skills you have built through the diploma. It is issued by IMETS as an independent training provider — a mark of completed, structured professional training.\n\nFor many professionals, the Healthcare Supply Chain Diploma is a clear step into healthcare supply-chain work or a way to manage procurement and inventory more effectively. Combined with your experience, the certificate helps you present a credible case for supply-chain and procurement roles across the healthcare sector.",
    },
    {
      q: ar
        ? "لماذا تُعدّ سلسلة الإمداد مهمة في القطاع الصحي؟"
        : "Why is supply chain important in healthcare?",
      group: "skills",
      a: ar
        ? "سلسلة الإمداد حاسمة في القطاع الصحي لأن الرعاية لا يمكن تقديمها دون توفّر الأدوية والأجهزة والمستهلكات المناسبة في المكان والوقت المناسبين. وسلسلة الإمداد الصحية الفعّالة تُبقي المنشآت مزوّدة بموثوقية، وتضبط التكلفة، وتمنع حالات النفاد التي قد تؤخّر العلاج أو تعرّض المرضى للخطر.\n\nوتواجه سلاسل الإمداد الصحية تحديات خاصة: متطلبات سلسلة التبريد للقاحات والأدوية، والتحكّم الصارم في الصلاحية والتشغيلات، والأجهزة عالية التكلفة، والحاجة إلى تجنّب النقص والهدر معًا. والإدارة الجيدة لسلسلة الإمداد توازن بين التوفّر والتكلفة وتقلّل الخسائر الناتجة عن الأصناف منتهية الصلاحية أو الفائضة، بينما تؤدّي الإدارة الضعيفة إلى الانقطاعات والهدر والمخاطر.\n\nوترتبط سلسلة الإمداد بالجودة والامتثال أيضًا: فالتوريد والتخزين والتتبّع السليم تدعم الرعاية الآمنة والاعتماد. وهذه بالضبط القدرات التي صُمّمت دبلومة سلسلة الإمداد الصحية لتطويرها."
        : "The supply chain is critical in healthcare because care cannot be delivered without the right medicines, equipment, and consumables in the right place at the right time. An effective healthcare supply chain keeps facilities reliably stocked, controls cost, and prevents the stockouts that can delay treatment or put patients at risk.\n\nHealthcare supply chains face particular challenges: cold-chain requirements for vaccines and medicines, strict expiry and lot control, high-cost equipment, and the need to avoid both shortages and waste. Good supply-chain management balances availability against cost and reduces the losses that come from expired or overstocked items, while weak management leads to disruptions, waste, and risk.\n\nThe supply chain is also tied to quality and compliance: proper sourcing, storage, and traceability support safe care and accreditation. These are exactly the capabilities the Healthcare Supply Chain Diploma is built to develop.",
    },
    {
      q: ar
        ? "ماذا يفعل مدير سلسلة الإمداد الصحية؟"
        : "What does a healthcare supply chain manager do?",
      group: "skills",
      a: ar
        ? "مدير سلسلة الإمداد الصحية يقود كيف يورّد المستشفى أو العيادة المستلزمات التي يحتاجها ويخزّنها ويوزّعها. فبدلًا من تقديم الرعاية، يدير تدفّق السلع الذي يجعل الرعاية ممكنة — وهو من أهم الأدوار التي تُعِدّك لها دبلومة سلسلة الإمداد الصحية.\n\nيوميًا، يشرف مدير سلسلة الإمداد الصحية على المشتريات وعلاقات المورّدين، ويدير المخزون ومستوياته، ويخطّط الطلب، وينسّق التخزين والتوزيع إلى نقاط الرعاية. ويضبط التكلفة، ويمنع النفاد وخسائر الصلاحية، ويضمن استيفاء المتطلبات الخاصة مثل سلسلة التبريد والتتبّع.\n\nكما يتعاون مدير سلسلة الإمداد الصحية عبر المؤسسة — مع الأقسام الإكلينيكية والصيدلة والتمويل والإدارة — لأن المستلزمات تمسّ كل خدمة. ويُبقي الرعاية غير منقطعة مع إدارة الموازنات بمسؤولية. وتبني دبلومة سلسلة الإمداد الصحية هذه المهارات بالضبط، محوّلةً الاهتمام بسلسلة الإمداد إلى مسار خاص بالقطاع الصحي."
        : "A healthcare supply chain manager leads how a hospital or clinic sources, stores, and distributes the supplies it needs. Rather than delivering care, they manage the flow of goods that makes care possible — one of the main roles the Healthcare Supply Chain Diploma prepares you for.\n\nDay to day, a healthcare supply chain manager oversees procurement and supplier relationships, manages inventory and stock levels, plans demand, and coordinates warehousing and distribution to points of care. They control cost, prevent stockouts and expiry losses, and ensure special requirements such as cold-chain and traceability are met.\n\nA healthcare supply chain manager also collaborates across the organization — with clinical departments, pharmacy, finance, and administration — because supplies touch every service. They keep care uninterrupted while managing budgets responsibly. The Healthcare Supply Chain Diploma builds exactly these skills, turning supply-chain interest into a healthcare-specific career.",
    },
  ];
}

/**
 * Shared "Program & Enrollment" sales FAQ for IMETS DIPLOMAS (not external-exam
 * prep). The certificate answer is IMETS-only — no external awarding body — and
 * no duration/price is invented. Pass the program's "who should join" line.
 */
function diplomaSalesFaq(ar: boolean, whoEn: string, whoAr: string): FaqItem[] {
  return [
    {
      q: ar ? "لمن هذا البرنامج؟" : "Who should join this program?",
      a: ar ? whoAr : whoEn,
    },
    {
      q: ar ? "هل البرنامج مباشر أم مسجّل؟" : "Is the program live or recorded?",
      a: ar
        ? "كلاهما. يُقدَّم البرنامج عبر جلسات مباشرة أونلاين يقودها خبراء ويمكنك طرح أسئلتك فيها مباشرةً — وتُسجَّل كل جلسة وتُضاف إلى حسابك لتعيد مشاهدتها في أي وقت دون أن يفوتك شيء إذا طرأت وردية أو حالة طارئة."
        : "Both. It is delivered through live, expert-led online sessions where you can ask questions in real time — and every session is recorded and added to your account, so you can rewatch anytime and never miss a thing if a shift or emergency comes up.",
    },
    {
      q: ar ? "هل سأحصل على شهادة؟" : "Will I receive a certificate?",
      a: ar
        ? "نعم. عند إتمام البرنامج تحصل على شهادة إتمام موثّقة من IMETS Medical School يمكن التحقّق منها، تضيفها إلى سيرتك الذاتية وحسابك على LinkedIn لتوثيق المهارات التي اكتسبتها."
        : "Yes. On completing the program you receive a verifiable certificate of completion from IMETS Medical School to add to your CV and LinkedIn, documenting the skills you have gained.",
    },
    {
      q: ar ? "ما مدة البرنامج؟" : "How long is the program?",
      a: ar
        ? "يمتد البرنامج على عدة أسابيع من الدراسة المنظّمة بدوام جزئي — مزيج من جلسات مباشرة أسبوعية ومواد بوتيرتك تناسب عملًا بدوام كامل. ولمعرفة الجدول القادم وتاريخ البدء بدقة، اضغط «قدّم الآن» وسيؤكّد لك المستشار التفاصيل."
        : "It runs over several weeks of structured, part-time study — a mix of live weekly sessions and self-paced material you can fit around a full-time job. For the exact upcoming schedule and start date, tap Apply Now and an advisor will confirm the details.",
    },
    {
      q: ar ? "كيف أسجّل؟" : "How do I register?",
      a: ar
        ? "التسجيل بسيط: اضغط «قدّم الآن» واملأ النموذج القصير، وسيتواصل معك مستشار القبول لتأكيد مقعدك والإجابة عن أسئلتك وإتمام التسجيل. ويمكنك أيضًا التواصل معنا عبر واتساب إن فضّلت الحديث أولًا."
        : "Registering is simple: tap Apply Now and fill in the short form, and an admissions advisor will contact you to confirm your seat, answer your questions, and complete enrollment. You can also reach us on WhatsApp if you'd prefer to talk it through first.",
    },
    {
      q: ar ? "ما خيارات الدفع؟" : "What are the payment options?",
      a: ar
        ? "نوفّر خيارات دفع مرنة ويمكننا إصدار الفاتورة بعملتك المحلية. ولضمان الدقة حسب بلدك وأي عروض أو خطط تقسيط حالية، اضغط «قدّم الآن» أو راسلنا عبر واتساب وسيشرح لك المستشار الخيارات المتاحة ويؤكّد الإجمالي."
        : "We offer flexible payment options and can bill in your local currency. To keep things accurate for your country and any current offers or instalment plans, tap Apply Now or message us on WhatsApp and an advisor will walk you through the available options and confirm the total.",
    },
  ];
}

const COURSE_EXTRAS: Record<
  string,
  (
    ar: boolean,
  ) => Partial<
    Pick<
      CourseContent,
      | "careerRoles"
      | "finalCta"
      | "headings"
      | "faqs"
      | "pageSeo"
      | "relatedSlugs"
      | "knowledgeCenter"
      | "knowledgeGroups"
      | "knowledgeTitle"
      | "knowledgeIntro"
      | "knowledgeCta"
      | "salesFaq"
    >
  >
> = {
  "healthcare-marketing-diploma": (ar) => ({
    knowledgeCenter: healthcareMarketingKnowledgeCenter(ar),
    knowledgeGroups: healthcareMarketingKnowledgeGroups(ar),
    knowledgeTitle: ar
      ? "مركز معرفة التسويق الصحي"
      : "Healthcare Marketing Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن دبلومة التسويق الصحي — محتواها، ولمن هي، والفرص المهنية التي تفتحها، وشهادة IMETS، ولماذا يهمّ التسويق الصحي."
      : "Everything you need to know about the Healthcare Marketing Diploma — what it covers, who it's for, the careers it opens, your IMETS certificate, and why healthcare marketing matters.",
    knowledgeCta: ar
      ? "مستعد لتنمية العلامات الصحية بثقة؟"
      : "Ready to Grow Healthcare Brands With Confidence?",
    salesFaq: diplomaSalesFaq(
      ar,
      "This program is ideal for clinic owners, doctors who run their own practice, and marketing or communications staff in hospitals, clinics, and health-tech — plus anyone moving into healthcare marketing. If your work touches patient acquisition, branding, or growing a medical service, it is built for you, and fresh graduates aiming for a healthcare marketing career are welcome too.",
      "البرنامج مثالي لأصحاب العيادات والأطباء الذين يديرون ممارساتهم، وكوادر التسويق والتواصل في المستشفيات والعيادات وشركات التقنية الصحية — إضافةً إلى كل من ينتقل إلى التسويق الصحي. وإذا كان عملك يمسّ استقطاب المرضى أو بناء العلامة أو تنمية خدمة طبية فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في التسويق الصحي.",
    ),
    careerRoles: [
      {
        title: ar ? "منسّق التسويق الصحي" : "Healthcare Marketing Coordinator",
      },
      {
        title: ar ? "أخصائي التسويق الصحي" : "Healthcare Marketing Specialist",
      },
      { title: ar ? "أخصائي تسويق أول" : "Senior Marketing Specialist" },
      { title: ar ? "مدير التسويق الصحي" : "Healthcare Marketing Manager" },
      { title: ar ? "مدير إدارة التسويق" : "Marketing Director" },
      {
        title: ar
          ? "استشاري أعمال الرعاية الصحية"
          : "Healthcare Business Consultant",
      },
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
      careers: ar
        ? "الفرص المهنية في التسويق الصحي"
        : "Healthcare Marketing Career Opportunities",
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
            q: ar
              ? "هل الدبلومة مناسبة للأطباء؟"
              : "Is this diploma suitable for doctors?",
            a: ar
              ? "نعم. الأطباء الذين يديرون عياداتهم أو يقودون خطوطًا خدمية داخل مستشفى هم من أكثر من يستفيد: تتعلّم كيف تُبنى الثقة وتُستقطب الحالات المناسبة دون الإضرار بالعلاقة الإكلينيكية."
              : "Yes. Doctors who run their own clinic or lead a service line inside a hospital are among those who benefit most: you learn how trust is built and how the right patients are reached, without damaging the clinical relationship.",
          },
          {
            q: ar
              ? "هل يستفيد أصحاب العيادات من هذه الدبلومة؟"
              : "Can clinic owners benefit from this diploma?",
            a: ar
              ? "نعم — وهذا من أوضح استخداماتها. أصحاب العيادات يتعاملون مع استقطاب المرضى وبناء العلامة والميزانية بأنفسهم، والدبلومة تعطيهم إطارًا لهذه القرارات بدل الاجتهاد."
              : "Yes — it is one of the clearest uses. Clinic owners handle patient acquisition, branding and budget themselves, and the diploma gives those decisions a framework instead of guesswork.",
          },
          {
            q: ar
              ? "هل تُشترط خبرة سابقة في التسويق؟"
              : "Is prior marketing experience required?",
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
            q: ar
              ? "هل سأتعلّم التسويق الرقمي الصحي؟"
              : "Will I learn digital healthcare marketing?",
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
  "healthcare-quality-management-diploma": (ar) => ({
    knowledgeCenter: healthcareQualityKnowledgeCenter(ar),
    knowledgeGroups: healthcareQualityKnowledgeGroups(ar),
    knowledgeTitle: ar
      ? "مركز معرفة جودة الرعاية الصحية"
      : "Healthcare Quality Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن دبلومة إدارة جودة الرعاية الصحية — محتواها، ولمن هي، والفرص المهنية التي تفتحها، وشهادة IMETS، ولماذا تهمّ الجودة وسلامة المرضى."
      : "Everything you need to know about the Healthcare Quality Management Diploma — what it covers, who it's for, the careers it opens, your IMETS certificate, and why quality and patient safety matter.",
    knowledgeCta: ar
      ? "جاهز لقيادة جودة الرعاية الصحية؟"
      : "Ready to Lead Healthcare Quality?",
    salesFaq: diplomaSalesFaq(
      ar,
      "This program is ideal for healthcare professionals working in — or moving into — quality, patient safety, and accreditation: nurses, physicians, pharmacists, quality coordinators, and patient-safety staff. If your role touches quality indicators or accreditation readiness it is built for you, and fresh graduates aiming for a quality career are welcome too.",
      "البرنامج مثالي لمتخصصي الرعاية الصحية العاملين في — أو المنتقلين إلى — الجودة وسلامة المرضى والاعتماد: الممرضون والأطباء والصيادلة ومنسّقو الجودة وكوادر سلامة المرضى. وإذا كان دورك يمسّ مؤشرات الجودة أو الجاهزية للاعتماد فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في الجودة.",
    ),
  }),
  "healthcare-hr-management-diploma": (ar) => ({
    knowledgeCenter: healthcareHrKnowledgeCenter(ar),
    knowledgeGroups: healthcareHrKnowledgeGroups(ar),
    knowledgeTitle: ar
      ? "مركز معرفة الموارد البشرية الصحية"
      : "Healthcare HR Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن دبلومة إدارة الموارد البشرية الصحية — محتواها، ولمن هي، والفرص المهنية التي تفتحها، وشهادة IMETS، ولماذا تهمّ الموارد البشرية في القطاع الصحي."
      : "Everything you need to know about the Healthcare HR Management Diploma — what it covers, who it's for, the careers it opens, your IMETS certificate, and why HR matters in healthcare.",
    knowledgeCta: ar
      ? "جاهز لبناء فرق صحية أقوى؟"
      : "Ready to Build Stronger Healthcare Teams?",
    salesFaq: diplomaSalesFaq(
      ar,
      "This program is ideal for HR staff in hospitals and clinics, administrators and clinical team leaders who manage people, and anyone moving into healthcare HR. If your role involves recruiting, developing, or leading healthcare teams, it is built for you, and fresh graduates aiming for a healthcare HR career are welcome too.",
      "البرنامج مثالي لكوادر الموارد البشرية في المستشفيات والعيادات، والإداريين وقادة الفرق الإكلينيكية الذين يديرون الأفراد، وكل من ينتقل إلى الموارد البشرية الصحية. وإذا كان دورك يشمل استقطاب الفرق الصحية أو تطويرها أو قيادتها فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في الموارد البشرية الصحية.",
    ),
  }),
  "healthcare-supply-chain-diploma": (ar) => ({
    knowledgeCenter: healthcareSupplyChainKnowledgeCenter(ar),
    knowledgeGroups: healthcareSupplyChainKnowledgeGroups(ar),
    knowledgeTitle: ar
      ? "مركز معرفة سلسلة الإمداد الصحية"
      : "Healthcare Supply Chain Knowledge Center",
    knowledgeIntro: ar
      ? "كل ما تحتاج معرفته عن دبلومة سلسلة الإمداد الصحية — محتواها، ولمن هي، والفرص المهنية التي تفتحها، وشهادة IMETS، ولماذا تهمّ سلسلة الإمداد في القطاع الصحي."
      : "Everything you need to know about the Healthcare Supply Chain Diploma — what it covers, who it's for, the careers it opens, your IMETS certificate, and why supply chain matters in healthcare.",
    knowledgeCta: ar
      ? "جاهز لإتقان سلسلة الإمداد الصحية؟"
      : "Ready to Master the Healthcare Supply Chain?",
    salesFaq: diplomaSalesFaq(
      ar,
      "This program is ideal for procurement, stores, and logistics staff in hospitals and clinics, administrators responsible for resources, and anyone moving into healthcare supply chain. If your role touches procurement, inventory, or logistics in healthcare, it is built for you, and fresh graduates aiming for a supply-chain career are welcome too.",
      "البرنامج مثالي لكوادر المشتريات والمخازن واللوجستيات في المستشفيات والعيادات، والإداريين المسؤولين عن الموارد، وكل من ينتقل إلى سلسلة الإمداد الصحية. وإذا كان دورك يمسّ المشتريات أو المخزون أو اللوجستيات في القطاع الصحي فالبرنامج مصمّم لك، ونرحّب أيضًا بحديثي التخرج الذين يستهدفون مسارًا في سلسلة الإمداد.",
    ),
  }),
};

/** Generic, healthcare-flavoured content for any non-flagship course. */
function genericContent(
  slug: string,
  titleEn: string,
  titleAr: string,
  locale: string,
): CourseContent {
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
  if (opts.slug === "hospital-management-diploma")
    return hospitalManagementContent(opts.locale);
  if (opts.slug === "cic-preparation") return cicContent(opts.locale);
  if (opts.slug === "infection-control-diploma")
    return infectionControlDiplomaContent(opts.locale);
  return genericContent(opts.slug, opts.titleEn, opts.titleAr, opts.locale);
}

/**
 * Review-distribution bars derived from the overall rating so the wall always
 * matches the headline number (no fake precision, just a believable spread).
 */
export function ratingDistribution(
  rating: number,
): { star: number; pct: number }[] {
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
