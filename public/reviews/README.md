# Student review screenshots

## Default (current setup)

The `/ar/cph` gallery shows a single composite "reviews board" image:

```
public/reviews/reviews-board.png
```

Save the Facebook reviews screenshot there (PNG/JPG/WebP — if you use a
different extension, update `REVIEW_SHOTS` in
`src/app/[locale]/(public)/cph/page.tsx`). It renders full-width with a
click-to-zoom lightbox. Until the file exists it's hidden automatically.

## Switching to individual screenshots later

List them in `REVIEW_SHOTS` (one `{ src, alt }` per file), e.g.
`review-01.jpg … review-12.jpg`. With more than one entry the gallery switches
to a masonry grid. Any missing file is hidden automatically.
