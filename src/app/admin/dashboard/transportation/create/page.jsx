"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, LoaderCircle, Route } from "lucide-react";

import { adminApi } from "@/utils/adminApi";
import TransportationForm from "@/components/admin/TransportationForm";

export default function CreateTransportationPage() {
  const router = useRouter();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/api/dashboard/destinations");

      setDestinations(response?.data || []);
    } catch (err) {
      console.error("Failed to load destinations:", err);

      setError(err?.message || "Unable to load destinations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  function handleBack() {
    router.push("/admin/dashboard/transportation");
  }

  function handleSaved() {
    router.push("/admin/dashboard/transportation");
  }

  return (
    <div className="min-h-screen w-full bg-emerald-50/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={17} />
            Back to Transportation
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
                <Route size={21} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Add Transportation
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new transportation service.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <LoaderCircle
                  size={28}
                  className="animate-spin text-emerald-600"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading destinations...
              </p>

              <p className="mt-1 text-xs text-slate-400">Please wait</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
            <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={19} />

                <p className="text-sm font-bold">Unable to load destinations</p>
              </div>

              <p className="mt-2 text-xs leading-5 text-red-600">{error}</p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={loadDestinations}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <TransportationForm
              destinations={destinations}
              mode="create"
              readOnly={false}
              onSuccess={handleSaved}
              onCancel={handleBack}
            />
          </div>
        )}
      </div>
    </div>
  );
}
