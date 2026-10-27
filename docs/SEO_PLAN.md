# SEO plan — working notes

Running record of the P1/P2 SEO work: what changed, what the evidence was, and
what is deliberately left as it is.

---

## P2-01 — Caching the public site

### The problem

Every marketing page was served with
`Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`, and
the build marked `/`, `/courses`, `/courses/[slug]`, `/blog/[slug]`, `/about`,
`/careers` and `/instructors` as `ƒ` (rendered on demand). Each visit —
including each crawl — re-rendered the page and re-hit the backend.

Nothing on those pages actually needed the request. Three separate causes, none
of them a dynamic-data requirement:

1. **No `generateStaticParams`.** A dynamic route with no param list is built on
   demand, and on-demand pages get `no-store`. This was the whole reason the
   course and article pages were dynamic. Proven by experiment before the fix: a
   temporary `export const dynamic = "error"` on the course page **built
   successfully** as `○ Static` and served `s-maxage`, so no part of it was
   reading request state.
2. **A GET that wrote.** `GET /blog/:slug` incremented `views`, so the frontend
   had to fetch articles with `revalidate: false` to keep the counter moving.
   The counter, not the content, was forcing every article page to be dynamic.
3. **A public endpoint fetched with a token.** `GET /instructors` is `@Public()`
   on the backend, but the client sent a bearer token anyway — which means
   reading the session cookie, which makes the route dynamic. The faculty strip
   renders on the home page and `/about`, which is why `/about` was dynamic
   despite having no data of its own.

### The changes

| Area | Change |
|---|---|
| `courses/[slug]`, `blog/[slug]`, `blog/category/[slug]`, `careers/[slug]`, `instructors/[id]` | `generateStaticParams` over the published records |
| `POST /blog/:slug/view` (new) | View counting split out of the article GET; fired from `<ArticleViewCounter>` in the browser |
| `getPublicBySlug` | `revalidate: false` → `86400` + tags `["blog", "blog:<slug>"]` |
| `instructorService.getAll/getById` | `{ public: true }` option → no token, cached 3600, tag `instructors` |
| All public routes | An explicit `revalidate` per family (below) |
| `api-client.ts` | New `tags` option → `next.tags` on public GETs |
| `/api/revalidate` | Clears cache **tags** as well as paths; new `job`, `review`, `marketing` scopes; accepts caller-supplied `tags` for a single record |
| Backend | `blog`, `marketing`, `career-hub`, `site-setting` and `seo` services now ping `/api/revalidate` on save, as `courses` already did |

### Revalidate windows

| Family | Route `revalidate` |
|---|---|
| Home, course/article/category listings | 600 |
| Course pages, country pages, comparisons, evergreen marketing, faculty | 3600 |
| Articles | 86400 |
| Jobs | 900 |

**The route export is an upper bound, not the effective window.** A page's
effective window is the shortest-lived fetch anywhere in its tree, and the
public shell reads site settings, SEO overrides and the course/blog taxonomy on
every page. Those sit at 300–900 s, so the build reports **5m** for the whole
marketing tree. That is the floor, and it is fine: the TTL is only the fallback
now that every admin save clears the matching tag, so content appears on the
next request rather than when a timer runs out.

### Evidence

Build markers after the change — every marketing route is `●` (SSG):

```
● /[locale]                       ● /[locale]/courses/[slug]
● /[locale]/about                 ● /[locale]/blog/[slug]
● /[locale]/courses               ● /[locale]/blog/category/[slug]
● /[locale]/blog                  ● /[locale]/category/[slug]
● /[locale]/instructors           ● /[locale]/careers/[slug]
● /[locale]/instructors/[id]      ● /[locale]/cphq-course/[country]
```

`curl -I` against a production build of the same commit (two passes each):

