"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { adminApi } from "@/utils/adminApi";

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDestinations() {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/api/dashboard/destinations");

      console.log("DESTINATIONS API RESPONSE:", response);

      let destinationData = [];

      if (Array.isArray(response)) {
        destinationData = response;
      } else if (Array.isArray(response?.destinations)) {
        destinationData = response.destinations;
      } else if (Array.isArray(response?.data)) {
        destinationData = response.data;
      } else if (Array.isArray(response?.data?.destinations)) {
        destinationData = response.data.destinations;
      }

      console.log("DESTINATIONS EXTRACTED:", destinationData);

      setDestinations(destinationData);
    } catch (error) {
      console.error("LOAD DESTINATIONS ERROR:", error);

      setError(
        error?.data?.message ||
          error?.message ||
          "Failed to load destinations.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDestinations();
  }, []);

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this destination?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await adminApi.delete(`/api/dashboard/destinations/${id}`);

      await loadDestinations();
    } catch (error) {
      console.error("DELETE DESTINATION ERROR:", error);

      alert(
        error?.data?.message ||
          error?.message ||
          "Failed to deactivate destination.",
      );
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Destinations</h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage tourism destinations.
          </p>
        </div>

        <Link
          href="/admin/dashboard/destinations/create"
          className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          Create Destination
        </Link>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* EMPTY */}

      {destinations.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
            🌍
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            No destinations found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            There are currently no destinations returned by the API.
          </p>

          <Link
            href="/admin/dashboard/destinations/create"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Create Destination
          </Link>
        </div>
      ) : (
        /* TABLE */

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Image
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Country
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {destinations.map((destination) => {
                  /*
                   * NEW CLOUDINARY STRUCTURE
                   *
                   * coverImage:
                   * {
                   *   url: "...",
                   *   publicId: "..."
                   * }
                   */

                  const imageUrl =
                    typeof destination.coverImage === "string"
                      ? destination.coverImage
                      : destination.coverImage?.url || "";

                  return (
                    <tr key={destination._id} className="hover:bg-slate-50">
                      {/* IMAGE */}

                      <td className="px-6 py-4">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={destination.name || "Destination"}
                            className="h-16 w-24 rounded-lg object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";

                              if (event.currentTarget.nextElementSibling) {
                                event.currentTarget.nextElementSibling.style.display =
                                  "flex";
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className={
                            imageUrl
                              ? "hidden h-16 w-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400"
                              : "flex h-16 w-24 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400"
                          }
                        >
                          No image
                        </div>
                      </td>

                      {/* NAME */}

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {destination.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {destination.slug}
                        </p>
                      </td>

                      {/* TYPE */}

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium capitalize text-indigo-700">
                          {destination.type}
                        </span>
                      </td>

                      {/* COUNTRY */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {destination.country}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        {destination.isActive !== false ? (
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          {/* VIEW */}

                          <Link
                            href={`/admin/dashboard/destinations/${destination._id}?view=true`}
                            title="View destination"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
                          >
                            <Eye size={17} />
                          </Link>

                          {/* EDIT */}

                          <Link
                            href={`/admin/dashboard/destinations/${destination._id}`}
                            title="Edit destination"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
                          >
                            <Pencil size={17} />
                          </Link>

                          {/* DEACTIVATE */}

                          {destination.isActive !== false && (
                            <button
                              type="button"
                              onClick={() => handleDelete(destination._id)}
                              title="Deactivate destination"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
