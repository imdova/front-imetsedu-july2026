"use client";

import type { UmUser, UmStats } from "@/lib/db/user-management";
import { UserDirectory } from "./user-directory";

export function UsersWorkspace({ users, stats }: { users: UmUser[]; stats: UmStats }) {
  return <UserDirectory users={users} stats={stats} />;
}
