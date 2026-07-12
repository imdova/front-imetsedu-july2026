/**
 * Legal / policy content for IMETS Medical School.
 *
 * IMETS is a single educational academy that delivers its own programs — NOT a
 * marketplace of third-party sellers. The wording reflects that: enrollment in
 * IMETS courses, academy-owned content, exam preparation (the certifying bodies
 * are independent), etc.
 */

export type PolicySection = {
  id: string;
  heading: string;
  /** Paragraphs of body text. */
  body?: string[];
  /** Optional bullet list rendered after the paragraphs. */
  bullets?: string[];
  /** Optional table (e.g. payment / refund schedule). */
  table?: { headers: string[]; rows: string[][] };
};

export type PolicyDoc = {
  slug: string;
  title: string;
  /** Short label for the sidebar. */
  navLabel: string;
  updated: string;
  intro: string;
  sections: PolicySection[];
};

const UPDATED = "12 July 2026";
const ACADEMY = "IMETS Medical School";
const SUPPORT = "support@imetsedu.com";
const LEGAL = "legal@imetsedu.com";
const REGISTRATION = "registration@imetsedu.com";
const REG_PHONE = "+20 100 881 5007";

/* ──────────────────────────── Terms ──────────────────────────── */
const terms: PolicyDoc = {
  slug: "terms",
  title: "Terms & Conditions",
  navLabel: "Terms & Conditions",
  updated: UPDATED,
  intro:
    `These Terms & Conditions ("Terms") govern your access to and use of ${ACADEMY} and the educational programs, ` +
    `courses, diplomas, live sessions, recordings, materials and services we provide (together, the "Services"). ` +
    `Please read them carefully and keep a copy for your records. By using the Services you agree to these Terms.`,
  sections: [
    {
      id: "about",
      heading: "1. About IMETS",
      body: [
        `${ACADEMY} is an educational academy that designs and delivers professional healthcare training — including ` +
          `diplomas, certificates and exam-preparation programs. We are the provider of every program on this platform; ` +
          `we are not an online marketplace and we do not host or resell courses on behalf of third-party sellers.`,
      ],
    },
    {
      id: "acceptance",
      heading: "2. Acceptance of Terms",
      body: [
        `By creating an account, enrolling in a program, or otherwise using the Services, you confirm that you have read, ` +
          `understood and agree to be bound by these Terms and by our Privacy Policy and Refund & Enrollment Policy, which ` +
          `are incorporated here by reference. If you do not agree, please do not use the Services.`,
      ],
    },
    {
      id: "eligibility",
      heading: "3. Eligibility & Accounts",
      body: [
        `You must be at least 18 years old, or have the consent of a parent or legal guardian, to enroll. You agree to ` +
          `provide accurate and complete information and to keep it up to date.`,
      ],
      bullets: [
        "Your account is personal to you and may not be shared, sold or transferred.",
        "You are responsible for keeping your password confidential and for all activity under your account.",
        "Notify us promptly at " + SUPPORT + " if you suspect any unauthorized use of your account.",
      ],
    },
    {
      id: "enrollment",
      heading: "4. Enrollment & Access to Programs",
      body: [
        `When you enroll, we grant you a personal, non-transferable, non-exclusive license to access the program you ` +
          `enrolled in for the access period stated at enrollment. Programs may combine live online sessions, recorded ` +
          `lessons, study materials, assignments and practice exams.`,
        `Live-session schedules, instructors and program content may be updated to improve quality. Where a live session ` +
          `is missed, a recording is normally made available in your account.`,
      ],
    },
    {
      id: "fees",
      heading: "5. Fees & Payments",
      body: [
        `Program fees are shown before you enroll and are payable at enrollment unless an installment plan is agreed in ` +
          `writing. Prices are quoted in Egyptian Pounds (EGP) unless stated otherwise, and applicable taxes may be added ` +
          `based on your location. We may change prices from time to time, but changes do not affect a program you have ` +
          `already paid for.`,
      ],
    },
    {
      id: "refunds",
      heading: "6. Refunds & Cancellations",
      body: [
        `Refunds and cancellations are governed by our Refund & Enrollment Policy. Please review it before enrolling. ` +
          `If ${ACADEMY} cancels a program, you are entitled to a full refund or transfer to another cohort.`,
      ],
    },
    {
      id: "conduct",
      heading: "7. Student Conduct & Academic Integrity",
      body: ["To keep the learning environment safe and fair, you agree not to:"],
      bullets: [
        "Share your login or grant others access to the Services.",
        "Copy, record, resell, publish or redistribute any course materials, recordings or exam questions.",
        "Cheat, plagiarize, or misrepresent your identity in assessments or certification exams.",
        "Harass instructors, staff or fellow students, or disrupt live sessions.",
        "Attempt to bypass security, scrape content, or use automated systems to access the Services.",
      ],
    },
    {
      id: "certificates",
      heading: "8. Certificates",
      body: [
        `Where a program offers a certificate of completion, it is issued once you meet the stated completion criteria ` +
          `(such as attendance, assignments and assessments). Certificates are verifiable through ${ACADEMY} and confirm ` +
          `completion of an IMETS program; they are not a professional license.`,
      ],
    },
    {
      id: "accreditation",
      heading: "9. Exam Preparation & Independent Certifying Bodies",
      body: [
        `Some programs prepare you for external professional examinations (for example CPHQ, CIC and similar credentials). ` +
          `Those examinations and credentials are owned and awarded by independent certifying bodies. ${ACADEMY} is not ` +
          `affiliated with, endorsed by, or acting on behalf of those bodies, and we do not guarantee that you will pass ` +
          `any external exam or obtain any external credential.`,
      ],
    },
    {
      id: "ip",
      heading: "10. Intellectual Property",
      body: [
        `All content on the platform — including lessons, videos, slides, materials, practice exams, text, graphics, logos ` +
          `and software — is owned by ${ACADEMY} or its licensors and is protected by intellectual-property laws. You may ` +
          `use it only for your own personal, non-commercial learning. All rights not expressly granted are reserved.`,
      ],
    },
    {
      id: "disclaimers",
      heading: "11. Disclaimers",
      body: [
        `The Services are provided for educational purposes on an "as is" and "as available" basis. We do not warrant ` +
          `uninterrupted or error-free access, and we do not guarantee any particular learning outcome, exam result, ` +
          `licensure or employment. Program content is not medical advice.`,
      ],
    },
    {
      id: "liability",
      heading: "12. Limitation of Liability",
      body: [
        `To the maximum extent permitted by law, ${ACADEMY} shall not be liable for any indirect, incidental or ` +
          `consequential damages, and our total liability arising out of or relating to the Services shall not exceed the ` +
          `amount you paid to us for the program giving rise to the claim in the twelve (12) months before the claim.`,
      ],
    },
    {
      id: "termination",
      heading: "13. Suspension & Termination",
      body: [
        `We may suspend or terminate your access if you breach these Terms or misuse the Services. You may close your ` +
          `account at any time by contacting us. On termination, your right to access the Services stops immediately; ` +
          `sections intended to survive (such as intellectual property, disclaimers and liability) continue to apply.`,
      ],
    },
    {
      id: "changes",
      heading: "14. Changes to These Terms",
      body: [
        `We may update these Terms from time to time. When we do, we will revise the "Last updated" date above and, where ` +
          `changes are material, take reasonable steps to notify you. Continued use of the Services after changes take ` +
          `effect means you accept the updated Terms.`,
      ],
    },
    {
      id: "law",
      heading: "15. Governing Law",
      body: [
        `These Terms are governed by the laws of the Arab Republic of Egypt, and the competent courts of Egypt shall have ` +
          `jurisdiction over any dispute, without prejudice to any mandatory consumer-protection rights you may have.`,
      ],
    },
    {
      id: "contact",
      heading: "16. Contact Us",
      body: [
        `Questions about these Terms? Contact us at ${LEGAL} or ${SUPPORT}.`,
      ],
    },
  ],
};

