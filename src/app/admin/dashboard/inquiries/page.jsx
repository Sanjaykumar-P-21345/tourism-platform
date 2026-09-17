"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, Eye, CheckCircle, X } from "lucide-react";

import { adminApi } from "@/utils/adminApi";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "New", value: "new" },
  { label: "Contacted", value: "contacted" },
  { label: "Resolved", value: "resolved" },
  { label: "Archived", value: "archived" },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [updating, setUpdating] = useState(false);

  /* =========================================================
     LOAD INQUIRIES
  ========================================================= */

  async function loadInquiries() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (status !== "all") {
        params.set("status", status);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      const query = params.toString();

      const url = `/api/dashboard/inquiries${query ? `?${query}` : ""}`;

      const response = await adminApi.get(url);

      // api.js returns JSON directly
      const result = response;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to load inquiries.");
      }

      setInquiries(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Load Inquiries Error:", error);

      setError(error.message || "Failed to load inquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, [status]);

  /* =========================================================
     UPDATE INQUIRY
  ========================================================= */

  async function updateInquiry(id, updateData) {
    try {
      setUpdating(true);
      setError("");

      const response = await adminApi.patch(
        `/api/dashboard/inquiries/${id}`,
        updateData,
      );

      // api.js returns JSON directly
      const result = response;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to update inquiry.");
      }

      setInquiries((current) =>
        current.map((inquiry) =>
          inquiry._id === id ? { ...inquiry, ...result.data } : inquiry,
        ),
      );

      setSelectedInquiry((current) =>
        current?._id === id ? { ...current, ...result.data } : current,
      );
    } catch (error) {
      console.error("Update Inquiry Error:", error);

      setError(error.message || "Failed to update inquiry.");
    } finally {
      setUpdating(false);
    }
  }

  /* =========================================================
     STATUS STYLE
  ========================================================= */

  function getStatusClass(currentStatus) {
    const styles = {
      new: "bg-blue-100 text-blue-700",
      contacted: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
      archived: "bg-slate-200 text-slate-600",
    };

    return styles[currentStatus] || styles.new;
  }

  /* =========================================================
     OPEN INQUIRY
  ========================================================= */

  function handleViewInquiry(inquiry) {
    setSelectedInquiry(inquiry);

    if (!inquiry.isRead) {
      updateInquiry(inquiry._id, {
        isRead: true,
      });
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
              Management
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Inquiries
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage visitor questions and travel requests.
            </p>
          </div>

          <button
            type="button"
            onClick={loadInquiries}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* FILTERS */}

        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-3 md:flex-row">
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadInquiries();
                  }
                }}
                placeholder="Search by name, email, phone..."
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* STATUS */}

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* SEARCH BUTTON */}

            <button
              type="button"
              onClick={loadInquiries}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Search
            </button>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading inquiries...
            </div>
          ) : inquiries.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              No inquiries found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Visitor</th>

                    <th className="px-5 py-4">Subject</th>

                    <th className="px-5 py-4">Status</th>

                    <th className="px-5 py-4">Date</th>

                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inquiry) => (
                    <tr
                      key={inquiry._id}
                      className={
                        inquiry.isRead
                          ? "transition hover:bg-slate-50"
                          : "bg-indigo-50/40 transition hover:bg-indigo-50"
                      }
                    >
                      {/* VISITOR */}

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {inquiry.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {inquiry.email}
                        </p>

                        <p className="text-xs text-slate-500">
                          {inquiry.phone}
                        </p>
                      </td>

                      {/* SUBJECT */}

                      <td className="max-w-xs px-5 py-4 text-slate-600">
                        {inquiry.subject || "No subject"}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(
                            inquiry.status,
                          )}`}
                        >
                          {inquiry.status}
                        </span>
                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {inquiry.createdAt
                          ? new Date(inquiry.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleViewInquiry(inquiry)}
                          className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          <Eye size={15} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* DETAILS MODAL */}

      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* MODAL HEADER */}

            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Inquiry Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              {/* VISITOR */}

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Visitor
                </p>

                <p className="font-semibold text-slate-900">
                  {selectedInquiry.name}
                </p>
              </div>

              {/* CONTACT */}

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Contact
                </p>

                <p className="text-slate-700">{selectedInquiry.email}</p>

                <p className="text-slate-700">{selectedInquiry.phone}</p>
              </div>

              {/* SUBJECT */}

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Subject
                </p>

                <p className="text-slate-700">
                  {selectedInquiry.subject || "No subject"}
                </p>
              </div>

              {/* MESSAGE */}

              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Message
                </p>

                <p className="whitespace-pre-wrap text-slate-700">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* PACKAGE */}

              {selectedInquiry.packageId && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Package
                  </p>

                  <p className="text-slate-700">
                    {typeof selectedInquiry.packageId === "object"
                      ? selectedInquiry.packageId.name ||
                        selectedInquiry.packageId.title ||
                        "Selected package"
                      : selectedInquiry.packageId}
                  </p>
                </div>
              )}

              {/* DESTINATION */}

              {selectedInquiry.destinationId && (
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Destination
                  </p>

                  <p className="text-slate-700">
                    {typeof selectedInquiry.destinationId === "object"
                      ? selectedInquiry.destinationId.name ||
                        selectedInquiry.destinationId.title ||
                        "Selected destination"
                      : selectedInquiry.destinationId}
                  </p>
                </div>
              )}

              {/* STATUS */}

              <div>
                <label
                  htmlFor="inquiryStatus"
                  className="mb-2 block text-xs font-semibold uppercase text-slate-400"
                >
                  Status
                </label>

                <select
                  id="inquiryStatus"
                  value={selectedInquiry.status || "new"}
                  disabled={updating}
                  onChange={(event) =>
                    updateInquiry(selectedInquiry._id, {
                      status: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"
                >
                  {statusOptions
                    .filter((option) => option.value !== "all")
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>

              {/* ADMIN NOTE */}

              <div>
                <label
                  htmlFor="adminNote"
                  className="mb-2 block text-xs font-semibold uppercase text-slate-400"
                >
                  Admin Note
                </label>

                <textarea
                  id="adminNote"
                  key={selectedInquiry._id}
                  defaultValue={selectedInquiry.adminNote || ""}
                  rows={4}
                  placeholder="Add an internal note..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  onBlur={(event) => {
                    const note = event.target.value;

                    if (note !== (selectedInquiry.adminNote || "")) {
                      updateInquiry(selectedInquiry._id, {
                        adminNote: note,
                      });
                    }
                  }}
                />
              </div>

              {/* RESOLVE BUTTON */}

              <button
                type="button"
                onClick={() =>
                  updateInquiry(selectedInquiry._id, {
                    status: "resolved",
                  })
                }
                disabled={updating}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle size={17} />

                {updating ? "Updating..." : "Mark as Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
