import type { CourseRow } from "@/types";
import type { BlogPost } from "@/types/blog";
import type { InstructorLookup } from "@/types";

/** Topic/career aliases so “Quality” also surfaces CPHQ, Patient Safety, etc. */
const TOPIC_ALIASES: Record<string, string[]> = {
  quality: [
    "cphq",
    "healthcare quality",
    "quality management",
    "quality diploma",
    "patient safety",
    "quality indicators",
    "clinical governance",
    "accreditation",
    "naqh",
    "nahq",
  ],
  cphq: ["quality", "healthcare quality", "patient safety", "nahq", "certification"],
  safety: ["patient safety", "cphq", "quality", "risk", "infection"],
  leadership: ["healthcare leadership", "management", "hospital management", "executive"],
  management: ["hospital management", "healthcare management", "leadership", "operations"],
  digital: ["digital health", "informatics", "health it", "telehealth", "ai"],
  ai: ["healthcare ai", "digital health", "informatics"],
  hr: ["healthcare hr", "human resources", "people"],
  marketing: ["healthcare marketing", "growth"],
  accreditation: ["jcaho", "jci", "cbaqi", "quality", "cphq"],
  informatics: ["health informatics", "digital health", "data"],
};

export type SmartHitKind =
  | "course"
  | "certification"
  | "career"
  | "instructor"
  | "topic"
  | "article";

