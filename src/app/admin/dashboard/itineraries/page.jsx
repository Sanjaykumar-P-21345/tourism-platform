"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  CalendarDays,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Star,
  Trash2,
  X,
} from "lucide-react";

import StatCard from "@/components/admin/StatCard";
import { adminApi } from "@/utils/adminApi";

export default function ItinerariesPage() {
  const router = useRouter();

  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItinerary, setSelectedItinerary] = useState(null);

  const [confirmation, setConfirmation] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadItineraries = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/api/dashboard/itineraries");

      const data =
        response?.data?.itineraries ||
        response?.data ||
        response?.itineraries ||
        [];

      setItineraries(Array.isArray(data) ? data : []);
    } catch (loadError) {
      console.error("Failed to load itineraries:", loadError);

      setError(
        loadError?.data?.message ||
          loadError?.message ||
          "Failed to load itineraries.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItineraries();
  }, [loadItineraries]);

  const stats = useMemo(() => {
    return {
      total: itineraries.length,
      active: itineraries.filter((item) => item?.isActive !== false).length,
      featured: itineraries.filter((item) => item?.isFeatured).length,
    };
  }, [itineraries]);

  function openView(itinerary) {
    setSelectedItinerary(itinerary);
  }

  function closeView() {
    setSelectedItinerary(null);
  }

  function openEdit(id) {
    router.push(`/admin/dashboard/itineraries/${id}`);
  }

  function requestToggle(itinerary) {
    setConfirmation({
      type: "toggle",
      item: itinerary,
    });
  }

  function requestDelete(itinerary) {
    setConfirmation({
      type: "delete",
      item: itinerary,
    });
  }

  function closeConfirmation() {
    if (actionLoading) return;

    setConfirmation(null);
  }

  async function handleConfirmedAction() {
    if (!confirmation?.item?._id) return;

    const itinerary = confirmation.item;

    try {
      setActionLoading(true);
      setError("");

      /* =====================================================
         ACTIVATE / DEACTIVATE
      ===================================================== */

      if (confirmation.type === "toggle") {
        await adminApi.put(`/api/dashboard/itineraries/${itinerary._id}`, {
          isActive: itinerary.isActive === false,
        });
      }

      /* =====================================================
         PERMANENT DELETE
      ===================================================== */

      if (confirmation.type === "delete") {
        await adminApi.delete(`/api/dashboard/itineraries/${itinerary._id}`);
      }

      setConfirmation(null);

      await loadItineraries();
    } catch (actionError) {
      console.error("Itinerary action failed:", actionError);

      setError(
        actionError?.data?.message ||
          actionError?.message ||
          "Failed to complete itinerary action.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-emerald-50/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-600 shadow-sm">
              <CalendarDays size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Itineraries
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create and manage detailed travel itineraries.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin/dashboard/itineraries/create")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={17} />
            Create Itinerary
          </button>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error ? (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

              <p className="text-sm leading-6 text-red-700">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0 text-red-400 transition hover:text-red-600"
            >
              <X size={17} />
            </button>
          </div>
        ) : null}

        {/* =====================================================
            STATS
        ===================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Itineraries"
            value={stats.total}
            description="All itinerary records"
            icon={<CalendarDays size={18} />}
          />

          <StatCard
            title="Active Itineraries"
            value={stats.active}
            description="Currently available"
            icon={<Power size={18} />}
          />

          <StatCard
            title="Featured Itineraries"
            value={stats.featured}
            description="Marked as featured"
            icon={<Star size={18} />}
          />
        </div>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
          {loading ? (
            <LoadingState />
          ) : itineraries.length === 0 ? (
            <EmptyState
              onCreate={() =>
                router.push("/admin/dashboard/itineraries/create")
              }
            />
          ) : (
            <>
              {/* DESKTOP */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[1050px] text-sm">
                  <thead>
                    <tr className="border-b border-emerald-100 bg-emerald-50/50">
                      <th className="px-5 py-4 text-left font-semibold text-slate-600">
                        Itinerary
                      </th>

                      <th className="px-5 py-4 text-left font-semibold text-slate-600">
                        Destination
                      </th>

                      <th className="px-5 py-4 text-left font-semibold text-slate-600">
                        Duration
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
                    {itineraries.map((item) => (
                      <ItineraryTableRow
                        key={item._id}
                        item={item}
                        onView={() => openView(item)}
                        onEdit={() => openEdit(item._id)}
                        onToggle={() => requestToggle(item)}
                        onDelete={() => requestDelete(item)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}

              <div className="divide-y divide-emerald-100 md:hidden">
                {itineraries.map((item) => (
                  <ItineraryMobileCard
                    key={item._id}
                    item={item}
                    onView={() => openView(item)}
                    onEdit={() => openEdit(item._id)}
                    onToggle={() => requestToggle(item)}
                    onDelete={() => requestDelete(item)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* =======================================================
          VIEW MODAL
      ======================================================= */}

      {selectedItinerary ? (
        <ItineraryViewModal
          itinerary={selectedItinerary}
          onClose={closeView}
          onEdit={() => {
            closeView();
            openEdit(selectedItinerary._id);
          }}
        />
      ) : null}

      {/* =======================================================
          ACTIVATE / DEACTIVATE / DELETE CONFIRMATION
      ======================================================= */}

      {confirmation ? (
        <ConfirmationModal
          confirmation={confirmation}
          loading={actionLoading}
          onClose={closeConfirmation}
          onConfirm={handleConfirmedAction}
        />
      ) : null}
    </div>
  );
}

/* ================================================================
   LOADING
================================================================ */

function LoadingState() {
  return (
    <div className="flex min-h-[360px] items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
          <Loader2 size={25} className="animate-spin text-emerald-600" />
        </div>

        <p className="mt-3 text-sm font-semibold text-slate-700">
          Loading itineraries...
        </p>

        <p className="mt-1 text-xs text-slate-400">Please wait</p>
      </div>
    </div>
  );
}

/* ================================================================
   TABLE ROW
================================================================ */

function ItineraryTableRow({ item, onView, onEdit, onToggle, onDelete }) {
  const active = item?.isActive !== false;

  return (
    <tr className="border-b border-slate-100 transition last:border-0 hover:bg-emerald-50/20">
      {/* ITINERARY */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl border border-emerald-100 bg-slate-100">
            {item?.coverImage?.url ? (
              <img
                src={item.coverImage.url}
                alt={item.title || "Itinerary"}
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
              <p className="max-w-[280px] truncate font-semibold text-slate-900">
                {item?.title || "-"}
              </p>

              {item?.isFeatured ? (
                <Star
                  size={14}
                  className="shrink-0 text-amber-500"
                  fill="currentColor"
                />
              ) : null}
            </div>

            <p className="mt-1 max-w-[280px] truncate text-xs text-slate-400">
              /{item?.slug || "-"}
            </p>
          </div>
        </div>
      </td>

      {/* DESTINATION */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin size={15} className="shrink-0 text-emerald-500" />

          <span className="max-w-[180px] truncate">
            {item?.destination?.name || "-"}
          </span>
        </div>
      </td>

      {/* DURATION */}

      <td className="px-5 py-4">
        <span className="font-medium text-slate-700">
          {item?.duration?.days ?? 0}D / {item?.duration?.nights ?? 0}N
        </span>
      </td>

      {/* STATUS */}

      <td className="px-5 py-4">
        <div className="flex flex-col items-start gap-1.5">
          <StatusBadge active={active}>
            {active ? "Active" : "Inactive"}
          </StatusBadge>

          {item?.isFeatured ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
              Featured
            </span>
          ) : null}
        </div>
      </td>

      {/* ACTIONS */}

      <td className="px-5 py-4">
        <div className="flex justify-end gap-2">
          <ActionButton
            title="View"
            onClick={onView}
            icon={<Eye size={16} />}
            variant="view"
          />

          <ActionButton
            title="Edit"
            onClick={onEdit}
            icon={<Pencil size={16} />}
            variant="edit"
          />

          <ActionButton
            title={active ? "Deactivate" : "Activate"}
            onClick={onToggle}
            icon={active ? <PowerOff size={16} /> : <Power size={16} />}
            variant={active ? "warning" : "success"}
          />

          {/* REAL DELETE */}

          <ActionButton
            title="Permanently Delete"
            onClick={onDelete}
            icon={<Trash2 size={16} />}
            variant="delete"
          />
        </div>
      </td>
    </tr>
  );
}

/* ================================================================
   MOBILE CARD
================================================================ */

function ItineraryMobileCard({ item, onView, onEdit, onToggle, onDelete }) {
  const active = item?.isActive !== false;

  return (
    <div className="p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-emerald-100 bg-slate-100">
          {item?.coverImage?.url ? (
            <img
              src={item.coverImage.url}
              alt={item.title || "Itinerary"}
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
                <h3 className="truncate font-bold text-slate-900">
                  {item?.title || "-"}
                </h3>

                {item?.isFeatured ? (
                  <Star
                    size={14}
                    className="shrink-0 text-amber-500"
                    fill="currentColor"
                  />
                ) : null}
              </div>

              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} />
                {item?.destination?.name || "No destination"}
              </p>
            </div>

            <StatusBadge active={active}>
              {active ? "Active" : "Inactive"}
            </StatusBadge>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            <span>{item?.duration?.days ?? 0} Days</span>
            <span>{item?.duration?.nights ?? 0} Nights</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SmallActionButton onClick={onView} icon={<Eye size={15} />}>
          View
        </SmallActionButton>

        <SmallActionButton onClick={onEdit} icon={<Pencil size={15} />}>
          Edit
        </SmallActionButton>

        <SmallActionButton
          onClick={onToggle}
          icon={active ? <PowerOff size={15} /> : <Power size={15} />}
        >
          {active ? "Deactivate" : "Activate"}
        </SmallActionButton>

        <SmallActionButton
          onClick={onDelete}
          danger
          icon={<Trash2 size={15} />}
        >
          Delete
        </SmallActionButton>
      </div>
    </div>
  );
}

/* ================================================================
   VIEW MODAL
================================================================ */

function ItineraryViewModal({ itinerary, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-[50]">
      {/* BACKDROP IS A REAL SIBLING */}
      <div
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        onMouseDown={onClose}
      />

      {/* CENTERING LAYER */}
      <div className="relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-6 pointer-events-none">
        {/* MODAL ONLY IS CLICKABLE */}
        <div
          className="pointer-events-auto flex max-h-[calc(100vh-24px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl sm:max-h-[calc(100vh-48px)]"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {/* HEADER */}

          <div className="flex shrink-0 items-center justify-between border-b border-emerald-100 bg-white px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                Itinerary Details
              </p>

              <h2 className="mt-0.5 truncate text-lg font-bold text-slate-900 sm:text-xl">
                {itinerary?.title || "Itinerary"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          </div>

          {/* BODY */}

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {itinerary?.coverImage?.url ? (
              <div className="overflow-hidden rounded-2xl border border-emerald-100">
                <img
                  src={itinerary.coverImage.url}
                  alt={itinerary.title || "Itinerary"}
                  className="h-56 w-full object-cover sm:h-64"
                />
              </div>
            ) : null}

            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                  {itinerary?.title || "-"}
                </h3>

                {itinerary?.isFeatured ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Star size={13} fill="currentColor" />
                    Featured
                  </span>
                ) : null}

                <StatusBadge active={itinerary?.isActive !== false}>
                  {itinerary?.isActive !== false ? "Active" : "Inactive"}
                </StatusBadge>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} className="text-emerald-500" />
                  {itinerary?.destination?.name || "-"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-emerald-500" />
                  {itinerary?.duration?.days ?? 0} Days /{" "}
                  {itinerary?.duration?.nights ?? 0} Nights
                </span>
              </div>
            </div>

            {itinerary?.description ? (
              <section className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                <h4 className="font-bold text-slate-900">Description</h4>

                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {itinerary.description}
                </p>
              </section>
            ) : null}

            <section className="mt-6">
              <h4 className="text-lg font-bold text-slate-900">
                Itinerary Details
              </h4>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <DetailBox label="Slug" value={`/${itinerary?.slug || "-"}`} />

                <DetailBox
                  label="Destination"
                  value={itinerary?.destination?.name || "-"}
                />

                <DetailBox
                  label="Duration"
                  value={`${itinerary?.duration?.days ?? 0} Days / ${
                    itinerary?.duration?.nights ?? 0
                  } Nights`}
                />

                <DetailBox
                  label="Budget"
                  value={formatBudget(itinerary?.estimatedBudget)}
                />

                <DetailBox
                  label="Featured"
                  value={itinerary?.isFeatured ? "Yes" : "No"}
                />

                <DetailBox
                  label="Status"
                  value={itinerary?.isActive !== false ? "Active" : "Inactive"}
                />
              </div>
            </section>

            {/* DAILY PLAN */}

            <section className="mt-7">
              <h4 className="text-lg font-bold text-slate-900">Daily Plan</h4>

              {Array.isArray(itinerary?.days) && itinerary.days.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {itinerary.days.map((day, index) => (
                    <div
                      key={`${day?.dayNumber}-${index}`}
                      className="rounded-xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
                          {day?.dayNumber || index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-600">
                            Day {day?.dayNumber || index + 1}
                          </p>

                          <h5 className="mt-0.5 font-bold text-slate-900">
                            {day?.title || "-"}
                          </h5>
                        </div>
                      </div>

                      {Array.isArray(day?.activities) &&
                      day.activities.length > 0 ? (
                        <div className="mt-4 space-y-2.5">
                          {day.activities.map((activity, activityIndex) => (
                            <div
                              key={`${activity?.title}-${activityIndex}`}
                              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                {activity?.time ? (
                                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-700">
                                    {activity.time}
                                  </span>
                                ) : null}

                                <span className="text-sm font-semibold text-slate-900">
                                  {activity?.title || "-"}
                                </span>
                              </div>

                              {activity?.description ? (
                                <p className="mt-2 text-xs leading-6 text-slate-500">
                                  {activity.description}
                                </p>
                              ) : null}

                              {activity?.place?.name ? (
                                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                                  <MapPin size={13} />
                                  {activity.place.name}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-4 text-xs text-slate-400">
                          No activities added for this day.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center">
                  <p className="text-sm text-slate-400">No daily plan added.</p>
                </div>
              )}
            </section>

            {/* GALLERY */}

            {Array.isArray(itinerary?.gallery) &&
            itinerary.gallery.length > 0 ? (
              <section className="mt-7">
                <h4 className="text-lg font-bold text-slate-900">Gallery</h4>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {itinerary.gallery.map((image, index) => (
                    <div
                      key={`${image?.publicId || image?.url}-${index}`}
                      className="overflow-hidden rounded-xl border border-slate-200"
                    >
                      {image?.url ? (
                        <img
                          src={image.url}
                          alt={`Gallery ${index + 1}`}
                          className="h-32 w-full object-cover transition duration-300 hover:scale-105"
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* FOOTER */}

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-emerald-100 bg-slate-50/60 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Pencil size={16} />
              Edit Itinerary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   CONFIRMATION MODAL
================================================================ */

function ConfirmationModal({ confirmation, loading, onClose, onConfirm }) {
  const item = confirmation?.item;

  const isDelete = confirmation?.type === "delete";
  const isActivate =
    confirmation?.type === "toggle" && item?.isActive === false;

  const title = isDelete
    ? "Permanently delete itinerary?"
    : isActivate
      ? "Activate itinerary?"
      : "Deactivate itinerary?";

  const description = isDelete
    ? `You are about to permanently delete "${item?.title || "this itinerary"}". This cannot be undone.`
    : isActivate
      ? `Activate "${item?.title || "this itinerary"}" and make it available again?`
      : `You are about to deactivate "${item?.title || "this itinerary"}". The itinerary will remain in the database.`;

  const actionLabel = isDelete
    ? "Delete Permanently"
    : isActivate
      ? "Activate"
      : "Deactivate";

  return (
    <div className="fixed inset-0 z-[100]">
      {/* IMPORTANT:
          This backdrop is a sibling of the modal.
          It cannot be covered by the modal centering layer.
      */}

      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onMouseDown={onClose}
      />

      <div className="relative z-10 flex h-full w-full items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {/* HEADER */}

          <div
            className={`border-b px-5 py-4 sm:px-6 ${
              isDelete
                ? "border-red-100 bg-red-50/70"
                : isActivate
                  ? "border-emerald-100 bg-emerald-50/70"
                  : "border-amber-100 bg-amber-50/70"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isDelete
                      ? "bg-red-100 text-red-600"
                      : isActivate
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {isDelete ? (
                    <Trash2 size={20} />
                  ) : isActivate ? (
                    <Power size={20} />
                  ) : (
                    <PowerOff size={20} />
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {title}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {isDelete
                      ? "This action cannot be undone."
                      : isActivate
                        ? "The itinerary will become active."
                        : "The record will remain in the database."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* BODY */}

          <div className="p-5 sm:p-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="font-semibold text-slate-900">
                {item?.title || "This itinerary"}
              </p>

              {item?.destination?.name ? (
                <p className="mt-1 text-xs text-slate-500">
                  {item.destination.name}
                </p>
              ) : null}
            </div>

            {isDelete ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-xs leading-5 text-red-700">
                  The itinerary will be permanently removed from MongoDB and its
                  cover image and gallery images will be deleted from
                  Cloudinary.
                </p>
              </div>
            ) : null}

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {description}
            </p>

            {/* ACTIONS */}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  isDelete
                    ? "bg-red-600 hover:bg-red-700"
                    : isActivate
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isDelete ? (
                  <Trash2 size={16} />
                ) : isActivate ? (
                  <Power size={16} />
                ) : (
                  <PowerOff size={16} />
                )}

                {loading ? "Processing..." : actionLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({ onCreate }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <CalendarDays size={26} />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        No itineraries found
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Create your first itinerary to get started.
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        <Plus size={17} />
        Create Itinerary
      </button>
    </div>
  );
}

/* ================================================================
   SMALL COMPONENTS
================================================================ */

function StatusBadge({ active, children }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {children}
    </span>
  );
}

function ActionButton({ title, onClick, icon, variant = "view" }) {
  const styles = {
    view: "border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600",

    edit: "border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600",

    success: "border-emerald-200 text-emerald-600 hover:bg-emerald-50",

    warning:
      "border-slate-200 text-slate-500 hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600",

    delete: "border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${styles[variant]}`}
    >
      {icon}
    </button>
  );
}

function SmallActionButton({ children, onClick, icon, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}

function formatBudget(budget) {
  if (!budget) return "-";

  const min = Number(budget.min || 0);
  const max = Number(budget.max || 0);

  if (!min && !max) return "-";

  if (min && max) {
    return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString("en-IN")}`;
  }

  if (min) {
    return `From ₹${min.toLocaleString("en-IN")}`;
  }

  return `Up to ₹${max.toLocaleString("en-IN")}`;
}
