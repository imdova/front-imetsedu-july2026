/**
 * Landing-pages seed (mock DB) — campaign landing-page registry with live
 * view/click counters, plus the captured "free exam" registrations matched to a
 * page by `path`. Mirrors the clone-spec `landing` module.
 *
 * When the DAL is pointed at the real backend (`/admin/landing/pages`,
 * `/admin/free-exam/leads`) these helpers disappear; the `Result<T>` shape is
 * unchanged so no UI refactor follows.
 */
import { respond, clone } from "./delay";

export type LandingStatus = "draft" | "published";
export type LandingLanguage = "en" | "ar" | "mix";

export interface MarketingLandingPage {
  id: string;
  name: string;
  path: string; // unique
  status: LandingStatus;
  language: LandingLanguage;
  campaign: string;
  audience: string;
  description: string;
  thumbnailUrl?: string;
  whatsappNumber?: string; // connected WhatsApp number for this landing page
  heroVideoUrl?: string; // hero-section YouTube video URL for this landing page
  views: number;
  clicks: number;
  ctr: number; // derived: clicks/views %
  registrations: number; // captured leads for this path
  createdAt: string;
  updatedAt: string;
}

export type LandingPageInput = {
  name: string;
  path: string;
  status: LandingStatus;
  language: LandingLanguage;
  campaign: string;
  audience: string;
  description: string;
  thumbnailUrl?: string;
  whatsappNumber?: string;
  heroVideoUrl?: string;
};

export interface LandingStats {
  total: number;
  published: number;
  drafts: number;
  views: number;
  clicks: number;
  ctr: number;
}

/** A lead captured on a public funnel; registrations on a landing page are the
 * subset whose `path` matches the page. (Shared with the Free Exam Leads panel.) */
export interface ExamLead {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  profession?: string;
  interest?: string; // course/program they were interested in
  region?: string;
  source: string;
  path?: string;
  createdAt: string;
}

export type LandingSort = "newest" | "views" | "clicks" | "ctr";
export interface ListLandingParams {
  search?: string;
  status?: LandingStatus | "all";
  sort?: LandingSort;
}

const stamp = () => new Date().toISOString();
const ctrOf = (clicks: number, views: number) =>
  views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;

type Row = Omit<MarketingLandingPage, "ctr" | "registrations">;

const pages: Row[] = [
  {
    id: "lp_1",
    name: "Summer Intake 2026",
    path: "/lp/summer-intake-2026",
    status: "published",
    language: "en",
    campaign: "summer-2026",
    audience: "Prospective diploma students",
    description: "Hero + program grid + lead form for the July intake push.",
    thumbnailUrl: "",
    views: 4820,
    clicks: 386,
    createdAt: "2026-05-02T09:00:00.000Z",
    updatedAt: "2026-06-10T09:00:00.000Z",
  },
  {
    id: "lp_2",
    name: "AI for Business — Free Webinar",
    path: "/lp/ai-for-business",
    status: "published",
    language: "ar",
    campaign: "ai-webinar",
    audience: "Working professionals",
    description: "Webinar registration funnel for the AI certificate launch.",
    thumbnailUrl: "",
    views: 2630,
    clicks: 211,
    createdAt: "2026-05-18T09:00:00.000Z",
    updatedAt: "2026-06-12T09:00:00.000Z",
  },
  {
    id: "lp_3",
    name: "PMP Bootcamp Waitlist",
    path: "/lp/pmp-bootcamp",
    status: "draft",
    language: "en",
    campaign: "pmp-q3",
    audience: "Project managers",
    description: "Waitlist capture for the next PMP cohort.",
    thumbnailUrl: "",
    views: 0,
    clicks: 0,
    createdAt: "2026-06-15T09:00:00.000Z",
    updatedAt: "2026-06-15T09:00:00.000Z",
  },
];

const leads: ExamLead[] = [
  { id: "el_1", name: "Mona Adel", email: "mona.adel@example.com", whatsapp: "+201001234567", profession: "Accountant", interest: "Financial Modeling", region: "Cairo", source: "free-exam", path: "/lp/summer-intake-2026", createdAt: "2026-06-18T10:00:00.000Z" },
  { id: "el_2", name: "Tarek Hassan", email: "tarek.h@example.com", whatsapp: "+201112223334", profession: "Engineer", interest: "PMP", region: "Giza", source: "free-exam", path: "/lp/summer-intake-2026", createdAt: "2026-06-19T12:30:00.000Z" },
  { id: "el_3", name: "Salma Youssef", email: "salma.y@example.com", whatsapp: "", profession: "Marketer", interest: "AI for Business", region: "Alexandria", source: "free-exam", path: "/lp/ai-for-business", createdAt: "2026-06-20T08:15:00.000Z" },
  { id: "el_4", name: "Karim Fouad", email: "karim.f@example.com", whatsapp: "+201234567890", profession: "Analyst", interest: "AI for Business", region: "Cairo", source: "free-exam", path: "/lp/ai-for-business", createdAt: "2026-06-21T16:45:00.000Z" },
  { id: "el_5", name: "Nour Ibrahim", email: "nour.i@example.com", whatsapp: "+201557778889", profession: "HR Specialist", interest: "Diploma", region: "Mansoura", source: "free-exam", path: "/lp/summer-intake-2026", createdAt: "2026-06-22T11:20:00.000Z" },
];

