"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  description,
  icon,
  href,
}) {
  const content = (
    <div className="flex h-full flex-col">
      {/* TOP */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          {icon}
        </div>

        {href ? (
          <ArrowUpRight
            size={16}
            className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-600"
          />
        ) : null}
      </div>

      {/* CONTENT */}
      <div className="mt-3">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>

        {description ? (
          <p className="mt-1 text-[11px] leading-4 text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );

  if (!href) {
    return (
      <div className="h-[118px] rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group block h-[118px] rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
    >
      {content}
    </Link>
  );
}