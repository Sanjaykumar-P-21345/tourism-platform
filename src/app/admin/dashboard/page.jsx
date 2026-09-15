"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { apiGet, logout } from "@/utils/api";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =========================================================
     LOAD AUTHENTICATED ADMIN
     ========================================================= */

  useEffect(() => {
    let isMounted = true;

    async function loadAdmin() {
      try {
        const token = sessionStorage.getItem("token");

        /* ---------------------------------------------------
           CHECK TOKEN
           --------------------------------------------------- */

        if (!token) {
          router.replace("/admin/login");
          return;
        }

        /* ---------------------------------------------------
           VERIFY TOKEN WITH SERVER
           --------------------------------------------------- */

        const response = await apiGet("/api/admin/me");

        if (!response?.success || !response?.user) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          router.replace("/admin/login");
          return;
        }

        if (isMounted) {
          setAdmin(response.user);

          /*
            Keep sessionStorage user data
            synchronized with the server.
          */
          sessionStorage.setItem("user", JSON.stringify(response.user));
        }
      } catch (error) {
        console.error("Failed to load admin:", error);

        if (!isMounted) {
          return;
        }

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        router.replace("/admin/login");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadAdmin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  /* =========================================================
     HANDLE LOGOUT
     ========================================================= */

  async function handleLogout() {
    try {
      const token = sessionStorage.getItem("token");

      /*
        Call logout API when a token exists.
      */
      if (token) {
        try {
          await apiGet("/api/admin/me");
        } catch (error) {
          console.log("Session verification before logout failed.");
        }
      }
    } finally {
      /*
        Since JWT is stored in sessionStorage,
        removing the token completes client logout.
      */
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      router.replace("/admin/login");
    }
  }

  /* =========================================================
     LOADING SCREEN
     ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-indigo-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
     ========================================================= */

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>

          <button
            onClick={() => router.replace("/admin/login")}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  /* =========================================================
     DASHBOARD
     ========================================================= */

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Tourism Admin</h1>

            <p className="text-xs text-slate-400">Administration Dashboard</p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
          >
            Logout
          </button>
        </div>
      </header>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* WELCOME */}

        <div className="mb-8">
          <p className="text-sm text-indigo-400">Welcome back</p>

          <h2 className="mt-1 text-3xl font-bold">
            {admin?.name || "Administrator"}
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your tourism platform from here.
          </p>
        </div>

        {/* ===================================================
            STATS
            =================================================== */}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* DESTINATIONS */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Destinations</p>

            <p className="mt-3 text-3xl font-bold">0</p>

            <p className="mt-2 text-xs text-slate-500">Tourism destinations</p>
          </div>

          {/* PLACES */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Places</p>

            <p className="mt-3 text-3xl font-bold">0</p>

            <p className="mt-2 text-xs text-slate-500">Tourist attractions</p>
          </div>

          {/* HOTELS */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Hotels</p>

            <p className="mt-3 text-3xl font-bold">0</p>

            <p className="mt-2 text-xs text-slate-500">Hotels and stays</p>
          </div>

          {/* INQUIRIES */}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">New Inquiries</p>

            <p className="mt-3 text-3xl font-bold">0</p>

            <p className="mt-2 text-xs text-slate-500">Visitor inquiries</p>
          </div>
        </div>

        {/* ===================================================
            ADMIN INFORMATION
            =================================================== */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Admin Account</h3>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Name</p>

              <p className="mt-1 text-sm text-slate-200">
                {admin?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Email</p>

              <p className="mt-1 text-sm text-slate-200">
                {admin?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Status</p>

              <p className="mt-1 text-sm font-medium text-emerald-400">
                {admin?.status || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Last Login</p>

              <p className="mt-1 text-sm text-slate-200">
                {admin?.lastLogin
                  ? new Date(admin.lastLogin).toLocaleString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
