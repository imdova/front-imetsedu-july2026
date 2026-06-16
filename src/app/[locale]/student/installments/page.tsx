import { getTranslations, setRequestLocale } from "next-intl/server";

import { api } from "@integration/lib/api-client";
import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import {
  InstallmentsView,
  type InstallmentsPageData,
  type ProcessedPlan,
  type RoadmapItem,
} from "@/features/student/components/installments-view";

/* ─── helpers ─────────────────────────────────────────────────── */

const isMongoId = (s: string) => /^[0-9a-fA-F]{24}$/.test(s);
const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ─── Data processing (runs server-side) ────────────────────── */

async function loadData(): Promise<InstallmentsPageData | null> {
  const res = await api.get<{ user: unknown; lead: any }>("/student-portal/profile");
  if (!res.ok) return null;

  const { lead } = res.data;

  // Extract payment plans from multiple possible paths
  const rawPlans: any[] = [];
  if (Array.isArray(lead?.data?.paymentPlans) && lead.data.paymentPlans.length > 0) {
    rawPlans.push(...lead.data.paymentPlans);
  } else if (Array.isArray(lead?.paymentPlans) && lead.paymentPlans.length > 0) {
    rawPlans.push(...lead.paymentPlans);
  } else if (lead?.data?.paymentPlan) {
    rawPlans.push(lead.data.paymentPlan);
  } else if (lead?.paymentPlan) {
    rawPlans.push(lead.paymentPlan);
  }

  if (rawPlans.length === 0) return null;

  // Collect unique Mongo course IDs and resolve names + thumbnails
  const courseIds = new Set<string>();
  rawPlans.forEach((p) => {
    if (p.courses?.[0] && isMongoId(p.courses[0])) courseIds.add(p.courses[0]);
  });
  if (lead?.coursesOfInterest?.[0] && isMongoId(lead.coursesOfInterest[0])) {
    courseIds.add(lead.coursesOfInterest[0]);
  }

  const courseMap: Record<string, { name: string; image?: string }> = {};
  if (courseIds.size > 0) {
    await Promise.all(
      [...courseIds].map(async (id) => {
        const r = await dal.courses.fetchCourse(id);
        if (r.ok && r.data) {
          courseMap[id] = {
            name: r.data.titleEn || r.data.titleAr || "—",
            image: r.data.thumbnailUrl ?? undefined,
          };
        }
      }),
    );
  }

  const resolveName = (val?: string): string | null => {
    if (!val) return null;
    return isMongoId(val) ? (courseMap[val]?.name ?? null) : val;
  };

  const now = Date.now();

  // Parse each plan into ProcessedPlan
  const plans: ProcessedPlan[] = rawPlans.map((plan, planIdx) => {
    const currency: string = plan.currency || "USD";
    const currencySymbol = currency === "EGP" ? "EGP " : currency === "USD" ? "$" : `${currency} `;
    const courseId: string | undefined = plan.courses?.[0] || lead?.coursesOfInterest?.[0];
    const courseName =
      plan.groupName ||
      resolveName(plan.courses?.[0]) ||
      resolveName(lead?.coursesOfInterest?.[0]) ||
      `Plan ${planIdx + 1}`;
    const courseImage =
      courseId && isMongoId(courseId) ? (courseMap[courseId]?.image ?? null) : null;
    const totalFeeNum: number = plan.totalAmount || plan.totalFee || 0;
    const installments: any[] = plan.installments || [];
    const planReceipts: any[] = plan.receipts || [];

    const firstUnpaidIdx = installments.findIndex(
      (i) => String(i.status).toUpperCase() !== "PAID",
    );

    const roadmap: RoadmapItem[] = installments.map((inst, index) => {
      const idx: number = inst.index || index + 1;
      const total: number = inst.total || installments.length;
      const isPaid = String(inst.status).toUpperCase() === "PAID";
      const dueDate = inst.dueDate ? new Date(inst.dueDate) : null;
      const isOverdue = !isPaid && dueDate && dueDate.getTime() < now;

      let status: RoadmapItem["status"] = "upcoming";
      if (isPaid) status = "paid";
      else if (isOverdue) status = "overdue";
      else if (index === firstUnpaidIdx) status = "due";

      let dateLabel = "";
      const fmt2 = (d: Date) =>
        d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      if (status === "paid") {
        const pDate = inst.paidDate
          ? new Date(inst.paidDate)
          : dueDate ?? new Date();
        dateLabel = `Paid on ${fmt2(pDate)}`;
      } else if (status === "overdue") {
        const daysLate = Math.ceil((now - (dueDate?.getTime() ?? 0)) / 86_400_000);
        dateLabel = `Due: ${fmt2(dueDate!)} (${daysLate} days late)`;
      } else {
        dateLabel = `Due: ${fmt2(dueDate ?? new Date())}`;
      }

      const instReceipts = planReceipts.filter((r: any) => r.scope === idx);
      const firstReceipt = instReceipts[0];

      return {
        id: `${planIdx}-${idx}`,
        title:
          idx === 1 && isPaid
            ? "Registration Deposit"
            : `Installment ${idx} of ${total}`,
        dateLabel,
        amount: fmt(Number(inst.amount) || 0),
        status,
        receiptAvailable: instReceipts.length > 0 || !!inst.receiptRef,
        receiptFileName: firstReceipt?.name || inst.receiptRef || undefined,
        receiptUrl: firstReceipt?.previewUrl || inst.receiptRef || undefined,
      };
    });

    const totalPaidNum = installments
      .filter((i) => String(i.status).toUpperCase() === "PAID")
      .reduce((s, i) => s + (Number(i.amount) || 0), 0);
    const totalRemainingNum = Math.max(0, totalFeeNum - totalPaidNum);
    const percentComplete =
      totalFeeNum > 0 ? Math.round((totalPaidNum / totalFeeNum) * 100) : 0;

    return {
      courseName,
      courseImage,
      currencySymbol,
      totalFeeNum,
      totalFee: fmt(totalFeeNum),
      totalPaidNum,
      totalPaid: fmt(totalPaidNum),
      totalRemainingNum,
      totalRemaining: fmt(totalRemainingNum),
      percentComplete,
      paymentMethod: plan.paymentMethod ?? null,
      roadmap,
      status: plan.status || "PENDING",
    };
  });

  // Aggregate across all plans
  const grandTotalFee = plans.reduce((s, p) => s + p.totalFeeNum, 0);
  const grandTotalPaid = plans.reduce((s, p) => s + p.totalPaidNum, 0);
  const grandTotalRemaining = plans.reduce((s, p) => s + p.totalRemainingNum, 0);
  const grandPercent =
    grandTotalFee > 0 ? Math.round((grandTotalPaid / grandTotalFee) * 100) : 0;
  const summaryCurrencySymbol = plans[0]?.currencySymbol ?? "";

  const allUnpaid = plans.flatMap((p) => p.roadmap.filter((i) => i.status !== "paid"));
  const nextInst = allUnpaid[0] ?? null;
  const overdueInsts = plans.flatMap((p) => p.roadmap.filter((i) => i.status === "overdue"));
  const overdueTotal = overdueInsts.reduce(
    (s, i) => s + parseFloat(i.amount.replace(/,/g, "")),
    0,
  );

  return {
    plans,
    summaryCurrencySymbol,
    grandTotalFee: fmt(grandTotalFee),
    grandTotalPaid: fmt(grandTotalPaid),
    grandTotalRemaining: fmt(grandTotalRemaining),
    grandPercent,
    nextInstallment: nextInst
      ? {
          title: nextInst.title,
          dueDate: nextInst.dateLabel.replace("Due: ", "").split(" (")[0],
          amount: nextInst.amount,
        }
      : { title: "No upcoming installments", dueDate: "N/A", amount: "0.00" },
    overdueReminder: {
      show: overdueInsts.length > 0,
      description:
        overdueInsts.length > 0
          ? `You have an outstanding balance of ${summaryCurrencySymbol}${fmt(overdueTotal)} from overdue installments.`
          : "",
    },
  };
}

/* ─── Page ─────────────────────────────────────────────────── */

export default async function StudentInstallmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const data = await loadData();

  return (
    <div className="mx-auto max-w-300 space-y-6">
      <PageHeader title={t("installmentsTitle")} description={t("installmentsSubtitle")} />
      <InstallmentsView data={data} />
    </div>
  );
}
