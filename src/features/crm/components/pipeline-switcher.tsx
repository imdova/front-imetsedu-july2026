"use client";

import { useRouter } from "@/i18n/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  pipelines: { value: string; label: string }[];
  currentId: string;
}

export function PipelineSwitcher({ pipelines, currentId }: Props) {
  const router = useRouter();

  return (
    <Select value={currentId} onValueChange={(id) => router.push(`/admin/crm/pipeline/${id}`)}>
      <SelectTrigger className="w-[220px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {pipelines.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
