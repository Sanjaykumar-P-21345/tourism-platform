"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function QuickLink({ href, label, icon }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-900 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
    >
      <span className="text-lg">{icon}</span>

      <span className="flex-1">{label}</span>

      <ArrowRight
        size={16}
        className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-500"
      />
    </Link>
  );
}