"use client";

import { useTranslations } from "next-intl";

import type { UmUser, UmStats, UmInvitation } from "@/lib/db/user-management";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserDirectory } from "./user-directory";
import { InvitationsTable } from "./invitations-table";

export function UsersWorkspace({
  users, stats, invitations,
}: {
  users: UmUser[];
  stats: UmStats;
  invitations: UmInvitation[];
}) {
  const t = useTranslations("Admin");
  const pending = invitations.filter((i) => i.status === "pending").length;

  return (
    <Tabs defaultValue="team" className="space-y-5">
      <TabsList>
        <TabsTrigger value="team">{t("umTabTeam")}</TabsTrigger>
        <TabsTrigger value="invitations">
          {t("umTabInvitations")}{pending ? ` (${pending})` : ""}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="team">
        <UserDirectory users={users} stats={stats} />
      </TabsContent>
      <TabsContent value="invitations">
        <InvitationsTable initial={invitations} />
      </TabsContent>
    </Tabs>
  );
}
