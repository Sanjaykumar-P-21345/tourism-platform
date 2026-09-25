"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  User,
} from "lucide-react";

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

  /* =========================================================
     LOAD DESTINATIONS & PACKAGES
  ========================================================= */

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

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  /* =========================================================
     SUBMIT INQUIRY
  ========================================================= */

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
    <main className="min-h-screen bg-[#f5f8f6] text-slate-900">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#073b32]">
        {/* Decorative circles */}
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="absolute -right-20 top-10 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-teal-300/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            {/* Small badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-emerald-100 backdrop-blur">
              <MessageSquare size={16} />
              We're here to help
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Plan Your Journey
              <span className="block text-emerald-300">With SST Travels</span>
            </h1>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-emerald-50/80 sm:text-lg">
              Have a question about your destination, package, hotel, or trip?
              Send us your requirements and our team will help you plan your
              journey.
            </p>

            {/* Hero features */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur">
                <MapPin size={16} className="text-emerald-300" />
                Travel destinations
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur">
                <Globe2 size={16} className="text-emerald-300" />
                Custom trip planning
              </div>

              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm text-white backdrop-blur">
                <Sparkles size={16} className="text-amber-300" />
                Personal assistance
              </div>
            </div>
          </div>
        </div>

        {/* Bottom curve */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#f5f8f6] [clip-path:ellipse(60%_100%_at_50%_100%)]" />
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.5fr] lg:items-start">
          {/* =================================================
              LEFT INFORMATION PANEL
          ================================================= */}
          <aside className="lg:sticky lg:top-8">
            <div className="overflow-hidden rounded-[28px] bg-[#073b32] shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
              <div className="relative p-7 sm:p-8">
                {/* Decorative circle */}
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-emerald-400/10 blur-2xl" />

                <div className="relative">
                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 ring-1 ring-white/10">
                    <MessageSquare size={26} />
                  </div>

                  <h2 className="mt-6 text-2xl font-extrabold text-white">
                    Let's plan your trip
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-emerald-50/70">
                    Tell us what you need and our team will help you find the
                    right travel option for your journey.
                  </p>

                  {/* Contact options */}
                  <div className="mt-7 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                        <MapPin size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-emerald-200/60">
                          Destinations
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-white">
                          Explore beautiful places
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                        <Phone size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-emerald-200/60">
                          Travel assistance
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-white">
                          Personalized trip support
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                        <Mail size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-emerald-200/60">
                          Inquiry
                        </p>

                        <p className="mt-0.5 text-sm font-semibold text-white">
                          We'll get back to you
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Small quote */}
                  <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm leading-6 text-emerald-50/80">
                      "Your journey starts with a simple conversation."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* =================================================
              FORM
          ================================================= */}
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_15px_45px_rgba(15,23,42,0.08)] sm:p-7 lg:p-9">
            {/* Form heading */}
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Send an Inquiry
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Tell Us About Your Trip
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fill in your details and tell us what you're looking for.
              </p>
            </div>

            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}
            {success && (
              <div
                role="status"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={19} />
                </div>

                <div>
                  <p className="font-semibold text-emerald-800">
                    Inquiry submitted
                  </p>

                  <p className="mt-1 text-sm text-emerald-700">{success}</p>
                </div>
              </div>
            )}

            {/* =================================================
                ERROR MESSAGE
            ================================================= */}
            {error && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                  !
                </div>

                <div>
                  <p className="font-semibold text-red-800">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* =================================================
                FORM
            ================================================= */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* =================================================
                  NAME + EMAIL
              ================================================= */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* NAME */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <User size={15} className="text-emerald-600" />
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Mail size={15} className="text-emerald-600" />
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>

              {/* =================================================
                  PHONE + SUBJECT
              ================================================= */}
              <div className="grid gap-5 md:grid-cols-2">
                {/* PHONE */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <Phone size={15} className="text-emerald-600" />
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>

                {/* SUBJECT */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                  >
                    <MessageSquare size={15} className="text-emerald-600" />
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
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                  />
                </div>
              </div>

              {/* =================================================
                  DESTINATION + PACKAGE
              ================================================= */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <div className="mb-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <MapPin size={16} />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-800">
                        Trip Details
                      </h3>

                      <p className="text-xs text-slate-500">
                        Optional — choose what your inquiry is about.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* DESTINATION */}
                  <div>
                    <label
                      htmlFor="destinationId"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Destination
                    </label>

                    <select
                      id="destinationId"
                      name="destinationId"
                      value={form.destinationId}
                      onChange={handleChange}
                      disabled={optionsLoading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Package
                    </label>

                    <select
                      id="packageId"
                      name="packageId"
                      value={form.packageId}
                      onChange={handleChange}
                      disabled={optionsLoading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-100"
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

              {/* =================================================
                  MESSAGE
              ================================================= */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
                >
                  <MessageSquare size={15} className="text-emerald-600" />
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
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />

                <div className="mt-2 flex justify-end">
                  <span className="text-xs font-medium text-slate-400">
                    {form.message.length}/2000
                  </span>
                </div>
              </div>

              {/* =================================================
                  SUBMIT
              ================================================= */}
              <button
                type="submit"
                disabled={loading || optionsLoading}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-700/15 transition-all duration-300 hover:bg-emerald-800 hover:shadow-xl hover:shadow-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Submit Inquiry
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              {/* Privacy note */}
              <p className="text-center text-xs leading-5 text-slate-400">
                Your information will only be used to respond to your travel
                inquiry.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM INFO
      ===================================================== */}
      <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Sparkles size={20} />
              </div>

              <div>
                <h3 className="font-bold text-slate-900">
                  Your Journey. Our Priority.
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Share your requirements and let us help you create a
                  comfortable travel experience.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={17} />
              Personalized assistance
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
