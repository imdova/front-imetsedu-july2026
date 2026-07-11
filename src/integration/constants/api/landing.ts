// Admin — landing pages
export const API_LANDING_PAGES = "/admin/landing/pages";
export const API_LANDING_PAGES_STATS = "/admin/landing/pages/stats";
export const apiLandingPage = (id: string) => `/admin/landing/pages/${id}`;

// Admin — free-exam leads
export const API_EXAM_LEADS = "/admin/free-exam/leads";
export const API_EXAM_LEADS_STATS = "/admin/free-exam/leads/stats";
export const API_EXAM_LEADS_EMAIL = "/admin/free-exam/leads/email";
export const apiExamLead = (id: string) => `/admin/free-exam/leads/${id}`;

// Admin — homepage CMS
export const API_LANDING_TESTIMONIALS = "/admin/landing/testimonials";
export const apiLandingTestimonial = (id: string) => `/admin/landing/testimonials/${id}`;
export const API_LANDING_SPONSORS = "/admin/landing/sponsors";
export const apiLandingSponsor = (id: string) => `/admin/landing/sponsors/${id}`;
export const API_LANDING_INSIGHTS = "/admin/landing/insights";
export const apiLandingInsight = (id: string) => `/admin/landing/insights/${id}`;
export const API_LANDING_NEWSLETTER = "/admin/landing/newsletter";
export const apiLandingSubscriber = (id: string) => `/admin/landing/newsletter/${id}`;
export const API_LANDING_CONTACT = "/admin/landing/contact";
export const apiLandingMessage = (id: string) => `/admin/landing/contact/${id}`;

// Public
export const API_LANDING_TRACK = "/landing/pages/track";
export const API_LANDING_PUBLIC_CONFIG = "/landing/pages/public";
export const API_FREE_EXAM_CAPTURE = "/free-exam/leads";
