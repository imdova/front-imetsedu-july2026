# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

IMETS Medical School — admin/staff/instructor/student console (Next.js 16 App Router frontend). Talks to a live NestJS backend at `https://main-api.imetsedu.com` (overridable via `NEXT_PUBLIC_API_URL`).

## Commands

```bash
npm run dev      # next dev --webpack   → http://localhost:3000
npm run build    # next build --webpack
npm run start    # next start (production)
npm run lint      # eslint
npx tsc --noEmit  # type-check (no separate "typecheck" script — run tsc directly)
```

There is no test suite/framework configured in this repo (no `test` script, no `*.test.ts` files under `src/`).

**Why `--webpack` and not the default Turbopack:** Next.js 16 makes Turbopack the default bundler for `next dev`/`next build`. On this Windows dev box, Turbopack's dev server hit a fatal `os error 10055` (socket buffer exhaustion) after sustained use. `package.json` pins both scripts to `--webpack` to avoid it. Don't remove the flag without confirming Turbopack is stable here first.

## Next.js 16 — this is not the Next.js you remember

Per `AGENTS.md`: breaking changes vs. training-data Next.js. The one that matters most structurally: **`middleware.ts` is renamed/deprecated → `proxy.ts`**, exporting a function named `proxy` (not `middleware`). This repo has exactly one such file, `src/proxy.ts`, and it is the single place handling locale routing, auth redirects, and role-based access — see below. Before touching routing/SSR/caching behavior, check `node_modules/next/dist/docs/` for the current API; do not assume v13–15 behavior.

## Architecture seam: `src/lib/dal/*` is the only data source the UI may import

```
UI components → @/lib/dal/*  → either @integration/services/* (live backend)
                                  or  @/lib/db/* (in-memory mock, legacy)
```

- Every DAL function returns the same `Result<T> = { ok: true; data: T } | { ok: false; error: string }` discriminated union, whether backed by the live API or the mock store. Components branch on `res.ok` and never know which backend a given call used.
- **The migration from mock to live is per-function, not per-file, and is already well underway** — open the specific DAL file you're touching and check: functions with a `LIVE:` comment call `@integration/services/*` against the real backend; anything else still delegates to `@/lib/db/*`. Don't assume a whole domain is "still mock" or "already live" — verify the function.
- `@integration/*` (`src/integration/`) is a vendored, framework-agnostic clone of the backend's API surface: ~38 service domains (`src/integration/services/<domain>/{index,*.service,types}.ts`), each calling through `src/integration/lib/api-client.ts` (`api.get/post/patch/delete`). Internal imports use `@integration/*`, not `@/*`, so it has no alias collisions with the host app.
- The HTTP client's token source is injected, not hardcoded — see next section. Base URL defaults to `https://main-api.imetsedu.com`, overridden by `NEXT_PUBLIC_API_URL`. **Never point `NEXT_PUBLIC_API_URL` at this app's own port** (e.g. `localhost:3000`) — `src/proxy.ts` and several pages make server-side fetches back through the configured API URL, and pointing it at the Next.js server itself creates a self-referential request that queues behind itself and can hang a request for tens of minutes (this happened; see git history around the `.env` fix).
- `src/lib/api-client.config.ts` (`bootstrapApiClient()`) wires the client-side token (Zustand `user.access_token`) — client components only. `src/lib/api-client.server.ts` (`configureServerApiClient()`) wires the server-side token (the `imets_token` cookie via `next/headers`) — **never import this from a client component or from the `@/lib/dal` barrel**; it pulls in `next/headers` which breaks client bundles. Wire it from a server `layout.tsx` only.

## Auth, roles, and permissions — read this before touching any of it

This is the most cross-cutting, easiest-to-break system in the app. A change here touches routing, cookies, Zustand, and the sidebar nav simultaneously; missing one spot breaks login redirects or lets the wrong role into the wrong area silently.

