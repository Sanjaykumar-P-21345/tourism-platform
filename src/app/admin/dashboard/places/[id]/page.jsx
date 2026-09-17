"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Clock,
  CalendarDays,
  IndianRupee,
} from "lucide-react";

import PlaceForm from "@/components/admin/PlaceForm";
import { adminApi } from "@/utils/adminApi";

export default function PlaceDetailsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();

  const isViewMode =
    searchParams.get("view") === "true";

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadPlace() {
      try {
        const response = await adminApi.get(
          `/api/dashboard/places/${id}`
        );

        setPlace(response.data);
      } catch (error) {
        alert(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlace();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading place...
      </div>
    );
  }

  if (!place) {
    return (
      <div className="p-6">
        <p className="text-gray-600">
          Place not found.
        </p>

        <Link
          href="/admin/dashboard/places"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:underline"
        >
          <ArrowLeft size={16} />
          Back to Places
        </Link>
      </div>
    );
  }

  if (!isViewMode) {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Edit Place
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Update place information.
            </p>
          </div>

          <Link
            href={`/admin/dashboard/places/${place._id}?view=true`}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            View
          </Link>
        </div>

        <PlaceForm initialValues={place} />
      </div>
    );
  }

  const coverImage =
    typeof place.coverImage === "string"
      ? place.coverImage
      : place.coverImage?.url || "";

  const gallery = Array.isArray(place.gallery)
    ? place.gallery
    : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            View Place
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View complete place information.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/dashboard/places"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Back
          </Link>

          <Link
            href={`/admin/dashboard/places/${place._id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Pencil size={17} />
            Edit
          </Link>
        </div>
      </div>

      {/* Main */}
      <div className="space-y-6">
        {/* Cover */}
        <div className="overflow-hidden rounded-2xl border bg-white">
          {coverImage ? (
            <img
              src={coverImage}
              alt={place.name || "Place"}
              className="h-80 w-full object-cover"
            />
          ) : (
            <div className="flex h-80 items-center justify-center bg-gray-100 text-gray-400">
              No cover image
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {place.name}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {place.shortDescription ||
                  "No short description available."}
              </p>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
                place.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {place.isActive
                ? "Active"
                : "Inactive"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              label="Destination"
              value={
                place.destination?.name || "-"
              }
            />

            <InfoItem
              label="Category"
              value={place.category || "-"}
              capitalize
            />

            <InfoItem
              label="Slug"
              value={place.slug || "-"}
            />

            <InfoItem
              label="Featured"
              value={
                place.isFeatured ? "Yes" : "No"
              }
            />

            <InfoItem
              label="Best Time to Visit"
              value={
                place.bestTimeToVisit || "-"
              }
            />

            <InfoItem
              label="Visit Duration"
              value={place.visitDuration || "-"}
            />
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Description
          </h2>

          <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
            {place.description || "-"}
          </p>
        </div>

        {/* Opening Information */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Visiting Information
          </h2>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem
              icon={<Clock size={18} />}
              label="Opening Time"
              value={place.openingTime || "-"}
            />

            <InfoItem
              icon={<Clock size={18} />}
              label="Closing Time"
              value={place.closingTime || "-"}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Closed On"
              value={place.closedOn || "-"}
            />

            <InfoItem
              icon={<CalendarDays size={18} />}
              label="Best Time"
              value={
                place.bestTimeToVisit || "-"
              }
            />
          </div>
        </div>

        {/* Entry Fee */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Entry Fee
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            <InfoItem
              icon={<IndianRupee size={18} />}
              label="Adult"
              value={
                place.entryFee?.adult !==
                undefined
                  ? `₹${place.entryFee.adult}`
                  : "-"
              }
            />

            <InfoItem
              icon={<IndianRupee size={18} />}
              label="Child"
              value={
                place.entryFee?.child !==
                undefined
                  ? `₹${place.entryFee.child}`
                  : "-"
              }
            />

            <InfoItem
              icon={<IndianRupee size={18} />}
              label="Foreigner"
              value={
                place.entryFee?.foreigner !==
                undefined
                  ? `₹${place.entryFee.foreigner}`
                  : "-"
              }
            />
          </div>
        </div>

        {/* Location */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Location
          </h2>

          <div className="space-y-4">
            <InfoItem
              icon={<MapPin size={18} />}
              label="Address"
              value={place.address || "-"}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Latitude"
                value={
                  place.latitude !==
                    undefined &&
                  place.latitude !== null
                    ? place.latitude
                    : "-"
                }
              />

              <InfoItem
                label="Longitude"
                value={
                  place.longitude !==
                    undefined &&
                  place.longitude !== null
                    ? place.longitude
                    : "-"
                }
              />
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">
            Gallery
          </h2>

          {gallery.length === 0 ? (
            <p className="text-sm text-gray-500">
              No gallery images.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {gallery.map((image, index) => {
                const imageUrl =
                  typeof image === "string"
                    ? image
                    : image?.url || "";

                if (!imageUrl) return null;

                return (
                  <img
                    key={
                      image?.publicId ||
                      `${imageUrl}-${index}`
                    }
                    src={imageUrl}
                    alt={`${place.name} ${
                      index + 1
                    }`}
                    className="h-48 w-full rounded-xl object-cover"
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
  capitalize = false,
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        {icon}
        {label}
      </div>

      <div
        className={`text-sm font-medium text-gray-800 ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}