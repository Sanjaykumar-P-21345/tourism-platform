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

  useEffect(() => {
    async function loadOptions() {
      try {
        setLoadingOptions(true);

        const [destinationResponse, packageResponse] = await Promise.all([
          apiGet("/api/public/destinations"),
          apiGet("/api/public/packages"),
        ]);

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
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      setErrorMessage("Name, email, phone, and message are required.");

      return;
    }

    try {
      setSubmitting(true);

      const response = await apiPost("/api/inquiries", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 text-white">
        {/* HERO */}
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

        {/* CONTENT */}
        <section className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            {/* CONTACT INFORMATION */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <h2 className="text-2xl font-bold">Contact Information</h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Our team will review your inquiry and contact you with the
                required information.
              </p>

              <div className="mt-8 space-y-6">
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

            {/* INQUIRY FORM */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold">Submit an Inquiry</h2>

                <p className="mt-2 text-sm text-slate-400">
                  Fill in the details below and our admin team will respond.
                </p>
              </div>

              {successMessage && (
                <div className="mb-5 flex gap-3 rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-4 text-sm text-emerald-300">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 rounded-xl border border-red-800/60 bg-red-950/30 p-4 text-sm text-red-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
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
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>

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
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                    />
                  </div>
                </div>

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
                    required
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>

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
                    disabled={loadingOptions}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
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
                    disabled={loadingOptions}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingOptions
                        ? "Loading packages..."
                        : "Choose a package"}
                    </option>

                    {packages.map((tourPackage) => (
                      <option key={tourPackage._id} value={tourPackage._id}>
                        {tourPackage.name || tourPackage.title}
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>

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
                    required
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