/* ─────────────────────────── Privacy ─────────────────────────── */
const privacy: PolicyDoc = {
  slug: "privacy",
  title: "Privacy Policy",
  navLabel: "Privacy Policy",
  updated: UPDATED,
  intro:
    `This Privacy Policy explains what personal information ${ACADEMY} collects, how we use and protect it, and the ` +
    `choices you have. It applies to your use of our platform and educational Services.`,
  sections: [
    {
      id: "collect",
      heading: "1. Information We Collect",
      body: ["We collect information you provide and information generated as you use the Services, including:"],
      bullets: [
        "Account details: name, email, phone number and, where relevant, professional background.",
        "Enrollment details: the programs you join, progress, assignments and assessment results.",
        "Payment details: processed securely by our payment providers — we do not store full card numbers.",
        "Usage data: device, browser, log and interaction data used to operate and improve the Services.",
      ],
    },
    {
      id: "use",
      heading: "2. How We Use Your Information",
      body: ["We use your information to:"],
      bullets: [
        "Provide the programs you enroll in and issue certificates.",
        "Process payments and manage your account and support requests.",
        "Communicate schedules, updates and (where you have opted in) offers.",
        "Improve our content, platform and student experience, and keep the Services secure.",
      ],
    },
    {
      id: "basis",
      heading: "3. Legal Basis",
      body: [
        `We process your information to perform our agreement with you (delivering the programs you enroll in), to comply ` +
          `with legal obligations, for our legitimate interests in operating and improving the academy, and — for optional ` +
          `communications — with your consent, which you may withdraw at any time.`,
      ],
    },
    {
      id: "sharing",
      heading: "4. Sharing & Disclosure",
      body: [
        `We do not sell your personal information. We share it only with trusted service providers who help us run the ` +
          `Services (such as payment processors, hosting and email providers) under confidentiality obligations, or where ` +
          `required by law.`,
      ],
    },
    {
      id: "cookies",
      heading: "5. Cookies & Tracking",
      body: [
        `We use essential cookies to run the platform and, with your consent where required, analytics cookies to ` +
          `understand usage and improve the Services. You can manage cookies through your browser settings.`,
      ],
    },
    {
      id: "security",
      heading: "6. Data Security",
      body: [
        `We apply appropriate technical and organizational measures to protect your information. No method of transmission ` +
          `or storage is completely secure, but we work to safeguard your data and to respond promptly to any incident.`,
      ],
    },
    {
      id: "retention",
      heading: "7. Data Retention",
      body: [
        `We keep your information for as long as your account is active and as needed to provide the Services, issue and ` +
          `verify certificates, and comply with legal, accounting and reporting obligations.`,
      ],
    },
    {
      id: "rights",
      heading: "8. Your Rights",
      body: ["Subject to applicable law, you may:"],
      bullets: [
        "Access the personal information we hold about you.",
        "Request correction of inaccurate information.",
        "Request deletion of your information, where we are not required to keep it.",
        "Object to or restrict certain processing, and withdraw consent for optional communications.",
      ],
    },
    {
      id: "children",
      heading: "9. Children",
      body: [
        `The Services are intended for adults. If you are under 18, you may use the Services only with the involvement of a ` +
          `parent or legal guardian.`,
      ],
    },
    {
      id: "contact",
      heading: "10. Contact Us",
      body: [
        `To exercise your rights or ask about this policy, contact us at ${LEGAL} or ${SUPPORT}.`,
      ],
    },
  ],
};

