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
