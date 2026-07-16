/** Real partner photography / logos served from /public/partners. */
export const PARTNER_IMAGES: Record<
  string,
  { src: string; objectFit?: "cover" | "contain"; objectPosition?: string }
> = {
  "King Faisal Specialist Hospital": {
    src: "/partners/king-faisal-specialist-hospital.png",
    objectFit: "cover",
    objectPosition: "center",
  },
  "Cleveland Clinic Abu Dhabi": {
    src: "/partners/cleveland-clinic-abu-dhabi.png",
    objectFit: "contain",
  },
  "Jordan University Hospital": {
    src: "/partners/jordan-university-hospital.png",
    objectFit: "cover",
    objectPosition: "center top",
  },
  "Mediclinic Middle East": {
    src: "/partners/mediclinic-middle-east.png",
    objectFit: "cover",
    objectPosition: "center",
  },
  "Aster DM Healthcare": {
    src: "/partners/aster-dm-healthcare.png",
    objectFit: "cover",
    objectPosition: "center top",
  },
  SCFHS: {
    src: "/partners/scfhs.png",
    objectFit: "contain",
  },
  DHA: {
    src: "/partners/dha.png",
    objectFit: "contain",
  },
  QCHP: {
    src: "/partners/qchp.png",
    objectFit: "contain",
  },
  "NAHQ · CPHQ": {
    src: "/partners/cphq.png",
    objectFit: "contain",
  },
  "AIHCM · American Institute of Healthcare Management": {
    src: "/partners/aihcm.png",
    objectFit: "contain",
  },
  "AGEPAA · American Group of Educational Projects Accreditation and Administration": {
    src: "/partners/agepaa.png",
    objectFit: "contain",
  },
};
