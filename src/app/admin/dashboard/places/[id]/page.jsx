"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import PlaceForm from "@/components/admin/PlaceForm";
import { adminApi } from "@/utils/adminApi";

export default function PlaceDetailsPage() {
  const { id } = useParams();

  const [place, setPlace] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadPlace() {
      try {
        setLoading(true);
        setError("");

        const response = await adminApi.get(`/api/dashboard/places/${id}`);

        if (!response?.success) {
          throw new Error(response?.message || "Failed to load place");
        }

        setPlace(response.data);
      } catch (error) {
        console.error("Failed to load place:", error);

        setError(error?.message || "Failed to load place");
      } finally {
        setLoading(false);
      }
    }

    loadPlace();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Loader2 size={20} className="animate-spin text-emerald-600" />
          Loading place...
        </div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Place not found."}
        </div>

        <Link
          href="/admin/dashboard/places"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          <ArrowLeft size={16} />
          Back to Places
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/dashboard/places"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to Places
        </Link>

        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Edit Place
        </h1>

        <p className="mt-1 text-sm text-slate-500">Update place information.</p>
      </div>

      <PlaceForm
        initialValues={place}
        onSuccess={() => {
          window.location.href = "/admin/dashboard/places";
        }}
        onCancel={() => {
          window.location.href = "/admin/dashboard/places";
        }}
      />
    </div>
  );
}
