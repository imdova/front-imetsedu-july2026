import { api, type Result } from "@integration/lib/api-client";
import {
  API_COMMISSIONS,
  API_COMMISSIONS_OVERVIEW,
  API_COMMISSION_PLAN,
  apiCommission,
} from "@integration/constants/api/commission";
import type {
  CommissionDealDto,
  CreateCommissionDealBody,
  CommissionOverviewDto,
  CommissionPlanDto,
} from "./types";

const monthParams = (month?: string) => (month ? { params: { month } } : undefined);

export const listDeals = (month?: string): Promise<Result<CommissionDealDto[]>> =>
  api.get<CommissionDealDto[]>(API_COMMISSIONS, monthParams(month));

export const getOverview = (month?: string): Promise<Result<CommissionOverviewDto>> =>
  api.get<CommissionOverviewDto>(API_COMMISSIONS_OVERVIEW, monthParams(month));

export const createDeal = (body: CreateCommissionDealBody): Promise<Result<CommissionDealDto>> =>
  api.post<CommissionDealDto>(API_COMMISSIONS, body);

export const updateDeal = (
  id: string,
  body: Partial<CreateCommissionDealBody>,
): Promise<Result<CommissionDealDto>> => api.patch<CommissionDealDto>(apiCommission(id), body);

export const deleteDeal = (id: string): Promise<Result<{ success: boolean }>> =>
  api.delete<{ success: boolean }>(apiCommission(id));

export const getPlan = (): Promise<Result<CommissionPlanDto>> =>
  api.get<CommissionPlanDto>(API_COMMISSION_PLAN);

export const updatePlan = (body: Partial<CommissionPlanDto>): Promise<Result<CommissionPlanDto>> =>
  api.put<CommissionPlanDto>(API_COMMISSION_PLAN, body);
