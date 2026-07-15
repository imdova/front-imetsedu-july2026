/** Groups DAL — list, stats and per-group detail. LIVE (GET /groups). */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as groupsSvc from "@integration/services/groups";
import * as groupCatsSvc from "@integration/services/group-categories";
import * as groupSubCatsSvc from "@integration/services/group-sub-categories";
import type { GroupRow, GroupStats, GroupDetail } from "@/lib/db/groups";
import type { CreateGroupInput, UpdateGroupInput } from "@integration/services/groups";
import { mapGroupRow, mapGroupDetail, computeGroupStats } from "@/lib/groups/map-group";

const arr = <T>(x: unknown): T[] => (Array.isArray(x) ? (x as T[]) : ((x as { data?: T[] })?.data ?? []));

/** A group's enrolled student, resolved to a CRM lead + their certificate. */
export interface GroupRosterStudent {
  userId: string;
  /** null when no CRM lead could be matched (can't issue a certificate). */
  leadId: string | null;
  name: string;
  email: string;
  phone: string;
  image: string;
  isApproved: boolean;
  progress: number;
  certificate: { id: string; code: string; link: string; status: string } | null;
}

/** LIVE: GET /groups/:id/students — roster joined to leads + certificates. */
export async function fetchGroupStudents(groupId: string): Promise<Result<GroupRosterStudent[]>> {
  const res = await groupsSvc.listGroupStudents(groupId);
  if (!res.ok) return res;
  const rows = arr<groupsSvc.GroupRosterStudentDto>(res.data);
  return ok(
    rows.map((r) => ({
      userId: r.userId,
      leadId: r.leadId ?? null,
      name: r.name || "—",
      email: r.email || "",
      phone: r.phone || "",
      image: r.image || "",
      isApproved: r.isApproved !== false,
      progress: r.progress ?? 0,
      certificate: r.certificate
        ? {
            id: r.certificate.id,
            code: r.certificate.code || "",
            link: r.certificate.link || "",
            status: r.certificate.status || "issued",
          }
        : null,
    })),
  );
}

const fmtDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-US");
};

/* ── Group taxonomy: categories + sub-categories (Group Settings page) ── */
export interface GroupCategoryRow {
  id: string;
  name: string;
  groups: number;
  createdAt: string;
}
export interface GroupSubcategoryRow extends GroupCategoryRow {
  parentId: string;
  parentName: string;
}

const toCatRow = (c: any): GroupCategoryRow => ({
  id: c._id ?? c.id ?? "",
  name: c.name ?? "—",
  groups: c.groupsCount ?? 0,
  createdAt: fmtDate(c.createdAt),
});
const toSubRow = (c: any): GroupSubcategoryRow => {
  const parent = c.parentCategory;
  return {
    ...toCatRow(c),
    parentId: typeof parent === "string" ? parent : (parent?._id ?? ""),
    parentName: parent && typeof parent === "object" ? (parent.name ?? "—") : "—",
  };
};

export const fetchGroupCategories = async (): Promise<Result<GroupCategoryRow[]>> => {
  const res = await groupCatsSvc.listGroupCategories();
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(toCatRow));
  } catch (err) {
    return fail(toMessage(err, "Failed to load group categories"));
  }
};

export const fetchGroupSubcategories = async (): Promise<Result<GroupSubcategoryRow[]>> => {
  const res = await groupSubCatsSvc.listGroupSubCategories();
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(toSubRow));
  } catch (err) {
    return fail(toMessage(err, "Failed to load group sub-categories"));
  }
};

