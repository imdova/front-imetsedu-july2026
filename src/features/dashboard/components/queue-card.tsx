import type { QueueItem } from "@/lib/db/platform";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface QueueCardProps {
  title: string;
  subtitle: string;
  viewAllLabel: string;
  items: QueueItem[];
}

/** Generic moderation/queue list card (verification, credentials, …). */
export function QueueCard({
  title,
  subtitle,
  viewAllLabel,
  items,
}: QueueCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <button
            type="button"
            className="text-sm font-medium text-primary hover:underline"
          >
            {viewAllLabel}
          </button>
        </div>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-border/60">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 py-3 first:pt-0"
            >
              <Avatar className="size-9 border">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {item.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.meta}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.ago}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
