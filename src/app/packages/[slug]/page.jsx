"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe2,
  IndianRupee,
  LoaderCircle,
  MapPin,
  MessageSquare,
  PackageOpen,
  Sparkles,
  Star,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FALLBACK_IMAGE = "/images/tourism-placeholder.jpg";

/* =========================================================
   HELPERS
========================================================= */

function getImageUrl(image) {
  if (!image) return FALLBACK_IMAGE;

  if (typeof image === "string") {
    return image || FALLBACK_IMAGE;
  }

  if (typeof image === "object") {
    return (
      image.url ||
      image.secure_url ||
      image.secureUrl ||
      image.path ||
      FALLBACK_IMAGE
    );
  }

  return FALLBACK_IMAGE;
}

function getPackageTitle(packageData) {
  return packageData?.title || packageData?.name || "Tour Package";
}

function getPackagePrice(packageData) {
  const price = packageData?.price ?? packageData?.estimatedCost;

  if (typeof price === "number") {
    return `₹${price.toLocaleString("en-IN")}`;
  }

  if (typeof price === "string") {
    return price.startsWith("₹") ? price : `₹${price}`;
  }

  if (price && typeof price === "object") {
    if (price.amount) {
      return `₹${Number(price.amount).toLocaleString("en-IN")}`;
    }

    if (price.min && price.max) {
      return `₹${Number(price.min).toLocaleString("en-IN")} - ₹${Number(
        price.max,
      ).toLocaleString("en-IN")}`;
    }

    if (price.min) {
      return `From ₹${Number(price.min).toLocaleString("en-IN")}`;
    }

    if (price.max) {
      return `Up to ₹${Number(price.max).toLocaleString("en-IN")}`;
    }
  }

  return "Price on request";
}

function getDuration(duration) {
  if (!duration) return "Flexible duration";

  if (typeof duration === "string" || typeof duration === "number") {
    return `${duration}`;
  }

  if (typeof duration === "object") {
    if (duration.days && duration.nights) {
      return `${duration.days} Days / ${duration.nights} Nights`;
    }

    if (duration.days) {
      return `${duration.days} Days`;
    }

    if (duration.nights) {
      return `${duration.nights} Nights`;
    }
  }

  return "Flexible duration";
}

/* =========================================================
   PACKAGE DETAILS PAGE
========================================================= */

