"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import TransportationForm from "@/components/admin/TransportationForm";
import { adminApi } from "@/utils/adminApi";

export default function CreateTransportationPage() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDestinations() {
      try {
        const response = await adminApi.get("/api/dashboard/destinations");

        setDestinations(response.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/dashboard/transportation"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Transportation
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Transportation
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Add a new transportation option.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : (
          <TransportationForm destinations={destinations} mode="create" />
        )}
      </div>
    </div>
  );
}