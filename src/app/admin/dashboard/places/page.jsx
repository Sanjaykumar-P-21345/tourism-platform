"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import AdminButton from "@/components/admin/AdminButton";
import { adminApi } from "@/utils/adminApi";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadPlaces() {
    try {
      setLoading(true);

      const response = await adminApi.get(
        "/api/dashboard/places"
      );

      setPlaces(response.data || []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlaces();
  }, []);

  async function handleDelete(id) {
    if (!confirm("Deactivate this place?")) {
      return;
    }

    try {
      await adminApi.delete(
        `/api/dashboard/places/${id}`
      );

      await loadPlaces();
    } catch (error) {
      alert(error.message);
    }
  }

  function getImageUrl(place) {
    if (typeof place?.coverImage === "string") {
      return place.coverImage;
    }

    return place?.coverImage?.url || "";
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Places
          </h1>

          <p className="text-sm text-gray-500">
            Manage places to visit.
          </p>
        </div>

        <Link href="/admin/dashboard/places/create">
          <AdminButton>
            <Plus size={18} />
            Create Place
          </AdminButton>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">
            Loading places...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-5 py-4 text-left">
                    Image
                  </th>

                  <th className="px-5 py-4 text-left">
                    Name
                  </th>

                  <th className="px-5 py-4 text-left">
                    Destination
                  </th>

                  <th className="px-5 py-4 text-left">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left">
                    Status
                  </th>

                  <th className="px-5 py-4 text-left">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {places.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-5 py-10 text-center text-gray-500"
                    >
                      No places found.
                    </td>
                  </tr>
                ) : (
                  places.map((place) => {
                    const imageUrl =
                      getImageUrl(place);

                    return (
                      <tr
                        key={place._id}
                        className="border-b last:border-b-0"
                      >
                        {/* Image */}
                        <td className="px-5 py-4">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={place.name || "Place"}
                              className="h-14 w-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </td>

                        {/* Name */}
                        <td className="px-5 py-4 font-medium">
                          {place.name || "-"}
                        </td>

                        {/* Destination */}
                        <td className="px-5 py-4">
                          {place.destination?.name ||
                            "-"}
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4 capitalize">
                          {place.category || "-"}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              place.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {place.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* View */}
                            <Link
                              href={`/admin/dashboard/places/${place._id}?view=true`}
                            >
                              <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                                title="View place"
                              >
                                <Eye size={17} />
                              </button>
                            </Link>

                            {/* Edit */}
                            <Link
                              href={`/admin/dashboard/places/${place._id}`}
                            >
                              <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                                title="Edit place"
                              >
                                <Pencil size={17} />
                              </button>
                            </Link>

                            {/* Delete */}
                            {place.isActive && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    place._id
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                                title="Deactivate place"
                              >
                                <Trash2 size={17} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}