| Path | Status | `x-nextjs-cache` | `Cache-Control` |
|---|---|---|---|
| `/courses/cphq-preparation` | 200 | HIT / HIT | `s-maxage=300, stale-while-revalidate=31535700` |
| `/blog/cphq-exam-study-plan` | 200 | HIT / HIT | same |
| `/cphq-course/saudi-arabia` | 200 | HIT / HIT | same |
| `/`, `/courses`, `/blog`, `/about` | 200 | HIT / HIT | same |
| `/careers` | 200 | — | `private, no-cache, no-store, …` |

No `no-store` on any of the acceptance URLs, and the second request is a cache
hit.

### Still dynamic, on purpose

- **`/careers`** — filters come from `searchParams`, so each filter combination
  is its own response. The individual postings are cached; the filtered index is
  not worth prerendering a combinatorial set for.
- **`/graduates/*`** — `export const dynamic = "force-dynamic"`, set when the
  cohort galleries were built.
- **`/checkout`, `/pay/*`, `/verify-certificate`, `/profile/[username]`** —
  per-visitor or per-transaction.
- **`/free-courses/[slug]`** — reads quiz detail through an authenticated
  endpoint. Making it public is a backend change and its own task.

### Personalisation vs. cached HTML

One cached document is served to every country, which is only safe because
nothing country-specific is rendered on the server:

- **Prices.** `CoursePrice` is a client component. It calls `/api/geo` (which
  stays dynamic) and swaps the currency after hydration. The cached HTML carries
  the default price, and the visitor's currency is applied in the browser.
- **Locale.** `en` and `ar` are separate URLs and separate prerendered
  documents, not one document that varies by `Accept-Language`.

If anything country- or user-specific ever needs to be rendered server-side on
these pages, it has to go in a client component or a route that opts out — not
into the cached document.

### Scheduled banners

`findActiveBanners` filters on `new Date()`, so a banner scheduled to start or
end at a given time now appears or disappears up to 15 minutes late (its fetch
TTL), rather than within a minute as before. Publishing or editing a banner
clears the `marketing` tag and takes effect at once; only the unattended
schedule boundary drifts. If precise scheduling matters later, the fix is a
cron on the backend that pings `/api/revalidate` at the boundary, not a shorter
TTL for every page on the site.

### nginx

nginx passes Next's `Cache-Control` through unmodified. Evidence: before this
work, production served different values on different routes — `no-store` on
`/courses/cphq-preparation` and `s-maxage=60, stale-while-revalidate` on
`/cphq-course/saudi-arabia` — which an `add_header`/`proxy_hide_header` override
would have flattened to one value. No change needed; `docs/nginx-seo.conf`
deliberately sets no `Cache-Control`.

### Deploy order

**Backend first, then frontend.** The frontend now posts to
`POST /blog/:slug/view`, which does not exist on the old backend. Deploying the
frontend first means article views stop being counted (the POST 404s and is
ignored silently) until the backend follows — no user-visible breakage, but a
gap in the numbers.

---

## P2-02 — Payload diet

### Before

Measured on production (the P2-01 build), uncompressed HTML and the inline
`self.__next_f` flight payload that hydrates it:

| Page | HTML | gzip | Flight | Flight share |
|---|---:|---:|---:|---:|
| `/` | 799 KB | 137 KB | 532 KB | 67% |
| `/courses` | 1,014 KB | 207 KB | 839 KB | 83% |
| `/blog` | 944 KB | 192 KB | 712 KB | 75% |
| `/courses/cphq-preparation` | 700 KB | 138 KB | 444 KB | 63% |
| `/ar` | 873 KB | 148 KB | 595 KB | 68% |
| `/ar/courses` | 1,071 KB | 215 KB | 892 KB | 83% |
| `/ar/blog` | 997 KB | 200 KB | 763 KB | 77% |
| `/ar/courses/cphq-preparation` | 749 KB | 147 KB | 494 KB | 66% |

### What was in the payload

Reading the largest flight chunks, four things accounted for most of it:

