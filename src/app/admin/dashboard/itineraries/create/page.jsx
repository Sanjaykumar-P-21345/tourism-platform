"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays } from "lucide-react";

import ItineraryForm from "@/components/admin/ItineraryForm";

export default function CreateItineraryPage() {
  const router = useRouter();

  function goBack() {
    router.push("/admin/dashboard/itineraries");
  }

  return (
    <div className="min-h-full bg-emerald-50/30">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={goBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={16} />
            Back to Itineraries
          </button>

          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-white text-emerald-600 shadow-sm">
              <CalendarDays size={21} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create Itinerary
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create a detailed travel itinerary for your
                destination.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-6">
          <ItineraryForm
            mode="create"
            readOnly={false}
            onSuccess={() =>
              router.push(
                "/admin/dashboard/itineraries",
              )
            }
            onCancel={goBack}
          />
        </div>
      </div>
    </div>
  );
}