**The role model** (`AppRole` in `src/lib/auth-session.ts`): `"admin" | "staff" | "instructor" | "student"`. Backend only knows two roles (`admin` | `user`); `mapRole()` derives the app role: backend `admin` → app `admin`; backend `user` + a `staffRole` object → `staff`; backend `user` with no `staffRole` → `student`. `homeForRole(role)` is the single source of truth for each role's landing route (`/admin/dashboard`, `/staff/...`, `/instructor/dashboard`, `/student/dashboard`).

**Admin vs. staff — the real discriminator is the `staffRole` field, not the role string.** Both land on `/admin` and both pass the `AREA_ROLES` gate for `/admin` and `/staff` (see below) — there's no URL-level separation between them. The actual access difference happens inside `src/lib/permission-guard.ts`, which checks `staffRole` directly everywhere (`can`, `requirePermission`, `requireSuperAdmin`, the client `usePermission` hook):
```ts
if (user.staffRole === null || user.staffRole === undefined) return true;       // super-admin: every permission passes
return user.staffRole.permissions?.[permission] === true;                        // staff: filtered to their own permission map
```
So: `staffRole === null` → super-admin, unrestricted. `staffRole` is an object with a `permissions` map → staff, restricted to exactly those keys. `requireSuperAdmin()` additionally requires `role === "admin"` on top of `staffRole === null` — a `"staff"`-role user can never pass it even if their `staffRole.permissions` happens to grant everything. `staffId` (used to auto-assign CRM leads) is only set when `staffRole` is a non-null object.

**Session storage, three places, kept in sync manually:**
- Zustand `auth-slice` (`src/store/slices/auth-slice.ts`) — the client source of truth (`user.role`, `user.staffRole`, `user.access_token`), persisted to `localStorage`.
- Cookies (`src/lib/auth-session.ts`: `persistSessionCookie` / `clearSessionCookie`) — `imets_role`, `imets_token`, `imets_user` (JSON), 7-day max-age. These exist purely so server code (`proxy.ts`, RSC pages, `api-client.server.ts`) can read the session without a client round-trip.
- `localStorage["imets_refresh"]` — the refresh token, deliberately kept out of the cookie.

If you change what gets stored or how a role is derived, update `mapRole`/`toAuthUser`/`persistSessionCookie` together — they're three different functions in the same file but easy to update only one of.

**`src/proxy.ts` (the Next-16 "middleware") does four unrelated jobs in one pass, in this order:**
1. Strips the locale prefix to get the unprefixed path (`ar` is prefixed, `en` is not — see i18n section).
2. Rewrites backend-emailed auth links (`/auth/accept-invitation`, `/auth/reset-password`, `/auth/set-password`) to their real un-prefixed routes, preserving the `?token=` query. Whitelisted by exact page name so it never touches OAuth callback paths (`/auth/google/redirect`, etc.).
3. Gates `PROTECTED` areas (`/admin`, `/staff`, `/instructor`, `/student`) on the presence of the `imets_role` cookie → redirects to `/login?next=...` if absent.
4. **Role-vs-area check**: `AREA_ROLES` maps each protected area to the roles allowed in it (`/admin` and `/staff` both allow `["admin","staff"]`; `/instructor` allows only `["instructor"]`; `/student` allows only `["student"]`). A logged-in user hitting the wrong area is redirected to `homeForRole(role)`, not blocked with an error. **If you add a new role or a new top-level protected area, you must add it to both `PROTECTED` and `AREA_ROLES` or it will be silently un-gated** (accessible to everyone) or silently un-routable.

Finally it delegates to `next-intl`'s `createMiddleware(routing)` for actual locale negotiation — proxy.ts is also the i18n middleware, not a separate file.