1. **The whole message dictionary, on every page — 179 KB.** The locale layout's
   `NextIntlClientProvider` serialised every namespace, including the ~50 KB
   `Admin` one, into every public page. Only the *current* locale was shipped, so
   "don't ship both dictionaries" was already true; the problem was that the one it
   shipped was entirely unscoped.
2. **`/courses`: 610 KB in one prop.** `CourseCatalog` is a client component (it
   filters and searches in the browser) and received the full `CourseRow` for every
   course — description, curriculum, FAQs, reviews — plus every instructor and 40
   whole articles for the search dropdown.
3. **`CourseCard`: ~20 KB per card, on home, course, category and instructor pages.**
   A client component (the price swaps by visitor country) handed a whole
   `CourseRow` and the full instructor list to render a dozen fields.
4. **`/blog`: 500 KB.** Sixty whole articles — rendered body, every section and
   block — passed to a client explorer that shows a headline and an excerpt.

### What changed

| Change | Where |
|---|---|
| Message scopes: the root ships `Common`; each area ships its own. Public ships `Common`, `Marketing`, `Nav`, and within those **only the keys client code names** (208 of 620 in `Marketing`). Signed-in areas keep the full catalogue. | `src/i18n/{scopes.json,scopes.ts,intl-scope.tsx,public-message-keys.json}`, area layouts |
| `scripts/gen-public-message-keys.mjs` builds the key list from the code and runs in `prebuild`. `check:i18n` fails if client code reads a namespace its area doesn't ship, if the list is stale, or if a key is built by concatenation. | `scripts/`, `package.json` |
| `CourseCard` takes `CourseCardData` (~15 fields, instructor resolved on the server). `CatalogCourse` adds precomputed filter **facets** and a short search text. | `features/marketing/lib/course-card-data.ts` |
| Full course search text (descriptions, curriculum) moves to **`/api/course-search-index`**, fetched the first time the search box is focused. Nothing becomes unsearchable. | `app/api/course-search-index`, `hooks/use-lazy-json.ts` |
| `/blog` paginated at **12**, as `/blog` and `/blog/page/N` — plain `<a>` links, `rel=prev/next`, **self-canonical per page**, unique title and description, `/blog/page/1` → 308 to `/blog`. | `features/blog/components/blog-listing-page.tsx`, `blog/page/[page]` |
| Blog search, tag/category filters and "most viewed" sort read **`/api/blog-index`** (slim cards for all 48 articles, 28 KB), fetched on first use. The catalog's article suggestions use the same index instead of 40 articles in the page. | `app/api/blog-index`, `blog-explorer-live.tsx` |
| Card icons drawn from a **shared sprite**: a ~450-byte inline SVG becomes a ~100-byte `<use>`. A card goes from 10.7 KB to 7.3 KB of markup, drawn identically. | `components/shared/card-icon{s,-sprite}.tsx`, `.ico` in `globals.css` |
| `audit-seo.mjs` gains an HTML-weight check (≤ 250 KB uncompressed): an error for the four pages in scope, a warning elsewhere. | `scripts/audit-seo.mjs` |

### After

Local production build of the same commit against the same live API:

| Page | HTML | gzip | Flight | vs before | ≤ 250 KB |
|---|---:|---:|---:|---:|:-:|
| `/` | 448 KB | 58 KB | 203 KB | −44% | ✗ |
| `/courses` | **232 KB** | 35 KB | 85 KB | −77% | ✓ |
| `/blog` | **162 KB** | 26 KB | 64 KB | −83% | ✓ |
| `/blog/page/2` | 167 KB | 26 KB | 65 KB | — | ✓ |
| `/courses/cphq-preparation` | 449 KB | 72 KB | 202 KB | −36% | ✗ |
| `/ar` | 475 KB | 64 KB | 219 KB | −46% | ✗ |
| `/ar/courses` | **243 KB** | 38 KB | 91 KB | −77% | ✓ |
| `/ar/blog` | **168 KB** | 28 KB | 69 KB | −83% | ✓ |
| `/ar/courses/cphq-preparation` | 450 KB | 75 KB | 206 KB | −40% | ✗ |

