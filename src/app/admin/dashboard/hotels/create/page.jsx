"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

import HotelForm from "@/components/admin/HotelForm";
import { adminApi } from "@/utils/adminApi";

export default function CreateHotelPage() {
  const router = useRouter();

  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDestinations() {
      try {
        setLoading(true);
        setError("");

        const response = await adminApi.get("/api/dashboard/destinations");

        if (!mounted) return;

        const data = response?.data?.data ?? response?.data ?? [];

        setDestinations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load destinations:", error);

        if (mounted) {
          setError(
            error?.data?.message ||
              error?.message ||
              "Failed to load destinations.",
          );

          setDestinations([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-full bg-emerald-50/30">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-emerald-100 bg-white">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Loading destinations...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-emerald-50/30">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Building2 size={22} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Add Hotel
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Create a new hotel or accommodation.
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        ) : null}

        {/* FORM */}
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <HotelForm
            mode="create"
            destinations={destinations}
            onSuccess={() => {
              router.push("/admin/dashboard/hotels");
            }}
            onCancel={() => {
              router.push("/admin/dashboard/hotels");
            }}
          />
        </div>
      </div>
    </div>
  );
}