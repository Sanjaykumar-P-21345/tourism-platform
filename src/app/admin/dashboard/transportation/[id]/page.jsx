"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { X, Loader2, Pencil } from "lucide-react";

import TransportationForm from "@/components/admin/TransportationForm";
import { adminApi } from "@/utils/adminApi";

export default function TransportationDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isViewMode = searchParams.get("view") === "true";

  const [item, setItem] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        const [transportationResponse, destinationsResponse] =
          await Promise.all([
            adminApi.get(`/api/dashboard/transportation/${id}`),
            adminApi.get("/api/dashboard/destinations"),
          ]);

        setItem(transportationResponse.data);
        setDestinations(destinationsResponse.data || []);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  function closeModal() {
    router.push("/admin/dashboard/transportation");
  }

  function switchToEdit() {
    router.push(`/admin/dashboard/transportation/${id}`);
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Transportation not found
          </h2>

          <button
            onClick={closeModal}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-sm sm:px-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div className="mx-auto flex min-h-full max-w-6xl items-center justify-center">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {isViewMode ? "Transportation Details" : "Edit Transportation"}
              </h1>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {item.providerName} • {item.type}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {isViewMode && (
                <button
                  type="button"
                  onClick={switchToEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              )}

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-slate-300 p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="max-h-[calc(100vh-110px)] overflow-y-auto p-4 sm:p-6">
            <TransportationForm
              initialValues={item}
              destinations={destinations}
              mode={isViewMode ? "view" : "edit"}
              readOnly={isViewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}