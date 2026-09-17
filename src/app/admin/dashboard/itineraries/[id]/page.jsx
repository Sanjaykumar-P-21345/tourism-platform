"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";

import ItineraryForm from "@/components/admin/ItineraryForm";
import { adminApi } from "@/utils/adminApi";

export default function EditItineraryPage() {
  const { id } = useParams();
  const router = useRouter();

  const [itinerary, setItinerary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadItinerary() {
      setLoading(true);
      setError("");

      try {
        const response = await adminApi.get(`/api/dashboard/itineraries/${id}`);

        if (!cancelled) {
          setItinerary(response?.data || null);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error?.data?.message ||
              error?.message ||
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={closeModal}
      />

      <div className="relative flex min-h-full items-start justify-center p-3 sm:p-6 lg:p-10">
        <div className="relative my-4 w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:my-8">
          {/* MODAL HEADER */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                Edit Itinerary
              </h1>

              {itinerary?.title && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {itinerary.title}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Close"
            >
              <X size={21} />
            </button>
          </div>

          {/* MODAL BODY */}
          <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-4 sm:p-6">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 size={20} className="animate-spin" />
                  Loading itinerary...
                </div>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/30">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Close
                </button>
              </div>
            ) : itinerary ? (
              <ItineraryForm
                initialData={itinerary}
                itineraryId={id}
                mode="edit"
              />
            ) : (
              <div className="py-20 text-center text-sm text-slate-500 dark:text-slate-400">
                Itinerary not found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}