export interface CommissionDealDto {
  _id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  customerName: string;
  courseName: string;
  commission: number;
  month: string;
  createdAt?: string;
}

export interface CreateCommissionDealBody {
  customerName: string;
  courseName?: string;
  commission: number;
  month: string;
}

export interface CommissionProgramDto {
  name: string;
  egypt: number;
  arab: number;
}
export interface CommissionRoleTierDto {
  key: string;
  label: string;
  minCustomers: number;
  amountAt5: number;
  amountAt6: number;
}
export interface CommissionPlanDto {
  _id?: string;
  programs: CommissionProgramDto[];
  roles: CommissionRoleTierDto[];
  existingCustomerNote: string;
}

export interface CommissionOverviewDto {
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