export const createGroupCategory = async (name: string): Promise<Result<GroupCategoryRow>> => {
  const res = await groupCatsSvc.createGroupCategory({ name, isActive: true });
  if (!res.ok) return res;
  try {
    return ok(toCatRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create category"));
  }
};

export const createGroupSubcategory = async (
  name: string,
  parentId: string,
  parentName?: string,
): Promise<Result<GroupSubcategoryRow>> => {
  const res = await groupSubCatsSvc.createGroupSubCategory({ name, parentCategory: parentId, isActive: true });
  if (!res.ok) return res;
  try {
    const row = toSubRow(res.data);
    return ok(row.parentName === "—" && parentName ? { ...row, parentId, parentName } : row);
  } catch (err) {
    return fail(toMessage(err, "Failed to create sub-category"));
  }
};

export const renameGroupCategory = async (id: string, name: string): Promise<Result<GroupCategoryRow>> => {
  const res = await groupCatsSvc.updateGroupCategory(id, { name });
  if (!res.ok) return res;
  try {
    return ok(toCatRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update category"));
  }
};

export const renameGroupSubcategory = async (id: string, name: string): Promise<Result<GroupSubcategoryRow>> => {
  const res = await groupSubCatsSvc.updateGroupSubCategory(id, { name });
  if (!res.ok) return res;
  try {
    return ok(toSubRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update sub-category"));
  }
};

export const deleteGroupCategory = (id: string) => groupCatsSvc.deleteGroupCategory(id);
export const deleteGroupSubcategory = (id: string) => groupSubCatsSvc.deleteGroupSubCategory(id);

export const downloadGroupCategories = () => groupCatsSvc.downloadGroupCategories();
export const downloadGroupSubcategories = () => groupSubCatsSvc.downloadGroupSubCategories();

export const fetchGroups = async (): Promise<Result<GroupRow[]>> => {
  const res = await groupsSvc.listGroups({ limit: 200 } as never);
  if (!res.ok) return res;
  try {
    return ok(arr<any>(res.data).map(mapGroupRow));
  } catch (err) {
    return fail(toMessage(err, "Failed to load groups"));
  }
};

export const fetchGroupStats = async (): Promise<Result<GroupStats>> => {
  const res = await groupsSvc.listGroups({ limit: 200 } as never);
  if (!res.ok) return res;
  try {
    return ok(computeGroupStats(arr<any>(res.data).map(mapGroupRow)));
  } catch (err) {
    return fail(toMessage(err, "Failed to load group stats"));
  }
};

export const fetchGroup = async (id: string): Promise<Result<GroupDetail | null>> => {
  const res = await groupsSvc.getGroupById(id);
  if (!res.ok) return res;
  try {
    return ok(res.data ? mapGroupDetail(res.data) : null);
  } catch (err) {
    return fail(toMessage(err, "Failed to load group"));
  }
};

/** LIVE: enroll a lead into a group (POST /groups/:id/students/:leadId). The
 * backend resolves the lead → user (creating one if needed) and adds it to the
 * group's roster, so an enrolled lead shows up in the group's student list. */
export const addLeadToGroup = async (groupId: string, leadId: string): Promise<Result<boolean>> => {
  const res = await groupsSvc.addStudentToGroup(groupId, leadId);
  if (!res.ok) return res;
  return ok(true);
};

/** LIVE: toggle a roster student's approval — PATCH /groups/:id/students/:studentId. */
export const updateStudentStatus = async (groupId: string, studentId: string, isApproved: boolean): Promise<Result<boolean>> => {
  const res = await groupsSvc.updateStudentApproval(groupId, studentId, isApproved);
  if (!res.ok) return res;
  return ok(true);
};

/** LIVE: create a group — POST /groups (Admin only). */
export const createGroup = async (input: CreateGroupInput): Promise<Result<GroupRow>> => {
  const res = await groupsSvc.createGroup(input);
  if (!res.ok) return res;
  try {
    return ok(mapGroupRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to create group"));
  }
};

/** LIVE: update a group — PATCH /groups/:id (Admin only). */
export const updateGroup = async (id: string, input: UpdateGroupInput): Promise<Result<GroupRow>> => {
  const res = await groupsSvc.updateGroup(id, input);
  if (!res.ok) return res;
  try {
    return ok(mapGroupRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update group"));
  }
};

/** LIVE: duplicate a group without its students — POST /groups/:id/duplicate (Admin only). */
export const duplicateGroup = async (id: string): Promise<Result<GroupRow>> => {
  const res = await groupsSvc.duplicateGroup(id);
  if (!res.ok) return res;
  try {
    return ok(mapGroupRow(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to duplicate group"));
  }
};

/** LIVE: delete a group — DELETE /groups/:id (Admin only). */
export const deleteGroup = async (id: string): Promise<Result<boolean>> => {
  const res = await groupsSvc.deleteGroup(id);
  if (!res.ok) return res;
  return ok(true);
};

/** LIVE: remove a student from a group's roster — DELETE /groups/:id/students/:studentId. */
export const removeStudentFromGroup = async (groupId: string, studentId: string): Promise<Result<boolean>> => {
  const res = await groupsSvc.removeStudentFromGroup(groupId, studentId);
  if (!res.ok) return res;
  return ok(true);
};
