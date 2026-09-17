"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
   * IMPORTANT:
   *
   * /admin/login must NOT use the dashboard layout.
   *
   * Otherwise after logout the login page appears
   * inside the sidebar/header, exactly like your screenshot.
   */

  if (pathname === "/admin/login") {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* SIDEBAR */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN AREA */}
      <div className="min-h-screen lg:ml-64">
        {/* HEADER */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* CONTENT */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
