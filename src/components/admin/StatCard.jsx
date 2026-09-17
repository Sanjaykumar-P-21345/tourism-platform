"use client";

import Link from "next/link";
import {
  ArrowUpRight,
} from "lucide-react";

export default function StatCard({
  title,
  value,
  description,
  icon,
  href,
}) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl dark:bg-indigo-500/10">
          {icon}
        </div>

        {href && (
          <ArrowUpRight
            size={18}
            className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-500"
          />
        )}
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>

        <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </p>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );

  if (!href) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900"
    >
      {content}
    </Link>
  );
}