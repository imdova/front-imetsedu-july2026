import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Placeholder testimonial identities that were once bundled in the course page
 * template and rendered to the public as real student feedback. They have been
 * removed; this rule makes their return a build failure rather than something
 * discovered on a live page. Reviews may only come from the course record
 * (admin form → Media & Reviews) with `consentToPublish` set.
 */
const FABRICATED_REVIEWERS = [
  "Mariam Al-Fahad",
  "Ahmed Mansour",
  "Layla Hassan",
  "Khaled Al-Otaibi",
  "Nour El-Din",
  "Sara Ibrahim",
  "مريم الفهد",
  "أحمد منصور",
  "ليلى حسن",
  "خالد العتيبي",
  "نور الدين",
  "سارة إبراهيم",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    /**
     * Scoped to the course-detail surface, which has been cleaned.
     *
     * AUDIT (not yet fixed — these are marketing/landing surfaces, decide before
     * removing, they carry live ad traffic):
     *   • features/marketing/components/student-review-cards.tsx — 5 invented
     *     named reviews with stock Unsplash portraits, used by /lp/mix/cphq,
     *     /lp/mix/cphq2 and /arab/mix/cphq alongside a hardcoded
     *     "96% recommend · 52 reviews".
     *   • features/marketing/components/healthcare-faculty-section.tsx — invented
     *     faculty with stock portraits and placeholder linkedin.com links.
     *   • features/marketing/components/alumni-section.tsx — 6 invented alumni.
     * Widen `files` below once those are resolved.
     */
    files: [
      "src/features/marketing/lib/course-content.ts",
      "src/features/marketing/components/course-*.{ts,tsx}",
      "src/app/**/courses/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        ...FABRICATED_REVIEWERS.map((name) => ({
          selector: `Literal[value=/${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/]`,
          message:
            `"${name}" is a placeholder testimonial that was published as real student feedback. ` +
            "Reviews must come from the course record (admin form → Media & Reviews) with consent recorded.",
        })),
        {
          // Catches a reintroduced hardcoded review wall even under new names.
          selector:
            "VariableDeclarator[id.name=/^(defaultReviews|sampleReviews|fallbackReviews|placeholderReviews)$/]",
          message:
            "Hardcoded review walls are not allowed. Render reviews from `course.textReviews` (consented) or render nothing.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
