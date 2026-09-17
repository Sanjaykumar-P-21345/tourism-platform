"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  Send,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
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

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleRating(value) {
    setFormData((current) => ({
      ...current,
      rating: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (!formData.rating) {
      setErrorMessage("Please select a rating.");
      return;
    }

    if (formData.review.trim().length < 10) {
      setErrorMessage(
        "Your review must contain at least 10 characters.",
      );
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
        throw new Error(
          response.message || "Failed to submit review.",
        );
      }

      setSuccessMessage(
        response.message ||
          "Review submitted successfully. Thank you!",
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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          {/* Back Link */}
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          {/* Heading */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <Star size={30} fill="currentColor" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              Share Your Experience
            </h1>

            <p className="mt-3 text-slate-600">
              Tell us about your travel experience with Explore India.
            </p>
          </div>

          {/* Review Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            {successMessage && (
              <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                <CheckCircle size={20} className="shrink-0" />
                <p>{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle size={20} className="shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
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
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  Your Rating
                </label>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => {
                    const activeRating =
                      hoverRating || formData.rating;

                    return (
                      <button
                        key={value}
                        type="button"
                        aria-label={`Give ${value} star rating`}
                        onMouseEnter={() => setHoverRating(value)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRating(value)}
                        className="rounded-lg p-1 text-yellow-400 transition hover:scale-110"
                      >
                        <Star
                          size={32}
                          fill={
                            value <= activeRating
                              ? "currentColor"
                              : "none"
                          }
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {formData.rating
                    ? `${formData.rating} out of 5 stars`
                    : "Select your rating"}
                </p>
              </div>

              {/* Review */}
              <div>
                <label
                  htmlFor="review"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Your Review
                </label>

                <textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleChange}
                  placeholder="Write about your travel experience..."
                  required
                  minLength={10}
                  maxLength={1000}
                  rows={6}
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <p className="mt-2 text-right text-xs text-slate-500">
                  {formData.review.length}/1000
                </p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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
                  </>
                )}
              </button>

              <p className="text-center text-xs text-slate-500">
                Your review will be published after admin approval.
              </p>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}