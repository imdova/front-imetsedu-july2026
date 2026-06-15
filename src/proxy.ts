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
