"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X, Loader2, AlertCircle } from "lucide-react";

import RestaurantForm from "@/components/admin/RestaurantForm";
import { adminApi } from "@/utils/adminApi";

export default function RestaurantDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isViewMode = searchParams.get("view") === "true";

  const [restaurant, setRestaurant] = useState(null);

  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [restaurantResponse, destinationResponse] = await Promise.all([
          adminApi.get(`/api/dashboard/restaurants/${id}`),
          adminApi.get("/api/dashboard/destinations"),
        ]);

        setRestaurant(restaurantResponse.data);

        setDestinations(destinationResponse.data || []);
      } catch (loadError) {
        console.error(loadError);

        setError(loadError?.message || "Failed to load restaurant");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function closeModal() {
    router.push("/admin/dashboard/restaurants");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={closeModal}
        className="absolute inset-0 cursor-default bg-slate-950/60 backdrop-blur-sm"
      />

      {/* MODAL */}
      <div className="relative z-10 flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        {/* MODAL HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
              {isViewMode ? "Restaurant Details" : "Edit Restaurant"}
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              {isViewMode
                ? "View restaurant information"
                : "Update restaurant information"}
            </p>
          </div>

          <button
            type="button"
            onClick={closeModal}
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading restaurant...
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[400px] items-center justify-center p-6">
              <div className="max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
                <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />

                <h2 className="font-semibold text-red-700 dark:text-red-300">
                  Unable to load restaurant
                </h2>

                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : restaurant ? (
            <div className="p-4 sm:p-6">
              <RestaurantForm
                initialValues={restaurant}
                destinations={destinations}
                mode={isViewMode ? "view" : "edit"}
                readOnly={isViewMode}
                onClose={closeModal}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}