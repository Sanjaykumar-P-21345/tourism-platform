"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  AlertCircle,
  CalendarDays,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import ItineraryForm from "@/components/admin/ItineraryForm";
import { adminApi } from "@/utils/adminApi";

export default function ItineraryDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params?.id;

  const isViewMode = searchParams.get("view") === "true";

  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadItinerary() {
      try {
        setLoading(true);
        setError("");

        const response = await adminApi.get(`/api/dashboard/itineraries/${id}`);

        const data =
          response?.data?.itinerary ||
          response?.data ||
          response?.itinerary ||
          null;

        if (!data) {
          throw new Error("Itinerary not found.");
        }

        if (!cancelled) {
          setItinerary(data);
        }
      } catch (loadError) {
        console.error("Failed to load itinerary:", loadError);

        if (!cancelled) {
          setError(
            loadError?.data?.message ||
              loadError?.message ||
              "Failed to load itinerary.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItinerary();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function closeModal() {
    router.push("/admin/dashboard/itineraries");
  }

  function openDeleteModal() {
    if (!itinerary) return;

    setDeleteError("");
    setDeleteOpen(true);
  }

  function closeDeleteModal() {
    if (deleting) return;

    setDeleteOpen(false);
    setDeleteError("");
  }

  async function handleDelete() {
    if (!id || deleting) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await adminApi.delete(`/api/dashboard/itineraries/${id}`);

      setDeleteOpen(false);

      router.push("/admin/dashboard/itineraries");
      router.refresh();
    } catch (deleteError) {
      console.error("Failed to permanently delete itinerary:", deleteError);

      setDeleteError(
        deleteError?.data?.message ||
          deleteError?.message ||
          "Failed to permanently delete itinerary.",
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleSaved(updatedItinerary) {
    if (updatedItinerary) {
      setItinerary(
        updatedItinerary?.data ||
          updatedItinerary?.itinerary ||
          updatedItinerary,
      );
    }

    closeModal();
  }

  return (
    <div className="fixed inset-0 z-[50]">
      {/* =====================================================
          MAIN BACKDROP

          IMPORTANT:
          This is a sibling of the modal content.
          The centering wrapper uses pointer-events-none.
      ===================================================== */}

      <div
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
        onMouseDown={closeModal}
      />

      {/* =====================================================
          MAIN MODAL CENTERING
      ===================================================== */}

      <div className="relative z-10 flex h-full w-full items-center justify-center p-3 pointer-events-none sm:p-6">
        {/* ===================================================
            MODAL
        =================================================== */}

        <div
          className="pointer-events-auto flex max-h-[calc(100vh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl sm:max-h-[calc(100vh-48px)]"
          onMouseDown={(event) => event.stopPropagation()}
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex shrink-0 items-center justify-between border-b border-emerald-100 bg-white px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {isViewMode ? <Eye size={19} /> : <CalendarDays size={19} />}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  {isViewMode ? "View Itinerary" : "Edit Itinerary"}
                </p>

                <h1 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                  {loading ? "Loading..." : itinerary?.title || "Itinerary"}
                </h1>

                {itinerary?.destination?.name ? (
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {itinerary.destination.name}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="ml-3 flex shrink-0 items-center gap-2">
              {/* DELETE */}

              {!loading && itinerary ? (
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  title="Permanently delete"
                >
                  <Trash2 size={16} />

                  <span className="hidden sm:inline">Delete</span>
                </button>
              ) : null}

              {/* CLOSE */}

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* =================================================
              BODY
          ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/40 p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-[450px] items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Loader2 size={28} className="animate-spin" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-slate-700">
                    Loading itinerary...
                  </p>

                  <p className="mt-1 text-xs text-slate-400">Please wait</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <AlertCircle size={21} />
                  </div>

                  <h2 className="mt-4 font-bold text-red-800">
                    Unable to load itinerary
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : itinerary ? (
              <ItineraryForm
                initialData={itinerary}
                itineraryId={id}
                mode="edit"
                readOnly={isViewMode}
                onSuccess={handleSaved}
                onCancel={closeModal}
              />
            ) : (
              <div className="py-20 text-center text-sm text-slate-500">
                Itinerary not found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteOpen ? (
        <div className="fixed inset-0 z-[100]">
          {/* DELETE BACKDROP */}

          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onMouseDown={closeDeleteModal}
          />

          {/* DELETE CENTERING */}

          <div className="relative z-10 flex h-full w-full items-center justify-center p-4 pointer-events-none">
            {/* DELETE MODAL */}

            <div
              className="pointer-events-auto w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              {/* HEADER */}

              <div className="border-b border-red-100 bg-red-50/70 px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                      <Trash2 size={20} />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900">
                        Permanently Delete?
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              {/* BODY */}

              <div className="p-5 sm:p-6">
                <p className="text-sm leading-6 text-slate-600">
                  You are about to permanently delete:
                </p>

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">
                    {itinerary?.title || "This itinerary"}
                  </p>

                  {itinerary?.destination?.name ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {itinerary.destination.name}
                    </p>
                  ) : null}
                </div>

                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
                  <p className="text-xs leading-5 text-red-700">
                    The itinerary will be permanently deleted from the database.
                    Its cover image and all gallery images will also be deleted
                    from Cloudinary.
                  </p>
                </div>

                {deleteError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                    {deleteError}
                  </div>
                ) : null}

                {/* ACTIONS */}

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={deleting}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}

                    {deleting ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}