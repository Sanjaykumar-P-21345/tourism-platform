"use client";

import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
  packageId: "",
  destinationId: "",
};

export default function InquiryPage() {
  const [form, setForm] = useState(initialForm);

  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Load destinations and packages
  useEffect(() => {
    async function loadOptions() {
      try {
        const response = await fetch("/api/inquiries/options");

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load options.");
        }

        setDestinations(result.data.destinations || []);
        setPackages(result.data.packages || []);
      } catch (error) {
        console.error("Options Loading Error:", error);

        setError(
          "Unable to load destinations and packages. Please refresh the page.",
        );
      } finally {
        setOptionsLoading(false);
      }
    }

    loadOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      };

      if (form.packageId) {
        payload.packageId = form.packageId;
      }

      if (form.destinationId) {
        payload.destinationId = form.destinationId;
      }

      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to submit inquiry.");
      }

      setSuccess("Your inquiry has been submitted successfully!");

      setForm(initialForm);
    } catch (error) {
      console.error("Inquiry Submission Error:", error);

      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
            SST Tourism
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Send Us an Inquiry
          </h1>

          <p className="mt-3 text-slate-600">
            Have questions about your trip? Our team will help you plan your
            journey.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-8">
          {/* SUCCESS MESSAGE */}
          {success && (
            <div
              role="status"
              className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div
              role="alert"
              className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME AND EMAIL */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name *
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address *
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* PHONE AND SUBJECT */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone Number *
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  maxLength={20}
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Subject
                </label>

                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={150}
                  placeholder="Inquiry subject"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* DESTINATION AND PACKAGE DROPDOWNS */}
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="mb-3 text-xs text-slate-500">
                Optional: Select a destination or package related to your
                inquiry.
              </p>

              <div className="grid gap-5 md:grid-cols-2">
                {/* DESTINATION */}
                <div>
                  <label
                    htmlFor="destinationId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Destination
                  </label>

                  <select
                    id="destinationId"
                    name="destinationId"
                    value={form.destinationId}
                    onChange={handleChange}
                    disabled={optionsLoading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {optionsLoading
                        ? "Loading destinations..."
                        : "Select destination (optional)"}
                    </option>

                    {destinations.map((destination) => (
                      <option key={destination._id} value={destination._id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PACKAGE */}
                <div>
                  <label
                    htmlFor="packageId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Package
                  </label>

                  <select
                    id="packageId"
                    name="packageId"
                    value={form.packageId}
                    onChange={handleChange}
                    disabled={optionsLoading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {optionsLoading
                        ? "Loading packages..."
                        : "Select package (optional)"}
                    </option>

                    {packages.map((pkg) => (
                      <option key={pkg._id} value={pkg._id}>
                        {pkg.name || pkg.title || "Unnamed package"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* MESSAGE */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Message *
              </label>

              <textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={2000}
                rows={6}
                placeholder="Tell us about your travel requirements..."
                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-1 text-right text-xs text-slate-500">
                {form.message.length}/2000
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading || optionsLoading}
              className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
