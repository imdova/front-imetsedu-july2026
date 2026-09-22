"use client";

import * as React from "react";
import {
  Activity as ActivityIcon,
  BarChart3,
  Building2,
  CalendarDays,
  GraduationCap,
  Mail,
  Phone,
  Shield,
  Target,
  UserRound,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { UserDetail as UserDetailModel } from "@/lib/db/admin";
import type { StaffActivityPage, StaffPerformance } from "@/lib/dal/staff-insights";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminStatusBadge } from "./admin-status-badge";
import { UserActivity } from "./user-activity";
import { UserPerformance } from "./user-performance";

const num = (n: number) => n.toLocaleString("en-US");
const egp = (n: number) => `EGP ${Math.round(n).toLocaleString("en-US")}`;

/**
 * The admin's view of one user: who they are, how they're performing, and
 * everything the system recorded them doing.
 */
export function UserDetail({
  user,
  performance,
  activity,
}: {
  user: UserDetailModel;
  performance: StaffPerformance | null;
  activity: StaffActivityPage | null;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Card className="h-fit">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3">
              <Avatar className="size-14 border">
                <AvatarFallback className="bg-primary/10 font-medium text-primary">{user.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-heading text-lg font-semibold">{user.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="size-3" />
                    {user.role}
                  </Badge>
                  <AdminStatusBadge value={user.status} />
                </div>
              </div>
            </div>
            <dl className="space-y-2.5 text-sm">
              <Line icon={Mail}>{user.email}</Line>
              <Line icon={Phone}>{user.phone}</Line>
              <Line icon={Building2}>{user.department}</Line>
              <Line icon={CalendarDays}>Joined {user.joinedAt}</Line>
            </dl>
          </CardContent>
        </Card>

        {performance && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">At a glance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <Stat icon={Target} label="Leads assigned">{num(performance.leads.total)}</Stat>
              <Stat icon={GraduationCap} label="Enrolled">
                {num(performance.leads.enrolled)} · {performance.leads.conversionRate}%
              </Stat>
              <Stat icon={BarChart3} label="Collected">{egp(performance.revenue.collected)}</Stat>
              <Stat icon={ActivityIcon} label="Actions logged">{num(performance.activity.total)}</Stat>
              {performance.orientation && (
                <Stat icon={UserRound} label="Orientation">
                  {performance.orientation.percent}%
                </Stat>
              )}
              {performance.orientation && (
                <Button asChild variant="outline" size="sm" className="mt-2 w-full">
                  <Link href={`/admin/orientation/progress/${user.id}`}>Orientation report</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="min-w-0">
        <TabsList className="h-auto flex-wrap gap-1 rounded-2xl bg-muted/60 p-1.5">
          <TabsTrigger value="overview" className="gap-1.5">
            <UserRound className="size-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5">
            <BarChart3 className="size-4" /> Performance
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5">
            <ActivityIcon className="size-4" /> Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <UserOverview user={user} performance={performance} activity={activity} />
        </TabsContent>
        <TabsContent value="performance" className="mt-4">
          <UserPerformance userId={user.id} initial={performance} />
        </TabsContent>
        <TabsContent value="activity" className="mt-4">
          <UserActivity userId={user.id} initial={activity} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserOverview({
  user,
  performance,
  activity,
}: {
  user: UserDetailModel;
  performance: StaffPerformance | null;
  activity: StaffActivityPage | null;
}) {
  const recent = activity?.items.slice(0, 6) ?? [];
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
            <Row label="Full name">{user.name}</Row>
            <Row label="Email">{user.email}</Row>
            <Row label="Phone">{user.phone}</Row>
            <Row label="Role">{user.role}</Row>
            <Row label="Department">{user.department}</Row>
            <Row label="Status">{user.status}</Row>
            <Row label="Joined">{user.joinedAt}</Row>
            <Row label="Last active">{user.lastActive}</Row>
          </dl>
        </CardContent>
      </Card>

      {performance && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
              <Row label="Open leads">{num(performance.leads.open)}</Row>
              <Row label="Enrolled">{num(performance.leads.enrolled)}</Row>
              <Row label="Lost / dead">{num(performance.leads.lost)}</Row>
              <Row label="Pipeline value">{egp(performance.leads.estimatedValue)}</Row>
              <Row label="Follow-ups overdue">{num(performance.followUps.overdue)}</Row>
              <Row label="Follow-ups today">{num(performance.followUps.today)}</Row>
              <Row label="Commission">{egp(performance.commission.total)}</Row>
              <Row label="Outstanding">{egp(performance.revenue.outstanding)}</Row>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {recent.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">Nothing recorded for this person yet.</p>
          ) : (
            recent.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 border-b border-border/50 py-3 text-sm last:border-0">
                <div className="min-w-0">
                  <p className="font-medium">{a.title}</p>
                  {a.detail && (
                    <p className="truncate text-xs text-muted-foreground" dir="auto">
                      {a.detail}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {new Date(a.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Line({ icon: Icon, children }: { icon: typeof Mail; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 truncate">{children}</span>
    </div>
  );
}

function Stat({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 shrink-0" />
        {label}
      </span>
      <span className="font-semibold tabular-nums">{children}</span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate font-medium">{children}</dd>
    </div>
  );
}
