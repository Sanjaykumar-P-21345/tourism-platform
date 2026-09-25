"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Eye,
  Pencil,
  Power,
  PowerOff,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import AdminButton from "@/components/admin/AdminButton";
import StatCard from "@/components/admin/StatCard";
import AdminModal from "@/components/admin/AdminModal";
import HotelForm from "@/components/admin/HotelForm";

import { adminApi } from "@/utils/adminApi";

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedHotel, setSelectedHotel] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadHotels() {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/api/dashboard/hotels");

      const data = response?.data?.data ?? response?.data ?? [];

      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load hotels:", error);

      setError(
        error?.data?.message || error?.message || "Failed to load hotels.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  function openViewModal(hotel) {
    setSelectedHotel(hotel);
    setModalType("view");
  }

  function openEditModal(hotel) {
    setSelectedHotel(hotel);
    setModalType("edit");
  }

  function openStatusModal(hotel) {
    setSelectedHotel(hotel);
    setModalType(hotel.isActive ? "deactivate" : "activate");
  }

  function openDeleteModal(hotel) {
    setSelectedHotel(hotel);
    setModalType("delete");
  }

  function closeModal() {
    if (actionLoading) return;

    setSelectedHotel(null);
    setModalType(null);
  }

  async function handleStatusChange() {
    if (!selectedHotel?._id) return;

    try {
      setActionLoading(true);

      const nextStatus = !selectedHotel.isActive;

      await adminApi.put(`/api/dashboard/hotels/${selectedHotel._id}`, {
        isActive: nextStatus,
      });

      closeModal();
      await loadHotels();
    } catch (error) {
      console.error("Failed to update hotel status:", error);

      setError(
        error?.data?.message ||
          error?.message ||
          "Failed to update hotel status.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDelete() {
    if (!selectedHotel?._id) return;

    try {
      setActionLoading(true);

      await adminApi.delete(`/api/dashboard/hotels/${selectedHotel._id}`);

      closeModal();
      await loadHotels();
    } catch (error) {
      console.error("Failed to delete hotel:", error);

      setError(
        error?.data?.message || error?.message || "Failed to delete hotel.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const totalHotels = hotels.length;

  const activeHotels = hotels.filter((hotel) => hotel.isActive).length;

  const featuredHotels = hotels.filter((hotel) => hotel.isFeatured).length;

  return (
    <div className="min-h-full bg-emerald-50/30">
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Building2 size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Hotels
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Manage hotels and accommodations.
              </p>
            </div>
          </div>

          <Link href="/admin/dashboard/hotels/create">
            <AdminButton>
              <Plus size={17} />
              Add Hotel
            </AdminButton>
          </Link>
        </div>

        {/* ERROR */}
        {error ? (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-xs font-semibold text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        ) : null}

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Hotels"
            value={totalHotels}
            description="All hotels in the system"
            icon={<Building2 size={18} />}
          />

          <StatCard
            title="Active Hotels"
            value={activeHotels}
            description="Currently available"
            icon={<Power size={18} />}
          />

          <StatCard
            title="Featured Hotels"
            value={featuredHotels}
            description="Marked as featured"
            icon={<Star size={18} />}
          />
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-sm">
              <thead>
                <tr className="border-b border-emerald-100 bg-emerald-50/60">
                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Hotel
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Destination
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Category
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Price / Night
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Rating
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          Loading hotels...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : hotels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          <Building2 size={22} />
                        </div>

                        <p className="mt-3 font-semibold text-slate-700">
                          No hotels found
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Add your first hotel to get started.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  hotels.map((hotel) => (
                    <tr
                      key={hotel._id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/20"
                    >
                      {/* HOTEL */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {hotel.coverImage?.url ? (
                            <img
                              src={hotel.coverImage.url}
                              alt={hotel.name || "Hotel"}
                              className="h-12 w-16 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] text-slate-400">
                              No image
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">
                              {hotel.name || "-"}
                            </p>

                            {hotel.isFeatured ? (
                              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                                <Star size={11} fill="currentColor" />
                                Featured
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* DESTINATION */}
                      <td className="px-5 py-4 text-slate-600">
                        {hotel.destination?.name || "-"}
                      </td>

                      {/* CATEGORY */}
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                          {hotel.category || "-"}
                        </span>
                      </td>

                      {/* PRICE */}
                      <td className="px-5 py-4 font-medium text-slate-700">
                        ₹{hotel.pricePerNight?.min ?? "-"} - ₹
                        {hotel.pricePerNight?.max ?? "-"}
                      </td>

                      {/* RATING */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Star
                            size={15}
                            className="text-amber-500"
                            fill="currentColor"
                          />

                          <span className="font-medium text-slate-700">
                            {Number(hotel.rating || 0).toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        {hotel.isActive ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* VIEW */}
                          <button
                            type="button"
                            title="View hotel"
                            onClick={() => openViewModal(hotel)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                          >
                            <Eye size={16} />
                          </button>

                          {/* EDIT */}
                          <button
                            type="button"
                            title="Edit hotel"
                            onClick={() => openEditModal(hotel)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* ACTIVATE / DEACTIVATE */}
                          <button
                            type="button"
                            title={
                              hotel.isActive
                                ? "Deactivate hotel"
                                : "Activate hotel"
                            }
                            onClick={() => openStatusModal(hotel)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                              hotel.isActive
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            {hotel.isActive ? (
                              <PowerOff size={16} />
                            ) : (
                              <Power size={16} />
                            )}
                          </button>

                          {/* DELETE */}
                          <button
                            type="button"
                            title="Delete hotel permanently"
                            onClick={() => openDeleteModal(hotel)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      <AdminModal
        open={modalType === "view" && !!selectedHotel}
        onClose={closeModal}
        title="Hotel Details"
        size="xl"
      >
        {selectedHotel ? <HotelDetails hotel={selectedHotel} /> : null}
      </AdminModal>

      {/* EDIT MODAL */}
      <AdminModal
        open={modalType === "edit" && !!selectedHotel}
        onClose={closeModal}
        title="Edit Hotel"
        size="xl"
      >
        {selectedHotel ? (
          <HotelEditForm
            hotel={selectedHotel}
            onSuccess={async () => {
              closeModal();
              await loadHotels();
            }}
            onCancel={closeModal}
          />
        ) : null}
      </AdminModal>

      {/* STATUS MODAL */}
      <AdminModal
        open={
          (modalType === "activate" || modalType === "deactivate") &&
          !!selectedHotel
        }
        onClose={closeModal}
        title={modalType === "activate" ? "Activate Hotel" : "Deactivate Hotel"}
      >
        {selectedHotel ? (
          <div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {modalType === "activate" ? (
                  <Power size={19} />
                ) : (
                  <PowerOff size={19} />
                )}
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  {modalType === "activate"
                    ? "Activate this hotel?"
                    : "Deactivate this hotel?"}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {modalType === "activate"
                    ? `“${selectedHotel.name}” will become active again.`
                    : `“${selectedHotel.name}” will be marked as inactive. The hotel will not be deleted.`}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <AdminButton
                variant="secondary"
                onClick={closeModal}
                disabled={actionLoading}
              >
                Cancel
              </AdminButton>

              <AdminButton
                onClick={handleStatusChange}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Saving..."
                  : modalType === "activate"
                    ? "Activate"
                    : "Deactivate"}
              </AdminButton>
            </div>
          </div>
        ) : null}
      </AdminModal>

      {/* DELETE MODAL */}
      <AdminModal
        open={modalType === "delete" && !!selectedHotel}
        onClose={closeModal}
        title="Delete Hotel"
      >
        {selectedHotel ? (
          <div>
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={19} />
              </div>

              <div>
                <h3 className="font-semibold text-slate-800">
                  Delete this hotel permanently?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  This will permanently delete{" "}
                  <span className="font-semibold text-slate-700">
                    {selectedHotel.name}
                  </span>{" "}
                  and its stored Cloudinary images. This action cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <AdminButton
                variant="secondary"
                onClick={closeModal}
                disabled={actionLoading}
              >
                Cancel
              </AdminButton>

              <AdminButton
                variant="danger"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete Permanently"}
              </AdminButton>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HOTEL DETAILS                                                              */
/* -------------------------------------------------------------------------- */

function HotelDetails({ hotel }) {
  return (
    <div className="space-y-6">
      {/* COVER */}
      {hotel.coverImage?.url ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <img
            src={hotel.coverImage.url}
            alt={hotel.name || "Hotel"}
            className="h-56 w-full object-cover sm:h-72"
          />
        </div>
      ) : null}

      {/* TITLE */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">{hotel.name}</h2>

          {hotel.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              <Star size={12} fill="currentColor" />
              Featured
            </span>
          ) : null}

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
              hotel.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {hotel.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {hotel.description ? (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {hotel.description}
          </p>
        ) : null}
      </div>

      {/* BASIC DETAILS */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="Destination"
            value={hotel.destination?.name || "-"}
          />

          <DetailItem label="Category" value={hotel.category || "-"} />

          <DetailItem
            label="Rating"
            value={
              hotel.rating !== undefined
                ? `${Number(hotel.rating).toFixed(1)} / 5`
                : "-"
            }
          />

          <DetailItem
            label="Minimum Price"
            value={
              hotel.pricePerNight?.min !== undefined
                ? `₹${hotel.pricePerNight.min}`
                : "-"
            }
          />

          <DetailItem
            label="Maximum Price"
            value={
              hotel.pricePerNight?.max !== undefined
                ? `₹${hotel.pricePerNight.max}`
                : "-"
            }
          />

          <DetailItem
            label="Featured"
            value={hotel.isFeatured ? "Yes" : "No"}
          />
        </div>
      </div>

      {/* AMENITIES */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Amenities</h3>

        {hotel.amenities?.length ? (
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No amenities added.</p>
        )}
      </div>

      {/* CONTACT / LOCATION */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Contact & Location
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <DetailItem label="Address" value={hotel.address || "-"} />

          <DetailItem label="Phone" value={hotel.contactPhone || "-"} />

          <DetailItem label="Website" value={hotel.website || "-"} />

          <DetailItem label="Latitude" value={hotel.latitude ?? "-"} />

          <DetailItem label="Longitude" value={hotel.longitude ?? "-"} />
        </div>
      </div>

      {/* GALLERY */}
      {hotel.gallery?.length ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Gallery</h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {hotel.gallery.map((image, index) => (
              <div
                key={image.publicId || image.url || index}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <img
                  src={image.url}
                  alt={`${hotel.name} ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EDIT FORM                                                                  */
/* -------------------------------------------------------------------------- */

function HotelEditForm({ hotel, onSuccess, onCancel }) {
  return (
    <HotelEditFormLoader
      hotel={hotel}
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

function HotelEditFormLoader({ hotel, onSuccess, onCancel }) {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDestinations() {
      try {
        setLoading(true);
        setError("");

        const response = await adminApi.get("/api/dashboard/destinations");

        if (!mounted) return;

        const data = response?.data?.data ?? response?.data ?? [];

        setDestinations(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load destinations:", error);

        if (mounted) {
          setError(
            error?.data?.message ||
              error?.message ||
              "Failed to load destinations.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDestinations();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[250px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-600" />

          <p className="mt-3 text-sm text-slate-500">Loading destinations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <HotelForm
      initialData={hotel}
      initialValues={hotel}
      hotelId={hotel._id}
      destinations={destinations}
      mode="edit"
      onSuccess={onSuccess}
      onCancel={onCancel}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* DETAIL ITEM                                                                */
/* -------------------------------------------------------------------------- */

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}