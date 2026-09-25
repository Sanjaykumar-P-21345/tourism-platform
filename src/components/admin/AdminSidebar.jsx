"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Building2,
  Utensils,
  Car,
  BriefcaseBusiness,
  Map,
  MessageSquare,
  X,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Destinations",
    href: "/admin/dashboard/destinations",
    icon: MapPin,
  },
  {
    label: "Places",
    href: "/admin/dashboard/places",
    icon: MapPin,
  },
  {
    label: "Hotels",
    href: "/admin/dashboard/hotels",
    icon: Building2,
  },
  {
    label: "Restaurants",
    href: "/admin/dashboard/restaurants",
    icon: Utensils,
  },
  {
    label: "Transportation",
    href: "/admin/dashboard/transportation",
    icon: Car,
  },
  {
    label: "Packages",
    href: "/admin/dashboard/packages",
    icon: BriefcaseBusiness,
  },
  {
    label: "Itineraries",
    href: "/admin/dashboard/itineraries",
    icon: Map,
  },
  {
    label: "Inquiries",
    href: "/admin/dashboard/inquiries",
    icon: MessageSquare,
  },
];

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        fixed
        inset-y-0
        left-0
        z-50
        flex
        w-[242px]
        flex-col
        overflow-hidden
        bg-[#063f32]
        text-white
        shadow-xl
        transition-transform
        duration-300
        ease-in-out
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }
      `}
    >
      {/* =================================================
          LOGO
      ================================================== */}

      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/10 px-4">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3"
          onClick={() => setSidebarOpen?.(false)}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#063f32]">
            <MapPin size={21} strokeWidth={2.2} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              SST Travels
            </p>

            <p className="mt-0.5 text-[10px] font-medium text-emerald-100/70">
              Tourism Management
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen?.(false)}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            text-white/70
            transition
            hover:bg-white/10
            hover:text-white
            lg:hidden
          "
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* =================================================
          NAVIGATION
      ================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        <p className="mb-3 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100/40">
          Main Menu
        </p>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/admin/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen?.(false)}
                className={`
                  group
                  flex
                  h-12
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  }
                `}
              >
                {/* ICON */}

                <span
                  className={`
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    ${
                      isActive
                        ? "bg-white/10"
                        : "bg-white/5 group-hover:bg-white/10"
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />
                </span>

                {/* LABEL */}

                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {item.label}
                </span>

                {/* ARROW */}

                <ChevronRight
                  size={16}
                  className={`
                    shrink-0
                    transition-transform
                    ${
                      isActive
                        ? "text-white"
                        : "text-white/30 group-hover:text-white/60"
                    }
                  `}
                />
              </Link>
            );
          })}
        </nav>
      </div>

      {/* =================================================
          SIDEBAR FOOTER
      ================================================== */}

      <div className="shrink-0 p-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
              <Map
                size={17}
                className="text-emerald-300"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                Tourism Dashboard
              </p>

              <p className="truncate text-[10px] text-white/45">
                Manage your travel content
              </p>
            </div>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-3/4 rounded-full bg-emerald-400" />
          </div>
        </div>
      </div>
    </aside>
  );
}