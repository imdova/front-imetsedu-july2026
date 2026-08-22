"use client";
/* eslint-disable @next/next/no-img-element -- S3 avatar / certificate / generated QR; design needs plain <img> */

import * as React from "react";
import { toast } from "sonner";

import type { PublicProfile as Profile } from "@/lib/dal/profiles";

const ORG = "IMETS Medical School";
const fmtLong = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
};
const fmtSlash = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())} / ${p(d.getMonth() + 1)} / ${d.getFullYear()}`;
};
const fmtMonthYear = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const I = {
  linkedin: <svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.76-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.3-2-3.3-2 0-2.3 1.57-2.3 3.2V21h-4V9Z" /></svg>,
  wa: <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.2 1.2-1.7 1.2-.5.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.3.3c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1.9 1.9 1.2 2.2 1.4.2.1.4.1.6-.1l.8-1c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.2.1.7-.1 1.3Z" /></svg>,
  copy: <svg viewBox="0 0 24 24"><path d="M9 2h9a2 2 0 0 1 2 2v12h-2V4H9V2Zm-3 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" /></svg>,
  eye: <svg viewBox="0 0 24 24"><path d="M12 5c-5 0-9 4.5-9 7s4 7 9 7 9-4.5 9-7-4-7-9-7Zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm0-6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" /></svg>,
  shield: <svg viewBox="0 0 24 24"><path d="M12 1 3 5v6c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V5l-9-4Zm-1.2 15.3-3.5-3.5 1.4-1.4 2.1 2.1 5-5 1.4 1.4-6.4 6.4Z" /></svg>,
  print: <svg viewBox="0 0 24 24"><path d="M7 3h10v4H7V3Zm-3 6h16a1 1 0 0 1 1 1v6h-4v5H7v-5H3v-6a1 1 0 0 1 1-1Zm5 8h6v3H9v-3Z" /></svg>,
  pin: <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" /></svg>,
  badge: <svg viewBox="0 0 24 24"><path d="M9.6 16.8 5.4 12.6l1.4-1.4 2.8 2.8 7.6-7.6 1.4 1.4z" /></svg>,
  cal: <svg viewBox="0 0 24 24"><path d="M7 2h2v2h6V2h2v2h3v18H4V4h3V2Zm13 8H6v10h14V10Z" /></svg>,
  mail: <svg viewBox="0 0 24 24"><path d="M3 5h18v14H3V5Zm2 2v.5l7 4.5 7-4.5V7H5Z" /></svg>,
  phone: <svg viewBox="0 0 24 24"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2Z" /></svg>,
  web: <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 9h-3a15 15 0 0 0-1.3-5.4A8 8 0 0 1 18.9 11ZM12 4.2c.8 1.2 1.6 3.4 1.8 6.8h-3.6c.2-3.4 1-5.6 1.8-6.8ZM5.1 13h3c.2 2 .6 3.9 1.3 5.4A8 8 0 0 1 5.1 13Zm3-2h-3a8 8 0 0 1 4.3-5.4A15 15 0 0 0 8.1 11Zm2.1 2h3.6c-.2 3.4-1 5.6-1.8 6.8-.8-1.2-1.6-3.4-1.8-6.8Zm5.4 5.4c.7-1.5 1.1-3.4 1.3-5.4h3a8 8 0 0 1-4.3 5.4Z" /></svg>,
};

/** 1:1 port of the "Graduate Profile — IMETS" artifact, rendered from a public profile record. */
export function PublicProfile({ profile: p, qrDataUrl, verifyUrl, profileUrl }: {
  profile: Profile; qrDataUrl: string; verifyUrl: string; profileUrl: string;
}) {
  const [lightbox, setLightbox] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const latest = p.certificates[0] ?? null;
  const isPdf = !!latest?.link && /\.pdf(\?|$)/i.test(latest.link);

  const flash = (m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 1800); };
  const copyLink = () => { navigator.clipboard?.writeText(profileUrl); flash("Profile link copied"); };
  const shareText = `${p.name} — verified ${ORG} graduate profile: ${profileUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`;
  const viewCert = () => { if (!latest?.link) { toast.info("No certificate file yet"); return; } if (isPdf) window.open(latest.link, "_blank", "noopener"); else setLightbox(true); };

  const classOf = latest?.issuedAt ? fmtMonthYear(latest.issuedAt) : p.stats.classYear ? String(p.stats.classYear) : "";
  const stats = [
    { value: String(p.stats.certificates), label: p.stats.certificates === 1 ? "IMETS CREDENTIAL" : "IMETS CREDENTIALS" },
    { value: String(p.stats.programs), label: p.stats.programs === 1 ? "PROGRAM ENROLLED" : "PROGRAMS ENROLLED" },
    ...(p.stats.classYear ? [{ value: String(p.stats.classYear), label: "CLASS YEAR" }] : []),
    { value: `${p.stats.completion}%`, label: "PROGRAM COMPLETED" },
  ];
  const facts = latest ? [
    { label: "PROGRAM", value: latest.program },
    { label: "CERTIFICATE SERIAL", value: latest.code, mono: true },
    { label: "DATE OF ISSUE", value: fmtSlash(latest.issuedAt) || "—" },
    { label: "ISSUER", value: ORG },
    { label: "STATUS", value: latest.status === "issued" ? "Completed & certified" : latest.status },
  ] : [];

  // Career & learning path (derived): current role → each credential → next milestone.
  const path = [
    ...((p.jobTitle || p.specialty) ? [{ when: "CURRENT ROLE", title: p.jobTitle || p.specialty, org: p.location || ORG, note: "Practising healthcare professional.", state: "now" as const }] : []),
    ...p.certificates.map((c) => ({ when: (fmtMonthYear(c.issuedAt) || "ISSUED").toUpperCase(), title: c.program, org: `${ORG} · certificate ${c.code}`, note: "Completed the full program and received a verifiable certificate.", state: "" as const })),
    { when: "NEXT", title: "Next milestone", org: "To be added", note: "New roles, courses and certification progress appear here as they are added.", state: "next" as const },
  ];
  const links = [
    ...(p.links.linkedin ? [{ icon: I.linkedin, label: "LinkedIn", href: p.links.linkedin, value: "profile" }] : []),
    ...(p.links.email ? [{ icon: I.mail, label: "Email", href: `mailto:${p.links.email}`, value: p.links.email }] : []),
    ...(p.links.phone ? [{ icon: I.phone, label: "Phone", href: `tel:${p.links.phone}`, value: p.links.phone }] : []),
    ...(p.links.website ? [{ icon: I.web, label: "Website", href: p.links.website, value: p.links.website.replace(/^https?:\/\//, "") }] : []),
    { icon: I.web, label: ORG, href: "https://imetsedu.com", value: "imetsedu.com" },
  ];

  return (
    <div className="pp" dir="ltr">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- profile-only display fonts */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Montserrat:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .pp{--ink:#05091E;--ink-2:#080F2C;--panel:rgba(255,255,255,.045);--panel-2:rgba(255,255,255,.075);--line:rgba(242,208,138,.20);--line-soft:rgba(255,255,255,.10);
          --text:#EDF1FF;--muted:#A3AECF;--dim:#7C88B0;--gold:#E7B95E;--gold-lt:#F6DCA4;--gold-dp:#9C7222;--verified:#3FD9A4;
          --ring:linear-gradient(150deg,#F6E0B0,#D9A441 45%,#8F6516 78%,#F2D08A);--r:18px;
          position:relative;background:var(--ink);color:var(--text);font-family:Montserrat,"Segoe UI",Arial,sans-serif;line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
        .pp *{box-sizing:border-box;margin:0;padding:0}
        .pp .aura{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(60% 40% at 12% -6%,rgba(42,47,214,.55),transparent 62%),radial-gradient(45% 35% at 92% 4%,rgba(231,185,94,.16),transparent 66%),radial-gradient(70% 55% at 50% 108%,rgba(42,47,214,.22),transparent 70%)}
        .pp .grain{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:.5;background-image:radial-gradient(rgba(255,255,255,.045) 1px,transparent 1px);background-size:3px 3px}
        .pp .shell{position:relative;z-index:1;max-width:1200px;margin:0 auto;padding:0 clamp(16px,3.5vw,40px)}
        .pp .bar{position:sticky;top:0;z-index:20;backdrop-filter:blur(14px);background:linear-gradient(180deg,rgba(5,9,30,.92),rgba(5,9,30,.62));border-bottom:1px solid var(--line-soft)}
        .pp .bar .shell{display:flex;align-items:center;gap:16px;padding-top:12px;padding-bottom:12px}
        .pp .brand{display:flex;align-items:center;gap:12px;min-width:0}
        .pp .brand .mark{width:38px;height:38px;border-radius:10px;background:#1512BB;display:grid;place-items:center;font-weight:800;font-size:13px;color:#F6DCA4}
        .pp .brand b{font-size:13px;letter-spacing:.24em;font-weight:700}
        .pp .brand span{display:block;font-size:10px;letter-spacing:.2em;color:var(--gold);font-weight:600}
        .pp .spacer{flex:1}
        .pp .actions{display:flex;gap:8px;flex-wrap:wrap}
        .pp .btn{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line-soft);background:var(--panel);color:var(--text);font:600 12.5px/1 Montserrat,sans-serif;padding:11px 15px;border-radius:999px;cursor:pointer;text-decoration:none;transition:transform .2s ease,border-color .2s ease,background .2s ease}
        .pp .btn:hover{transform:translateY(-2px);border-color:var(--line);background:var(--panel-2)}
        .pp .btn svg{width:15px;height:15px;fill:currentColor}
        .pp .btn.gold{background:linear-gradient(135deg,var(--gold-lt),var(--gold));color:#241703;border:none}
        .pp .btn.gold:hover{filter:brightness(1.06)}
        .pp header.hero{padding:clamp(34px,6vw,74px) 0 clamp(20px,3vw,34px)}
        .pp .hero-in{display:grid;grid-template-columns:auto 1fr;gap:clamp(22px,4vw,52px);align-items:center}
        .pp .avatar{position:relative;width:clamp(140px,20vw,224px);aspect-ratio:1;border-radius:50%;padding:7px;background:var(--ring);box-shadow:0 26px 60px rgba(0,0,0,.55)}
        .pp .avatar img,.pp .avatar .ph{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;border:4px solid var(--ink-2);background:#0B1B57}
        .pp .avatar .ph{display:grid;place-items:center;font-family:Fraunces,Georgia,serif;font-size:clamp(40px,6vw,72px);color:var(--gold-lt)}
        .pp .vbadge{position:absolute;right:2%;bottom:2%;width:36%;aspect-ratio:1;border-radius:50%;background:linear-gradient(140deg,#0C4D3A,#0A3A2C);border:3px solid var(--ink);display:grid;place-items:center}
        .pp .vbadge svg{width:52%;height:52%;fill:var(--verified)}
        .pp .eyebrow{font-size:11px;letter-spacing:.32em;text-indent:.32em;color:var(--gold);font-weight:700}
        .pp h1{font-family:Fraunces,Georgia,serif;font-weight:600;line-height:1.03;font-size:clamp(32px,5.6vw,62px);margin:10px 0 6px;text-wrap:balance}
        .pp .headline{font-size:clamp(15px,2vw,20px);font-weight:600;color:var(--gold-lt)}
        .pp .meta{display:flex;flex-wrap:wrap;gap:10px;margin-top:16px}
        .pp .chip{display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:600;padding:8px 13px;border-radius:999px;background:var(--panel);border:1px solid var(--line-soft);color:var(--muted)}
        .pp .chip svg{width:13px;height:13px;fill:var(--gold)}
        .pp .chip.ok{color:#BDF3DF;border-color:rgba(63,217,164,.35);background:rgba(63,217,164,.09)}
        .pp .chip.ok svg{fill:var(--verified)}
        .pp .summary{margin-top:18px;max-width:62ch;color:var(--muted);font-size:15px}
        .pp .hero .actions{margin-top:22px}
        .pp .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin:clamp(20px,3vw,30px) 0 clamp(30px,5vw,54px)}
        .pp .stat{background:var(--panel);border:1px solid var(--line-soft);border-radius:var(--r);padding:20px 22px}
        .pp .stat b{display:block;font-family:Fraunces,Georgia,serif;font-size:clamp(26px,3.4vw,36px);font-weight:600;line-height:1;font-variant-numeric:tabular-nums}
        .pp .stat span{display:block;margin-top:9px;font-size:10.5px;letter-spacing:.22em;text-indent:.22em;color:var(--dim);font-weight:600}
        .pp .cols{display:grid;grid-template-columns:1.55fr 1fr;gap:clamp(18px,2.6vw,30px);align-items:start;padding-bottom:clamp(40px,6vw,80px)}
        .pp .card{background:var(--panel);border:1px solid var(--line-soft);border-radius:var(--r);padding:clamp(20px,2.6vw,30px);margin-bottom:clamp(18px,2.6vw,26px)}
        .pp .card.glow{background:linear-gradient(180deg,rgba(231,185,94,.10),rgba(255,255,255,.03));border-color:var(--line)}
        .pp h2{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:clamp(19px,2.4vw,25px);display:flex;align-items:center;gap:11px;margin-bottom:6px}
        .pp h2 .dot{width:8px;height:8px;background:var(--gold);transform:rotate(45deg);flex:0 0 8px}
        .pp .lead{color:var(--dim);font-size:12.5px;margin-bottom:20px}
        .pp .cred{display:grid;grid-template-columns:1.25fr .75fr;gap:22px;align-items:start}
        .pp .certwrap{border:1px solid var(--line);border-radius:12px;overflow:hidden;cursor:zoom-in;background:#0B1B57;position:relative;transition:transform .25s ease;min-height:180px}
        .pp .certwrap:hover{transform:translateY(-3px)}
        .pp .certwrap img{width:100%;display:block}
        .pp .certwrap iframe{width:calc(100% + 4px);height:320px;border:0;background:#fff;pointer-events:none;margin:-2px}
        .pp .certwrap .empty{display:grid;place-items:center;height:180px;color:var(--dim);font-size:12px;letter-spacing:.12em}
        .pp .certwrap .hint{position:absolute;inset:auto 0 0 0;padding:9px 12px;font-size:10.5px;letter-spacing:.16em;font-weight:600;color:#fff;background:linear-gradient(180deg,transparent,rgba(3,6,20,.88))}
        .pp .qrbox{text-align:center}
        .pp .qrbox img{width:100%;max-width:170px;border-radius:12px;background:#fff;padding:9px;display:block;margin:0 auto}
        .pp .qrbox p{font-size:10.5px;color:var(--dim);margin-top:10px;letter-spacing:.12em;font-weight:600}
        .pp .facts{margin-top:22px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px}
        .pp .fact{border-top:1px solid var(--line-soft);padding-top:12px}
        .pp .fact span{display:block;font-size:10px;letter-spacing:.2em;color:var(--dim);font-weight:600}
        .pp .fact b{display:block;margin-top:6px;font-size:14.5px;font-weight:700}
        .pp .fact b.mono{font-family:"Courier New",monospace;letter-spacing:.06em;color:var(--gold-lt)}
        .pp .tl{position:relative;margin-top:6px;padding-left:34px}
        .pp .tl::before{content:"";position:absolute;left:9px;top:8px;bottom:8px;width:2px;background:linear-gradient(180deg,var(--gold),rgba(231,185,94,.15))}
        .pp .ev{position:relative;padding:0 0 26px}
        .pp .ev:last-child{padding-bottom:0}
        .pp .ev::before{content:"";position:absolute;left:-30px;top:5px;width:14px;height:14px;border-radius:50%;background:var(--ink);border:2px solid var(--gold)}
        .pp .ev.now::before{background:var(--gold);box-shadow:0 0 0 5px rgba(231,185,94,.16)}
        .pp .ev.next::before{border-style:dashed;border-color:var(--dim)}
        .pp .ev .when{font-size:10.5px;letter-spacing:.2em;color:var(--gold);font-weight:700}
        .pp .ev h3{font-size:16px;font-weight:700;margin:5px 0 3px}
        .pp .ev .org{font-size:13px;color:var(--muted);font-weight:600}
        .pp .ev p{font-size:13px;color:var(--dim);margin-top:7px;max-width:60ch}
        .pp .ev.next h3,.pp .ev.next .org{color:var(--dim)}
        .pp .tags{display:flex;flex-wrap:wrap;gap:8px}
        .pp .tag{font-size:12px;font-weight:600;padding:8px 12px;border-radius:9px;background:rgba(231,185,94,.10);border:1px solid rgba(231,185,94,.22);color:var(--gold-lt)}
        .pp .prog .row{margin-bottom:16px}.pp .prog .row:last-child{margin-bottom:0}
        .pp .prog .lab{display:flex;justify-content:space-between;align-items:baseline;gap:10px;font-size:12.5px;font-weight:600;margin-bottom:8px}
        .pp .prog .lab i{font-style:normal;color:var(--dim);font-size:11px;font-variant-numeric:tabular-nums}
        .pp .track{height:7px;border-radius:99px;background:rgba(255,255,255,.09);overflow:hidden}
        .pp .fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--gold-dp),var(--gold-lt));transition:width 1.1s cubic-bezier(.2,.7,.3,1)}
        .pp .fill.done{background:linear-gradient(90deg,#0F7E5E,var(--verified))}
        .pp .links{display:grid;gap:9px}
        .pp .link{display:flex;align-items:center;gap:11px;padding:12px 14px;border-radius:12px;background:var(--panel);border:1px solid var(--line-soft);text-decoration:none;color:var(--text);font-size:13px;font-weight:600;transition:transform .2s ease,border-color .2s ease}
        .pp .link:hover{transform:translateX(3px);border-color:var(--line)}
        .pp .link svg{width:16px;height:16px;fill:var(--gold);flex:0 0 16px}
        .pp .link span{color:var(--dim);font-weight:500;margin-left:auto;font-size:11.5px;max-width:55%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .pp footer{border-top:1px solid var(--line-soft);padding:clamp(26px,4vw,44px) 0;color:var(--dim);font-size:12px}
        .pp footer .shell{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between}
        .pp footer b{color:var(--gold-lt);font-weight:700}
        .pp .lb{position:fixed;inset:0;z-index:60;background:rgba(3,5,18,.94);display:grid;place-items:center;padding:24px;cursor:zoom-out}
        .pp .lb img{max-width:min(1200px,96vw);max-height:92vh;border-radius:10px;box-shadow:0 30px 90px rgba(0,0,0,.7)}
        .pp .toast{position:fixed;left:50%;bottom:28px;transform:translate(-50%,0);z-index:70;background:var(--gold-lt);color:#241703;font:700 12.5px Montserrat,sans-serif;padding:11px 18px;border-radius:999px}
        .pp .empty-note{color:var(--dim);font-size:13px}
        @media (max-width:640px){.pp .bar .actions{flex-wrap:nowrap}.pp .bar .btn{padding:9px 11px;font-size:11px;gap:6px}.pp .brand div{display:none}}
        @media (max-width:900px){.pp .cols{grid-template-columns:1fr}.pp .cred{grid-template-columns:1fr}.pp .qrbox img{max-width:150px}.pp .hero-in{grid-template-columns:1fr;text-align:center;justify-items:center}.pp .meta,.pp .hero .actions{justify-content:center}.pp .summary{margin-inline:auto}}
        @media print{.pp .bar,.pp .actions,.pp .lb,.pp .toast,.pp .aura,.pp .grain{display:none!important}.pp{background:#fff;color:#111}.pp .card,.pp .stat{border:1px solid #ccc;background:#fff;break-inside:avoid}.pp h1,.pp .stat b,.pp h2{color:#0B1B57}.pp .tag{background:#f3f3f3;color:#5a4413;border-color:#ddd}.pp .cols{grid-template-columns:1fr}}
      `}</style>

      <div className="aura" /><div className="grain" />

      {/* top bar */}
      <div className="bar">
        <div className="shell">
          <div className="brand">
            <span className="mark">IM</span>
            <div><b>IMETS</b><span>MEDICAL SCHOOL</span></div>
          </div>
          <div className="spacer" />
          <div className="actions">
            <a className="btn" href={liHref} target="_blank" rel="noopener noreferrer">{I.linkedin}LinkedIn</a>
            <a className="btn" href={waHref} target="_blank" rel="noopener noreferrer">{I.wa}WhatsApp</a>
            <button className="btn gold" type="button" onClick={copyLink}>{I.copy}Copy link</button>
          </div>
        </div>
      </div>

      {/* hero */}
      <header className="hero">
        <div className="shell hero-in">
          <div className="avatar">
            {p.image ? <img src={p.image} alt={p.name} /> : <div className="ph">{p.name.trim().charAt(0).toUpperCase()}</div>}
            {p.verified && <div className="vbadge" title="Verified graduate">{I.badge}</div>}
          </div>
          <div>
            <p className="eyebrow">{p.verified ? "VERIFIED GRADUATE PROFILE" : "IMETS MEMBER PROFILE"}</p>
            <h1>{p.name}</h1>
            {p.headline && <p className="headline">{p.headline}</p>}
            <div className="meta">
              {p.location && <span className="chip">{I.pin}{p.location}</span>}
              {p.verified && <span className="chip ok">{I.badge}Verified by IMETS</span>}
              {classOf && <span className="chip">{I.cal}Class of {classOf}</span>}
            </div>
            {p.summary && <p className="summary">{p.summary}</p>}
            <div className="actions">
              {latest && <button className="btn gold" type="button" onClick={viewCert}>{I.eye}View certificate</button>}
              {latest && <a className="btn" href={verifyUrl} target="_blank" rel="noopener noreferrer">{I.shield}Verify credential</a>}
              <button className="btn" type="button" onClick={() => window.print()}>{I.print}Save as PDF</button>
            </div>
          </div>
        </div>
      </header>

      <div className="shell">
        <div className="stats">
          {stats.map((s) => <div className="stat" key={s.label}><b>{s.value}</b><span>{s.label}</span></div>)}
        </div>
      </div>

      <div className="shell cols">
        <div>
          <section className="card glow">
            <h2><i className="dot" />Credential</h2>
            <p className="lead">{latest ? `Awarded by ${ORG} and verifiable by serial number or QR scan.` : `Credentials issued by ${ORG} will appear here once awarded.`}</p>
            {latest ? (
              <>
                <div className="cred">
                  <div className="certwrap" onClick={viewCert} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && viewCert()}>
                    {latest.link
                      ? (isPdf
                        ? <iframe src={`${latest.link}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} title="Certificate" loading="lazy" />
                        : <img src={latest.link} alt="Certificate" />)
                      : <div className="empty">CERTIFICATE FILE PENDING</div>}
                    <div className="hint">{isPdf ? "CLICK TO OPEN" : "CLICK TO ENLARGE"}</div>
                  </div>
                  <div className="qrbox">
                    <img src={qrDataUrl} alt="Verification QR code" />
                    <p>SCAN TO VERIFY</p>
                  </div>
                </div>
                <div className="facts">
                  {facts.map((f) => <div className="fact" key={f.label}><span>{f.label}</span><b className={f.mono ? "mono" : ""}>{f.value}</b></div>)}
                </div>
              </>
            ) : (
              <p className="empty-note">No certificate has been issued to this profile yet.</p>
            )}
          </section>

          <section className="card">
            <h2><i className="dot" />Career &amp; learning path</h2>
            <p className="lead">Professional background and credential milestones.</p>
            <div className="tl">
              {path.map((e, i) => (
                <div className={`ev ${e.state}`} key={i}>
                  <div className="when">{e.when}</div>
                  <h3>{e.title}</h3>
                  <div className="org">{e.org}</div>
                  {e.note && <p>{e.note}</p>}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <section className="card">
            <h2><i className="dot" />Competencies</h2>
            <p className="lead">Areas covered by the curriculum and professional practice.</p>
            {p.skills.length ? <div className="tags">{p.skills.map((s) => <span className="tag" key={s}>{s}</span>)}</div> : <p className="empty-note">No competencies listed yet.</p>}
          </section>

          <section className="card">
            <h2><i className="dot" />Learning progress</h2>
            <p className="lead">Study record at {ORG}.</p>
            {p.progress.length ? (
              <div className="prog">
                {p.progress.map((r) => (
                  <div className="row" key={r.label}>
                    <div className="lab"><span>{r.label}</span><i>{r.note}</i></div>
                    <div className="track"><div className={`fill ${r.pct >= 100 ? "done" : ""}`} style={{ width: `${r.pct}%` }} /></div>
                  </div>
                ))}
              </div>
            ) : <p className="empty-note">No enrolments on record yet.</p>}
          </section>

          <section className="card">
            <h2><i className="dot" />Contact</h2>
            <p className="lead">How employers can get in touch.</p>
            <div className="links">
              {links.map((l) => (
                <a className="link" key={l.label + l.href} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                  {l.icon}{l.label}<span>{l.value}</span>
                </a>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <footer>
        <div className="shell">
          <div>Issued by <b>{ORG}</b> — credentials are verifiable by serial number.</div>
          <div>{latest ? `${latest.code} · ${fmtLong(latest.issuedAt)}` : `imetsedu.com/profile/${p.username}`}</div>
        </div>
      </footer>

      {lightbox && latest?.link && !isPdf && (
        <div className="lb" onClick={() => setLightbox(false)}><img src={latest.link} alt="Certificate full view" /></div>
      )}
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </div>
  );
}
