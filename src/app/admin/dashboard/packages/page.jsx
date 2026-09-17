"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  X,
  AlertTriangle,
  Star,
} from "lucide-react";

import { adminApi } from "@/utils/adminApi";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [deleting, setDeleting] = useState(false);

  async function loadPackages() {
    try {
      setError("");

      const response = await adminApi.get("/api/dashboard/packages");

      setPackages(response?.data || []);
    } catch (loadError) {
      console.error("Package load error:", loadError);

      setError(loadError?.message || "Failed to load packages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackages();
  }, []);

  async function handleDelete() {
    if (!deleteTarget?._id) return;

    setDeleting(true);

    try {
      await adminApi.delete(`/api/dashboard/packages/${deleteTarget._id}`);

      setDeleteTarget(null);

      await loadPackages();
    } catch (deleteError) {
      setError(deleteError?.message || "Failed to deactivate package.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Packages
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage tourism packages, pricing, itineraries and images.
          </p>
        </div>

        <Link
          href="/admin/dashboard/packages/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={18} />
          Create Package
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
          />

          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto text-red-500"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={32}
                className="mx-auto animate-spin text-indigo-600"
              />

              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Loading packages...
              </p>
            </div>
          </div>
        ) : packages.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <Plus size={24} className="text-slate-400" />
            </div>

            <h2 className="mt-4 font-bold text-slate-900 dark:text-white">
              No packages found
            </h2>

            <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Create your first tourism package to get started.
            </p>

            <Link
              href="/admin/dashboard/packages/create"
              className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create Package
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <tr>
                  <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Package
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Destination
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Duration
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Price
                  </th>

                  <th className="px-5 py-4 text-left font-semibold text-slate-600 dark:text-slate-300">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold text-slate-600 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {packages.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    {/* Package */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                          {item.coverImage?.url ? (
                            <img
                              src={item.coverImage.url}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="max-w-[250px] truncate font-semibold text-slate-900 dark:text-white">
                              {item.name || "-"}
                            </p>

                            {item.isFeatured && (
                              <Star
                                size={14}
                                className="shrink-0 fill-current text-amber-500"
                              />
                            )}
                          </div>

                          <p className="mt-1 max-w-[280px] truncate text-xs text-slate-500 dark:text-slate-400">
                            {item.shortDescription || item.slug || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Destination */}
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {item.destination?.name || "-"}
                    </td>

                    {/* Duration */}
                    <td className="px-5 py-4">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {item.duration?.days ?? 0}D /{" "}
                        {item.duration?.nights ?? 0}N
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {item.price ?? "-"}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {formatPriceType(item.priceType)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          item.isActive
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          href={`/admin/dashboard/packages/${item._id}?view=true`}
                          label="View"
                          icon={<Eye size={17} />}
                          variant="view"
                        />

                        <ActionButton
                          href={`/admin/dashboard/packages/${item._id}`}
                          label="Edit"
                          icon={<Pencil size={17} />}
                          variant="edit"
                        />

                        {item.isActive && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Deactivate"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteTarget(null)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <Trash2 size={22} />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
              Deactivate Package?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Are you sure you want to deactivate{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {deleteTarget.name}
              </span>
              ? The package will remain in the database but will become
              inactive.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <Loader2 size={16} className="animate-spin" />}

                {deleting ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({ href, label, icon, variant }) {
  const variantClasses = {
    view: "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",

    edit: "border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/30",
  };

  return (
    <Link
      href={href}
      title={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${variantClasses[variant]}`}
    >
      {icon}
    </Link>
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