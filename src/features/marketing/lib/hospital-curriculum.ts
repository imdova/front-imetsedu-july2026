/**
 * Detailed lecture-level curriculum for the Hospital Management Diploma.
 *
 * The DB (`course.modules[]`) owns the course list and lesson titles; this file
 * owns the teaching detail behind each lecture — objectives, key topics, and the
 * workshop / practical takeaway — which has no home in the backend lesson schema
 * (a lesson is title + duration only).
 *
 * Matched to a module by a keyword in its title, so renaming a module in the
 * admin form keeps working as long as the keyword survives.
 *
 * NOTE ON LANGUAGE: the diploma is delivered in English, so the lecture detail
 * below is intentionally English in both locales. Only the surrounding UI labels
 * are localized. Translate here if the programme ever runs bilingually.
 */

export type CurriculumLecture = {
  title: string;
  /** "Learning objectives" bullets. */
  objectives?: string[];
  /** "Key topics" covered in the lecture. */
  topics: string[];
  /** Workshop or practical takeaway line. */
  practice?: string;
  /** Label for `practice` — defaults to "Workshop". */
  practiceLabel?: string;
};

export type CurriculumDetail = {
  /** e.g. "4 lectures · 24 contact hours · Online — Zoom" */
  meta?: string;
  /** One-paragraph course aim / description. */
  aim?: string;
  /** Course-level learning outcomes. */
  outcomes?: string[];
  lectures: CurriculumLecture[];
};

const WORKSHOP = "Workshop";
const TAKEAWAY = "Practical takeaway";

