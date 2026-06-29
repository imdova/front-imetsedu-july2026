import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { homeForRole, type AppRole } from "./lib/auth-session";

/** Locale negotiation + prefix handling for every page request. */
const intlMiddleware = createMiddleware(routing);

/** Areas that require a signed-in session (presence of the role cookie). */
const PROTECTED = ["/admin", "/staff", "/instructor", "/student"];

/** Roles allowed inside each protected area — wrong role gets bounced to its own home. */
const AREA_ROLES: Record<string, AppRole[]> = {
  "/admin": ["admin", "staff"],
  "/staff": ["admin", "staff"],
  "/instructor": ["instructor"],
  "/student": ["student"],
};

/* -------------------------------------------------------------------------- */
/*  SEO redirects — admin-managed (/admin/seo/redirects), enforced at the edge */
/*  with a 60s in-memory cache so the backend is hit at most once per minute    */
/*  per edge instance. Fail-open: if the API is unavailable, no redirect runs.  */
/* -------------------------------------------------------------------------- */
interface RedirectRule { from: string; to: string; type: string }
const REDIRECT_TTL = 60_000;
let redirectCache: { at: number; rules: RedirectRule[] } | null = null;

async function getRedirects(): Promise<RedirectRule[]> {
  if (redirectCache && Date.now() - redirectCache.at < REDIRECT_TTL) {
    return redirectCache.rules;
  }
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "https://main-api.imetsedu.com";
    const res = await fetch(`${base}/seo/redirects`, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data: unknown = await res.json();
    const rules: RedirectRule[] = Array.isArray(data)
      ? data.map((r) => ({ from: String(r.from), to: String(r.to), type: String(r.type ?? "301") }))
      : [];
    redirectCache = { at: Date.now(), rules };
    return rules;
  } catch {
    return redirectCache?.rules ?? [];
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Strip a leading locale segment (only `ar` is prefixed; `en` is at root).
  const seg = pathname.split("/")[1];
  const localePrefix = seg === "ar" ? "/ar" : "";
  const rest = localePrefix ? pathname.slice(localePrefix.length) || "/" : pathname;

  // The backend emails link to /auth/<page> (user-invitation → accept-invitation,
  // password reset → reset-password, student set-password invite → set-password),
  // but those pages live in the (auth) route group and are served without the
  // /auth segment. Redirect the emailed links to the real routes — the ?token=…
  // query is preserved on the cloned URL. Whitelisted so it never touches the
  // backend's OAuth callbacks (/auth/google/redirect, /auth/facebook/redirect).
  const AUTH_EMAIL_PAGES = ["accept-invitation", "reset-password", "set-password"];
  const authPage = rest.match(/^\/auth\/([^/?]+)$/)?.[1];
  if (authPage && AUTH_EMAIL_PAGES.includes(authPage)) {
    const url = req.nextUrl.clone();
    url.pathname = `${localePrefix}/${authPage}`;
    return NextResponse.redirect(url);
  }

  const area = PROTECTED.find((p) => rest === p || rest.startsWith(`${p}/`));
  const role = req.cookies.get("imets_role")?.value as AppRole | undefined;

  if (area) {
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = `${localePrefix}/login`;
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }

    // Logged in, but wrong area for this role (e.g. a student opening /admin) — send them home.
    if (!AREA_ROLES[area].includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = `${localePrefix}${homeForRole(role)}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // Admin-managed SEO redirects (public paths only; protected areas skipped).
  if (!area) {
    const hit = (await getRedirects()).find((r) => r.from === rest);
    if (hit) {
      const status = Number(hit.type) || 308;
      if (/^https?:\/\//.test(hit.to)) {
        return NextResponse.redirect(hit.to, status);
      }
      const url = req.nextUrl.clone();
      url.pathname = `${localePrefix}${hit.to}`;
      url.search = "";
      return NextResponse.redirect(url, status);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // Run on all paths except API, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
