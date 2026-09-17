"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useSearchParams,
} from "next/navigation";
import HotelForm from "@/components/admin/HotelForm";
import { adminApi } from "@/utils/adminApi";

export default function HotelDetailsPage() {
  const { id } = useParams();
  const searchParams =
    useSearchParams();

  const isViewMode =
    searchParams.get("view") === "true";

  const [hotel, setHotel] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!id) return;

    async function loadHotel() {
      try {
        setLoading(true);
        setError("");

        const response =
          await adminApi.get(
            `/api/dashboard/hotels/${id}`
          );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to load hotel."
          );
        }

        setHotel(response.data);
      } catch (error) {
        console.error(
          "Load hotel error:",
          error
        );

        setError(
          error?.data?.message ||
            error?.message ||
            "Failed to load hotel."
        );
      } finally {
        setLoading(false);
      }
    }

    loadHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        Loading hotel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="p-6">
        Hotel not found.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isViewMode
              ? "View Hotel"
              : "Edit Hotel"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {hotel.name}
          </p>
        </div>
      </div>

      <HotelForm
        initialData={hotel}
        hotelId={id}
        mode={
          isViewMode
            ? "view"
            : "edit"
        }
        readOnly={isViewMode}
      />
    </div>
  );
}