"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";

import RestaurantForm from "@/components/admin/RestaurantForm";
import { adminApi } from "@/utils/adminApi";

export default function CreateRestaurantPage() {
  const router = useRouter();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true);
        setError("");

        const response = await adminApi.get("/api/dashboard/destinations");

        setDestinations(response?.data || []);
      } catch (loadError) {
        console.error(loadError);

        setError(loadError?.message || "Failed to load destinations");
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  return (
    <div className="min-h-full bg-emerald-50/30 p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/restaurants")}
            className="rounded-xl border border-emerald-100 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-emerald-50 hover:text-emerald-600"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Add Restaurant
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Add a new restaurant to your tourism platform.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-emerald-100 bg-white">
            <div className="flex flex-col items-center">
              <LoaderCircle
                size={30}
                className="animate-spin text-emerald-600"
              />

              <p className="mt-3 text-sm font-medium text-slate-500">
                Loading destinations...
              </p>
            </div>
          </div>
        ) : (
          <RestaurantForm
            destinations={destinations}
            mode="create"
            onSuccess={() => router.push("/admin/dashboard/restaurants")}
            onCancel={() => router.push("/admin/dashboard/restaurants")}
          />
        )}
      </div>
    </div>
  );
}
