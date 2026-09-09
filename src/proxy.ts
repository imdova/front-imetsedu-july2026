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

/**
 * Whether the session JWT has expired.
 *
 * Only the `exp` claim is read and the signature is deliberately NOT verified:
 * this is a routing decision, not an authorisation one. The API verifies every
 * token properly on every request; the job here is just to stop sending someone
 * into the console holding a token the API will reject.
 *
 * Why this exists: the session cookies are re-stamped with a fresh 7-day
 * max-age on every navigation (`persistSessionCookie`, called by the
 * permissions refresher), but the JWT inside `imets_token` still expires 7 days
 * after login and nothing renews it — `/auth/refresh` exists in the service
 * layer and is never called. Gating on the presence of `imets_role` alone
 * therefore let someone browse indefinitely with a dead token: pages rendered,
 * layouts passed their checks against the `imets_user` cookie, and every
 * server-side API call quietly 401'd. The result was a console that worked
 * except that every list was empty, with nothing on screen saying why.
 *
 * Unreadable tokens are treated as valid so a decoding quirk can never lock
 * anyone out; the API stays the real gate.
 */
function tokenExpired(token: string | undefined): boolean {
  if (!token) return true;
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    const claims = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { exp?: number };
    if (typeof claims.exp !== "number") return false;
    return claims.exp * 1000 <= Date.now();
  } catch {
    return false;
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
    // No session, or one whose token the API will reject — either way the only
    // useful destination is login. Letting an expired session through produces a
    // console that renders but cannot load anything.
    if (!role || tokenExpired(req.cookies.get("imets_token")?.value)) {
      const url = req.nextUrl.clone();
      url.pathname = `${localePrefix}/login`;
      url.search = `?next=${encodeURIComponent(pathname)}`;
      const res = NextResponse.redirect(url);
      // Clear the stale session so the next request does not loop straight back.
      for (const name of ["imets_role", "imets_token", "imets_user"]) {
        res.cookies.delete(name);
      }
      return res;
    }

    // Logged in, but wrong area for this role (e.g. a student opening /admin) — send them home.
    if (!AREA_ROLES[area].includes(role)) {
      const url = req.nextUrl.clone();
      url.pathname = `${localePrefix}${homeForRole(role)}`;
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(req);
}

export const config = {
  // Run on all paths except API, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
