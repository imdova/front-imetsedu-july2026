# IMETS Medical School — Admin Console (Frontend)

A modern, scalable Next.js front end for the IMETS Medical School online
courses platform. Built with a feature-based architecture, a reusable component
system, and a clean data-access seam that lets the UI run on dummy data today
and switch to the real NestJS backend with **no UI refactor**.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, RSC, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + design tokens (blue brand) |
| Components | shadcn/ui (Radix primitives) + RTL support |
| Forms | React Hook Form + Zod |
| Tables | TanStack Table (headless wrapper) |
| Rich text | Tiptap (modular extensions) |
| Drag & drop | dnd-kit (composable sortable) |
| State | Zustand (slice pattern) |
| Animation | Motion |
| Theming | next-themes (light/dark) |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000  → redirects to /dashboard
npm run build    # production build (all routes prerender)
npx tsc --noEmit # type-check
```

## Folder structure & rationale

```
src/
├─ app/                      # App Router routes
│  ├─ (admin)/               # route group → admin shell (sidebar + header)
│  │  ├─ dashboard/          # the first page (stats, chart, dnd board, table, editor)
│  │  └─ courses/            # list + courses/new (the Add-New-Course wizard)
│  └─ layout.tsx             # root: fonts (Geist + Cairo/AR), theme, toaster
│
├─ components/
│  ├─ ui/                    # shadcn primitives (generated, low-level)
│  ├─ shared/                # cross-feature reusables (DataTable, RichTextEditor,
│  │                         #   SortableList, MultiSelect, TagsInput, ImageUpload…)
│  ├─ layout/                # app shell: sidebar, header, nav, icon map
│  └─ providers/             # theme provider
│
├─ features/                 # feature-scoped UI (composition over prop-drilling)
│  ├─ dashboard/             # stats grid, sales chart, task board, announcement
│  └─ courses/               # columns, table, quick-create modal, course-form wizard
│
├─ lib/
│  ├─ db/                    # dummy database: typed seed + async CRUD + delay()
│  ├─ dal/                   # Data Access Layer — the ONLY data source the UI imports
│  ├─ api-client.config.ts   # injects auth token into the integration HTTP client
│  └─ utils.ts               # cn(), formatCurrency, slugify, …
│
├─ integration/             # vendored portable API layer (see below) under @integration/*
├─ store/                   # Zustand store + slices (ui, auth)
├─ validations/             # Zod schemas (course-schema) + form defaults
├─ constants/               # nav model, course option sets
├─ types/                   # app type barrel (re-exports backend contracts)
└─ app/globals.css          # design tokens, typography, scrollbars
```

**Why these boundaries?**

- **`ui` vs `shared` vs `features`** — three altitudes. `ui` is dumb primitives,
  `shared` is reusable-but-composed (a DataTable, an editor), `features` is
  domain-aware composition. Each layer only depends downward, so nothing is
  duplicated and refactors stay local.
- **`lib/db` vs `lib/dal`** — the dummy DB is an implementation detail; the DAL
  is the contract. See the migration note below.
- **route group `(admin)`** — scopes the console shell without polluting URLs.

## The data-access seam (future-API ready)

The UI imports data functions **only** from `@/lib/dal`. Each returns the same
`Result<T>` discriminated union the real backend services use:

```ts
import { dal } from "@/lib/dal";
const res = await dal.courses.fetchCourses();
if (res.ok) render(res.data);   // else res.error
```

Today the DAL delegates to `lib/db` (in-memory seed). To go live, change only the
DAL body to call the vendored integration services — e.g.

```ts
// lib/dal/courses.ts  (the only file that changes)
import { courses } from "@integration/services/courses";
export const fetchCourses = (p) => courses.listCourses(p);
```

No component changes, because: (1) types are stable (the form already targets the
backend `CourseFormData` contract via `to-course-payload.ts`), (2) Zod validates
inputs, and (3) the `Result<T>` shape is identical on both sides. The token
source is already wired through `bootstrapApiClient()` → Zustand auth slice.

### `src/integration` — the vendored API layer

A framework-agnostic clone of the platform's API surface (23 endpoint catalogs,
38 service domains, Zod validations) talking to `https://main-api.imetsedu.com`.
Internal `@/*` imports were rewritten to `@integration/*` so it drops in without
alias collisions. It compiles as part of the project (`tsc` passes) and is the
forward target for the DAL.

## Reusable component patterns

- **DataTable** (`components/shared/data-table`) — headless TanStack wrapper with
  sorting, pagination, row selection, loading skeleton and empty state. Consumers
  pass typed columns + data only.
- **RichTextEditor** (`components/shared/rich-text-editor`) — modular Tiptap:
  extensions / toolbar / editor split; controlled `value`/`onChange`.
- **SortableList** (`components/shared/sortable`) — composable dnd-kit list with a
  render-prop drag handle; SSR-safe (defers dnd to the client to avoid hydration
  id mismatches). Powers the dashboard board and the curriculum builder.
- **Course wizard** (`features/courses/components/course-form`) — 3-step RHF+Zod
  form (Basic Info → Structure → SEO & Publish) covering all 44 BA fields:
  bilingual EN/AR, multi-currency pricing, dnd curriculum (modules → lessons),
  SEO with SERP preview, per-step validation.

## Internationalisation

shadcn was initialised with RTL support and a Cairo Arabic font that activates on
`[dir="rtl"]` / `[lang="ar"]`. Every course field has an Arabic counterpart and
RTL inputs throughout.