export default function PackageDetailsPage() {
  const params = useParams();
  const slug = params?.slug;

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     LOAD PACKAGE
  ======================================================= */

  useEffect(() => {
    if (!slug) return;

    async function loadPackage() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/public/packages/${encodeURIComponent(slug)}`,
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load package.");
        }

        setPackageData(result.data);
      } catch (error) {
        console.error("Load package error:", error);

        setErrorMessage(error.message || "Failed to load package.");
      } finally {
        setLoading(false);
      }
    }

    loadPackage();
  }, [slug]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f6]">
        <Navbar />

        <main className="flex min-h-[65vh] items-center justify-center px-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <LoaderCircle
                size={30}
                className="animate-spin text-emerald-600"
              />
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-700">
              Loading package...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Preparing your travel experience
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     ERROR / NOT FOUND
  ======================================================= */

  if (errorMessage || !packageData) {
    return (
      <div className="min-h-screen bg-[#f5f8f6]">
        <Navbar />

        <main className="flex min-h-[65vh] items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-[0_15px_45px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <PackageOpen size={32} className="text-emerald-600" />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
              Package Not Found
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {errorMessage || "This package is unavailable."}
            </p>

            <Link
              href="/packages"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              <ArrowLeft size={17} />
              Browse Packages
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const title = getPackageTitle(packageData);

  const coverImage = getImageUrl(packageData.coverImage);

  const gallery = Array.isArray(packageData.gallery) ? packageData.gallery : [];

  const destination = packageData.destination;

  const price = getPackagePrice(packageData);

  const duration = getDuration(packageData.duration);

  /* =======================================================
     MAIN PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-slate-900">
      <Navbar />

      <main>
        {/* =================================================
            HERO
        ================================================= */}
        <section className="relative overflow-hidden bg-[#073b32]">
          {/* Decorative background */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="absolute -right-32 top-10 h-[420px] w-[420px] rounded-full bg-teal-300/10 blur-3xl" />

          {/* Hero content */}
          <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-8">
            {/* Back button */}
            <Link
              href="/packages"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
            >
              <ArrowLeft size={16} />
              Back to Packages
            </Link>

            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              {/* =================================================
                  LEFT HERO CONTENT
              ================================================= */}
              <div>
                {/* Label */}
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200 backdrop-blur">
                  <PackageOpen size={16} />
                  Travel Package
                </div>

                {/* Title */}
                <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  {title}
                </h1>

                {/* Destination */}
                {destination?.name && (
                  <div className="mt-5 flex items-center gap-2 text-emerald-100/80">
                    <MapPin size={18} className="text-emerald-300" />

                    <span className="text-sm font-medium sm:text-base">
                      {destination.name}
                      {destination.state ? `, ${destination.state}` : ""}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="mt-6 max-w-2xl text-sm leading-7 text-emerald-50/75 sm:text-base">
                  {packageData.description ||
                    "Discover a memorable travel experience with SST Travels."}
                </p>

                {/* Hero stats */}
                <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <IndianRupee size={17} />
                      <span className="text-xs font-medium">
                        Estimated Price
                      </span>
                    </div>

                    <p className="mt-2 text-base font-bold text-white">
                      {price}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Clock size={17} />
                      <span className="text-xs font-medium">Duration</span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-white">
                      {duration}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-2 text-emerald-300">
                      <Star size={17} fill="currentColor" />
                      <span className="text-xs font-medium">Experience</span>
                    </div>

                    <p className="mt-2 text-sm font-bold text-white">
                      Memorable journeys
                    </p>
                  </div>
                </div>
              </div>

              {/* =================================================
                  HERO IMAGE
              ================================================= */}
              <div className="relative">
                <div className="overflow-hidden rounded-[30px] border border-white/15 bg-white/10 p-2 shadow-2xl">
                  <div className="relative overflow-hidden rounded-[24px]">
                    <img
                      src={coverImage}
                      alt={title}
                      className="h-[360px] w-full object-cover transition duration-700 hover:scale-105 sm:h-[440px]"
                      onError={(event) => {
                        event.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                    {/* Image bottom badge */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-black/25 p-4 text-white backdrop-blur-md">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                          <Globe2 size={20} />
                        </div>

                        <div>
                          <p className="text-xs text-white/60">
                            Explore with SST Travels
                          </p>

                          <p className="text-sm font-bold">
                            Your journey starts here
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#f5f8f6] [clip-path:ellipse(60%_100%_at_50%_100%)]" />
        </section>

        {/* =================================================
            MAIN DETAILS
        ================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.75fr]">
            {/* =================================================
                LEFT CONTENT
            ================================================= */}
            <div className="space-y-8">
              {/* Overview */}
              <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                    Travel Experience
                  </div>

                  <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                    Package Overview
                  </h2>
                </div>

                <div className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  {packageData.description ||
                    "No description is available for this package."}
                </div>

                {/* Highlights */}
                {Array.isArray(packageData.highlights) &&
                  packageData.highlights.length > 0 && (
                    <div className="mt-9 border-t border-slate-100 pt-8">
                      <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <Sparkles size={19} />
                        </div>

                        <div>
                          <h3 className="text-xl font-extrabold text-slate-900">
                            Package Highlights
                          </h3>

                          <p className="mt-0.5 text-xs text-slate-400">
                            What makes this journey special
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {packageData.highlights.map((highlight, index) => (
                          <div
                            key={`${highlight}-${index}`}
                            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                              <CheckCircle2 size={16} />
                            </div>

                            <span className="pt-1 text-sm leading-5 text-slate-600">
                              {highlight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </section>

              {/* =================================================
                  GALLERY
              ================================================= */}
              {gallery.length > 0 && (
                <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                        Visual Journey
                      </div>

                      <h2 className="text-2xl font-extrabold text-slate-900">
                        Package Gallery
                      </h2>
                    </div>

                    <div className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:block">
                      {gallery.length} Photos
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {gallery.map((image, index) => (
                      <div
                        key={image?._id || image?.url || index}
                        className="group relative overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${title} gallery ${index + 1}`}
                          className="h-64 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-72"
                          onError={(event) => {
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                        <div className="absolute bottom-4 left-4 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur transition duration-300 group-hover:opacity-100">
                          {index + 1} / {gallery.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}
            <aside className="lg:sticky lg:top-8 lg:h-fit">
              <div className="overflow-hidden rounded-[28px] bg-[#073b32] shadow-[0_18px_50px_rgba(15,23,42,0.14)]">
                {/* Sidebar header */}
                <div className="relative overflow-hidden p-6 sm:p-7">
                  <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />

                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                      <PackageOpen size={23} />
                    </div>

                    <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                      Package Details
                    </p>

                    <h2 className="mt-2 text-xl font-extrabold text-white">
                      {title}
                    </h2>
                  </div>
                </div>

                {/* Quick information */}
                <div className="border-t border-white/10 p-6 sm:p-7">
                  <div className="space-y-5">
                    {/* Duration */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                        <CalendarDays size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-emerald-100/50">
                          Duration
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {duration}
                        </p>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                        <MapPin size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-emerald-100/50">
                          Destination
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {destination?.name || "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                        <IndianRupee size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-emerald-100/50">
                          Estimated Price
                        </p>

                        <p className="mt-1 text-base font-extrabold text-white">
                          {price}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-7 h-px bg-white/10" />

                  {/* Inquiry CTA */}
                  <Link
                    href={`/contact?packageId=${packageData._id}`}
                    className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-[#073b32] transition hover:bg-emerald-50"
                  >
                    <MessageSquare size={17} />
                    Enquire About This Package
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  <p className="mt-4 text-center text-xs leading-5 text-emerald-100/45">
                    Have questions? Send us an inquiry and we'll help you plan
                    your trip.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* =================================================
            BOTTOM JOURNEY SECTION
        ================================================= */}
        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[30px] bg-white p-7 shadow-sm ring-1 ring-slate-200 sm:p-9">
            <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-100/60 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Sparkles size={21} />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Your Journey
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                    Ready to explore?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Talk to SST Travels and start planning your next memorable
                    journey.
                  </p>
                </div>
              </div>

              <Link
                href={`/contact?packageId=${packageData._id}`}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
              >
                Start Planning
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
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
