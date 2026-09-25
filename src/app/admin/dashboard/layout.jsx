"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

import { apiGet, clearAuthData, getToken } from "@/utils/api";

const SIDEBAR_WIDTH = 242;

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* =====================================================
     ADMIN AUTHENTICATION
  ====================================================== */

  useEffect(() => {
    let isMounted = true;

    async function verifyAdmin() {
      try {
        const token = getToken();

        if (!token) {
          router.replace("/admin/login");
          return;
        }

        const response = await apiGet("/api/admin/me");

        const admin = response?.user;

        if (!admin || admin.status !== "active") {
          clearAuthData();
          router.replace("/admin/login");
          return;
        }

        if (isMounted) {
          setAuthorized(true);
        }
      } catch (error) {
        console.error("Admin verification failed:", error);

        clearAuthData();
        router.replace("/admin/login");
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
        }
      }
    }

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  /* =====================================================
     AUTH LOADING
  ====================================================== */

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f8f6]">
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 shadow-sm">
            <LoaderCircle size={30} className="animate-spin text-emerald-600" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-700">
            Verifying administrator access...
          </p>

          <p className="mt-1 text-xs text-slate-400">Please wait</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     UNAUTHORIZED / REDIRECTING
  ====================================================== */

  if (!authorized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f5f8f6]">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
          <LoaderCircle size={28} className="animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  /* =====================================================
     ADMIN DASHBOARD
  ====================================================== */

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f8f6]">
      {/* =================================================
          SIDEBAR
          
          Fixed on desktop.
          Drawer on mobile.
      ================================================== */}

      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* =================================================
          MAIN DESKTOP AREA

          IMPORTANT:
          Use margin-left instead of padding-left.

          This guarantees that page content starts AFTER
          the fixed sidebar and can never slide underneath it.
      ================================================== */}

      <div
        className="
          min-h-screen
          w-full
          min-w-0
          bg-[#f5f8f6]
          lg:ml-[242px]
          lg:w-[calc(100%-242px)]
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="sticky top-0 z-40 w-full">
          <AdminHeader
            onMenuClick={() => {
              setSidebarOpen(true);
            }}
          />
        </div>

        {/* =================================================
            PAGE CONTENT

            No sidebar padding here.
            No extra margin here.
        ================================================== */}

        <main
          className="
            min-h-[calc(100vh-64px)]
            w-full
            min-w-0
            bg-[#f5f8f6]
          "
        >
          {children}
        </main>
      </div>

      {/* =================================================
          MOBILE SIDEBAR BACKDROP

          The AdminSidebar can also provide its own backdrop.
          This layer is intentionally only useful when the
          sidebar is opened on mobile.
      ================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="
            fixed
            inset-0
            z-40
            bg-slate-950/40
            backdrop-blur-[1px]
            lg:hidden
          "
        />
      )}
    </div>
  );
}
