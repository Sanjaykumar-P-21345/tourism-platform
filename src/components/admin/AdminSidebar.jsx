"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Globe2,
  MapPin,
  Hotel,
  Utensils,
  Car,
  BriefcaseBusiness,
  Map,
  X,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Destinations",
    href: "/admin/dashboard/destinations",
    icon: Globe2,
  },
  {
    name: "Places",
    href: "/admin/dashboard/places",
    icon: MapPin,
  },
  {
    name: "Hotels",
    href: "/admin/dashboard/hotels",
    icon: Hotel,
  },
  {
    name: "Restaurants",
    href: "/admin/dashboard/restaurants",
    icon: Utensils,
  },
  {
    name: "Transportation",
    href: "/admin/dashboard/transportation",
    icon: Car,
  },
  {
    name: "Packages",
    href: "/admin/dashboard/packages",
    icon: BriefcaseBusiness,
  },
  {
    name: "Itineraries",
    href: "/admin/dashboard/itineraries",
    icon: Map,
  },
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50",
          "flex w-64 flex-col",
          "border-r border-slate-200",
          "bg-white",
          "text-slate-900",
          "shadow-sm",
          "transition-transform duration-300",
          "dark:border-slate-800",
          "dark:bg-slate-900",
          "dark:text-white",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* BRAND */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <Link
            href="/admin/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              T
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Tourism Admin
              </p>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Management Panel
              </p>
            </div>
          </Link>

          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Management
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={[
                    "flex items-center gap-3",
                    "rounded-lg",
                    "px-3 py-2.5",
                    "text-sm font-medium",
                    "transition",
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  ].join(" ")}
                >
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />

                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-slate-200 px-4 py-4 dark:border-slate-800">
          <p className="text-[10px] leading-4 text-slate-400 dark:text-slate-500">
            Tourism Management System
            <br />
            Administration Panel
          </p>
        </div>
      </aside>
    </>
  );
}