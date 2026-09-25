import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

/* =========================================================
   BASE CARD
========================================================= */

export function AdminCard({ children, className = "", hover = true }) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        border border-slate-200
        bg-white
        shadow-[0_4px_20px_rgba(15,23,42,0.04)]

        ${
          hover
            ? `
              transition-all duration-300 ease-out
              hover:-translate-y-0.5
              hover:border-emerald-200
              hover:shadow-[0_14px_35px_rgba(16,185,129,0.10)]
            `
            : ""
        }

        dark:border-slate-800
        dark:bg-[#10231d]
        dark:shadow-none
        dark:hover:border-emerald-900

        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

export function AdminStatCard({
  title,
  value,
  description,
  href,
  icon: Icon,
  image,
  theme = "green",
  loading = false,
}) {
  const themes = {
    green: {
      card: "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/70 dark:border-emerald-900/60 dark:from-[#10231d] dark:to-[#0d211a]",
      icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
      glow: "bg-emerald-300/20",
      arrow: "text-emerald-600",
    },

    blue: {
      card: "border-sky-100 bg-gradient-to-br from-white to-sky-50/70 dark:border-sky-900/60 dark:from-[#10231d] dark:to-[#0d1e21]",
      icon: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
      glow: "bg-sky-300/20",
      arrow: "text-sky-600",
    },

    purple: {
      card: "border-violet-100 bg-gradient-to-br from-white to-violet-50/70 dark:border-violet-900/60 dark:from-[#10231d] dark:to-[#171326]",
      icon: "bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300",
      glow: "bg-violet-300/20",
      arrow: "text-violet-600",
    },

    orange: {
      card: "border-orange-100 bg-gradient-to-br from-white to-orange-50/70 dark:border-orange-900/60 dark:from-[#10231d] dark:to-[#21170f]",
      icon: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300",
      glow: "bg-orange-300/20",
      arrow: "text-orange-600",
    },

    cyan: {
      card: "border-cyan-100 bg-gradient-to-br from-white to-cyan-50/70 dark:border-cyan-900/60 dark:from-[#10231d] dark:to-[#0c2021]",
      icon: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300",
      glow: "bg-cyan-300/20",
      arrow: "text-cyan-600",
    },

    rose: {
      card: "border-rose-100 bg-gradient-to-br from-white to-rose-50/70 dark:border-rose-900/60 dark:from-[#10231d] dark:to-[#211217]",
      icon: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
      glow: "bg-rose-300/20",
      arrow: "text-rose-600",
    },
  };

  const currentTheme = themes[theme] || themes.green;

  return (
    <Link href={href} className="group block">
      <div
        className={`
          relative min-h-[150px]
          overflow-hidden rounded-2xl
          border
          p-4 sm:p-5

          shadow-[0_3px_16px_rgba(15,23,42,0.035)]

          transition-all duration-300 ease-out
          hover:-translate-y-1
          hover:shadow-[0_15px_35px_rgba(15,23,42,0.09)]

          dark:shadow-none

          ${currentTheme.card}
        `}
      >
        {/* Decorative glow */}
        <div
          className={`
            pointer-events-none
            absolute -right-10 -top-10
            h-28 w-28 rounded-full
            blur-3xl
            opacity-50
            transition-all duration-500
            group-hover:scale-125
            ${currentTheme.glow}
          `}
        />

        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div
              className={`
                flex h-11 w-11
                shrink-0
                items-center justify-center
                rounded-full
                transition-all duration-300
                group-hover:scale-110
                ${currentTheme.icon}
              `}
            >
              <Icon className="h-5 w-5" />
            </div>

            <ArrowUpRight
              className={`
                h-4 w-4
                transition-all duration-300
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
                ${currentTheme.arrow}
              `}
            />
          </div>

          <div className="mt-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>

            <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {loading ? "—" : value}
            </p>

            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-500">
              {description}
            </p>
          </div>

          {image && (
            <div
              className="
                absolute bottom-4 right-4
                h-14 w-16
                overflow-hidden
                rounded-xl
                border border-white/70
                shadow-sm
                transition-transform duration-300
                group-hover:scale-105
                dark:border-slate-700
              "
            >
              <img src={image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   QUICK ACTION
========================================================= */

export function AdminQuickAction({ title, href, icon: Icon, theme = "green" }) {
  const themes = {
    green:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
    purple:
      "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
    orange:
      "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  };

  return (
    <Link href={href} className="group block">
      <div
        className="
          rounded-xl
          border border-slate-200
          bg-white
          p-3
          transition-all duration-300

          hover:-translate-y-0.5
          hover:border-emerald-200
          hover:shadow-[0_10px_25px_rgba(16,185,129,0.09)]

          dark:border-slate-800
          dark:bg-[#10231d]
          dark:hover:border-emerald-900
        "
      >
        <div
          className={`
            flex h-9 w-9
            items-center justify-center
            rounded-full
            transition-transform duration-300
            group-hover:scale-110
            ${themes[theme] || themes.green}
          `}
        >
          <Icon className="h-4 w-4" />
        </div>

        <p className="mt-3 text-xs font-medium text-slate-700 dark:text-slate-300">
          {title}
        </p>

        <div className="mt-2 flex justify-end">
          <ArrowRight
            className="
              h-3.5 w-3.5
              text-slate-400
              transition-all duration-300
              group-hover:translate-x-1
              group-hover:text-emerald-600
            "
          />
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

export function AdminSectionHeader({ title, description, icon: Icon, action }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <div
            className="
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-full
              bg-emerald-50
              text-emerald-600

              dark:bg-emerald-950/50
              dark:text-emerald-400
            "
          >
            <Icon className="h-4 w-4" />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

/* =========================================================
   SIMPLE PANEL
========================================================= */

export function AdminPanel({ children, className = "" }) {
  return (
    <AdminCard hover={false} className={`p-4 sm:p-5 ${className}`}>
      {children}
    </AdminCard>
  );
}
