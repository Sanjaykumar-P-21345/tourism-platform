"use client";

import { useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#f5f8f6]">
      {/* Sidebar */}
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main application area */}
      <div className="min-h-screen w-full lg:pl-[270px]">
        {/* Header */}
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="m-0 min-h-[calc(100vh-64px)] w-full bg-[#f5f8f6] p-0">
          {children}
        </main>
      </div>
    </div>
  );
}