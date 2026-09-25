"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  Eye,
  IndianRupee,
  LoaderCircle,
  MapPin,
  Package as PackageIcon,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";

import StatCard from "@/components/admin/StatCard";
import { adminApi } from "@/utils/adminApi";

export default function PackagesPage() {
  const router = useRouter();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [confirmation, setConfirmation] = useState({
    open: false,
    type: null,
    packageData: null,
  });

  /* ---------------------------------------------------------------------- */
  /* Load Packages                                                          */
  /* ---------------------------------------------------------------------- */

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/api/dashboard/packages");

      const packageList = response?.data || response?.packages || [];

      setPackages(Array.isArray(packageList) ? packageList : []);
    } catch (err) {
      console.error("Failed to load packages:", err);

      setError(err?.message || "Failed to load packages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  /* ---------------------------------------------------------------------- */
  /* Statistics                                                             */
  /* ---------------------------------------------------------------------- */

  const stats = useMemo(() => {
    const total = packages.length;

    const active = packages.filter((item) => item.isActive !== false).length;

    const featured = packages.filter((item) => item.isFeatured === true).length;

    return {
      total,
      active,
      featured,
    };
  }, [packages]);

  /* ---------------------------------------------------------------------- */
  /* Modal Navigation                                                       */
  /* ---------------------------------------------------------------------- */

  const openView = (id) => {
    router.push(`/admin/dashboard/packages/${id}?view=true`);
  };

  const openEdit = (id) => {
    router.push(`/admin/dashboard/packages/${id}`);
  };

  const openCreate = () => {
    router.push("/admin/dashboard/packages/create");
  };

  /* ---------------------------------------------------------------------- */
  /* Confirmation                                                            */
  /* ---------------------------------------------------------------------- */

  const requestToggle = (packageData) => {
    setConfirmation({
      open: true,
      type: "toggle",
      packageData,
    });
  };

  const requestDelete = (packageData) => {
    setConfirmation({
      open: true,
      type: "delete",
      packageData,
    });
  };

  const closeConfirmation = () => {
    if (actionLoadingId) {
      return;
    }

    setConfirmation({
      open: false,
      type: null,
      packageData: null,
    });
  };

  /* ---------------------------------------------------------------------- */
  /* Confirm Action                                                          */
  /* ---------------------------------------------------------------------- */

  const handleConfirmedAction = async () => {
    const packageData = confirmation.packageData;

    if (!packageData?._id) {
      return;
    }

    try {
      setActionLoadingId(packageData._id);

      if (confirmation.type === "toggle") {
        await adminApi.put(`/api/dashboard/packages/${packageData._id}`, {
          isActive: packageData.isActive === false,
        });
      }

      if (confirmation.type === "delete") {
        await adminApi.delete(`/api/dashboard/packages/${packageData._id}`);
      }

      setConfirmation({
        open: false,
        type: null,
        packageData: null,
      });

      await loadPackages();
    } catch (err) {
      console.error("Package action failed:", err);

      setError(err?.message || "The requested action could not be completed.");

      setConfirmation({
        open: false,
        type: null,
        packageData: null,
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                 */
  /* ---------------------------------------------------------------------- */

  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return "—";
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
  };

  const formatDuration = (duration) => {
    if (!duration) {
      return "—";
    }

    const days = Number(duration.days);
    const nights = Number(duration.nights);

    if (!Number.isFinite(days)) {
      return "—";
    }

    if (!Number.isFinite(nights)) {
      return `${days} days`;
    }

    return `${days}D / ${nights}N`;
  };

  const getDestinationName = (packageData) => {
    if (!packageData?.destination) {
      return "—";
    }

    if (typeof packageData.destination === "string") {
      return packageData.destination;
    }

    return packageData.destination.name || packageData.destination.title || "—";
  };

  const getCoverImage = (packageData) => {
    if (!packageData?.coverImage) {
      return null;
    }

    if (typeof packageData.coverImage === "string") {
      return packageData.coverImage;
    }

    return packageData.coverImage.url || null;
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="min-h-screen w-full bg-emerald-50/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ================================================================ */}
        {/* Header                                                            */}
        {/* ================================================================ */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <PackageIcon size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Packages
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage travel packages, pricing, itineraries and visibility.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Plus size={17} />
            Add Package
          </button>
        </div>

        {/* ================================================================ */}
        {/* Error                                                             */}
        {/* ================================================================ */}

        {error ? (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Something went wrong</p>

              <p className="mt-0.5 text-sm text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={loadPackages}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        ) : null}

        {/* ================================================================ */}
        {/* Stats                                                             */}
        {/* ================================================================ */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Packages"
            value={stats.total}
            description="All packages in the system"
            icon={<PackageIcon size={18} />}
          />

          <StatCard
            title="Active Packages"
            value={stats.active}
            description="Currently active packages"
            icon={<Power size={18} />}
          />

          <StatCard
            title="Featured Packages"
            value={stats.featured}
            description="Packages marked as featured"
            icon={<Star size={18} />}
          />
        </div>

        {/* ================================================================ */}
        {/* Loading                                                            */}
        {/* ================================================================ */}

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-emerald-100 bg-white shadow-sm">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                <LoaderCircle
                  size={26}
                  className="animate-spin text-emerald-600"
                />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                Loading packages...
              </p>

              <p className="mt-1 text-xs text-slate-400">Please wait</p>
            </div>
          </div>
        ) : packages.length === 0 ? (
          /* ================================================================ */
          /* Empty State                                                       */
          /* ================================================================ */

          <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-white px-6 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <PackageIcon size={28} />
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-900">
              No packages found
            </h2>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Create your first travel package to start building package-based
              travel experiences.
            </p>

            <button
              type="button"
              onClick={openCreate}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus size={17} />
              Add Package
            </button>
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* Desktop Table                                                  */}
            {/* ============================================================ */}

            <div className="hidden overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-emerald-100 bg-emerald-50/60">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Package
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Destination
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Duration
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Price
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                        Featured
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-emerald-50">
                    {packages.map((packageData) => {
                      const imageUrl = getCoverImage(packageData);

                      const isActive = packageData.isActive !== false;

                      const isFeatured = packageData.isFeatured === true;

                      return (
                        <tr
                          key={packageData._id}
                          className="transition hover:bg-emerald-50/30"
                        >
                          {/* Package */}
                          <td className="px-5 py-4">
                            <div className="flex min-w-[280px] items-center gap-3">
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50">
                                {imageUrl ? (
                                  <img
                                    src={imageUrl}
                                    alt={packageData.name || "Package"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-emerald-600">
                                    <PackageIcon size={21} />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {packageData.name || "Untitled Package"}
                                </p>

                                {packageData.shortDescription ? (
                                  <p className="mt-1 max-w-[260px] truncate text-xs text-slate-400">
                                    {packageData.shortDescription}
                                  </p>
                                ) : packageData.slug ? (
                                  <p className="mt-1 truncate text-xs text-slate-400">
                                    /{packageData.slug}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          {/* Destination */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin
                                size={15}
                                className="shrink-0 text-emerald-500"
                              />

                              <span className="max-w-[160px] truncate">
                                {getDestinationName(packageData)}
                              </span>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <CalendarDays
                                size={15}
                                className="text-emerald-500"
                              />

                              {formatDuration(packageData.duration)}
                            </div>
                          </td>

                          {/* Price */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                              <IndianRupee
                                size={14}
                                className="text-emerald-600"
                              />

                              {Number(packageData.price).toLocaleString(
                                "en-IN",
                              )}
                            </div>

                            <p className="mt-0.5 text-[11px] capitalize text-slate-400">
                              {String(
                                packageData.priceType || "per-person",
                              ).replace("-", " ")}
                            </p>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Featured */}
                          <td className="px-4 py-4">
                            {isFeatured ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                <Star size={13} className="fill-current" />
                                Featured
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">No</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <ActionButton
                                label="View"
                                onClick={() => openView(packageData._id)}
                              >
                                <Eye size={16} />
                              </ActionButton>

                              <ActionButton
                                label="Edit"
                                onClick={() => openEdit(packageData._id)}
                              >
                                <Pencil size={16} />
                              </ActionButton>

                              <ActionButton
                                label={isActive ? "Deactivate" : "Activate"}
                                onClick={() => requestToggle(packageData)}
                                disabled={actionLoadingId === packageData._id}
                              >
                                {isActive ? (
                                  <PowerOff size={16} />
                                ) : (
                                  <Power size={16} />
                                )}
                              </ActionButton>

                              <ActionButton
                                label="Delete"
                                danger
                                onClick={() => requestDelete(packageData)}
                                disabled={actionLoadingId === packageData._id}
                              >
                                <Trash2 size={16} />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ============================================================ */}
            {/* Mobile Cards                                                   */}
            {/* ============================================================ */}

            <div className="space-y-4 md:hidden">
              {packages.map((packageData) => {
                const imageUrl = getCoverImage(packageData);

                const isActive = packageData.isActive !== false;

                const isFeatured = packageData.isFeatured === true;

                return (
                  <div
                    key={packageData._id}
                    className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex gap-3 border-b border-emerald-50 p-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={packageData.name || "Package"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-emerald-600">
                            <PackageIcon size={23} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="truncate text-sm font-bold text-slate-900">
                            {packageData.name || "Untitled Package"}
                          </h2>

                          {isFeatured ? (
                            <Star
                              size={16}
                              className="shrink-0 fill-amber-400 text-amber-400"
                            />
                          ) : null}
                        </div>

                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin
                            size={13}
                            className="shrink-0 text-emerald-500"
                          />

                          <span className="truncate">
                            {getDestinationName(packageData)}
                          </span>
                        </div>

                        {packageData.shortDescription ? (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-4 text-slate-400">
                            {packageData.shortDescription}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3 px-4 py-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <CalendarDays size={13} />
                          Duration
                        </div>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {formatDuration(packageData.duration)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                          <IndianRupee size={13} />
                          Price
                        </div>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {formatPrice(packageData.price)}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 px-4 pb-4">
                      {isActive ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}

                      {isFeatured ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          <Star size={12} className="fill-current" />
                          Featured
                        </span>
                      ) : null}

                      {packageData.priceType ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-500">
                          {String(packageData.priceType).replace("-", " ")}
                        </span>
                      ) : null}
                    </div>

                    {/* Mobile Actions */}
                    <div className="grid grid-cols-4 gap-2 border-t border-emerald-50 bg-emerald-50/30 p-3">
                      <MobileActionButton
                        label="View"
                        onClick={() => openView(packageData._id)}
                      >
                        <Eye size={16} />
                      </MobileActionButton>

                      <MobileActionButton
                        label="Edit"
                        onClick={() => openEdit(packageData._id)}
                      >
                        <Pencil size={16} />
                      </MobileActionButton>

                      <MobileActionButton
                        label={isActive ? "Off" : "On"}
                        onClick={() => requestToggle(packageData)}
                        disabled={actionLoadingId === packageData._id}
                      >
                        {isActive ? (
                          <PowerOff size={16} />
                        ) : (
                          <Power size={16} />
                        )}
                      </MobileActionButton>

                      <MobileActionButton
                        label="Delete"
                        danger
                        onClick={() => requestDelete(packageData)}
                        disabled={actionLoadingId === packageData._id}
                      >
                        <Trash2 size={16} />
                      </MobileActionButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ================================================================== */}
      {/* Confirmation Backdrop Modal                                        */}
      {/* ================================================================== */}

      {confirmation.open && confirmation.packageData ? (
        <ConfirmationModal
          type={confirmation.type}
          packageData={confirmation.packageData}
          loading={actionLoadingId === confirmation.packageData._id}
          onCancel={closeConfirmation}
          onConfirm={handleConfirmedAction}
        />
      ) : null}
    </div>
  );
}

/* ========================================================================= */
/* Desktop Action Button                                                    */
/* ========================================================================= */

function ActionButton({
  children,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "border-red-100 bg-white text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

/* ========================================================================= */
/* Mobile Action Button                                                     */
/* ========================================================================= */

function MobileActionButton({
  children,
  label,
  onClick,
  danger = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex min-h-10 flex-col items-center justify-center gap-1 rounded-lg border bg-white px-2 py-1.5 transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        danger
          ? "border-red-100 text-red-500 hover:bg-red-50"
          : "border-emerald-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600",
      ].join(" ")}
    >
      {children}

      <span className="text-[10px] font-semibold">{label}</span>
    </button>
  );
}

/* ========================================================================= */
/* Confirmation Modal                                                       */
/* ========================================================================= */

function ConfirmationModal({
  type,
  packageData,
  loading,
  onCancel,
  onConfirm,
}) {
  const isDelete = type === "delete";

  const isCurrentlyActive = packageData?.isActive !== false;

  const title = isDelete
    ? "Delete Package Permanently?"
    : isCurrentlyActive
      ? "Deactivate Package?"
      : "Activate Package?";

  const description = isDelete
    ? "This package will be permanently removed. This action cannot be undone."
    : isCurrentlyActive
      ? "This package will be deactivated. You can activate it again later."
      : "This package will be activated and treated as an active package.";

  const confirmLabel = isDelete
    ? "Delete Permanently"
    : isCurrentlyActive
      ? "Deactivate"
      : "Activate";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="package-confirmation-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-slate-100 p-5">
          <div
            className={[
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              isDelete
                ? "bg-red-50 text-red-600"
                : isCurrentlyActive
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600",
            ].join(" ")}
          >
            {isDelete ? (
              <Trash2 size={21} />
            ) : isCurrentlyActive ? (
              <PowerOff size={21} />
            ) : (
              <Power size={21} />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="package-confirmation-title"
              className="text-base font-bold text-slate-900"
            >
              {title}
            </h2>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>

        {/* Package Preview */}
        <div className="px-5 py-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="truncate text-sm font-bold text-slate-800">
              {packageData?.name || "Untitled Package"}
            </p>

            {packageData?.slug ? (
              <p className="mt-0.5 truncate text-xs text-slate-400">
                /{packageData.slug}
              </p>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={[
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
              isDelete
                ? "bg-red-600 hover:bg-red-700"
                : isCurrentlyActive
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-600 hover:bg-emerald-700",
            ].join(" ")}
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : isDelete ? (
              <Trash2 size={16} />
            ) : isCurrentlyActive ? (
              <PowerOff size={16} />
            ) : (
              <Power size={16} />
            )}

            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}