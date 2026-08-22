import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import QRCode from "qrcode";

import { dal } from "@/lib/dal";
import { PublicProfile } from "@/features/public/components/public-profile";

export const dynamic = "force-dynamic";

const SITE = "https://imetsedu.com";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const res = await dal.profiles.fetchPublicProfile(username);
  if (!res.ok) return { title: "Profile | IMETS Medical School", robots: { index: false } };
  const p = res.data;
  const title = `${p.name} — ${p.headline || "IMETS Medical School graduate"}`;
  return {
    title,
    description: p.summary || `${p.name}'s verified IMETS Medical School profile — credentials, competencies and learning record.`,
    alternates: { canonical: `${SITE}/profile/${p.username}` },
    openGraph: { title, description: p.summary || undefined, images: p.image ? [{ url: p.image }] : undefined, type: "profile" },
  };
}

/** Public profile — every account gets one at /profile/:username. */
export default async function PublicProfilePage({ params }: { params: Promise<{ locale: string; username: string }> }) {
  const { locale, username } = await params;
  setRequestLocale(locale);
  const res = await dal.profiles.fetchPublicProfile(username);
  if (!res.ok) notFound();
  const profile = res.data;

  // QR → the branded verify page of the most recent certificate (or the profile itself).
  const latest = profile.certificates[0];
  const verifyUrl = latest ? `${SITE}/verify-certificate?code=${encodeURIComponent(latest.code)}` : `${SITE}/profile/${profile.username}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, { margin: 1, width: 360, color: { dark: "#05091E", light: "#FFFFFF" } });

  return <PublicProfile profile={profile} qrDataUrl={qrDataUrl} verifyUrl={verifyUrl} profileUrl={`${SITE}/profile/${profile.username}`} />;
}
