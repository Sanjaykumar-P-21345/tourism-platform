"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Bike,
  BusFront,
  Car,
  Eye,
  Pencil,
  Plane,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  Route,
  TrainFront,
  Trash2,
  X,
} from "lucide-react";

import AdminButton from "@/components/admin/AdminButton";
import { adminApi } from "@/utils/adminApi";

/* =========================================================
   TRANSPORTATION PAGE
========================================================= */

export default function TransportationPage() {
  const [transportation, setTransportation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  async function loadTransportation() {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/api/dashboard/transportation");

      const list =
        response?.data?.transportation ||
        response?.transportation ||
        response?.data ||
        [];

      setTransportation(Array.isArray(list) ? list : []);
    } catch (loadError) {
      console.error("Failed to load transportation:", loadError);

      setError(
        loadError?.data?.message ||
          loadError?.message ||
          "Failed to load transportation.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransportation();
  }, []);

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const total = transportation.length;

    const active = transportation.filter(
      (item) => item.isActive !== false,
    ).length;

    const inactive = transportation.filter(
      (item) => item.isActive === false,
    ).length;

    const flights = transportation.filter(
      (item) => item.type === "flight",
    ).length;

    const trains = transportation.filter(
      (item) => item.type === "train",
    ).length;

    const buses = transportation.filter((item) => item.type === "bus").length;

    return {
      total,
      active,
      inactive,
      flights,
      trains,
      buses,
    };
  }, [transportation]);

  /* =======================================================
     TOGGLE ACTIVE / INACTIVE
  ======================================================= */

  async function handleToggle(item) {
    if (!item?._id || togglingId) {
      return;
    }

    try {
      setTogglingId(item._id);
      setError("");

      await adminApi.put(`/api/dashboard/transportation/${item._id}`, {
        isActive: !item.isActive,
      });

      await loadTransportation();
    } catch (toggleError) {
      console.error("Failed to update transportation status:", toggleError);

      setError(
        toggleError?.data?.message ||
          toggleError?.message ||
          "Failed to update transportation status.",
      );
    } finally {
      setTogglingId(null);
    }
  }

  /* =======================================================
     PERMANENT DELETE
  ======================================================= */

  async function handleDelete() {
    if (!deleteItem?._id || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await adminApi.delete(`/api/dashboard/transportation/${deleteItem._id}`);

      setDeleteItem(null);

      await loadTransportation();
    } catch (deleteError) {
      console.error("Failed to delete transportation:", deleteError);

      setError(
        deleteError?.data?.message ||
          deleteError?.message ||
          "Failed to delete transportation.",
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     CLOSE VIEW
  ======================================================= */

  function closeView() {
    setSelectedItem(null);
  }

  /* =======================================================
     FORMATTERS
  ======================================================= */

  function formatType(type) {
    if (!type) {
      return "Transportation";
    }

    return type
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function formatCurrency(value) {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
      return "—";
    }

    return `₹${numericValue.toLocaleString("en-IN")}`;
  }

  function getDestinationName(item) {
    if (typeof item?.destination === "object") {
      return item.destination?.name || item.destination?.title || "—";
    }

    return item?.destination || "—";
  }

  /* =======================================================
     ICONS
  ======================================================= */

  function getTransportIcon(type, size = 18) {
    switch (type) {
      case "flight":
        return <Plane size={size} />;

      case "train":
        return <TrainFront size={size} />;

      case "bus":
        return <BusFront size={size} />;

      case "taxi":
        return <Car size={size} />;

      case "car-rental":
        return <Car size={size} />;

      case "bike-rental":
        return <Bike size={size} />;

      default:
        return <Route size={size} />;
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-full bg-emerald-50/30">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex min-h-[520px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                <RefreshCw
                  size={28}
                  className="animate-spin text-emerald-600"
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Loading transportation...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Preparing transportation records
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-full bg-emerald-50/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Route size={21} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Transportation
              </h1>

              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Manage transportation options available for your destinations.
              </p>
            </div>
          </div>

          <Link href="/admin/dashboard/transportation/create">
            <AdminButton icon={<Plus size={17} />}>
              Add Transportation
            </AdminButton>
          </Link>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <div>
                  <p className="text-sm font-semibold text-red-700">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-xs leading-5 text-red-600">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-500 transition hover:text-red-700"
                aria-label="Close error"
              >
                <X size={17} />
              </button>
            </div>
          </div>
        ) : null}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label="Total"
            value={stats.total}
            icon={<Route size={17} />}
          />

          <StatCard
            label="Active"
            value={stats.active}
            icon={<Power size={17} />}
          />

          <StatCard
            label="Inactive"
            value={stats.inactive}
            icon={<PowerOff size={17} />}
          />

          <StatCard
            label="Flights"
            value={stats.flights}
            icon={<Plane size={17} />}
          />

          <StatCard
            label="Trains"
            value={stats.trains}
            icon={<TrainFront size={17} />}
          />

          <StatCard
            label="Buses"
            value={stats.buses}
            icon={<BusFront size={17} />}
          />
        </div>

        {/* =================================================
            DESKTOP TABLE
        ================================================= */}

        <div className="hidden overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm md:block">
          <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Transportation Records
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {transportation.length} record
                {transportation.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <button
              type="button"
              onClick={loadTransportation}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {transportation.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Transportation
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Type
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Route
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Destination
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Cost
                    </th>

                    <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transportation.map((item) => {
                    const active = item.isActive !== false;

                    return (
                      <tr
                        key={item._id}
                        className="transition hover:bg-emerald-50/30"
                      >
                        {/* NAME */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              {getTransportIcon(item.type, 18)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-900">
                                {item.providerName || "Unnamed Provider"}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-400">
                                {item.contactPhone || "No contact number"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* TYPE */}

                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                            {formatType(item.type)}
                          </span>
                        </td>

                        {/* ROUTE */}

                        <td className="px-5 py-4">
                          <div className="max-w-[220px]">
                            <p className="truncate text-xs font-semibold text-slate-700">
                              {item.from || "—"}
                            </p>

                            <div className="my-1 flex items-center gap-1 text-slate-300">
                              <span className="h-px w-5 bg-slate-200" />
                              <Route size={12} />
                            </div>

                            <p className="truncate text-xs font-semibold text-slate-700">
                              {item.to || "—"}
                            </p>
                          </div>
                        </td>

                        {/* DESTINATION */}

                        <td className="px-5 py-4">
                          <p className="max-w-[150px] truncate text-xs font-semibold text-slate-700">
                            {getDestinationName(item)}
                          </p>
                        </td>

                        {/* COST */}

                        <td className="px-5 py-4">
                          <p className="text-xs font-semibold text-slate-700">
                            {formatCurrency(item?.estimatedCost?.min)}
                            {item?.estimatedCost?.max != null
                              ? ` – ${formatCurrency(item.estimatedCost.max)}`
                              : ""}
                          </p>

                          {item.estimatedDuration ? (
                            <p className="mt-1 text-[11px] text-slate-400">
                              {item.estimatedDuration}
                            </p>
                          ) : null}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <StatusBadge active={active} />
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1.5">
                            <ActionButton
                              title="View"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye size={15} />
                            </ActionButton>

                            <Link
                              href={`/admin/dashboard/transportation/${item._id}`}
                            >
                              <ActionButton title="Edit">
                                <Pencil size={15} />
                              </ActionButton>
                            </Link>

                            <ActionButton
                              title={active ? "Deactivate" : "Activate"}
                              disabled={togglingId === item._id}
                              onClick={() => handleToggle(item)}
                            >
                              {active ? (
                                <PowerOff size={15} />
                              ) : (
                                <Power size={15} />
                              )}
                            </ActionButton>

                            <ActionButton
                              title="Delete"
                              danger
                              onClick={() => setDeleteItem(item)}
                            >
                              <Trash2 size={15} />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =================================================
            MOBILE CARDS
        ================================================= */}

        <div className="space-y-3 md:hidden">
          <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-sm font-bold text-slate-900">
                Transportation Records
              </p>

              <p className="mt-0.5 text-[11px] text-slate-400">
                {transportation.length} record
                {transportation.length !== 1 ? "s" : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={loadTransportation}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
              aria-label="Refresh transportation"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          {transportation.length === 0 ? (
            <EmptyState />
          ) : (
            transportation.map((item) => {
              const active = item.isActive !== false;

              return (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                          {getTransportIcon(item.type, 19)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-900">
                            {item.providerName || "Unnamed Provider"}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-slate-400">
                            {formatType(item.type)}
                          </p>
                        </div>
                      </div>

                      <StatusBadge active={active} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MobileInfo label="From" value={item.from || "—"} />

                      <MobileInfo label="To" value={item.to || "—"} />

                      <MobileInfo
                        label="Destination"
                        value={getDestinationName(item)}
                      />

                      <MobileInfo
                        label="Duration"
                        value={item.estimatedDuration || "—"}
                      />

                      <MobileInfo
                        label="Cost"
                        value={
                          item?.estimatedCost?.min != null
                            ? `${formatCurrency(item.estimatedCost.min)}${
                                item?.estimatedCost?.max != null
                                  ? ` – ${formatCurrency(
                                      item.estimatedCost.max,
                                    )}`
                                  : ""
                              }`
                            : "—"
                        }
                      />

                      <MobileInfo
                        label="Phone"
                        value={item.contactPhone || "—"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 border-t border-slate-100">
                    <MobileAction
                      label="View"
                      onClick={() => setSelectedItem(item)}
                    >
                      <Eye size={15} />
                    </MobileAction>

                    <Link
                      href={`/admin/dashboard/transportation/${item._id}`}
                      className="border-r border-slate-100"
                    >
                      <MobileAction label="Edit">
                        <Pencil size={15} />
                      </MobileAction>
                    </Link>

                    <MobileAction
                      label={active ? "Off" : "On"}
                      disabled={togglingId === item._id}
                      onClick={() => handleToggle(item)}
                    >
                      {active ? <PowerOff size={15} /> : <Power size={15} />}
                    </MobileAction>

                    <MobileAction
                      label="Delete"
                      danger
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 size={15} />
                    </MobileAction>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ===================================================
          VIEW MODAL
      =================================================== */}

      {selectedItem ? (
        <ViewTransportationModal
          item={selectedItem}
          onClose={closeView}
          onEdit={() => {
            setSelectedItem(null);
          }}
        />
      ) : null}

      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deleteItem ? (
        <DeleteModal
          item={deleteItem}
          deleting={deleting}
          onCancel={() => {
            if (!deleting) {
              setDeleteItem(null);
            }
          }}
          onConfirm={handleDelete}
          formatType={formatType}
        />
      ) : null}
    </div>
  );
}

/* =============================================================
   STAT CARD
============================================================= */

function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* =============================================================
   ACTION BUTTON
============================================================= */

function ActionButton({
  children,
  title,
  onClick,
  disabled = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "border-red-100 bg-white text-red-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
      }`}
    >
      {children}
    </button>
  );
}

/* =============================================================
   MOBILE INFO
============================================================= */

function MobileInfo({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* =============================================================
   MOBILE ACTION
============================================================= */

function MobileAction({
  children,
  label,
  onClick,
  disabled = false,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[58px] flex-col items-center justify-center gap-1 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        danger
          ? "text-red-500 hover:bg-red-50"
          : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600"
      }`}
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

/* =============================================================
   EMPTY STATE
============================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Route size={25} />
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-900">
        No transportation found
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        Add transportation options to make them available for your destinations.
      </p>

      <Link
        href="/admin/dashboard/transportation/create"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
      >
        <Plus size={15} />
        Add Transportation
      </Link>
    </div>
  );
}

/* =============================================================
   VIEW MODAL
============================================================= */

function ViewTransportationModal({ item, onClose }) {
  const destinationName =
    typeof item?.destination === "object"
      ? item.destination?.name || item.destination?.title || "—"
      : item?.destination || "—";

  const type = item?.type || "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* BACKDROP */}

      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* CONTAINER */}

      <div className="relative flex min-h-full items-start justify-center p-3 sm:p-6 lg:p-10">
        <div
          className="relative my-4 w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl sm:my-8"
          onClick={(event) => event.stopPropagation()}
        >
          {/* HEADER */}

          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                {getStaticTransportIcon(type)}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                  {item?.providerName || "Transportation"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  {formatStaticType(type)}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* CONTENT */}

          <div className="max-h-[calc(100vh-120px)] overflow-y-auto p-4 sm:p-6">
            {/* COVER */}

            {item?.coverImage?.url ? (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={item.coverImage.url}
                  alt={item.providerName || "Transportation"}
                  className="h-52 w-full object-cover sm:h-64"
                />
              </div>
            ) : null}

            {/* SUMMARY */}

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DetailItem label="Type" value={formatStaticType(type)} />

              <DetailItem label="Destination" value={destinationName} />

              <DetailItem
                label="Status"
                value={item.isActive !== false ? "Active" : "Inactive"}
              />
            </div>

            {/* ROUTE */}

            <section className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 sm:p-5">
              <SectionTitle>Route</SectionTitle>

              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <RouteBox label="From" value={item.from || "—"} />

                <div className="hidden items-center justify-center text-emerald-500 sm:flex">
                  <Route size={20} />
                </div>

                <RouteBox label="To" value={item.to || "—"} />
              </div>
            </section>

            {/* DETAILS */}

            <section className="mt-6">
              <SectionTitle>Transportation Details</SectionTitle>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DetailItem label="Provider" value={item.providerName || "—"} />

                <DetailItem label="Phone" value={item.contactPhone || "—"} />

                <DetailItem
                  label="Estimated Duration"
                  value={item.estimatedDuration || "—"}
                />

                <DetailItem label="Schedule" value={item.schedule || "—"} />

                <DetailItem
                  label="Minimum Cost"
                  value={formatStaticCurrency(item?.estimatedCost?.min)}
                />

                <DetailItem
                  label="Maximum Cost"
                  value={formatStaticCurrency(item?.estimatedCost?.max)}
                />

                <DetailItem
                  label="Booking URL"
                  value={item.bookingUrl || "—"}
                />

                <DetailItem label="Address" value={item.address || "—"} />
              </div>
            </section>

            {/* DESCRIPTION */}

            {item.description ? (
              <section className="mt-6">
                <SectionTitle>Description</SectionTitle>

                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              </section>
            ) : null}

            {/* GALLERY */}

            {Array.isArray(item.gallery) && item.gallery.length > 0 ? (
              <section className="mt-6">
                <SectionTitle>Gallery</SectionTitle>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {item.gallery.map((image, index) =>
                    image?.url ? (
                      <div
                        key={image.publicId || index}
                        className="overflow-hidden rounded-xl border border-slate-200"
                      >
                        <img
                          src={image.url}
                          alt={`Transportation gallery ${index + 1}`}
                          className="h-32 w-full object-cover sm:h-36"
                        />
                      </div>
                    ) : null,
                  )}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   DELETE MODAL
============================================================= */

function DeleteModal({ item, deleting, onCancel, onConfirm, formatType }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* BACKDROP */}

      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={() => {
          if (!deleting) {
            onCancel();
          }
        }}
      />

      {/* MODAL */}

      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">
                Delete Transportation
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                This action will permanently remove this transportation record.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">
              {item?.providerName || "Unnamed Provider"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {formatType(item?.type)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {item?.from || "—"} → {item?.to || "—"}
            </p>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={15} />
                  Delete Permanently
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =============================================================
   ROUTE BOX
============================================================= */

function RouteBox({ label, value }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

/* =============================================================
   DETAIL ITEM
============================================================= */

function DetailItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1.5 break-words text-sm font-semibold text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

/* =============================================================
   SECTION TITLE
============================================================= */

function SectionTitle({ children }) {
  return <h3 className="text-sm font-bold text-slate-900">{children}</h3>;
}

/* =============================================================
   STATIC HELPERS FOR MODAL
============================================================= */

function formatStaticType(type) {
  if (!type) {
    return "Transportation";
  }

  return type
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatStaticCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return `₹${numericValue.toLocaleString("en-IN")}`;
}

function getStaticTransportIcon(type) {
  switch (type) {
    case "flight":
      return <Plane size={19} />;

    case "train":
      return <TrainFront size={19} />;

    case "bus":
      return <BusFront size={19} />;

    case "taxi":
      return <Car size={19} />;

    case "car-rental":
      return <Car size={19} />;

    case "bike-rental":
      return <Bike size={19} />;

    default:
      return <Route size={19} />;
  }
}