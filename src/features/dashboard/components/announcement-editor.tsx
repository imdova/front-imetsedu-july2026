"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/shared/rich-text-editor/editor";

const INITIAL = `<p>👋 Welcome to the new term! Share an update with your instructors and students — new course launches, schedule changes, or platform news.</p>`;

/** Rich-text "announcement" composer powered by the modular Tiptap wrapper. */
export function AnnouncementEditor() {
  const [content, setContent] = React.useState(INITIAL);
  const t = useTranslations("Dashboard");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <Megaphone className="size-4" />
          </span>
          <div>
            <CardTitle>{t("broadcastAnnouncement")}</CardTitle>
            <CardDescription>{t("announcementDesc")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder={t("writeAnnouncement")}
        />
        <div className="flex justify-end">
          <Button
            className="gap-1.5"
            onClick={() => toast.success(t("announcementPublished"))}
          >
            <Send className="size-4" />
            {t("publish")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