/* ───────────────────── Enrollment & Academic ─────────────────── */
const enrollment: PolicyDoc = {
  slug: "enrollment",
  title: "Enrollment & Academic Policy",
  navLabel: "Enrollment & Academic",
  updated: UPDATED,
  intro:
    `This Policy sets out the admission, registration, tuition, attendance, learning-platform, assessment, graduation and ` +
    `conduct rules that apply to enrollment in ${ACADEMY} programs. Where a specific program page states additional or ` +
    `different requirements, the program page takes precedence.`,
  sections: [
    {
      id: "eligibility",
      heading: "1. Admission Eligibility",
      body: [
        `Applicants must hold a Bachelor's degree in one of the following fields, or a qualification the Academy recognises ` +
          `as equivalent at its sole discretion:`,
      ],
      bullets: [
        "Medicine, Pharmacy, Dentistry or Nursing",
        "Science",
        "Business Administration",
        "Any other discipline accepted by the Academy as equivalent",
      ],
    },
    {
      id: "eligibility-extra",
      heading: "2. Additional Requirements & Non-Discrimination",
      body: [
        `Certain programs may carry additional entry requirements — for example a defined period of clinical or managerial ` +
          `experience, or a specific professional licence. Where they apply, they are stated on the program page and take ` +
          `precedence over the general requirements above.`,
        `Admission decisions are made on the basis of academic and professional eligibility alone. The Academy does not ` +
          `discriminate on the grounds of gender, nationality, religion, or disability.`,
      ],
    },
    {
      id: "english",
      heading: "3. English Language Proficiency",
      body: [
        `All programs are delivered and assessed in English. Applicants must demonstrate written and spoken English ` +
          `sufficient to participate fully in lectures, discussions and assessments. Proficiency may be evidenced by any of:`,
      ],
      bullets: [
        "A recognised English test result (e.g. IELTS, TOEFL or equivalent) at the level published on the program page;",
        "A degree taught and examined in English; or",
        "Successful completion of a short English assessment administered by the Academy.",
      ],
    },
    {
      id: "documents",
      heading: "4. Supporting Documents",
      body: ["Applicants must submit the following at registration:"],
      bullets: [
        "A copy of the Bachelor's degree certificate (and transcript, where requested);",
        "A valid national ID or passport;",
        "Evidence of English proficiency, where required;",
        "A recent passport-sized photograph, for certificate issuance;",
        "Any additional documents specified on the program page.",
      ],
    },
    {
      id: "falsification",
      heading: "5. Accuracy of Documents",
      body: [
        `The Academy may decline or withdraw an offer of a place where documents are incomplete, inaccurate or falsified. ` +
          `Falsification of documents results in immediate termination of enrollment without refund.`,
      ],
    },
    {
      id: "registration",
      heading: "6. How to Register",
      body: [
        `Candidates who meet the eligibility criteria may register by contacting the Registration Department, which will ` +
          `confirm eligibility, issue a proforma invoice, and provide payment instructions:`,
      ],
      bullets: [
        `Telephone / WhatsApp: ${REG_PHONE}`,
        `Email: ${REGISTRATION}`,
      ],
    },
    {
      id: "confirmation",
      heading: "7. Confirmation of Registration",
      body: [
        `A place is not reserved and registration is not confirmed until the Academy has received either the full tuition ` +
          `fee or a first instalment of at least 50% of the total fee. Places are allocated on a first-confirmed, ` +
          `first-served basis; unpaid applications do not hold a place regardless of enquiry date. Registration is ` +
          `confirmed in writing by the Registration Department — no other acknowledgement constitutes confirmation.`,
        `Registration closes at the earlier of the published deadline for the cohort or the point at which the cohort ` +
          `reaches capacity. Late registration may be accepted at the Academy's discretion, subject to seat availability.`,
      ],
    },
    {
      id: "fees",
      heading: "8. Tuition Fees & What They Include",
      body: [
        `Program fees are inclusive of all required learning materials, LMS access for the study period, assessments, and ` +
          `the ${ACADEMY} graduation certificate. Certificates issued by affiliated bodies are charged separately (see ` +
          `“Certificates from Affiliated Bodies” below).`,
      ],
    },
    {
      id: "payment-schedule",
      heading: "9. Payment Schedule",
      body: [
        `The total tuition fee is due by the program Start Date unless a specific instalment arrangement is agreed in ` +
          `writing with the Registration Department.`,
      ],
      table: {
        headers: ["Payment", "Amount", "Due"],
        rows: [
          ["First instalment", "Minimum 50% of total tuition", "On registration — registration is not confirmed without it"],
          ["Second instalment", "Remaining balance", "Within one (1) month of the program Start Date"],
        ],
      },
    },
    {
      id: "payment-methods",
      heading: "10. Accepted Payment Methods",
      body: [`All fees are payable to ${ACADEMY} by any of the following:`],
      bullets: [
        "Cheque",
        "Visa / MasterCard",
        "Vodafone Cash",
        "Western Union (for payments originating outside Egypt)",
      ],
    },
    {
      id: "overdue",
      heading: "11. Overdue Payments",
      body: [
        `Bank charges, transfer fees and currency-conversion costs are borne by the candidate; the Academy must receive the ` +
          `full net invoiced amount. Where the second instalment is not received by its due date, the Academy may suspend ` +
          `LMS access and withhold assessment results and certification until the account is settled in full, after written ` +
          `notice to the candidate.`,
      ],
    },
    {
      id: "attendance",
      heading: "12. Attendance & Participation",
      body: [
        `Every candidate must attend a minimum of 75% of the total scheduled lectures for their program. Attendance is ` +
          `recorded for both in-person and live online sessions. Candidates who fall below the 75% threshold are not ` +
          `eligible for graduation or certification, irrespective of assessment performance.`,
        `Candidates unable to attend should notify the Registration Department in advance. Where absence is caused by ` +
          `documented medical or exceptional circumstances, a written request with evidence may be submitted for the absence ` +
          `to be discounted, considered case by case. Viewing a session recording does not by itself count towards ` +
          `attendance unless expressly permitted for that program. A candidate below the threshold may, at the Academy's ` +
          `discretion and subject to any applicable fee, be transferred to a later cohort; no refund is payable for ` +
          `attendance failure.`,
      ],
    },
    {
      id: "lms",
      heading: "13. Learning Platform (LMS) — Access & Acceptable Use",
      body: [
        `Each candidate is issued an individual LMS account, active for the duration of their study period and deactivated ` +
          `automatically at its end. Please download any materials you wish to keep before deactivation. The account is ` +
          `strictly personal and non-transferable. Candidates must not:`,
      ],
      bullets: [
        "Share, sell or disclose their login credentials to any third party;",
        "Permit any other person to access the LMS using their account;",
        "Download, record, screen-capture, reproduce or redistribute course materials, recordings or assessments outside the LMS;",
        "Attempt to circumvent access controls or security measures.",
      ],
    },
    {
      id: "lms-enforcement",
      heading: "14. LMS Enforcement",
      body: [
        `The Academy monitors concurrent sessions, device fingerprints and IP addresses. Where credential sharing or ` +
          `unauthorised access is detected, the account is suspended and the candidate is notified in writing with seven (7) ` +
          `days to respond. On a confirmed breach, access is permanently revoked, the candidate is withdrawn, no certificate ` +
          `is issued, and no refund is payable. Where a candidate is found to have distributed course materials, the Academy ` +
          `reserves the right to pursue all available legal remedies. A suspension or revocation may be appealed under the ` +
          `Complaints & Appeals section below.`,
      ],
    },
    {
      id: "assessment",
      heading: "15. Assessment & Progression",
      body: [
        `Candidates are assessed by the methods published for each program, which may include written examinations, ` +
          `assignments, projects and practical assessments. To graduate, a candidate must meet the 75% attendance ` +
          `requirement, pass all required assessments, and have settled all fees due to the Academy in full.`,
      ],
    },
    {
      id: "graduation",
      heading: "16. Graduation & Certification",
      body: [
        `On satisfying all graduation requirements, each candidate is awarded a graduation certificate issued by ${ACADEMY}. ` +
          `Certificates are issued in the candidate's full legal name exactly as it appears on the ID or passport submitted ` +
          `at registration; candidates are responsible for verifying the accuracy of their name, and reissuance to correct a ` +
          `candidate-supplied error is subject to a reissuance fee.`,
      ],
    },
    {
      id: "affiliated",
      heading: "17. Certificates from Affiliated Bodies",
      body: [
        `Candidates who require a certificate from an affiliated body — including Sadat Academy for Management Sciences, the ` +
          `American Institute of Healthcare and Hospital Management, and the International Accreditation Organization — must ` +
          `complete the Affiliated Certification Request Form and pay the applicable additional fee in full, both no later ` +
          `than three (3) months before the certificate is required. Requests after this deadline cannot be processed for ` +
          `the current cycle. Fees paid to affiliated bodies are non-refundable once submitted. The Academy acts as a ` +
          `facilitator only; issuance timelines and requirements are determined by the affiliated body.`,
      ],
    },
    {
      id: "deferral",
      heading: "18. Deferral, Transfer & Withdrawal",
      body: [
        `A candidate may request in writing to defer their place to a later cohort. Deferral requests received 21 days or ` +
          `more before the Start Date are normally granted at no charge, subject to availability; later requests may be ` +
          `granted at the Academy's discretion and may incur an administrative fee. A place may be deferred once; fees are ` +
          `transferred to the deferred cohort and remain non-refundable thereafter, save as provided in our Cancellation & ` +
          `Refund Policy.`,
        `A candidate who withdraws after the Start Date remains liable for the full tuition fee and no refund is payable. ` +
          `Where the Academy cancels or reschedules a program, affected candidates may elect a full refund of fees paid or a ` +
          `transfer to the next available cohort at no additional charge; the Academy's liability is limited to fees paid and ` +
          `does not extend to travel, accommodation or other consequential costs.`,
      ],
    },
    {
      id: "conduct",
      heading: "19. Conduct, Academic Integrity & Appeals",
      body: [
        `Candidates are expected to conduct themselves professionally towards faculty, staff and fellow candidates, in ` +
          `person and online. Harassment, discrimination, disruptive behaviour and misuse of Academy platforms are grounds ` +
          `for withdrawal without refund. Plagiarism, collusion, impersonation and cheating are treated as serious ` +
          `misconduct and result in failure of the assessment and may result in withdrawal without refund.`,
        `A candidate may appeal an academic decision, a sanction or a refund determination in writing to the Registration ` +
          `Department within fourteen (14) days of being notified. Appeals are reviewed by a member of Academy management ` +
          `not involved in the original decision, and a written outcome is provided within fourteen (14) days of receipt.`,
      ],
    },
    {
      id: "data",
      heading: "20. Personal Data",
      body: [
        `The Academy collects and processes candidate data — including identity documents, academic records, attendance, ` +
          `assessment results, payment records and LMS activity logs — for admission, delivery, certification and quality ` +
          `assurance. Data is not sold, and is disclosed to third parties only to affiliated bodies where the candidate has ` +
          `requested affiliated certification, or where required by law. See our Privacy Policy for full details.`,
      ],
    },
    {
      id: "amendments",
      heading: "21. Amendments, Contact & Governing Law",
      body: [
        `The Academy may amend this Policy; the version in force at the date of a candidate's registration governs that ` +
          `enrollment, and material changes are notified to affected candidates in writing.`,
        `Registration Department — ${ACADEMY}. Email: ${REGISTRATION} · Telephone / WhatsApp: ${REG_PHONE}.`,
        `This Policy is governed by the laws of the Arab Republic of Egypt.`,
      ],
    },
  ],
};

