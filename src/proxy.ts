import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

/** Locale negotiation + prefix handling for every page request. */
const intlMiddleware = createMiddleware(routing);

/** Areas that require a signed-in session (presence of the role cookie). */
const PROTECTED = ["/admin", "/staff", "/instructor", "/student"];

export default function proxy(req: NextRequest) {
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

  const isProtected = PROTECTED.some((p) => rest === p || rest.startsWith(`${p}/`));
  if (isProtected && !req.cookies.get("imets_role")) {
    const url = req.nextUrl.clone();
    url.pathname = `${localePrefix}/login`;
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(req);
}

export const config = {
  // Run on all paths except API, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
