"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, LogOut, UserCircle, Loader2 } from "lucide-react";

import { getUser, clearAuthData } from "@/utils/api";

export default function AdminHeader({ onMenuClick }) {
  const router = useRouter();

  // IMPORTANT:
  // Keep the initial value static so server and client render
  // exactly the same HTML during hydration.
  const [admin, setAdmin] = useState({
    name: "Administrator",
    email: "",
    role: "Admin",
  });

  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const storedUser = getUser();

    if (!storedUser) {
      return;
    }

    setAdmin({
      name:
        storedUser.name ||
        storedUser.fullName ||
        storedUser.username ||
        storedUser.email ||
        "Administrator",

      email: storedUser.email || "",

      role: storedUser.role === "admin" ? "Admin" : storedUser.role || "Admin",
    });
  }, []);

  const handleLogout = () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    /*
     * Your authentication uses:
     *
     * sessionStorage.token
     * sessionStorage.user
     *
     * Therefore clearAuthData() is enough.
     *
     * We intentionally DO NOT call:
     * /api/admin/logout
     *
     * because that endpoint is not required for your
     * current Bearer-token/sessionStorage authentication.
     */

    clearAuthData();

    // Go directly to login.
    router.replace("/admin/login");
  };

  const adminName = admin.name || "Administrator";
  const adminEmail = admin.email || "Admin";

  const initial = adminName.charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        {/* LEFT SIDE */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile menu */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-900 dark:text-white sm:text-lg">
              Tourism Management
            </h1>

            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Admin information */}
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {adminName}
            </p>

            <p className="max-w-[180px] truncate text-xs text-slate-500 dark:text-slate-400">
              {adminEmail}
            </p>
          </div>

          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            {initial || <UserCircle size={20} />}
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Logout"
            className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            {loggingOut ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <LogOut size={17} />
            )}

            <span className="hidden md:inline">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