/* ─────────────────── Cancellation & Refund ───────────────────── */
const refund: PolicyDoc = {
  slug: "refund",
  title: "Cancellation & Refund Policy",
  navLabel: "Cancellation & Refund",
  updated: UPDATED,
  intro:
    `This policy explains how to cancel an enrollment, what refund (if any) applies, and how approved refunds are ` +
    `processed for ${ACADEMY} programs. It should be read together with our Enrollment & Academic Policy.`,
  sections: [
    {
      id: "how",
      heading: "1. How to Cancel",
      body: [
        `All cancellations must be submitted in writing to ${REGISTRATION}. Cancellations communicated by telephone, ` +
          `WhatsApp or any other channel are not valid and will not be actioned. The date of cancellation is the date on ` +
          `which the written request is received by the Registration Department — not the date it was sent.`,
      ],
    },
    {
      id: "schedule",
      heading: "2. Refund Schedule",
      body: [
        `Refund entitlement is determined by the number of calendar days between receipt of the written cancellation and ` +
          `the program Start Date:`,
      ],
      table: {
        headers: ["Cancellation received", "Refund"],
        rows: [
          ["21 calendar days or more before the Start Date", "100% — full refund"],
          ["14 to 20 calendar days before the Start Date", "50% of fees paid"],
          ["13 calendar days or fewer before the Start Date", "No refund"],
          ["On or after the Start Date", "No refund"],
        ],
      },
    },
    {
      id: "no-show",
      heading: "3. No-Shows",
      body: [
        `Non-attendance without a written cancellation ("no-show") does not constitute cancellation and attracts no refund.`,
      ],
    },
    {
      id: "processing",
      heading: "4. Method & Processing of Refunds",
      body: [
        `Refunds are issued to the same payment method used for the original payment and cannot be redirected to a third ` +
          `party or an alternative account. For credit and debit card refunds, processing takes up to thirty (30) days from ` +
          `approval, and the candidate must present the physical card used for the original payment together with the POS ` +
          `receipt or a bank statement evidencing the transaction. Bank charges and currency-conversion losses on refund ` +
          `are borne by the candidate.`,
      ],
    },
    {
      id: "non-refundable",
      heading: "5. Non-Refundable Items",
      body: [
        `The following are non-refundable in all circumstances, save where the Academy cancels the program:`,
      ],
      bullets: [
        "Fees paid to affiliated bodies once submitted;",
        "Bank, transfer and currency-conversion charges;",
        "Any administrative or reissuance fees.",
      ],
    },
    {
      id: "contact",
      heading: "6. Contact",
      body: [`Questions about cancellations or refunds? Contact the Registration Department at ${REGISTRATION}.`],
    },
  ],
};

export const POLICY_ORDER = ["terms", "enrollment", "refund", "privacy"] as const;
export const POLICIES: Record<string, PolicyDoc> = { terms, enrollment, refund, privacy };
