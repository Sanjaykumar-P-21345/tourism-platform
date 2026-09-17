"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import RestaurantForm from "@/components/admin/RestaurantForm";
import { adminApi } from "@/utils/adminApi";

export default function CreateRestaurantPage() {
  const router = useRouter();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await adminApi.get("/api/dashboard/destinations");

        setDestinations(response.data || []);
      } catch (error) {
        console.error(error);
        alert(error.message || "Failed to load destinations");
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  return (
    <div className="min-h-full bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/restaurants")}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Create Restaurant
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add a new restaurant to your tourism platform.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading destinations...
            </div>
          </div>
        ) : (
          <RestaurantForm destinations={destinations} mode="create" />
        )}
      </div>
    </div>
  );
}