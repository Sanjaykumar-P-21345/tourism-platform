"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  LoaderCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet, apiPost } from "@/utils/api";

export default function ContactPage() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    destinationId: "",
    packageId: "",
  });

  /* =========================================================
     LOAD DESTINATIONS AND PACKAGES
  ========================================================= */

  useEffect(() => {
    let isMounted = true;

    async function loadOptions() {
      try {
        setLoadingOptions(true);

        const [destinationResponse, packageResponse] = await Promise.all([
          apiGet("/api/public/destinations"),
          apiGet("/api/public/packages"),
        ]);

        if (!isMounted) return;

        setDestinations(
          Array.isArray(destinationResponse)
            ? destinationResponse
            : destinationResponse?.data || [],
        );

        setPackages(
          Array.isArray(packageResponse)
            ? packageResponse
            : packageResponse?.data || [],
        );
      } catch (error) {
        console.error("Failed to load inquiry options:", error);
      } finally {
        if (isMounted) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  }

  /* =========================================================
     HANDLE FORM SUBMIT
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const phone = formData.phone.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();

    /* -------------------------------------------------------
       REQUIRED FIELD VALIDATION
    ------------------------------------------------------- */

    if (!name || !email || !phone || !message) {
      setErrorMessage("Name, email, phone, and message are required.");

      return;
    }

    /* -------------------------------------------------------
       LENGTH VALIDATION
    ------------------------------------------------------- */

    if (name.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");

      return;
    }

    if (name.length > 100) {
      setErrorMessage("Name must not exceed 100 characters.");

      return;
    }

    if (phone.length > 20) {
      setErrorMessage("Phone number must not exceed 20 characters.");

      return;
    }

    if (subject.length > 150) {
      setErrorMessage("Subject must not exceed 150 characters.");

      return;
    }

    if (message.length < 5) {
      setErrorMessage("Message must be at least 5 characters.");

      return;
    }

    if (message.length > 2000) {
      setErrorMessage("Message must not exceed 2000 characters.");

      return;
    }

    /* -------------------------------------------------------
       EMAIL VALIDATION
    ------------------------------------------------------- */

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setErrorMessage("Please enter a valid email address.");

      return;
    }

    try {
      setSubmitting(true);

      const response = await apiPost("/api/inquiries", {
        name,
        email,
        phone,
        subject,
        message,
        destinationId: formData.destinationId || null,
        packageId: formData.packageId || null,
      });

      if (response?.success === false) {
        throw new Error(response.message || "Failed to submit inquiry.");
      }

      setSuccessMessage(
        response?.message || "Your inquiry was submitted successfully.",
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        destinationId: "",
        packageId: "",
      });
    } catch (error) {
      console.error("Inquiry submission error:", error);

      setErrorMessage(
        error?.message || "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     PAGE UI
  ========================================================= */

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 text-white">
        {/* =================================================
            HERO SECTION
        ================================================= */}

        <section className="border-b border-slate-800 bg-slate-900/60 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Link
              href="/"
              className="mb-6 inline-flex items-center gap-2 text-sm text-indigo-400 transition hover:text-indigo-300"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>

            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-indigo-400">
              Get in Touch
            </p>

            <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
              Plan Your Next Journey With Us
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
              Have questions about destinations, packages, hotels, or travel
              arrangements? Send us an inquiry.
            </p>
          </div>
        </section>

        {/* =================================================
            CONTENT SECTION
        ================================================= */}

        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            {/* =================================================
                CONTACT INFORMATION
            ================================================= */}

            <div className="h-fit rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Contact Information</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Our team will review your inquiry and contact you with the
                required information.
              </p>

              <div className="mt-8 space-y-6">
                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                    <Mail size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">Email</h3>

                    <p className="mt-1 text-sm text-slate-400">
                      support@tourism.com
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                    <Phone size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">Phone</h3>

                    <p className="mt-1 text-sm text-slate-400">
                      +91 98765 43210
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                    <MapPin size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">Location</h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Tamil Nadu, India
                    </p>
                  </div>
                </div>

                {/* Visitor Support */}
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
                    <MessageSquare size={20} />
                  </div>

                  <div>
                    <h3 className="font-semibold">Visitor Support</h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Ask about packages and destinations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                INQUIRY FORM
            ================================================= */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Submit an Inquiry</h2>

                <p className="mt-2 text-sm text-slate-400">
                  Fill in the details below and our admin team will respond.
                </p>
              </div>

              {/* Success Message */}
              {successMessage && (
                <div
                  role="alert"
                  className="mb-5 flex gap-3 rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4 text-sm text-emerald-300"
                >
                  <CheckCircle className="h-5 w-5 shrink-0" />

                  <span>{successMessage}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-800/60 bg-red-950/30 p-4 text-sm text-red-300"
                >
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Name and Phone */}
                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Full Name *
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      minLength={2}
                      maxLength={100}
                      required
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Phone Number *
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      maxLength={20}
                      required
                      autoComplete="tel"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email Address *
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    maxLength={150}
                    required
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Destination */}
                <div>
                  <label
                    htmlFor="destinationId"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Select Destination
                  </label>

                  <select
                    id="destinationId"
                    name="destinationId"
                    value={formData.destinationId}
                    onChange={handleChange}
                    disabled={loadingOptions || submitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading destinations..."
                        : "Choose a destination"}
                    </option>

                    {destinations.map((destination) => (
                      <option key={destination._id} value={destination._id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Package */}
                <div>
                  <label
                    htmlFor="packageId"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Select Package
                  </label>

                  <select
                    id="packageId"
                    name="packageId"
                    value={formData.packageId}
                    onChange={handleChange}
                    disabled={loadingOptions || submitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading packages..."
                        : "Choose a package"}
                    </option>

                    {packages.map((tourPackage) => (
                      <option key={tourPackage._id} value={tourPackage._id}>
                        {tourPackage.name ||
                          tourPackage.title ||
                          "Unnamed Package"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Subject
                  </label>

                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What is your inquiry about?"
                    maxLength={150}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Message *
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your inquiry..."
                    rows={5}
                    minLength={5}
                    maxLength={2000}
                    required
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />

                  <div className="mt-1 text-right text-xs text-slate-500">
                    {formData.message.length}/2000 characters
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
