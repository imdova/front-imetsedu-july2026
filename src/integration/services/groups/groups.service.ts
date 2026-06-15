import { api, type Result } from "@integration/services/http/client";
import { API_GROUPS, apiGroupById, apiGroupStudent, apiGroupCourse, apiGroupDuplicate, apiGroupStatus } from "@integration/constants/api/groups";
import type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  GroupListResponse,
} from "./types";

/**
 * Groups service.
 */

export function createGroup(
  input: CreateGroupInput
): Promise<Result<Group>> {
  return api.post<Group>(API_GROUPS, input);
}

export function listGroups(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
} = {}): Promise<Result<GroupListResponse>> {
  return api.get<GroupListResponse>(API_GROUPS, { params });
}

export function getGroupById(id: string): Promise<Result<Group>> {
  return api.get<Group>(apiGroupById(id));
}

export function updateGroup(
  id: string,
  input: UpdateGroupInput
): Promise<Result<Group>> {
  return api.patch<Group>(apiGroupById(id), input);
}

export function deleteGroup(id: string): Promise<Result<void>> {
  return api.delete<void>(apiGroupById(id));
}

export function duplicateGroup(id: string): Promise<Result<Group>> {
  return api.post<Group>(apiGroupDuplicate(id), {});
}

export function updateGroupStatus(
  id: string,
  status: "pending" | "inprogress" | "finished",
): Promise<Result<Group>> {
  return api.patch<Group>(apiGroupStatus(id), { status });
}

export function addStudentToGroup(
  id: string,
  studentId: string,
  payload?: { status?: boolean },
): Promise<Result<Group>> {
  return api.post<Group>(apiGroupStudent(id, studentId), payload ?? {});
}

export function updateStudentApproval(
  groupId: string,
  studentId: string,
  isApproved: boolean,
): Promise<Result<any>> {
  return api.patch<any>(apiGroupStudent(groupId, studentId), { status: isApproved });
}

export function removeStudentFromGroup(
  id: string,
  studentId: string
): Promise<Result<Group>> {
  return api.delete<Group>(apiGroupStudent(id, studentId));
}

export function assignCourseToGroup(
  groupId: string,
  courseId: string
): Promise<Result<Group>> {
  return api.post<Group>(apiGroupCourse(groupId, courseId), {});
}