let pageSeq = pages.length;
const leadSeq = leads.length;

const withCtr = (r: Row): MarketingLandingPage => ({
  ...r,
  ctr: ctrOf(r.clicks, r.views),
  registrations: leads.filter((l) => l.path === r.path).length,
});

/* ── Landing pages ── */
export async function getLandingPages(
  params: ListLandingParams = {},
): Promise<MarketingLandingPage[]> {
  let rows = [...pages];
  const q = params.search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) =>
      [r.name, r.path, r.campaign, r.audience].some((v) => v.toLowerCase().includes(q)),
    );
  }
  if (params.status && params.status !== "all") {
    rows = rows.filter((r) => r.status === params.status);
  }
  switch (params.sort) {
    case "views": rows.sort((a, b) => b.views - a.views); break;
    case "clicks": rows.sort((a, b) => b.clicks - a.clicks); break;
    case "ctr": rows.sort((a, b) => ctrOf(b.clicks, b.views) - ctrOf(a.clicks, a.views)); break;
    default: rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  return respond(rows.map(withCtr));
}

export async function getLandingStats(): Promise<LandingStats> {
  const total = pages.length;
  const published = pages.filter((p) => p.status === "published").length;
  const views = pages.reduce((s, p) => s + p.views, 0);
  const clicks = pages.reduce((s, p) => s + p.clicks, 0);
  return respond({
    total,
    published,
    drafts: total - published,
    views,
    clicks,
    ctr: ctrOf(clicks, views),
  });
}

export async function getLandingPage(id: string): Promise<MarketingLandingPage | null> {
  const r = pages.find((p) => p.id === id);
  return respond(r ? withCtr(r) : null);
}

export async function createLandingPage(input: LandingPageInput): Promise<MarketingLandingPage> {
  const row: Row = {
    ...input,
    id: `lp_${++pageSeq}`,
    views: 0,
    clicks: 0,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  pages.push(row);
  return respond(withCtr(row));
}

export async function updateLandingPage(
  id: string,
  patch: Partial<LandingPageInput>,
): Promise<MarketingLandingPage | null> {
  const row = pages.find((p) => p.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch, { updatedAt: stamp() });
  return respond(withCtr(clone(row)));
}

export async function deleteLandingPage(id: string): Promise<boolean> {
  const i = pages.findIndex((p) => p.id === id);
  if (i === -1) return respond(false);
  pages.splice(i, 1);
  return respond(true);
}

/** Public best-effort hit tracking (view/click) by path. */
export async function trackLanding(path: string, type: "view" | "click"): Promise<boolean> {
  const row = pages.find((p) => p.path === path);
  if (!row) return respond(false);
  if (type === "view") row.views += 1;
  else row.clicks += 1;
  return respond(true);
}

/* ── Registrations (leads) ── */
export async function getRegistrationsByPath(path: string): Promise<ExamLead[]> {
  return respond(leads.filter((l) => l.path === path));
}

export interface ExamLeadStats {
  total: number;
  last7: number;
  last30: number;
  withWhatsapp: number;
}

/** All leads (newest first), optionally filtered by a free-text query. */
export async function listLeads(search?: string): Promise<ExamLead[]> {
  let rows = [...leads].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const q = search?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((l) =>
      [l.name, l.email, l.whatsapp, l.profession, l.interest, l.region].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }
  return respond(rows);
}

export async function getLeadStats(): Promise<ExamLeadStats> {
  const now = Date.now();
  const within = (ms: number) =>
    leads.filter((l) => now - new Date(l.createdAt).getTime() <= ms).length;
  return respond({
    total: leads.length,
    last7: within(7 * 86_400_000),
    last30: within(30 * 86_400_000),
    withWhatsapp: leads.filter((l) => !!l.whatsapp && l.whatsapp.trim().length > 0).length,
  });
}

export async function deleteLead(id: string): Promise<boolean> {
  const i = leads.findIndex((l) => l.id === id);
  if (i === -1) return respond(false);
  leads.splice(i, 1);
  return respond(true);
}

/** Mock email-to-leads — server would personalize {{name}}/{{email}} per recipient. */
export async function emailLeads(ids: string[] | undefined): Promise<{ sent: number; failed: number; total: number }> {
  const targets = ids?.length ? leads.filter((l) => ids.includes(l.id)) : leads;
  return respond({ sent: targets.length, failed: 0, total: targets.length });
}
