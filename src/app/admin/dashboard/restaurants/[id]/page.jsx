"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import RestaurantForm from "@/components/admin/RestaurantForm";
import { adminApi } from "@/utils/adminApi";

export default function RestaurantEditPage() {
  const { id } = useParams();
  const router = useRouter();

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

        const [restaurantResponse, destinationResponse] =
          await Promise.all([
            adminApi.get(
              `/api/dashboard/restaurants/${id}`,
            ),
            adminApi.get("/api/dashboard/destinations"),
          ]);

        setRestaurant(restaurantResponse?.data || null);
        setDestinations(destinationResponse?.data || []);
      } catch (loadError) {
        console.error(loadError);

        setError(
          loadError?.message || "Failed to load restaurant",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-emerald-50/30">
        <div className="flex flex-col items-center">
          <LoaderCircle
            size={30}
            className="animate-spin text-emerald-600"
          />

          <p className="mt-3 text-sm font-medium text-slate-500">
            Loading restaurant...
          </p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-emerald-50/30 p-6">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <h2 className="font-bold text-slate-900">
            Unable to load restaurant
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "Restaurant not found"}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/admin/dashboard/restaurants")
            }
            className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Back to Restaurants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-emerald-50/30 p-4 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl">
        <RestaurantForm
          initialValues={restaurant}
          destinations={destinations}
          mode="edit"
          onSuccess={() =>
            router.push("/admin/dashboard/restaurants")
          }
          onCancel={() =>
            router.push("/admin/dashboard/restaurants")
          }
        />
      </div>
    </div>
  );
}