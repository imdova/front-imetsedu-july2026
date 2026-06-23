/**
 * Landing homepage-CMS seed (mock DB) — the content the public landing/homepage
 * renders: testimonials, sponsors & partners, insights (articles), newsletter
 * subscribers and contact messages. Mirrors the clone-spec `LandingManager`.
 *
 * Testimonials / sponsors / insights are full CRUD; newsletter subscribers and
 * contact messages are read + delete (captured from public forms).
 */
import { respond, clone } from "./delay";

export interface LandingTestimonial {
  id: string;
  quote: string;
  authorName: string;
  authorTitle?: string;
  videoUrl?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
}
export type TestimonialInput = Omit<LandingTestimonial, "id">;

export type SponsorType = "sponsor" | "partner";
export interface LandingSponsor {
  id: string;
  name: string;
  logoUrl?: string;
  type: SponsorType;
  url?: string;
  order: number;
  isActive: boolean;
}
export type SponsorInput = Omit<LandingSponsor, "id">;

export interface LandingInsight {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  coverImage?: string;
  publishedAt?: string;
  order: number;
  isActive: boolean;
}
export type InsightInput = Omit<LandingInsight, "id">;

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string;
  tags: string[];
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  phone?: string;
  createdAt: string;
}

const testimonials: LandingTestimonial[] = [
  { id: "ts_1", quote: "The diploma transformed how I lead my finance team.", authorName: "Mona Adel", authorTitle: "Finance Manager, Cairo", imageUrl: "", order: 1, isActive: true },
  { id: "ts_2", quote: "Best investment in my career — practical and accredited.", authorName: "Tarek Hassan", authorTitle: "Project Manager", imageUrl: "", order: 2, isActive: true },
  { id: "ts_3", quote: "Loved the live sessions and the instructors.", authorName: "Salma Youssef", authorTitle: "Marketing Lead", videoUrl: "", order: 3, isActive: false },
];

const sponsors: LandingSponsor[] = [
  { id: "sp_1", name: "Egyptian Banking Institute", type: "partner", url: "https://ebi.gov.eg", order: 1, isActive: true },
  { id: "sp_2", name: "PMI Egypt Chapter", type: "partner", url: "", order: 2, isActive: true },
  { id: "sp_3", name: "TechCorp", type: "sponsor", url: "", order: 3, isActive: true },
];

const insights: LandingInsight[] = [
  { id: "in_1", title: "5 skills every finance leader needs in 2026", slug: "finance-skills-2026", excerpt: "From FP&A to storytelling with data.", publishedAt: "2026-05-20T09:00:00.000Z", order: 1, isActive: true },
  { id: "in_2", title: "Is a PMP worth it?", slug: "is-pmp-worth-it", excerpt: "We break down the ROI.", publishedAt: "2026-06-01T09:00:00.000Z", order: 2, isActive: true },
];

const subscribers: NewsletterSubscriber[] = [
  { id: "ns_1", email: "lina@example.com", source: "footer", tags: ["newsletter"], createdAt: "2026-06-10T09:00:00.000Z" },
  { id: "ns_2", email: "omar@example.com", source: "popup", tags: ["newsletter", "promo"], createdAt: "2026-06-15T09:00:00.000Z" },
  { id: "ns_3", email: "heba@example.com", source: "footer", tags: ["newsletter"], createdAt: "2026-06-20T09:00:00.000Z" },
];

const messages: ContactMessage[] = [
  { id: "cm_1", name: "Yousef Salim", email: "yousef@example.com", phone: "+201001112223", message: "Do you offer corporate training packages?", createdAt: "2026-06-18T09:00:00.000Z" },
  { id: "cm_2", name: "Maryam Adel", email: "maryam@example.com", message: "When is the next PMP cohort?", createdAt: "2026-06-21T09:00:00.000Z" },
];

let tsSeq = testimonials.length, spSeq = sponsors.length, inSeq = insights.length;

const sortByOrder = <T extends { order: number }>(rows: T[]) => [...rows].sort((a, b) => a.order - b.order);

/* ── Testimonials ── */
export const getTestimonials = () => respond(sortByOrder(testimonials));
export async function createTestimonial(input: TestimonialInput): Promise<LandingTestimonial> {
  const row = { ...input, id: `ts_${++tsSeq}` };
  testimonials.push(row); return respond(row);
}
export async function updateTestimonial(id: string, patch: Partial<TestimonialInput>): Promise<LandingTestimonial | null> {
  const row = testimonials.find((r) => r.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch); return respond(clone(row));
}
export async function deleteTestimonial(id: string): Promise<boolean> {
  const i = testimonials.findIndex((r) => r.id === id);
  if (i === -1) return respond(false);
  testimonials.splice(i, 1); return respond(true);
}

/* ── Sponsors & partners ── */
export const getSponsors = () => respond(sortByOrder(sponsors));
export async function createSponsor(input: SponsorInput): Promise<LandingSponsor> {
  const row = { ...input, id: `sp_${++spSeq}` };
  sponsors.push(row); return respond(row);
}
export async function updateSponsor(id: string, patch: Partial<SponsorInput>): Promise<LandingSponsor | null> {
  const row = sponsors.find((r) => r.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch); return respond(clone(row));
}
export async function deleteSponsor(id: string): Promise<boolean> {
  const i = sponsors.findIndex((r) => r.id === id);
  if (i === -1) return respond(false);
  sponsors.splice(i, 1); return respond(true);
}

/* ── Insights ── */
export const getInsights = () => respond(sortByOrder(insights));
export async function createInsight(input: InsightInput): Promise<LandingInsight> {
  const row = { ...input, id: `in_${++inSeq}` };
  insights.push(row); return respond(row);
}
export async function updateInsight(id: string, patch: Partial<InsightInput>): Promise<LandingInsight | null> {
  const row = insights.find((r) => r.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch); return respond(clone(row));
}
export async function deleteInsight(id: string): Promise<boolean> {
  const i = insights.findIndex((r) => r.id === id);
  if (i === -1) return respond(false);
  insights.splice(i, 1); return respond(true);
}

/* ── Newsletter subscribers (read + delete) ── */
export async function getSubscribers(search?: string): Promise<NewsletterSubscriber[]> {
  let rows = [...subscribers].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const q = search?.trim().toLowerCase();
  if (q) rows = rows.filter((s) => s.email.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)));
  return respond(rows);
}
export async function deleteSubscriber(id: string): Promise<boolean> {
  const i = subscribers.findIndex((s) => s.id === id);
  if (i === -1) return respond(false);
  subscribers.splice(i, 1); return respond(true);
}

/* ── Contact messages (read + delete) ── */
export async function getContactMessages(search?: string): Promise<ContactMessage[]> {
  let rows = [...messages].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const q = search?.trim().toLowerCase();
  if (q) rows = rows.filter((m) => [m.name, m.email, m.message].some((v) => v.toLowerCase().includes(q)));
  return respond(rows);
}
export async function deleteContactMessage(id: string): Promise<boolean> {
  const i = messages.findIndex((m) => m.id === id);
  if (i === -1) return respond(false);
  messages.splice(i, 1); return respond(true);
}
