"use client";

import { useEffect, useState } from "react";
import {
  X,
  LoaderCircle,
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
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = params?.id;

  const isViewMode = searchParams.get("view") === "true";

  const [packageData, setPackageData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  /* =========================================================
     LOCK BACKGROUND SCROLL
     ========================================================= */

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  /* =========================================================
     ESCAPE KEY
     ========================================================= */

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* =========================================================
     LOAD PACKAGE
     ========================================================= */

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    async function loadPackage() {
      try {
        setLoading(true);
        setError("");

        const response = await adminApi.get(`/api/dashboard/packages/${id}`);

        const data =
          response?.data?.package || response?.data || response?.package;

        if (!data) {
          throw new Error("Package not found.");
        }

        if (!cancelled) {
          setPackageData(data);
        }
      } catch (loadError) {
        console.error("Failed to load package:", loadError);

        if (!cancelled) {
          setError(
            loadError?.data?.message ||
              loadError?.message ||
              "Failed to load package.",
          );
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

  /* =========================================================
     CLOSE MODAL
     ========================================================= */

  function closeModal() {
    router.push("/admin/dashboard/packages");
  }

  /* =========================================================
     SAVE PACKAGE
     ========================================================= */

  function handleSaved(updatedPackage) {
    if (updatedPackage) {
      setPackageData(updatedPackage);
    }

    closeModal();
  }

  /* =========================================================
     BACKDROP CLICK
     ========================================================= */

  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget) {
      closeModal();
    }
  }

  /* =========================================================
     MAIN MODAL
     ========================================================= */

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={isViewMode ? "View package" : "Edit package"}
    >
      {/* =====================================================
          FULL SCREEN BACKDROP
          ===================================================== */}

      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
        onMouseDown={closeModal}
      />

      {/* =====================================================
          MODAL CENTER WRAPPER
          ===================================================== */}

      <div
        className="relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-5 lg:p-8"
        onMouseDown={handleBackdropMouseDown}
      >
        {/* ===================================================
            PROFESSIONAL COMPACT MODAL
            =================================================== */}

        <div
          className="
            flex
            w-full
            max-w-4xl
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-emerald-100
            bg-white
            shadow-[0_25px_80px_rgba(15,23,42,0.35)]
          "
          style={{
            maxHeight: "calc(100vh - 48px)",
          }}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          {/* =================================================
              MODAL HEADER
              ================================================= */}

          <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-emerald-100 bg-white px-4 sm:px-5">
            <div className="min-w-0 pr-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                Package Management
              </p>

              <h1 className="mt-0.5 truncate text-base font-bold text-slate-900 sm:text-lg">
                {loading
                  ? "Loading Package..."
                  : isViewMode
                    ? packageData?.name || "Package Details"
                    : `Edit ${packageData?.name || "Package"}`}
              </h1>
            </div>

            <button
              type="button"
              onClick={closeModal}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
                hover:text-emerald-700
                focus:outline-none
                focus:ring-2
                focus:ring-emerald-500
                focus:ring-offset-2
              "
              title="Close"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* =================================================
              SCROLLABLE CONTENT
              ================================================= */}

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState error={error} onClose={closeModal} />
            ) : isViewMode ? (
              <div className="p-4 sm:p-5 lg:p-6">
                <PackageView packageData={packageData} onClose={closeModal} />
              </div>
            ) : (
              <div className="p-4 sm:p-5 lg:p-6">
                <PackageForm
                  mode="edit"
                  packageId={id}
                  initialData={packageData}
                  readOnly={false}
                  onSuccess={handleSaved}
                  onCancel={closeModal}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   LOADING STATE
   ============================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
          <LoaderCircle size={26} className="animate-spin text-emerald-600" />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-700">
          Loading package...
        </p>

        <p className="mt-1 text-xs text-slate-400">Please wait</p>
      </div>
    </div>
  );
}

/* =============================================================
   ERROR STATE
   ============================================================= */