export interface SmartHit {
  kind: SmartHitKind;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  /** When set, selecting this hit filters the catalog to matching courses. */
  courseIds?: string[];
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expandQuery(q: string): string[] {
  const base = norm(q);
  if (!base) return [];
  const parts = new Set<string>([base, ...base.split(" ").filter((w) => w.length > 1)]);
  for (const [key, aliases] of Object.entries(TOPIC_ALIASES)) {
    if (base.includes(key) || aliases.some((a) => base.includes(norm(a)) || norm(a).includes(base))) {
      parts.add(key);
      for (const a of aliases) parts.add(norm(a));
    }
  }
  return [...parts];
}

function stripHtml(html?: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ");
}

function courseHaystack(c: CourseRow): string {
  return norm(
    [
      c.titleEn,
      c.titleAr,
      c.slug,
      c.category,
      c.difficulty,
      c.headlineEn,
      c.headlineAr,
      c.subHeadlineEn,
      c.subHeadlineAr,
      stripHtml(c.descriptionEn),
      stripHtml(c.descriptionAr),
      stripHtml(c.whoCanAttendEn),
      stripHtml(c.whoCanAttendAr),
      ...(c.instructorNames ?? []),
      ...(c.tagLabels ?? []),
      ...(c.modules ?? []).flatMap((m) => [
        m.titleEn,
        m.titleAr,
        ...m.lessons.flatMap((l) => [l.titleEn, l.titleAr]),
      ]),
    ]
      .filter(Boolean)
      .join(" "),
  );
}

function scoreText(haystack: string, terms: string[]): number {
  let score = 0;
  for (const term of terms) {
    if (!term) continue;
    if (haystack.includes(term)) score += term.length >= 4 ? 3 : 2;
    // Acronym / token boost (e.g. "cphq" in slug)
    const tokens = haystack.split(" ");
    if (tokens.some((t) => t === term || t.startsWith(term))) score += 4;
  }
  return score;
}

function looksLikeCertification(c: CourseRow): boolean {
  const blob = `${c.titleEn} ${c.slug} ${c.category}`.toLowerCase();
  return /\b(cphq|chbm|cip|certif|naqh|nahq|diploma|board)\b/i.test(blob);
}

function certificationLabel(c: CourseRow): string {
  const m = c.titleEn.match(/\b([A-Z]{3,6})\b/);
  if (m) return m[1]!;
  if (/cphq/i.test(c.slug) || /cphq/i.test(c.titleEn)) return "CPHQ";
  return c.titleEn;
}

export function courseMatchesSmartSearch(course: CourseRow, query: string): boolean {
  const terms = expandQuery(query);
  if (!terms.length) return true;
  return scoreText(courseHaystack(course), terms) > 0;
}

export function buildSmartHits(opts: {
  query: string;
  courses: CourseRow[];
  instructors?: InstructorLookup[];
  articles?: BlogPost[];
  limitPerKind?: number;
}): SmartHit[] {
  const { query, courses, instructors = [], articles = [], limitPerKind = 4 } = opts;
  const terms = expandQuery(query);
  if (!terms.length) return [];

  const hits: SmartHit[] = [];

  // Courses
  const scoredCourses = courses
    .map((c) => ({ c, score: scoreText(courseHaystack(c), terms) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  for (const { c } of scoredCourses.slice(0, limitPerKind)) {
    hits.push({
      kind: "course",
      id: `course-${c.id}`,
      title: c.titleEn,
      subtitle: c.category !== "—" ? c.category : undefined,
      href: `/courses/${c.slug}`,
      courseIds: [c.id],
    });
  }

  // Certifications (courses that look like cert prep / diplomas)
  const certs = scoredCourses.filter(({ c }) => looksLikeCertification(c)).slice(0, limitPerKind);
  for (const { c } of certs) {
    hits.push({
      kind: "certification",
      id: `cert-${c.id}`,
      title: certificationLabel(c),
      subtitle: c.titleEn,
      href: `/courses/${c.slug}`,
      courseIds: [c.id],
    });
  }

  // Career / who-can-attend style matches
  for (const { c } of scoredCourses.slice(0, limitPerKind)) {
    const careerBlob = norm(`${c.whoCanAttendEn ?? ""} ${c.headlineEn ?? ""} ${c.category}`);
    if (scoreText(careerBlob, terms) <= 0 && !scoreText(norm(c.category), terms)) continue;
    hits.push({
      kind: "career",
      id: `career-${c.id}`,
      title: c.category !== "—" ? c.category : c.titleEn,
      subtitle: c.titleEn,
      href: `/courses/${c.slug}`,
      courseIds: [c.id],
    });
  }

  // Instructors
  const instructorHits = instructors
    .map((ins) => ({
      ins,
      score: scoreText(norm(`${ins.label} ${ins.title ?? ""}`), terms),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limitPerKind);

  for (const { ins } of instructorHits) {
    const related = courses
      .filter((c) => (c.instructorNames ?? []).some((n) => norm(n).includes(norm(ins.label)) || norm(ins.label).includes(norm(n))))
      .map((c) => c.id);
    hits.push({
      kind: "instructor",
      id: `instructor-${ins.id}`,
      title: ins.label,
      subtitle: ins.title,
      href: `/instructors/${ins.slug || ins.id}`,
      courseIds: related.length ? related : undefined,
    });
  }

  // Topics (alias keys + course tags/categories)
  const topicLabels = new Set<string>();
  for (const term of terms) {
    for (const [key, aliases] of Object.entries(TOPIC_ALIASES)) {
      if (term === key || aliases.some((a) => norm(a) === term || term.includes(key))) {
        topicLabels.add(key.replace(/\b\w/g, (ch) => ch.toUpperCase()));
      }
    }
  }
  for (const sc of scoredCourses) {
    for (const tg of sc.c.tagLabels ?? []) {
      if (scoreText(norm(tg), terms) > 0) topicLabels.add(tg);
    }
    if (sc.c.category !== "—" && scoreText(norm(sc.c.category), terms) > 0) topicLabels.add(sc.c.category);
  }
  let topicCount = 0;
  for (const label of topicLabels) {
    if (topicCount >= limitPerKind) break;
    const related = courses.filter((c) => courseMatchesSmartSearch(c, label)).map((c) => c.id);
    hits.push({
      kind: "topic",
      id: `topic-${norm(label)}`,
      title: label,
      subtitle: related.length ? `${related.length} programs` : undefined,
      href: `/courses?q=${encodeURIComponent(label)}`,
      courseIds: related,
    });
    topicCount += 1;
  }

  // Articles
  const articleHits = articles
    .map((a) => ({
      a,
      score: scoreText(norm(`${a.title} ${a.excerpt} ${(a.tags ?? []).join(" ")} ${a.category ?? ""}`), terms),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limitPerKind);

  for (const { a } of articleHits) {
    hits.push({
      kind: "article",
      id: `article-${a.id}`,
      title: a.title,
      subtitle: a.category || "Article",
      href: `/blog/${a.slug}`,
    });
  }

  // De-dupe by id while keeping kind diversity order
  const seen = new Set<string>();
  return hits.filter((h) => {
    if (seen.has(h.id)) return false;
    seen.add(h.id);
    return true;
  });
}

export const SMART_HIT_ORDER: SmartHitKind[] = [
  "course",
  "certification",
  "career",
  "instructor",
  "topic",
  "article",
];
