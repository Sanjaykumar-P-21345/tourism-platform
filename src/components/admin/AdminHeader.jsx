"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Bell, LogOut } from "lucide-react";

import { getUser, logout } from "@/utils/api";

export default function AdminHeader({ onMenuClick }) {
  /*
   * Keep the initial render identical on server and client.
   * User information is loaded only after hydration.
   */
  const [userName, setUserName] = useState("Administrator");
  const [userRole, setUserRole] = useState("Admin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const storedUser = getUser();

    if (storedUser) {
      const name =
        storedUser.name ||
        storedUser.fullName ||
        storedUser.username ||
        storedUser.email ||
        "Administrator";

      const role =
        storedUser.role === "admin" ? "Admin" : storedUser.role || "Admin";

      setUserName(name);
      setUserRole(role);
    }
  }, []);

  const avatarLetter = mounted ? userName.charAt(0).toUpperCase() : "A";

  return (
    <header className="relative z-30 m-0 h-16 w-full border-b border-slate-200 bg-white p-0 shadow-sm">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            LEFT SIDE
        ====================================================== */}

        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          {/* <div className="hidden md:flex">
            <button
              type="button"
              className="flex h-10 w-[390px] max-w-[42vw] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-left transition-all duration-200 hover:border-emerald-200 hover:bg-white hover:shadow-sm"
            >
              <Search className="h-4 w-4 shrink-0 text-slate-400" />

              <span className="flex-1 truncate text-sm text-slate-400">
                Search dashboard...
              </span>

              <span className="shrink-0 rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-400">
                Ctrl + K
              </span>
            </button>
          </div> */}
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Mobile search */}
          <button
            type="button"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 md:hidden"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notifications */}
          {/* <button
            type="button"
            aria-label="Notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Bell className="h-[18px] w-[18px]" />

            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white shadow-sm">
              3
            </span>
          </button> */}

          {/* Divider */}
          <div className="mx-1 hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Admin */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700 shadow-sm">
              {avatarLetter}
            </div>

            <div className="hidden min-w-0 sm:block">
              <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
                {userName}
              </p>

              <p className="text-[11px] text-slate-400">{userRole}</p>
            </div>

            <button
              type="button"
              onClick={logout}
              aria-label="Logout"
              title="Logout"
              className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
