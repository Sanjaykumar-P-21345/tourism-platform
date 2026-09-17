"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AdminButton from "@/components/admin/AdminButton";
import { adminApi } from "@/utils/adminApi";

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] =
    useState(true);

  async function loadHotels() {
    try {
      setLoading(true);

      const response =
        await adminApi.get(
          "/api/dashboard/hotels"
        );

      setHotels(response?.data || []);
    } catch (error) {
      alert(
        error?.message ||
          "Failed to load hotels."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  async function handleDelete(id) {
    if (
      !confirm(
        "Deactivate this hotel?"
      )
    ) {
      return;
    }

    try {
      await adminApi.delete(
        `/api/dashboard/hotels/${id}`
      );

      await loadHotels();
    } catch (error) {
      alert(
        error?.message ||
          "Failed to deactivate hotel."
      );
    }
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Hotels
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage hotels and accommodations.
          </p>
        </div>

        <Link href="/admin/dashboard/hotels/create">
          <AdminButton>
            Create Hotel
          </AdminButton>
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-6">
            Loading...
          </div>
        ) : (
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
                  Price
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
              {hotels.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    No hotels found.
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr
                    key={hotel._id}
                    className="border-b last:border-b-0"
                  >
                    {/* IMAGE */}
                    <td className="px-5 py-4">
                      {hotel.coverImage?.url ? (
                        <img
                          src={
                            hotel.coverImage.url
                          }
                          alt={
                            hotel.name ||
                            "Hotel"
                          }
                          className="h-14 w-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                          No image
                        </div>
                      )}
                    </td>

                    {/* NAME */}
                    <td className="px-5 py-4 font-medium">
                      {hotel.name || "-"}
                    </td>

                    {/* DESTINATION */}
                    <td className="px-5 py-4">
                      {hotel.destination
                        ?.name || "-"}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-5 py-4 capitalize">
                      {hotel.category || "-"}
                    </td>

                    {/* PRICE */}
                    <td className="px-5 py-4">
                      {hotel.pricePerNight
                        ?.min ?? "-"}{" "}
                      -{" "}
                      {hotel.pricePerNight
                        ?.max ?? "-"}
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      {hotel.isActive ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/dashboard/hotels/${hotel._id}?view=true`}
                          title="View hotel"
                        >
                          <AdminButton variant="secondary">
                            View
                          </AdminButton>
                        </Link>

                        <Link
                          href={`/admin/dashboard/hotels/${hotel._id}`}
                          title="Edit hotel"
                        >
                          <AdminButton variant="secondary">
                            Edit
                          </AdminButton>
                        </Link>

                        {hotel.isActive && (
                          <AdminButton
                            variant="danger"
                            onClick={() =>
                              handleDelete(
                                hotel._id
                              )
                            }
                          >
                            Delete
                          </AdminButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}