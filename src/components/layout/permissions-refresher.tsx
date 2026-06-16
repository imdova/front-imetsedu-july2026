"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useStore } from "@/store";
import * as authDal from "@/lib/dal/auth";
import { persistSessionCookie } from "@/lib/auth-session";

/**
 * Fetches /users/me (GET /auth/profile) on every route change and whenever the
 * user becomes authenticated. Updates the in-memory Zustand store and the
 * session cookie so that hard refreshes also get the latest permissions —
 * no re-login required.
 *
 * Mirrors old codebase: components/admin/PermissionsRefresher.tsx exactly.
 */
export function PermissionsRefresher() {
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      const token = useStore.getState().user?.access_token;
      if (!token) return;

      const result = await authDal.getProfile();
      if (cancelled || !result.ok) return;

      const currentUser = useStore.getState().user;
      if (!currentUser) return;

      const updated = {
        ...currentUser,
        staffRole: result.data.staffRole ?? null,
      };

      // Update store (sidebar re-renders immediately with latest permissions)
      setUser(updated);

      // Update session cookie so next hard-refresh also has the latest permissions
      persistSessionCookie(updated);
    })();

    return () => {
      cancelled = true;
    };
    // user: triggers on initial auth
    // pathname: triggers on every navigation (catches admin permission changes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.access_token, pathname]);

  return null;
}