/* ------------------------------------------------------------------ */
/* Course 1 — Hospital Management Fundamentals                         */
/* ------------------------------------------------------------------ */
const course1: CurriculumDetail = {
  meta: "4 lectures · 12 contact hours · Online — Zoom",
  aim: "Establish a shared systems view of how hospitals are structured, governed, and operated — the vocabulary, roles, and core metrics every hospital manager must command before tackling advanced disciplines.",
  lectures: [
    {
      title:
        "Health Systems, Hospital Classification, Ownership & Governance Models",
      objectives: [
        "Describe the building blocks of a health system and locate the hospital within the continuum of care.",
        "Classify hospitals by level of care, size, ownership, and teaching status.",
        "Compare governance and ownership models — public, private for-profit, non-profit, university, and public–private partnership — and their impact on decision-making.",
        "Explain the distinct roles of the board, executive leadership, and organized medical staff.",
      ],
      topics: [
        "WHO health-system building blocks",
        "Primary, secondary, tertiary and quaternary levels of care",
        "Hospital classification schemes",
        "Ownership and financing models",
        "Corporate versus clinical governance",
        "Board structures and committees",
        "The Egyptian health-system landscape (MOHP, the Universal Health Insurance Authority, and the private sector)",
      ],
      practice:
        "Produce a one-page profile classifying your own hospital by type, ownership, and governance model.",
      practiceLabel: TAKEAWAY,
    },
    {
      title: "Organizational Structure, Departments & the Manager's Authority",
      objectives: [
        "Map the typical hospital organizational structure and the interdependencies among clinical, nursing, and support departments.",
        "Distinguish line, staff, and matrix relationships and their effect on accountability.",
        "Define the hospital manager's role, span of control, and authority boundaries.",
        "Identify decision rights, delegation, and escalation paths across departments.",
      ],
      topics: [
        "Organizational charts and departmentalization",
        "Clinical versus administrative reporting lines",
        "Matrix and dual-reporting structures",
        "RACI and delegation of authority",
        "Committees as coordination mechanisms",
        "Interface and hand-off management between departments",
      ],
      practice:
        "Draft a RACI matrix for a cross-departmental process such as patient admission.",
      practiceLabel: TAKEAWAY,
    },
    {
      title:
        "Hospital Operations Basics — OPD, ER, OR, Inpatient, Bed Management & LOS",
      objectives: [
        "Explain the core functions and patient journeys through outpatient, emergency, surgical, and inpatient areas.",
        "Define and calculate key operational metrics: occupancy, average length of stay, bed turnover, and throughput.",
        "Describe bed-management principles and the admission–discharge–transfer (ADT) cycle.",
        "Recognize demand–capacity mismatches and their operational consequences.",
      ],
      topics: [
        "Outpatient, emergency, operating-room and inpatient workflows",
        "Triage",
        "OR scheduling and utilization",
        "Bed management and the ADT cycle",
        "Occupancy rate, average length of stay, bed-turnover rate and turnover interval",
        "Discharge-planning fundamentals",
      ],
      practice:
        "Calculate occupancy, ALOS, and bed turnover from a sample ward dataset.",
      practiceLabel: TAKEAWAY,
    },
    {
      title:
        "Support Services Overview — Facilities, CSSD, Laundry, Housekeeping, Waste & Emergency Preparedness",
      objectives: [
        "Describe the scope and standards of the key non-clinical support services.",
        "Explain how CSSD, housekeeping, laundry, and waste management protect patient safety.",
        "Outline the facilities and utilities essential to hospital continuity.",
        "Introduce emergency preparedness and hospital disaster planning.",
      ],
      topics: [
        "Facilities and utilities (HVAC, medical gases, power resilience)",
        "The CSSD sterilization workflow",
        "Environmental services and housekeeping standards",
        "Linen and laundry management",
        "Medical and hazardous waste segregation and disposal",
        "Emergency preparedness, hazard-vulnerability analysis, and the hospital incident command system",
      ],
      practice:
        "Complete a support-services readiness checklist for one department.",
      practiceLabel: TAKEAWAY,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Course 2 — Advanced Hospital & Strategic Management                 */
/* ------------------------------------------------------------------ */
const course2: CurriculumDetail = {
  meta: "4 lectures · 24 contact hours · Online — Zoom",
  aim: "This course equips healthcare professionals with the strategic leadership and management competencies required to lead hospitals and healthcare organizations in today's dynamic environment. Participants learn how to formulate, implement, and evaluate strategies while applying strategic management frameworks to real-world healthcare challenges.",
  outcomes: [
    "Explain the strategic management process in healthcare organizations.",
    "Develop strategic plans aligned with a hospital's vision and mission.",
    "Analyze the internal and external healthcare environment.",
    "Formulate and evaluate strategic alternatives.",
    "Implement strategies using effective leadership and change management.",
    "Monitor organizational performance using KPIs and the Balanced Scorecard.",
    "Apply strategic thinking to solve healthcare management challenges.",
  ],
  lectures: [
    {
      title: "Strategic Leadership & the Strategic Management Process",
      topics: [
        "Introduction to Strategic Management in Healthcare",
        "Strategic Leadership vs. Operational Management",
        "The Strategic Management Process",
        "Vision, Mission & Core Values",
        "Hospital Governance & Leadership Structure",
        "Organizational Culture in Healthcare",
        "Strategic Thinking for Hospital Managers",
      ],
      practice:
        "Develop the Vision, Mission, and Core Values for a Hospital.",
      practiceLabel: WORKSHOP,
    },
    {
      title: "Strategic Analysis of Healthcare Organizations",
      topics: [
        "External Environment Analysis",
        "PESTLE Analysis",
        "Healthcare Industry Analysis",
        "Porter's Five Forces",
        "Internal Environment Analysis",
        "SWOT Analysis",
        "Resource & Capability Assessment",
        "Stakeholder Analysis",
      ],
      practice:
        "Conduct a Strategic Assessment (SWOT + PESTLE) for a Hospital.",
      practiceLabel: WORKSHOP,
    },
    {
      title: "Strategy Formulation & Competitive Advantage",
      topics: [
        "Strategic Objectives",
        "Strategy Formulation",
        "Strategic Alternatives",
        "Competitive Strategies in Healthcare",
        "Service Line Development",
        "Growth & Expansion Strategies",
        "Value-Based Healthcare",
        "Strategic Decision-Making",
      ],
      practice:
        "Develop a Five-Year Strategic Plan for a Healthcare Organization.",
      practiceLabel: WORKSHOP,
    },
    {
      title:
        "Strategy Implementation, Performance Management & Strategic Control",
      topics: [
        "Strategy Implementation",
        "Change Management in Healthcare",
        "Balanced Scorecard (BSC)",
        "Hospital Key Performance Indicators (KPIs)",
        "Strategy Evaluation",
        "Strategic Control",
        "Healthcare Innovation & Digital Transformation",
        "Continuous Improvement",
      ],
      practice:
        "Design a Hospital Balanced Scorecard and Performance Dashboard.",
      practiceLabel: WORKSHOP,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Course 6 — Healthcare Quality & Patient Safety                      */
/* ------------------------------------------------------------------ */
const course6: CurriculumDetail = {
  meta: "4 lectures · 24 contact hours · Online — Zoom",
  outcomes: [
    "Explain the principles of healthcare quality and patient safety.",
    "Apply quality improvement methodologies in healthcare organizations.",
    "Monitor organizational performance using quality indicators and KPIs.",
    "Design and implement performance improvement initiatives.",
    "Foster a culture of safety and continuous improvement.",
  ],
  lectures: [
    {
      title: "Foundations of Healthcare Quality Management",
      topics: [
        "Introduction to Healthcare Quality",
        "Dimensions of Healthcare Quality",
        "Quality Gurus (Deming, Juran, Crosby)",
        "The Juran Trilogy",
        "The Evolution of Quality in Healthcare",
        "Systems Thinking in Healthcare",
        "Statistical Process Control (SPC)",
        "Continuous Quality Improvement (CQI)",
      ],
      practice: "Analyze a quality problem using the Systems Approach.",
      practiceLabel: WORKSHOP,
    },
    {
      title: "Patient Safety & Clinical Risk Management",
      topics: [
        "Fundamentals of Patient Safety",
        "Patient Safety Culture",
        "Human Factors in Healthcare",
        "Types of Medical Errors",
        "Root Cause Analysis (RCA)",
        "Failure Mode and Effects Analysis (FMEA)",
        "Sentinel Events",
        "National Patient Safety Goals",
        "Clinical Risk Management",
      ],
      practice: "Conduct a Root Cause Analysis for a Sentinel Event.",
      practiceLabel: WORKSHOP,
    },
    {
      title: "Healthcare Performance Measurement",
      topics: [
        "Performance Measurement Frameworks",
        "Quality Indicators",
        "Key Performance Indicators (KPIs)",
        "Clinical Indicators",
        "Operational Indicators",
        "Patient Experience Indicators",
        "Benchmarking",
        "Dashboard Design",
        "Data Collection & Analysis",
      ],
      practice: "Develop a KPI Dashboard for a Hospital Department.",
      practiceLabel: WORKSHOP,
    },
    {
      title: "Performance Improvement & Quality Excellence",
      topics: [
        "Performance Improvement Methodology",
        "PDCA Cycle",
        "Lean Healthcare",
        "Six Sigma Basics",
        "Clinical Audit",
        "Evidence-Based Improvement",
        "Change Management for Quality",
        "Sustaining Improvement",
        "Accreditation & Continuous Readiness",
      ],
      practice:
        "Develop a Performance Improvement Project using the PDCA Cycle.",
      practiceLabel: WORKSHOP,
    },
  ],
};

/**
 * Resolve the detailed curriculum for a module of the Hospital Management
 * Diploma. Matching is ordered most-specific first, because several of the new
 * course names share words ("hospital", "management", "healthcare").
 */
export function resolveModuleDetail(
  slug: string,
  moduleTitle: string,
): CurriculumDetail | null {
  if (slug !== "hospital-management-diploma") return null;
  const t = moduleTitle.toLowerCase();
  const has = (...keys: string[]) => keys.some((k) => t.includes(k));

  if (has("fundamental")) return course1;
  if (has("strategic", "strategy")) return course2;
  if (has("quality", "patient safety")) return course6;
  return null;
}
