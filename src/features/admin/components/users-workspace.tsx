"use client";

import type { UmUser, UmStats, UmRole, UmDepartment } from "@/lib/db/user-management";
import { UserDirectory } from "./user-directory";

export function UsersWorkspace({
  users, stats, roles = [], departments = [],
}: {
  users: UmUser[]; stats: UmStats; roles?: UmRole[]; departments?: UmDepartment[];
}) {
  return <UserDirectory users={users} stats={stats} roles={roles} departments={departments} />;
}