function ErrorState({ error, onClose }) {
  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <X size={22} />
        </div>

        <h2 className="mt-4 font-bold text-red-700">Unable to load package</h2>

        <p className="mt-2 text-sm leading-6 text-red-600">{error}</p>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* =============================================================
   PACKAGE VIEW
   ============================================================= */

function PackageView({ packageData, onClose }) {
  return (
    <div className="space-y-5">
      {/* =======================================================
          HERO
          ======================================================= */}

      <div className="overflow-hidden rounded-xl border border-emerald-100">
        {packageData?.coverImage?.url ? (
          <div className="relative">
            <img
              src={packageData.coverImage.url}
              alt={packageData.name || "Package"}
              className="
                h-48
                w-full
                object-cover
                sm:h-56
                lg:h-64
              "
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                {packageData.isFeatured ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950">
                    <Star size={12} />
                    Featured
                  </span>
                ) : null}

                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    packageData.isActive !== false
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {packageData.isActive !== false ? (
                    <CheckCircle2 size={12} />
                  ) : (
                    <CircleOff size={12} />
                  )}

                  {packageData.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                {packageData.name || "Untitled Package"}
              </h2>

              {packageData.shortDescription ? (
                <p className="mt-1 max-w-2xl text-xs leading-5 text-white/80 sm:text-sm">
                  {packageData.shortDescription}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center bg-emerald-50 sm:h-56">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                <Star size={22} />
              </div>

              <p className="mt-2 text-xs text-slate-500">No cover image</p>
            </div>
          </div>
        )}
      </div>

      {/* =======================================================
          SUMMARY CARDS
          ======================================================= */}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard
          icon={<MapPin size={17} />}
          label="Destination"
          value={packageData?.destination?.name || "-"}
        />

        <InfoCard
          icon={<CalendarDays size={17} />}
          label="Duration"
          value={`${packageData?.duration?.days ?? 0} Days / ${
            packageData?.duration?.nights ?? 0
          } Nights`}
        />

        <InfoCard
          icon={<IndianRupee size={17} />}
          label="Price"
          value={`₹${Number(packageData?.price || 0).toLocaleString("en-IN")}`}
          secondary={formatPriceType(packageData?.priceType)}
        />

        <InfoCard
          icon={<Star size={17} />}
          label="Featured"
          value={packageData?.isFeatured ? "Yes" : "No"}
        />
      </div>

      {/* =======================================================
          PACKAGE DETAILS
          ======================================================= */}

      <section className="rounded-xl border border-emerald-100 bg-white p-4 sm:p-5">
        <h3 className="text-base font-bold text-slate-900">Package Details</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Package Name" value={packageData?.name} />

          <DetailItem label="Slug" value={packageData?.slug} />

          <DetailItem
            label="Destination"
            value={packageData?.destination?.name}
          />

          <DetailItem
            label="Price"
            value={`₹${Number(packageData?.price || 0).toLocaleString(
              "en-IN",
            )}`}
          />

          <DetailItem
            label="Price Type"
            value={formatPriceType(packageData?.priceType)}
          />

          <DetailItem
            label="Duration"
            value={`${packageData?.duration?.days ?? 0} Days / ${
              packageData?.duration?.nights ?? 0
            } Nights`}
          />
        </div>
      </section>

      {/* =======================================================
          DESCRIPTION
          ======================================================= */}

      <section className="rounded-xl border border-emerald-100 bg-white p-4 sm:p-5">
        <h3 className="text-base font-bold text-slate-900">Description</h3>

        {packageData?.shortDescription ? (
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
            {packageData.shortDescription}
          </p>
        ) : null}

        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
          {packageData?.description || "-"}
        </p>
      </section>

      {/* =======================================================
          INCLUSIONS / EXCLUSIONS
          ======================================================= */}

      <div className="grid gap-4 lg:grid-cols-2">
        <ListSection title="Inclusions" items={packageData?.inclusions} />

        <ListSection title="Exclusions" items={packageData?.exclusions} />
      </div>

      {/* =======================================================
          ITINERARY
          ======================================================= */}

      <section className="rounded-xl border border-emerald-100 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Itinerary</h3>

          <p className="mt-1 text-xs text-slate-500">
            Daily activities and selected places.
          </p>
        </div>

        {Array.isArray(packageData?.itinerary) &&
        packageData.itinerary.length > 0 ? (
          <div className="space-y-3">
            {packageData.itinerary.map((day, index) => (
              <div
                key={`day-${day.day}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {day.day || index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      {day.title || `Day ${index + 1}`}
                    </h4>

                    {day.description ? (
                      <p className="mt-1.5 whitespace-pre-line text-xs leading-5 text-slate-600">
                        {day.description}
                      </p>
                    ) : null}

                    {Array.isArray(day.places) && day.places.length > 0 ? (
                      <div className="mt-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                          Places
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {day.places.map((place, placeIndex) => (
                            <span
                              key={place?._id || place || placeIndex}
                              className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
                            >
                              {typeof place === "object"
                                ? place.name || place.slug || "Place"
                                : place}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
            <p className="text-xs text-slate-500">No itinerary added.</p>
          </div>
        )}
      </section>

      {/* =======================================================
          GALLERY
          ======================================================= */}

      <section className="rounded-xl border border-emerald-100 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">Gallery</h3>

          <p className="mt-1 text-xs text-slate-500">Package gallery images.</p>
        </div>

        {Array.isArray(packageData?.gallery) &&
        packageData.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {packageData.gallery.map((image, index) => (
              <div
                key={`gallery-${image?.publicId || image?.url || index}`}
                className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
              >
                {image?.url ? (
                  <img
                    src={image.url}
                    alt={`${packageData.name || "Package"} gallery ${
                      index + 1
                    }`}
                    className="h-32 w-full object-cover transition duration-300 hover:scale-105 sm:h-36"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center">
                    <span className="text-[11px] text-slate-400">
                      Image unavailable
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
            <p className="text-xs text-slate-500">No gallery images.</p>
          </div>
        )}
      </section>

      {/* =======================================================
          FOOTER
          ======================================================= */}

      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800 sm:text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}

/* =============================================================
   INFO CARD
   ============================================================= */

function InfoCard({ icon, label, value, secondary }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-3.5 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-600">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p className="mt-1.5 text-sm font-bold text-slate-900">{value}</p>

      {secondary ? (
        <p className="mt-0.5 text-[10px] font-medium text-slate-400">
          {secondary}
        </p>
      ) : null}
    </div>
  );
}

/* =============================================================
   DETAIL ITEM
   ============================================================= */

function DetailItem({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-slate-800 sm:text-sm">
        {value || "-"}
      </p>
    </div>
  );
}

/* =============================================================
   LIST SECTION
   ============================================================= */

function ListSection({ title, items }) {
  const normalizedItems = Array.isArray(items) ? items.filter(Boolean) : [];

  return (
    <section className="rounded-xl border border-emerald-100 bg-white p-4 sm:p-5">
      <h3 className="text-base font-bold text-slate-900">{title}</h3>

      {normalizedItems.length > 0 ? (
        <ul className="mt-3 space-y-2.5">
          {normalizedItems.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex gap-2.5 text-xs leading-5 text-slate-600 sm:text-sm"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />

              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-slate-400">None specified.</p>
      )}
    </section>
  );
}

/* =============================================================
   PRICE TYPE
   ============================================================= */

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