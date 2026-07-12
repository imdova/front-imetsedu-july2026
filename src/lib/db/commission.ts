/** UI view-model types for the sales commission tracker (backed by the live API). */

export interface CommissionDeal {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  customerName: string;
  courseName: string;
  commission: number;
  month: string;
  createdAt?: string;
}

export interface CommissionDealInput {
  customerName: string;
  courseName?: string;
  commission: number;
  month: string;
}

export interface CommissionProgram {
  name: string;
  egypt: number;
  arab: number;
}
export interface CommissionRoleTier {
  key: string;
  label: string;
  minCustomers: number;
  amountAt5: number;
  amountAt6: number;
}
export interface CommissionPlan {
  programs: CommissionProgram[];
  roles: CommissionRoleTier[];
  existingCustomerNote: string;
}

export interface CommissionOverview {
  totals: {
    totalCommission: number;
    totalDeals: number;
    activeReps: number;
    avgPerDeal: number;
  };
  byRep: { ownerId: string; ownerName: string; ownerEmail: string; deals: number; commission: number }[];
  byCourse: { courseName: string; deals: number; commission: number }[];
  trend: { month: string; commission: number; deals: number }[];
}
