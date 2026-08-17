import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { staticPageMeta } from "@/lib/seo";

/**
 * Privacy policy for Meta platform integrations (WhatsApp Business Platform,
 * Meta Pixel / Conversions API, Facebook & Instagram lead ads). This is the
 * Privacy Policy URL submitted with our Meta app review — content is kept in
 * English and self-contained so Meta's reviewers can crawl it directly.
 */

const LAST_UPDATED = "August 17, 2026";

const SECTIONS: { title: string; paras: string[]; bullets?: string[] }[] = [
  {
    title: "1. Who we are",
    paras: [
      "IMETS Medical School (“IMETS”, “we”, “our”) is an international medical-education provider operating the website imetsedu.com. We offer healthcare-management and healthcare-quality training programs, including CPHQ, CBAHI, GAHAR and CIC preparation.",
      "This policy explains how we collect, use and protect personal data when you interact with us through Meta Platforms products — WhatsApp, Facebook and Instagram — or when our website shares data with Meta's advertising and messaging services. It supplements our general Privacy Policy.",
    ],
  },
  {
    title: "2. Data we collect through Meta products",
    paras: ["Depending on how you interact with us, we may collect:"],
    bullets: [
      "WhatsApp Business Platform — your phone number, WhatsApp profile name, and the content of messages you exchange with us (text, images, documents and voice notes), together with message timestamps and delivery statuses.",
      "Facebook & Instagram lead forms and ads — the information you submit in a lead form (typically name, phone number, email address and the program you are interested in).",
      "Meta Pixel & Conversions API — website events such as page views, form submissions and course-interest actions, along with technical identifiers (IP address, browser information, and Meta cookie identifiers where you have consented to them). This data is used for measurement and to improve the relevance of our advertising.",
    ],
  },
  {
    title: "3. How we use this data",
    paras: ["We use data collected through Meta products to:"],
    bullets: [
      "Answer your questions and provide student support over WhatsApp.",
      "Send you course information, enrollment details, reminders and — only where you have opted in — marketing messages about our programs.",
      "Follow up on inquiries you submit through Facebook or Instagram lead forms.",
      "Measure the performance of our advertising campaigns and improve their relevance.",
      "Maintain records of our conversations so our team can serve you consistently.",
    ],
  },
  {
    title: "4. WhatsApp messaging",
    paras: [
      "We use the WhatsApp Business Platform (Cloud API) provided by Meta to communicate with prospective and current students. Messages you send us are stored securely on our systems so that our advising team can respond to you and keep the context of the conversation.",
      "Marketing messages on WhatsApp are sent using Meta-approved message templates and only to people who have shared their number with us and consented to be contacted. You can opt out at any time by replying “STOP” (or إيقاف) to any message, or by asking our team to remove you — we will stop sending you marketing messages promptly.",
      "WhatsApp conversations are subject to WhatsApp's own terms and privacy policy, available from Meta.",
    ],
  },
  {
    title: "5. Sharing and processors",
    paras: [
      "We do not sell your personal data. We share data only with:",
    ],
    bullets: [
      "Meta Platforms, Inc. and its affiliates — as the provider of WhatsApp, Facebook and Instagram, Meta processes message delivery and advertising events under its own terms and data-processing arrangements.",
      "Service providers that host our infrastructure (cloud hosting, file storage and databases) under confidentiality obligations.",
      "Our staff and authorized advisors, who access conversations and lead details only to provide you with support and enrollment services.",
    ],
  },
  {
    title: "6. Data retention",
    paras: [
      "We keep lead details and message history for as long as needed to provide our services and to comply with legal obligations. If you ask us to delete your data, we will remove your conversation history and contact details from our active systems, except where we are legally required to retain specific records.",
    ],
  },
  {
    title: "7. Security",
    paras: [
      "Data is transmitted over encrypted connections (HTTPS/TLS) and stored on access-controlled systems. WhatsApp messages between you and WhatsApp's servers are protected by WhatsApp's transport security; once delivered to our business systems they are protected by our own safeguards and internal access controls.",
    ],
  },
  {
    title: "8. Your rights",
    paras: [
      "You may request access to, correction of, or deletion of your personal data at any time. You may also withdraw consent to marketing messages at any time without affecting other services we provide to you. To exercise any of these rights, contact us using the details below and we will respond within 30 days.",
    ],
  },
  {
    title: "9. Contact us",
    paras: [
      "For any privacy questions or requests relating to our use of Meta products, contact IMETS Medical School at hello@imetsedu.com, or through the contact page on imetsedu.com.",
    ],
  },
];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return staticPageMeta({
    title: "Meta Products Privacy Policy",
    description:
      "How IMETS Medical School collects, uses and protects personal data through Meta products — WhatsApp Business Platform, Facebook and Instagram ads, and the Meta Pixel.",
    path: "/meta-privacy",
    locale,
  });
}

export default async function MetaPrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div dir="ltr" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-bold tracking-tight">Meta Products Privacy Policy</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        This policy describes how IMETS Medical School handles personal data collected through Meta
        Platforms products — WhatsApp, Facebook and Instagram. It supplements our{" "}
        <Link href="/privacy" className="font-medium text-primary underline underline-offset-2">
          general Privacy Policy
        </Link>
        .
      </p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="font-heading text-lg font-semibold">{s.title}</h2>
            {s.paras.map((p) => (
              <p key={p.slice(0, 40)} className="mt-2 text-base leading-relaxed text-muted-foreground">{p}</p>
            ))}
            {s.bullets && (
              <ul className="mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground">
                {s.bullets.map((b) => <li key={b.slice(0, 40)}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