Message dictionary shipped: **179 KB → 13.7 KB** (`/`) and 17.5 KB (`/ar`).

Across all 157 URLs in the sitemap: total HTML **60.4 MB → 29.7 MB**, median page
**340 KB → 175 KB**, pages over 250 KB **156 → 22**.

### Where the target was not met, and why

**Under 200 KB:** only `/blog` and `/ar/blog`. `/courses` and `/ar/courses` pass the
250 KB gate but not 200 KB.

**≤ 250 KB: `/` and `/courses/cphq-preparation` (and their `/ar` twins) do not pass,
and cannot without changing what the pages contain.** Their remaining weight is the
page itself, not waste:

- Next sends a server-rendered tree twice — once as HTML, once as flight so the client
  can hydrate and navigate. Home is ~245 KB of rendered markup and ~200 KB of flight
  that mirrors it. Nothing left in the payload is a prop to slim; the largest remaining
  flight chunk is ~5 KB.
- Class strings are about 40% of both halves. Replacing every repeated long class
  string with a short named class would save an estimated ~105 KB on home and ~85 KB on
  the course page — still ~340 KB and ~360 KB — for a large, risky CSS refactor.
- Turning static sections into client components would shrink the flight but trade it
  for JavaScript, which contradicts the task's own direction (static → server).

Real transfer cost is small: **58 KB and 72 KB gzipped** for home and the course page,
down from 137 KB each. The options are a revised budget for these two content-heavy
pages (about 450 KB uncompressed, under 80 KB gzipped), or trimming content: fewer
cards or sections on home, a shorter curriculum or fewer sections on the course page.

### Trade-offs

- **Search recall is unchanged but arrives late.** The page carries a short search
  text per course (title, headline, category, tags, instructors). Descriptions and
  curriculum become searchable once `/api/course-search-index` has loaded — about
  48 KB, on first focus of the search box. Before it arrives, matching is on the
  short text only.
- **Blog sort and filters need one fetch.** They filter the current page instantly and
  widen to all 48 articles when `/api/blog-index` lands.
- **The key list must stay fresh.** It is regenerated by `prebuild`, so a deploy cannot
  ship a stale one; `npm run check:i18n` runs the same check without building.
- **A bug the new check found:** `become-form.tsx` asked for `Common.sending`, which
  did not exist in either language, so the submit button would have shown a raw key
  while sending. Added in both languages.

### Visual regression

Full-page screenshots at 1440 px and 390 px wide, production before and this build
after, with transitions frozen and fonts and images settled so a capture is
repeatable — production against itself differs by **0.00%** on every page. Pixel diff,
tolerating ±2 px of shift:

| Page | Desktop | Mobile |
|---|---:|---:|
| `/` | 0.00% | 0.00% |
| `/courses` | 0.00% | 0.00% |
| `/courses/cphq-preparation` | 2.4% \* | 0.00% |
| `/blog` | by design † | by design † |

\* The course page differs from production by 2.4% on desktop **with the previous
commit built locally too** (2.6%), and by 0.01% between the previous commit and this
one. It is an offset in the career-roadmap section that comes from local-versus-
production rendering, not from this change: every heading and roadmap row sits at
identical coordinates and the page is the same height.

† `/blog` now shows 12 articles instead of 48; the first 12 and the surrounding page
match. Home differs from the previous commit by under 1%, entirely two article cover
images caught in different load states.

## P2-03 — Images

### Before (production, 1440 px viewport, DPR 1)

