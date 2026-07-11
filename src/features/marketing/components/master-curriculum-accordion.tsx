"use client";

import * as React from "react";
import type { ComponentType } from "react";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ClipboardList,
  FileCheck,
  HeartPulse,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const MODULES: { icon: ComponentType<{ className?: string }>; title: string; desc: string }[] = [
  { icon: Users, title: "Organizational Leadership", desc: "Strategy, governance, project & change management, and building a culture of quality." },
  { icon: BarChart3, title: "Health Data Analytics", desc: "Collecting, measuring and interpreting data to drive quality decisions." },
  { icon: TrendingUp, title: "Performance & Process Improvement", desc: "Lean, Six Sigma and PDSA tools to design and improve care processes." },
  { icon: ShieldCheck, title: "Patient Safety", desc: "Risk management, error reduction and a proactive culture of safety." },
  { icon: FileCheck, title: "Regulatory & Accreditation Compliance", desc: "Standards, surveys and readiness for JCI, CBAHI and accreditation bodies." },
  { icon: ClipboardList, title: "Quality Review & Accountability", desc: "Peer review, credentialing and performance accountability." },
  { icon: HeartPulse, title: "Population Health & Care Transitions", desc: "Care coordination, safe transitions and population-level outcomes." },
  { icon: Target, title: "Exam Strategy & Full Mock Exams", desc: "Question-bank practice, timed mock exams and exam-day tactics." },
];

export function MasterCurriculumAccordion() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="curriculum" dir="ltr" className="mx-auto max-w-3xl px-4 py-16 text-left sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0a2f7a]">What you&apos;ll master</h2>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#0b3fa8]/10 px-3 py-1 text-sm font-semibold text-[#0b3fa8]">
          <BookOpen className="size-4" /> 10 weeks · 8 units built on the Exam Blueprint
        </p>
      </div>

      <div className="divide-y divide-blue-100 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
        {MODULES.map((m, i) => {
          const expanded = open === i;
          const Icon = m.icon;
          return (
            <div key={m.title}>
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : i)}
                aria-expanded={expanded}
                className="flex w-full items-center gap-4 px-4 py-4 text-start transition-colors hover:bg-blue-50/60 sm:px-5"
              >
                <span className="relative grid size-11 shrink-0 place-items-center rounded-xl bg-[#0b3fa8] text-white">
                  <Icon className="size-5" />
                  <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[#f4c430] text-[10px] font-bold text-[#051a4a] ring-2 ring-white">
                    {i + 1}
                  </span>
                </span>
                <span className="min-w-0 flex-1 font-bold text-[#0a2f7a]">{m.title}</span>
                <ChevronDown
                  className={cn("size-5 shrink-0 text-slate-400 transition-transform", expanded && "rotate-180")}
                />
              </button>
              {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/80 px-4 pb-4 pt-3 sm:px-5 sm:ps-20">
                  <p className="text-sm leading-relaxed text-slate-600">{m.desc}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
