"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2, Plus, Loader2 } from "lucide-react";

import { adminApi } from "@/utils/adminApi";

export default function TransportationPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function loadItems() {
    try {
      setLoading(true);

      const response = await adminApi.get("/api/dashboard/transportation");

      setItems(response.data || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm("Deactivate this transportation entry?");

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await adminApi.delete(`/api/dashboard/transportation/${id}`);

      await loadItems();
    } catch (error) {
      alert(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  function formatType(type) {
    const labels = {
      flight: "Flight",
      train: "Train",
      bus: "Bus",
      taxi: "Taxi",
      "car-rental": "Car Rental",
      "bike-rental": "Bike Rental",
    };

    return labels[type] || type || "-";
  }

  function formatCost(cost) {
    if (!cost) return "-";

    const min = cost.min;
    const max = cost.max;

    if (min !== undefined && max !== undefined) {
      return `${min} - ${max}`;
    }

    if (min !== undefined) {
      return `${min}+`;
    }

    if (max !== undefined) {
      return `Up to ${max}`;
    }

    return "-";
  }

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Transportation
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage transportation options for your tourism platform.
            </p>
          </div>

          <Link
            href="/admin/dashboard/transportation/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Transportation
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Image
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Provider
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Type
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Destination
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Route
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Cost
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-700 dark:text-slate-200">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-semibold text-slate-700 dark:text-slate-200">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="px-5 py-16 text-center text-slate-500 dark:text-slate-400"
                      >
                        No transportation entries found.
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60"
                      >
                        {/* Image */}
                        <td className="px-5 py-4">
                          {item.coverImage?.url ? (
                            <img
                              src={item.coverImage.url}
                              alt={item.providerName}
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                              No image
                            </div>
                          )}
                        </td>

                        {/* Provider */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {item.providerName || "-"}
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                            {formatType(item.type)}
                          </span>
                        </td>

                        {/* Destination */}
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {item.destination?.name || "-"}
                        </td>

                        {/* Route */}
                        <td className="px-5 py-4">
                          <div className="text-slate-900 dark:text-white">
                            {item.from || "-"}
                          </div>

                          <div className="text-xs text-slate-400">
                            ↓ {item.to || "-"}
                          </div>
                        </td>

                        {/* Cost */}
                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {formatCost(item.estimatedCost)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          {item.isActive ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-300">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {/* View */}
                            <Link
                              href={`/admin/dashboard/transportation/${item._id}?view=true`}
                              title="View"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/admin/dashboard/transportation/${item._id}`}
                              title="Edit"
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-400"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>

                            {/* Delete */}
                            {item.isActive && (
                              <button
                                type="button"
                                title="Deactivate"
                                disabled={deletingId === item._id}
                                onClick={() => handleDelete(item._id)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                              >
                                {deletingId === item._id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}