**Permission checks (finer-grained than role, for staff members specifically):**
- Server-side: `src/lib/permission-guard.ts` — `getSessionUser()` reads the `imets_user` cookie; `can(permission)` / `requirePermission(permission)` / `requirePermissions([...])` / `requireSuperAdmin()` / `requireStaffOrAdmin()`. **`requirePermission` throws a 404 (Next's `notFound()`), it does not redirect** — a denied staff member sees a 404 page, not a login screen or a 403.
- Client-side: `usePermission(permission)` hook (`src/hooks/use-permission.ts`) and the `<PermissionGate>` component (`src/components/shared/permission-gate.tsx`) for conditional rendering — same `staffRole`-based logic as above.
- The sidebar nav model (`src/constants/navigation.ts`) filters items via `requiredPermissions` / `adminOnly` flags — a nav item and its destination page can fall out of sync if you change one without the other.

## CRM pipelines & stages — the most fragile feature in this codebase

This was the subject of an extended debugging session; the mechanism is non-obvious and has no backend write API, which makes "just add a stage" a multi-file, partially-backend-blocked operation.

**Where a stage's data actually lives — two layers, mapped by position, not by key:**
1. Each **Pipeline document** (backend, `GET /crm/pipelines` / `/crm/pipelines/:id` / `/crm/pipelines/:id/view`) has its own `stages: [{ key, name, order }]` array. This is what the Kanban board and the lead's "Pipeline Status" dropdown actually iterate over. **There is no backend endpoint to add/edit/remove a stage on an existing pipeline** — `PATCH /crm/pipelines/:id` explicitly rejects a `stages` field (`"property stages should not exist"`), and no `/crm/pipelines/:id/stages` sub-resource exists. Stages are fixed at pipeline-creation time, server-side. Adding a stage today requires a backend code/DB change — the frontend cannot do it through any API call.
2. A single **CRM Settings record** (id `6a25bd99f90982c9b47c4d22`, `nameEn: "stages"`) holds an `options: string[]` array of *display names* — and `src/hooks/use-pipeline-stages.ts` maps `options[i]` onto the *i-th visible stage* of whatever pipeline's `stages` array you pass in, **by array index after sorting by `order` and filtering out `EXCLUDED_STAGE_KEYS` ("qualified", "payment")** — never by matching `key` to anything. This means:
   - The CRM Settings `options` array and every pipeline's `stages` array must stay the same *length* and *relative order* (after the exclusion filter) or names silently shift onto the wrong stage.
   - Editing only the CRM Settings record (e.g. appending a display name) **does nothing visible** unless the pipeline's own `stages` array also gains a matching entry at the same position — and per point 1, that side is currently backend-only.

**`STAGE_MAP` in `src/lib/crm/map-lead.ts` is a silent landmine:** it maps a backend pipeline stage `key` to the UI's canonical stage key, with a fallback of `?? "new"`. **Any backend stage key not present in this map gets displayed, grouped, and dragged as if it were `"new"`** — no error, no warning, the lead just silently shows up in the wrong Kanban column. Whenever a new stage key is introduced on the backend, `STAGE_MAP` must be updated in the same change, or leads in that stage will misreport.

**`GATED` (`pipeline-board.tsx`) / `GATED_STAGES` (`lead-detail.tsx`) are independent fixed arrays** (currently `["contacted", "enrolled", "lost"]` in both) that decide whether moving a lead into a stage opens a confirmation modal (`LeadTransitionModal`) first. A new stage key not in this list transitions immediately with no modal — that's a deliberate property to rely on if you want a "quiet" stage, but it means the two arrays must be kept in sync with each other if the gating list ever changes.

**Full checklist for adding a new stage key (e.g. the `dead` stage added this session) — all of these, or it'll be half-broken:**
- Backend: append `{ key, name, order }` to every relevant pipeline's `stages[]` (no API for this today — backend/DB change only). `order` must sort after the existing stages.
- CRM Settings record `6a25bd99f90982c9b47c4d22`: append the display name to `options[]` **at the matching position** (i.e., last, if the new stage sorts last).
- `src/lib/crm/map-lead.ts` → `STAGE_MAP[key] = key` (or whatever canonical key you want it to collapse to).
- `src/hooks/use-pipeline-stages.ts` → `STAGE_COLORS[key]`, and add to the `isTerminal` check if it's a funnel-ending stage.
- `src/features/crm/lib/maps.ts` → `STAGE_LABEL_KEY[key]`, `STAGE_STYLE[key]`, `STAGE_ACCENT[key]` (skipping this one specifically throws at runtime in `crm-dashboard.tsx`, which calls `tr(STAGE_LABEL_KEY[key])` with no fallback, unlike the other consumers which all guard with `??`).
- `messages/en.json` / `messages/ar.json` → the `stageXxx` translation key referenced by `STAGE_LABEL_KEY`.
- `src/lib/db/crm.ts` → `DEFAULT_PIPELINE.stages` (a local fallback list, separate from any real pipeline, used for the generic "filter by stage" dropdown on the all-leads list page).
- Decide whether the new stage belongs in `GATED`/`GATED_STAGES` (confirmation modal) and in `pipeline-board.tsx`'s forecast-table exclusion filter (currently excludes `lost`; terminal/failure stages are typically excluded from revenue forecasting too).

## i18n (next-intl)

- Locales: `en` (default, **no URL prefix**) and `ar` (prefixed `/ar/...`). Config: `src/i18n/routing.ts` (`defineRouting`), per-request loader `src/i18n/request.ts` (dynamically imports `messages/<locale>.json`).
- **Always navigate via `src/i18n/navigation.ts`'s exports (`Link`, `useRouter`, `usePathname`, `redirect`), never `next/navigation` directly** — these wrappers add/strip the locale prefix automatically. `usePathname()` from this wrapper returns the path *without* the locale prefix, matching nav-model `href`s directly.
- Message catalogs are flat-ish JSON in `messages/en.json` / `messages/ar.json` (large files, no separate translation-management tooling) — `useTranslations("Namespace")` keys into them by top-level namespace.
- `src/proxy.ts` strips/restores the locale prefix manually for its own path matching (see auth section) — it does this in addition to, not instead of, delegating to `next-intl`'s own middleware at the end.

## State (Zustand)

`src/store/index.ts` composes two slices via `persist()` (only `user`, `sidebarCollapsed`, `collapsedNavSections` are persisted to `localStorage` — everything else in `ui-slice` is transient):
- `auth-slice.ts` — the logged-in `AuthUser` (see auth section above) + `setUser()`/`logout()`.
- `ui-slice.ts` — sidebar collapse state, command-palette open state, per-section nav-collapse state.

No other slices exist; don't add cross-cutting state here without checking if it belongs in a feature's own local state instead — this store is intentionally small.

## Component layering (3 altitudes, each depends only downward)

- `src/components/ui/` — shadcn/Radix primitives, dumb, generated. Don't hand-edit business logic in here.
- `src/components/shared/` — reusable-but-composed (DataTable over TanStack Table, the Tiptap-based RichTextEditor, the dnd-kit SortableList, PermissionGate, MultiSelect, etc.) — domain-agnostic.
- `src/features/<domain>/components/` — domain-aware composition (crm, courses, dashboard, staff, student, instructor, marketing, blog, auth, ...). This is where most page-specific UI actually lives; route files under `src/app/[locale]/**` are typically thin wrappers that fetch via the DAL and render a `features/*` component.

## Route structure (`src/app/[locale]/**`)

Locale-prefixed (see i18n above). Two route groups provide alternate shells without affecting the URL: `(auth)` (login/register/password flows, no sidebar) and `(public)` (marketing site, no sidebar). Four role-scoped top-level areas share the full admin shell (sidebar + header): `/admin`, `/staff`, `/instructor`, `/student` — access to each is enforced by `proxy.ts`'s `AREA_ROLES` (see auth section), so a route existing under, say, `/student/**` does not by itself prove a student can reach it without also checking the proxy gate matches.