Measured in Chrome over the DevTools protocol (`img-audit`: every `<img>`, natural vs
rendered width, response format and bytes). Lighthouse is not installed on this machine,
so the two Lighthouse findings are measured by what they test: *Properly size images* =
natural width more than 2× rendered; *Serve images in next-gen formats* = JPEG/PNG
responses.

| Page | Images | Raw `<img>` | Oversized (>2×) | Not WebP/AVIF | Image KB |
|---|---:|---:|---:|---:|---:|
| `/` | 52 | 16 | 16 | 14 | 10,115 |
| `/courses` | 15 | 5 | 5 | 3 | 1,218 |
| `/blog` | 14 | 14 | 14 | 12 | **32,090** |
| `/courses/cphq-preparation` | 10 | 6 | 5 | 3 | 1,164 |
| `/graduates` | 28 | 28 | 28 | 26 | 13,927 |
| `/free-courses` | 25 | 25 | 21 | 5 | 655 |
| `/blog/<article>` | 6 | 5 | 5 | 3 | 1,130 |

The cause was not the image optimizer being off — course cards already used `next/image`.
It was raw `<img>` tags (logos, graduate faces, mega-menu thumbnails, blog covers, review
screenshots, the YouTube poster as a CSS background) pointing at multi-megabyte S3
originals: a 3,072 px graduate photo shown at 36 px, a 6 MB PNG blog cover shown at 297 px.

### What changed

- **`src/lib/image-hosts.ts`** — one allow-list, read by both `next.config.ts` and the
  browser. `IMAGE_HOST` (or `NEXT_PUBLIC_IMAGE_HOST`) names the media host; it defaults to
  `imets-medical.s3.us-east-1.amazonaws.com`. Putting a CDN in front of S3 is: set
  `IMAGE_HOST=cdn.imetsedu.com`, rebuild. Nothing else names the bucket.
- **`next.config.ts`** — `formats: ["image/avif", "image/webp"]`, a 7-day
  `minimumCacheTTL` (uploads are keyed by name, never replaced), and `remotePatterns`
  generated from the allow-list. **The previous `**.amazonaws.com` wildcard is gone**: it
  let anyone use our optimizer as a proxy for any AWS-hosted file.
- **`SmartImage`** (`src/components/shared/smart-image.tsx`) — `next/image` for allow-listed
  hosts; a plain, lazy, sized `<img>` for a URL an admin pasted from elsewhere (which
  `next/image` would throw on). If the optimizer itself fails for an image, it falls back
  to the original file rather than showing a broken image.
- **~25 components switched over**, each with a `sizes` that describes its real CSS width
  (blog cards `300px` beside the sidebar, mega-menu thumbs `300px`, avatars `36/56/96px`,
  article body `768px`, …) so the browser picks the smallest candidate.
- **Priority** (`loading="eager"` + `fetchPriority="high"`, the Next 16 replacement for the
  deprecated `priority` prop): header logo, the home hero poster, the course page's
  preview/enroll image, the blog article cover. Everything else is lazy. A below-the-fold
  image that was marked `priority` (it preloaded 1,152 px on every home visit) lost it.
- The YouTube facade poster was a CSS `background-image` of a 480 px original, invisible to
  the optimizer; it is now an image.
- **Country pages have no images** (they are text and a form), so there is nothing to
  prioritise there.

### After (local production build against the live API, 1440 px)

| Page | Images | Raw `<img>` | Oversized (>2×) | Image KB |
|---|---:|---:|---:|---:|
| `/` | 53 | 1 † | **0** | 650 |
| `/courses` | 15 | 0 | 0 | 200 |
| `/blog` | 14 | 0 | 0 | 87 |
| `/courses/cphq-preparation` | 11 | 0 | 0 | 158 |
| `/graduates` | 28 | 0 | 0 | 108 |
| `/free-courses` | 25 | 0 | 0 | 377 |
| `/blog/<article>` | 6 | 0 | 0 | 76 |

