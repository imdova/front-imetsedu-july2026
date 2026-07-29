"use client";

import type { ReactNode } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Hides the public footer on focused / conversion pages — landing pages (`/lp/*`)
 * and free-course detail (player) pages — where a full site footer is a
 * distraction. `usePathname()` here is locale-stripped, so paths match without
 * the `/ar` prefix. The footer is passed in as children (a server component),
 * so this client gate only decides whether to render it.
 */
export function FooterGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/lp/") || /^\/free-courses\/[^/]+/.test(pathname);
  return hidden ? null : <>{children}</>;
}
