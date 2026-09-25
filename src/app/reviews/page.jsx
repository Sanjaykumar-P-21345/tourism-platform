"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Star,
  Send,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  MessageSquare,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiPost } from "@/utils/api";

export default function ReviewsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    review: "",
  });

  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  /* =========================================================
     HANDLE RATING
  ========================================================= */

  function handleRating(value) {
    setFormData((current) => ({
      ...current,
      rating: value,
    }));
  }

  /* =========================================================
     SUBMIT REVIEW
  ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!formData.rating) {
      setErrorMessage("Please select a rating.");
      return;
    }

    if (formData.review.trim().length < 10) {
      setErrorMessage("Your review must contain at least 10 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiPost("/api/reviews", {
        name: formData.name,
        email: formData.email,
        rating: formData.rating,
        review: formData.review,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to submit review.");
      }

      setSuccessMessage(
        response.message || "Review submitted successfully. Thank you!",
      );

      setFormData({
        name: "",
        email: "",
        rating: 0,
        review: "",
      });

      setHoverRating(0);
    } catch (error) {
      setErrorMessage(
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const activeRating = hoverRating || formData.rating;

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-slate-900">
      <Navbar />

      <main>
        {/* =================================================
            HERO
        ================================================= */}
        <section className="relative overflow-hidden bg-[#073b32]">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            {/* Back link */}
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-emerald-100 backdrop-blur-sm transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              Back to Home
            </Link>

            <div className="mt-10 max-w-3xl">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/20">
                <Star size={27} fill="currentColor" />
              </div>

              {/* Label */}
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Your Experience Matters
              </p>

              {/* Heading */}
              <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Share Your
                <span className="block text-emerald-300">
                  Travel Experience
                </span>
              </h1>

              {/* Description */}
              <p className="mt-5 max-w-2xl text-sm leading-7 text-emerald-50/65 sm:text-base sm:leading-8">
                Tell us about your journey with SST Travels. Your feedback helps
                us improve our service and create better travel experiences for
                every guest.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            FORM SECTION
        ================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* =================================================
                REVIEW FORM
            ================================================= */}
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
              {/* Success message */}
              {successMessage && (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
                  <CheckCircle size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-bold">Thank you!</p>

                    <p className="mt-1 leading-6">{successMessage}</p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {errorMessage && (
                <div className="mb-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-bold">Unable to submit review</p>

                    <p className="mt-1 leading-6">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Form heading */}
              <div className="mb-8 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <MessageSquare size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Guest Feedback
                  </p>

                  <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                    Tell Us About Your Journey
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    We would love to hear about your experience.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* =================================================
                    NAME + EMAIL
                ================================================= */}
                <div className="grid gap-6 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Your Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      maxLength={100}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      maxLength={150}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                    />
                  </div>
                </div>

                {/* =================================================
                    RATING
                ================================================= */}
                <div className="rounded-2xl bg-slate-50 p-5">
                  <label className="block text-sm font-bold text-slate-700">
                    Your Rating
                  </label>

                  <div className="mt-4 flex items-center gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map((value) => {
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-label={`Give ${value} star rating`}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => handleRating(value)}
                          className="group rounded-xl p-1.5 transition hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        >
                          <Star
                            size={32}
                            className="text-amber-400 transition"
                            fill={
                              value <= activeRating ? "currentColor" : "none"
                            }
                          />
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-500">
                    {formData.rating
                      ? `${formData.rating} out of 5 stars`
                      : "Select your rating"}
                  </p>
                </div>

                {/* =================================================
                    REVIEW
                ================================================= */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="review"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Your Review
                    </label>

                    <span className="text-xs font-medium text-slate-400">
                      Minimum 10 characters
                    </span>
                  </div>

                  <textarea
                    id="review"
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    placeholder="Write about your travel experience..."
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={7}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />

                  <div className="mt-2 flex justify-end">
                    <p className="text-xs font-medium text-slate-400">
                      {formData.review.length}/1000
                    </p>
                  </div>
                </div>

                {/* =================================================
                    SUBMIT
                ================================================= */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#073b32] px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Review
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

                <p className="text-center text-xs leading-5 text-slate-400">
                  Your review will be published after admin approval.
                </p>
              </form>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}
            <aside className="h-fit lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[28px] bg-[#073b32] shadow-[0_20px_50px_rgba(7,59,50,0.16)]">
                {/* Header */}
                <div className="relative overflow-hidden p-6 sm:p-7">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                      <Star size={21} fill="currentColor" />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Why Your Feedback Matters
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold text-white">
                      Help Us Improve
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-emerald-100/60">
                      Every review helps SST Travels deliver better journeys and
                      experiences.
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="border-t border-white/10 p-6 sm:p-7">
                  <div className="space-y-5">
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                        <Star size={16} fill="currentColor" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Share Your Experience
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-100/50">
                          Tell other travellers what made your journey special.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                        <MessageSquare size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Help Us Improve
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-100/50">
                          Your feedback helps us improve our services.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                        <CheckCircle size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-white">
                          Reviewed by Our Team
                        </p>

                        <p className="mt-1 text-xs leading-5 text-emerald-100/50">
                          Reviews are checked before being published.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating decoration */}
                  <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={18}
                          className="text-amber-400"
                          fill="currentColor"
                        />
                      ))}
                    </div>

                    <p className="mt-3 text-sm font-bold text-white">
                      Your voice matters.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-100/50">
                      Take a moment to share your experience with us.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* =================================================
            BOTTOM CTA
        ================================================= */}
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Sparkles size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    SST Travels
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                    Travel. Experience. Share.
                  </h2>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                    Thank you for being part of the SST Travels journey.
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#073b32] px-5 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700"
              >
                Explore SST Travels
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
