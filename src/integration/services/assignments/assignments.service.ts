import { api, type Result } from "@integration/services/http/client";
import type {
  Assignment,
  AssignmentSubmission,
  CreateAssignmentInput,
  AssignmentListResponse,
} from "./types";

export function createAssignment(
  input: CreateAssignmentInput
): Promise<Result<Assignment>> {
  return api.post<Assignment>("/assignments", input);
}

export function listAssignments(params: {
  page?: number;
  limit?: number;
  lmsId?: string;
  group?: string;
} = {}): Promise<Result<AssignmentListResponse>> {
  return api.get<AssignmentListResponse>("/assignments", { params });
}

export function deleteAssignment(id: string): Promise<Result<void>> {
  return api.delete<void>(`/assignments/${id}`);
}

export function getAssignment(id: string): Promise<Result<Assignment>> {
  return api.get<Assignment>(`/assignments/${id}`);
}

export function listAssignmentSubmissions(
  id: string
): Promise<Result<AssignmentSubmission[]>> {
  return api.get<AssignmentSubmission[]>(`/assignments/${id}/submissions`);
}

export function updateSubmissionStatus(
  submissionId: string,
  input: { status: string; score: number | null; plagiarismScore: number | null }
): Promise<Result<unknown>> {
  return api.patch<unknown>(`/assignments/submissions/${submissionId}/status`, input);
}
