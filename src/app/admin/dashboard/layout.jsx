"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import AdminSidebar from "@/components/admin/AdminSidebar";

import { apiGet, clearAuthData, getToken } from "@/utils/api";

export default function AdminDashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdmin() {
      try {
        setCheckingAuth(true);

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
  }, [router, pathname]);

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle
            size={32}
            className="animate-spin text-indigo-400"
          />

          <p className="text-sm text-slate-400">
            Verifying administrator access...
          </p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <LoaderCircle
          size={28}
          className="animate-spin text-indigo-400"
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {/* SIDEBAR */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN CONTENT */}
      <main className="min-w-0 flex-1 p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}