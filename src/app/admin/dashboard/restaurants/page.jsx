"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, Plus, Loader2, Utensils } from "lucide-react";

import { adminApi } from "@/utils/adminApi";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);

  const [loading, setLoading] = useState(true);

  async function loadRestaurants() {
    try {
      setLoading(true);

      const response = await adminApi.get("/api/dashboard/restaurants");

      setRestaurants(response.data || []);
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this restaurant?",
    );

    if (!confirmed) return;

    try {
      await adminApi.delete(`/api/dashboard/restaurants/${id}`);

      await loadRestaurants();
    } catch (error) {
      console.error(error);

      alert(error.message || "Failed to deactivate restaurant");
    }
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 dark:bg-slate-950 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Restaurants
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage restaurants and dining information.
            </p>
          </div>

          <Link
            href="/admin/dashboard/restaurants/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Restaurant
          </Link>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading restaurants...
              </div>
            </div>
          ) : restaurants.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
                <Utensils className="h-8 w-8 text-slate-400" />
              </div>

              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                No restaurants found
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Create your first restaurant to get started.
              </p>

              <Link
                href="/admin/dashboard/restaurants/create"
                className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Create Restaurant
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Restaurant
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Destination
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Food
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Price
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr
                      key={restaurant._id}
                      className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      {/* RESTAURANT */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                            {restaurant.coverImage?.url ? (
                              <img
                                src={restaurant.coverImage.url}
                                alt={restaurant.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Utensils className="h-5 w-5 text-slate-400" />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {restaurant.name}
                            </p>

                            {restaurant.isFeatured && (
                              <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* DESTINATION */}
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {restaurant.destination?.name || "-"}
                      </td>

                      {/* FOOD */}
                      <td className="px-5 py-4">
                        <span className="capitalize text-slate-600 dark:text-slate-300">
                          {restaurant.foodType || "-"}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="px-5 py-4">
                        <span className="capitalize text-slate-600 dark:text-slate-300">
                          {restaurant.priceRange || "-"}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        {restaurant.isActive ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {/* VIEW */}
                          <Link
                            href={`/admin/dashboard/restaurants/${restaurant._id}?view=true`}
                            title="View restaurant"
                            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {/* EDIT */}
                          <Link
                            href={`/admin/dashboard/restaurants/${restaurant._id}`}
                            title="Edit restaurant"
                            className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-900 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          {/* DELETE */}
                          {restaurant.isActive && (
                            <button
                              type="button"
                              title="Deactivate restaurant"
                              onClick={() => handleDelete(restaurant._id)}
                              className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}