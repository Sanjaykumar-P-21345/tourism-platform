"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
  CalendarDays,
  MapPin,
  Star,
} from "lucide-react";

import AdminButton from "@/components/admin/AdminButton";
import { adminApi } from "@/utils/adminApi";

export default function ItinerariesPage() {
  const [itineraries, setItineraries] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);

  const [deleteItem, setDeleteItem] = useState(null);

  const [deleting, setDeleting] = useState(false);

  async function loadItineraries() {
    setLoading(true);
    setError("");

    try {
      const response = await adminApi.get("/api/dashboard/itineraries");

      setItineraries(response?.data || []);
    } catch (error) {
      setError(
        error?.data?.message || error?.message || "Failed to load itineraries.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItineraries();
  }, []);

  async function handleDelete() {
    if (!deleteItem?._id) return;

    setDeleting(true);

    try {
      await adminApi.delete(`/api/dashboard/itineraries/${deleteItem._id}`);

      setDeleteItem(null);

      await loadItineraries();
    } catch (error) {
      setError(
        error?.data?.message ||
          error?.message ||
          "Failed to deactivate itinerary.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function closeViewModal() {
    setSelectedItem(null);
  }

  return (
    <div className="min-h-full">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Itineraries
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your travel itineraries.
          </p>
        </div>

        <Link href="/admin/dashboard/itineraries/create">
          <AdminButton>
            <span className="inline-flex items-center gap-2">
              <Plus size={17} />
              Create Itinerary
            </span>
          </AdminButton>
        </Link>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 size={20} className="animate-spin" />
              Loading itineraries...
            </div>
          </div>
        ) : itineraries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CalendarDays
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-600"
            />

            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
              No itineraries found
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create your first itinerary to get started.
            </p>

            <Link
              href="/admin/dashboard/itineraries/create"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <Plus size={17} />
              Create Itinerary
            </Link>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60">
                  <tr>
                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Itinerary
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Destination
                    </th>

                    <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                      Duration
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
                  {itineraries.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                    >
                      {/* ITINERARY */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                            {item.coverImage?.url ? (
                              <img
                                src={item.coverImage.url}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-slate-400">
                                <CalendarDays size={20} />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-semibold text-slate-900 dark:text-white">
                                {item.title || "-"}
                              </p>

                              {item.isFeatured && (
                                <Star
                                  size={14}
                                  className="shrink-0 text-amber-500"
                                  fill="currentColor"
                                />
                              )}
                            </div>

                            <p className="mt-0.5 max-w-[280px] truncate text-xs text-slate-500 dark:text-slate-400">
                              /{item.slug}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* DESTINATION */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <MapPin size={15} className="text-slate-400" />

                          {item.destination?.name || "-"}
                        </div>
                      </td>

                      {/* DURATION */}
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.duration?.days ?? 0}D /{" "}
                          {item.duration?.nights ?? 0}N
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col items-start gap-1.5">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              item.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </span>

                          {item.isFeatured && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
                            title="View"
                          >
                            <Eye size={17} />
                          </button>

                          <Link
                            href={`/admin/dashboard/itineraries/${item._id}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </Link>

                          {item.isActive && (
                            <button
                              type="button"
                              onClick={() => setDeleteItem(item)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                              title="Deactivate"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE/TABLET CARDS */}
            <div className="divide-y divide-slate-200 lg:hidden dark:divide-slate-800">
              {itineraries.map((item) => (
                <div key={item._id} className="p-4 sm:p-5">
                  <div className="flex gap-4">
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {item.coverImage?.url ? (
                        <img
                          src={item.coverImage.url}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">
                          <CalendarDays size={22} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="truncate font-bold text-slate-900 dark:text-white">
                              {item.title || "-"}
                            </h3>

                            {item.isFeatured && (
                              <Star
                                size={14}
                                className="shrink-0 text-amber-500"
                                fill="currentColor"
                              />
                            )}
                          </div>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.destination?.name || "No destination"}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
                            item.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>{item.duration?.days} Days</span>

                        <span>{item.duration?.nights} Nights</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Eye size={15} />
                      View
                    </button>

                    <Link
                      href={`/admin/dashboard/itineraries/${item._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    >
                      <Pencil size={15} />
                      Edit
                    </Link>

                    {item.isActive && (
                      <button
                        type="button"
                        onClick={() => setDeleteItem(item)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 dark:border-red-900/50 dark:text-red-400"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* VIEW MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeViewModal}
          />

          <div className="relative flex min-h-full items-center justify-center p-3 sm:p-6">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Itinerary Details
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    View itinerary information
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeViewModal}
                  className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[80vh] overflow-y-auto p-5 sm:p-6">
                {selectedItem.coverImage?.url && (
                  <img
                    src={selectedItem.coverImage.url}
                    alt={selectedItem.title}
                    className="h-56 w-full rounded-2xl object-cover sm:h-72"
                  />
                )}

                <div className="mt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {selectedItem.title}
                    </h3>

                    {selectedItem.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                        <Star size={13} fill="currentColor" />
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} />
                      {selectedItem.destination?.name}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={15} />
                      {selectedItem.duration?.days} Days /{" "}
                      {selectedItem.duration?.nights} Nights
                    </span>
                  </div>

                  {selectedItem.description && (
                    <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {selectedItem.description}
                    </p>
                  )}

                  {/* BUDGET */}
                  {selectedItem.estimatedBudget && (
                    <div className="mt-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Estimated Budget
                      </p>

                      <p className="mt-1 font-bold text-slate-900 dark:text-white">
                        {selectedItem.estimatedBudget?.min ?? 0} -{" "}
                        {selectedItem.estimatedBudget?.max ?? 0}
                      </p>
                    </div>
                  )}

                  {/* DAYS */}
                  {Array.isArray(selectedItem.days) &&
                    selectedItem.days.length > 0 && (
                      <div className="mt-7">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          Daily Plan
                        </h4>

                        <div className="mt-4 space-y-4">
                          {selectedItem.days.map((day) => (
                            <div
                              key={day.dayNumber}
                              className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                            >
                              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                Day {day.dayNumber}
                              </p>

                              <h5 className="mt-1 font-bold text-slate-900 dark:text-white">
                                {day.title}
                              </h5>

                              {Array.isArray(day.activities) &&
                                day.activities.length > 0 && (
                                  <div className="mt-4 space-y-3">
                                    {day.activities.map((activity, index) => (
                                      <div
                                        key={index}
                                        className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"
                                      >
                                        <div className="flex flex-wrap gap-2">
                                          {activity.time && (
                                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                              {activity.time}
                                            </span>
                                          )}

                                          <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {activity.title}
                                          </span>
                                        </div>

                                        {activity.description && (
                                          <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
                                            {activity.description}
                                          </p>
                                        )}

                                        {activity.place?.name && (
                                          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            Place: {activity.place.name}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* GALLERY */}
                  {Array.isArray(selectedItem.gallery) &&
                    selectedItem.gallery.length > 0 && (
                      <div className="mt-7">
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                          Gallery
                        </h4>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {selectedItem.gallery.map((image, index) => (
                            <img
                              key={image.publicId || index}
                              src={image.url}
                              alt={`Gallery ${index + 1}`}
                              className="h-32 w-full rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={closeViewModal}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
                >
                  Close
                </button>

                <Link
                  href={`/admin/dashboard/itineraries/${selectedItem._id}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  <Pencil size={16} />
                  Edit
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteItem(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <Trash2 size={22} />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
              Deactivate itinerary?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              You are about to deactivate{" "}
              <strong className="text-slate-700 dark:text-slate-200">
                {deleteItem.title}
              </strong>
              . It will no longer be active, but the record will remain in the
              database.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteItem(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}

                {deleting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}