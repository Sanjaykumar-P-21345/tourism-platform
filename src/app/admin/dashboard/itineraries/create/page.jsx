"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import ItineraryForm from "@/components/admin/ItineraryForm";

export default function CreateItineraryPage() {
  return (
    <div className="min-h-full">
      <div className="mb-6">
        <Link
          href="/admin/dashboard/itineraries"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={16} />
          Back to Itineraries
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Create Itinerary
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a detailed travel itinerary.
        </p>
      </div>

      <ItineraryForm mode="create" />
    </div>
  );
}