Every image that loaded is AVIF. `audit-seo` over all 157 sitemap URLs: **0 raw `<img>`**.
† A flag/avatar whose optimizer request timed out on this machine and fell back to the
original; see below.

### Caveats

- **Lighthouse was not run.** The proxy above measures the two named findings directly,
  but run Lighthouse on production after deploy to confirm.
- **First request after every deploy is slow.** The optimizer cache lives in
  `.next/cache/images`, and the deploy's `rm -rf .next` empties it. AVIF costs more CPU to
  encode than WebP; on a 3.8 GB VPS shared with the backend, expect the first visits to
  warm the cache. `minimumCacheTTL` stops it re-encoding afterwards.
- **The optimizer gives up on an upstream download after ~7 s.** Several blog covers are
  6 MB, 2816×1536 PNGs; from this machine they take 5–8 s to fetch and some failed. From
  the VPS the same files download in **1.2 s**, so this should not occur in production —
  and `SmartImage` falls back to the original if it does. The real fix is to re-export those
  covers as JPEG/WebP at 1600 px when they are next edited.
- Logo `width`/`height` are a 3:1 hint (the file's real ratio takes over via `w-auto`).

## P2-04 — Title templates

### What was wrong

The root layout appended ` · IMETS Medical School` (23 characters) to every title that did
not already name the school. On a blog post whose `seoTitle` was a sensible 45 characters
that made 70, so Google cut the tail — the brand — and on longer ones, the keyword.

**The CMS field and the backfill already existed**: all 48 posts have a `seoTitle`, all ≤ 60
characters. What was missing was rendering it as the whole title, and validating it.

### What changed

| Area | Change |
|---|---|
| Blog posts | `title: { absolute: seoTitle || title }` — no suffix. H1 and JSON-LD keep the full headline. |
| CMS | `seoTitle` is `@MaxLength(60)` in the API; the article builder stops at 60, shows a red counter and warns when no meta title is set and the headline itself exceeds 60. |
| Jobs | `{Role} — {City} \| IMETS Careers`. Employer and country leave the title; they stay in the H1 line and the JobPosting JSON-LD. A long role is cut at a word with `…`; the city and brand are kept. |
| Static pages | Layout template is `%s \| IMETS` (8 characters, not 23) and no longer depends on the admin-editable site name. Graduates, policy, profile, 404, success stories, course fallbacks, and the OG titles of category and instructor pages all use ` \| IMETS`. |
| Over-length | The UAE infection-control country-page title was 62 → 56; `/lp/partnership` was 72 → 57. |
| Course admin | The SEO panel's counter used the old 23-character suffix and counted it on titles that are already absolute; it now uses the new one. |
| Tests | `scripts/titles.test.mjs` (`npm run test:titles`, also run by `prebuild`) fails if any country, compare or bundled course title exceeds 60. `TITLES_LIVE=1` also checks every blog post and course in the CMS. The SEO audit now treats an over-length title on blog, course, compare and country pages as an **error**. |

### Blog title table

The 48 current `seoTitle`s are the proposal — see the approval table in the thread. None
exceeds 60 characters, and each opens with its subject (CPHQ, CBAHI, GAHAR, CIC, …) well inside the first 50.

## Found while verifying: raw i18n keys in the header (a P2-02 regression)

The Resources menu in the public header rendered **`Nav.navFreeExamDesc`**,
`Nav.navBlogDesc`, `Nav.navReviewsDesc`, `Nav.navVerifyDesc` and `Nav.navHelpDesc` as its
descriptions, on every public page in both languages, since P2-02 shipped. The key
generator (`gen-public-message-keys.mjs`) only recognised prefix templates
(`` `spec${n}` ``); the header builds `` `${item.titleKey}Desc` ``. The menu is closed on
load, so the screenshot comparison never showed it. The generator now handles suffix
templates, and `npm run check:raw-keys [base-url]` sweeps 36 pages for any raw key in the
served HTML (exits 1 if it finds one).
