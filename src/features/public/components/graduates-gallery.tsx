/* eslint-disable @next/next/no-img-element -- S3-hosted graduate photos; design needs plain <img> inside the gold halo */
import type { GraduateCohort } from "@/lib/dal/graduates";
import { SITE_LOGO } from "@/lib/seo";

const fmtIssued = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())} / ${p(d.getMonth() + 1)} / ${d.getFullYear()}`;
};

/**
 * Graduation gallery — a 1:1 port of the "Class of 2026" artifact design,
 * rendered from a cohort record. Self-contained styling (scoped class names).
 */
export function GraduatesGallery({ cohort }: { cohort: GraduateCohort }) {
  const issued = fmtIssued(cohort.issuedAt);
  return (
    <div className="gg" dir="ltr">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- gallery-only display fonts, intentionally scoped to this page */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Montserrat:wght@400;500;600;700;800&display=swap" />
      <style>{`
        .gg{--ink:#04091F;--deep:#0A1747;--royal:#141FA0;--gold:#D9A441;--gold-lt:#F2D08A;--paper:#FFFFFF;--muted:#AEB8DC;
          --ring:linear-gradient(150deg,#F6E0B0,#D9A441 45%,#8F6516 78%,#F2D08A);
          background:var(--ink);color:var(--paper);font-family:Montserrat,"Segoe UI",Arial,sans-serif;-webkit-font-smoothing:antialiased}
        .gg *{box-sizing:border-box;margin:0;padding:0}
        .gg .sky{position:relative;overflow:hidden;text-align:center;padding:clamp(48px,7vw,96px) 24px clamp(40px,5vw,68px);
          background:radial-gradient(60% 55% at 50% 0%,rgba(242,208,138,.18),rgba(0,0,0,0) 68%),
          radial-gradient(130% 100% at 50% -18%,#2A2FD6 0%,var(--royal) 30%,#0B1B57 58%,var(--ink) 100%)}
        .gg .arc{position:absolute;opacity:.42;stroke:var(--gold);fill:none;pointer-events:none}
        .gg .logo{width:clamp(84px,10vw,128px);height:auto;display:block;margin:0 auto 14px}
        .gg .school{font-size:clamp(11px,1.5vw,14px);letter-spacing:.46em;text-indent:.46em;color:var(--gold-lt);font-weight:600}
        .gg h1{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;font-size:clamp(38px,7.2vw,88px);line-height:1.02;margin:18px 0 6px;text-wrap:balance}
        .gg h1 em{font-style:normal;color:var(--gold-lt)}
        .gg .kicker{font-size:clamp(11px,1.6vw,15px);letter-spacing:.28em;text-indent:.28em;color:var(--muted);font-weight:500}
        .gg .rule{display:flex;align-items:center;justify-content:center;gap:16px;margin:26px 0 22px}
        .gg .rule i{height:1px;width:min(28vw,220px);background:linear-gradient(90deg,transparent,var(--gold))}
        .gg .rule i+i{background:linear-gradient(90deg,var(--gold),transparent)}
        .gg .dia{width:9px;height:9px;background:var(--gold-lt);transform:rotate(45deg)}
        .gg .facts{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(18px,4vw,54px);margin-top:6px}
        .gg .fact b{display:block;font-size:clamp(28px,4.4vw,44px);font-weight:800;line-height:1}
        .gg .fact span{display:block;margin-top:8px;font-size:11px;letter-spacing:.24em;text-indent:.24em;color:var(--muted)}
        .gg main{padding:clamp(40px,6vw,84px) clamp(16px,4vw,56px) 20px;max-width:1360px;margin:0 auto}
        .gg .roll{list-style:none;display:grid;gap:clamp(26px,3.4vw,46px) clamp(14px,2.4vw,30px);grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}
        .gg .grad{text-align:center;animation:ggrise .6s cubic-bezier(.2,.7,.3,1) both;animation-delay:calc(var(--i)*40ms)}
        .gg .halo{width:100%;aspect-ratio:1;border-radius:50%;padding:5px;background:var(--ring);box-shadow:0 16px 34px rgba(0,0,0,.5);transition:transform .35s ease,box-shadow .35s ease}
        .gg .halo img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block;border:3px solid var(--deep);background:var(--deep)}
        .gg .grad:hover .halo{transform:translateY(-6px) scale(1.03);box-shadow:0 22px 46px rgba(217,164,65,.34)}
        .gg .name{margin-top:14px;font-size:clamp(12px,1.35vw,15px);font-weight:700;line-height:1.35}
        .gg .sub{margin-top:4px;font-size:11px;letter-spacing:.08em;color:var(--muted)}
        .gg footer{margin-top:clamp(40px,6vw,80px);padding:clamp(28px,4vw,52px) 24px clamp(36px,5vw,60px);text-align:center;border-top:1px solid rgba(242,208,138,.22);
          background:linear-gradient(180deg,rgba(20,31,160,.18),rgba(4,9,31,0))}
        .gg .fmain{font-family:"Cormorant Garamond",Georgia,serif;font-size:clamp(20px,3vw,30px);color:var(--gold-lt)}
        .gg .fsub{margin-top:12px;font-size:11px;letter-spacing:.22em;text-indent:.22em;color:var(--muted)}
        @keyframes ggrise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @media (prefers-reduced-motion:reduce){.gg .grad{animation:none}.gg .halo{transition:none}}
      `}</style>

      <header className="sky">
        <svg className="arc" width="520" height="520" viewBox="0 0 400 400" style={{ left: -190, top: -140 }} aria-hidden="true">
          <circle cx="200" cy="200" r="196" strokeWidth="1.2" /><circle cx="200" cy="200" r="166" strokeWidth="3" />
        </svg>
        <svg className="arc" width="560" height="560" viewBox="0 0 400 400" style={{ right: -220, bottom: -260 }} aria-hidden="true">
          <circle cx="200" cy="200" r="196" strokeWidth="1.2" /><circle cx="200" cy="200" r="158" strokeWidth="3" />
        </svg>
        <img className="logo" src={SITE_LOGO} alt="IMETS Medical School" />
        <p className="school">{cohort.schoolLabel || "IMETS MEDICAL SCHOOL"}</p>
        <h1>{cohort.programTitle} {cohort.programTitleAccent && <em>{cohort.programTitleAccent}</em>}</h1>
        {cohort.kicker && <p className="kicker">{cohort.kicker}</p>}
        <div className="rule"><i /><span className="dia" /><i /></div>
        <div className="facts">
          <div className="fact"><b>{cohort.graduates.length}</b><span>GRADUATES</span></div>
          {cohort.trainingHours > 0 && <div className="fact"><b>{cohort.trainingHours}</b><span>TRAINING HOURS</span></div>}
          {(cohort.classYear || cohort.classLabel) && (
            <div className="fact"><b>{cohort.classYear || cohort.classLabel}</b><span>{cohort.classYear ? (cohort.classLabel || "CLASS") : "CLASS"}</span></div>
          )}
        </div>
      </header>

      <main>
        <ul className="roll">
          {cohort.graduates.map((g, i) => (
            <li className="grad" key={g.id || i} style={{ ["--i" as string]: i } as React.CSSProperties}>
              <div className="halo">
                {g.photoUrl
                  ? <img src={g.photoUrl} alt={g.name} loading={i < 8 ? "eager" : "lazy"} />
                  : <img src={SITE_LOGO} alt="" style={{ objectFit: "contain", padding: 18 }} />}
              </div>
              <p className="name">{g.name}</p>
              {(g.title || g.country) && <p className="sub">{[g.title, g.country].filter(Boolean).join(" · ")}</p>}
            </li>
          ))}
        </ul>
      </main>

      <footer>
        <p className="fmain">{cohort.footerTitle || "Congratulations to every graduate"}</p>
        <p className="fsub">{issued ? `ISSUED ${issued} · ` : ""}{cohort.schoolLabel || "IMETS MEDICAL SCHOOL"}</p>
      </footer>
    </div>
  );
}
