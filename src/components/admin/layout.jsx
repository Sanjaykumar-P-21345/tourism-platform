import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      <AdminHeader />

      <main className="ml-64 min-h-screen pt-16">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}