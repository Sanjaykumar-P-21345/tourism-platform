"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  MapPin,
  CalendarDays,
  IndianRupee,
  Star,
  CheckCircle2,
  CircleOff,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import PackageForm from "@/components/admin/PackageForm";
import { adminApi } from "@/utils/adminApi";

export default function PackageDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isViewMode = searchParams.get("view") === "true";

  const [packageData, setPackageData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadPackage() {
      setLoading(true);
      setError("");

      try {
        const response = await adminApi.get(`/api/dashboard/packages/${id}`);

        if (!cancelled) {
          setPackageData(response.data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.message || "Failed to load package.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPackage();

    return () => {
      cancelled = true;
    };
  }, [id]);

  function closeModal() {
    router.push("/admin/dashboard/packages");
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={closeModal}
      />

      <div className="relative flex min-h-full items-start justify-center p-3 sm:p-6 lg:p-10">
        <div
          className="relative z-10 my-2 w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:my-6"
          onClick={(event) => event.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Package
              </p>

              <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
                {loading
                  ? "Loading..."
                  : isViewMode
                    ? packageData?.name || "Package Details"
                    : `Edit ${packageData?.name || "Package"}`}
              </h1>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="ml-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[calc(100vh-100px)] overflow-y-auto p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-center">
                  <Loader2
                    size={34}
                    className="mx-auto animate-spin text-indigo-600"
                  />

                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Loading package...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
                <p className="font-medium text-red-700 dark:text-red-300">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                >
                  Close
                </button>
              </div>
            ) : isViewMode ? (
              <PackageView packageData={packageData} onClose={closeModal} />
            ) : (
              <PackageForm
                mode="edit"
                packageId={id}
                initialData={packageData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PackageView({ packageData, onClose }) {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        {packageData?.coverImage?.url ? (
          <div className="relative">
            <img
              src={packageData.coverImage.url}
              alt={packageData.name}
              className="h-64 w-full object-cover sm:h-80"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                {packageData.isFeatured && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
                    <Star size={13} />
                    Featured
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                    packageData.isActive
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-600 text-white"
                  }`}
                >
                  {packageData.isActive ? (
                    <CheckCircle2 size={13} />
                  ) : (
                    <CircleOff size={13} />
                  )}

                  {packageData.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <h2 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                {packageData.name}
              </h2>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center bg-slate-100 dark:bg-slate-900">
            <p className="text-slate-500">No cover image</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<MapPin size={19} />}
          label="Destination"
          value={packageData.destination?.name || "-"}
        />

        <InfoCard
          icon={<CalendarDays size={19} />}
          label="Duration"
          value={`${packageData.duration?.days ?? 0} Days / ${
            packageData.duration?.nights ?? 0
          } Nights`}
        />

        <InfoCard
          icon={<IndianRupee size={19} />}
          label="Price"
          value={`${packageData.price ?? 0} · ${formatPriceType(
            packageData.priceType,
          )}`}
        />

        <InfoCard
          icon={<Star size={19} />}
          label="Featured"
          value={packageData.isFeatured ? "Yes" : "No"}
        />
      </div>

      {/* Description */}
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Description
        </h3>

        {packageData.shortDescription && (
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
            {packageData.shortDescription}
          </p>
        )}

        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-400">
          {packageData.description || "-"}
        </p>
      </section>

      {/* Inclusions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ListSection title="Inclusions" items={packageData.inclusions} />

        <ListSection title="Exclusions" items={packageData.exclusions} />
      </div>

      {/* Itinerary */}
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:p-6">
        <h3 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
          Itinerary
        </h3>

        {packageData.itinerary?.length ? (
          <div className="space-y-4">
            {packageData.itinerary.map((day) => (
              <div
                key={day.day}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                    {day.day}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {day.title}
                    </h4>

                    {day.description && (
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {day.description}
                      </p>
                    )}

                    {day.places?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {day.places.map((place) => (
                          <span
                            key={place._id}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {place.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No itinerary added.
          </p>
        )}
      </section>

      {/* Gallery */}
      {packageData.gallery?.length > 0 && (
        <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:p-6">
          <h3 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
            Gallery
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {packageData.gallery.map((image, index) => (
              <img
                key={`${image.url}-${index}`}
                src={image.url}
                alt={`${packageData.name} gallery ${index + 1}`}
                className="h-40 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end border-t border-slate-200 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
        {icon}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-2 font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ListSection({ title, items = [] }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      {items.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-3 text-sm text-slate-600 dark:text-slate-400"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          None specified.
        </p>
      )}
    </section>
  );
}

function formatPriceType(type) {
  if (type === "per-person") {
    return "Per Person";
  }

  if (type === "per-couple") {
    return "Per Couple";
  }

  if (type === "per-group") {
    return "Per Group";
  }

  return "-";
}