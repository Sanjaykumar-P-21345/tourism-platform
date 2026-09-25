"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Clock,
  Globe2,
  IndianRupee,
  LoaderCircle,
  MapPin,
  PackageOpen,
  Search,
  Sparkles,
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
    return String(duration);
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

function getDestinationName(destination) {
  if (!destination) return "Multiple destinations";

  if (typeof destination === "string") {
    return destination;
  }

  return destination.name || "Multiple destinations";
}

/* =========================================================
   PACKAGE CARD
========================================================= */

function PackageCard({ packageData }) {
  const title = getPackageTitle(packageData);

  const packageSlug = packageData.slug || packageData._id;

  const destination = packageData.destination;

  const imageUrl = getImageUrl(packageData.coverImage);

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
      {/* =====================================================
          IMAGE
      ===================================================== */}
      <Link
        href={`/packages/${packageSlug}`}
        className="relative block overflow-hidden"
      >
        <div className="relative h-[260px] overflow-hidden bg-slate-100">
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_IMAGE;
            }}
          />

          {/* Image gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

          {/* Package badge */}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/30 bg-white/90 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur">
            <PackageOpen size={14} />
            Travel Package
          </div>

          {/* Destination */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            <MapPin size={13} />
            {getDestinationName(destination)}
          </div>
        </div>
      </Link>

      {/* =====================================================
          CARD CONTENT
      ===================================================== */}
      <div className="p-6">
        {/* Destination */}
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <MapPin size={16} />

          <span className="font-medium">{getDestinationName(destination)}</span>
        </div>

        {/* Title */}
        <Link href={`/packages/${packageSlug}`}>
          <h2 className="mt-3 line-clamp-2 text-xl font-extrabold leading-snug text-slate-900 transition group-hover:text-emerald-700">
            {title}
          </h2>
        </Link>

        {/* Description */}
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">
          {packageData.description ||
            "Explore this amazing travel package and discover memorable experiences."}
        </p>

        {/* Meta */}
        <div className="mt-5 flex items-center border-y border-slate-100 py-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Clock size={15} />
            </div>

            <span>{getDuration(packageData.duration)}</span>
          </div>
        </div>

        {/* Price + View */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-400">Starting from</p>

            <p className="mt-1 text-lg font-extrabold text-emerald-700">
              {getPackagePrice(packageData)}
            </p>
          </div>

          <Link
            href={`/packages/${packageSlug}`}
            aria-label={`View details for ${title}`}
            className="group/button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#073b32] text-white transition hover:bg-emerald-700"
          >
            <ArrowRight
              size={19}
              className="transition-transform duration-300 group-hover/button:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PACKAGES PAGE
========================================================= */

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  /* =======================================================
     LOAD PACKAGES
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    async function loadPackages() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/public/packages");

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load packages.");
        }

        if (isMounted) {
          setPackages(Array.isArray(result.data) ? result.data : []);
        }
      } catch (error) {
        console.error("Load packages error:", error);

        if (isMounted) {
          setErrorMessage(error.message || "Failed to load packages.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPackages();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredPackages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return packages;

    return packages.filter((packageData) => {
      const title = getPackageTitle(packageData).toLowerCase();

      const description = (packageData.description || "").toLowerCase();

      const destination = getDestinationName(
        packageData.destination,
      ).toLowerCase();

      return (
        title.includes(search) ||
        description.includes(search) ||
        destination.includes(search)
      );
    });
  }, [packages, searchTerm]);

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-slate-900">
      <Navbar />

      <main>
        {/* =================================================
            HERO
        ================================================= */}
        <section className="relative overflow-hidden bg-[#073b32]">
          {/* Decorative circles */}
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-teal-300/10 blur-3xl" />

          <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28">
            <div className="mx-auto max-w-3xl text-center">
              {/* Small label */}
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-emerald-200 backdrop-blur">
                <Sparkles size={15} />
                Discover Your Next Journey
              </div>

              {/* Heading */}
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Explore Our
                <span className="block text-emerald-300">Travel Packages</span>
              </h1>

              {/* Description */}
              <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-emerald-50/70 sm:text-base sm:leading-8">
                Discover carefully planned travel experiences, beautiful
                destinations, and unforgettable journeys with SST Travels.
              </p>

              {/* Mini stats */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
                  <Globe2 size={14} className="text-emerald-300" />
                  Beautiful Destinations
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
                  <PackageOpen size={14} className="text-emerald-300" />
                  Curated Packages
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur">
                  <Clock size={14} className="text-emerald-300" />
                  Flexible Trips
                </div>
              </div>
            </div>
          </div>

          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#f5f8f6] [clip-path:ellipse(60%_100%_at_50%_100%)]" />
        </section>

        {/* =================================================
            SEARCH
        ================================================= */}
        <section className="relative z-10 mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
          <div className="-mt-9 rounded-[24px] border border-slate-200 bg-white p-3 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
            <div className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3.5 transition focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-emerald-100">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Search size={18} />
              </div>

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search packages or destinations..."
                className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
              />

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            PACKAGE LIST
        ================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8">
          {/* Heading */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                Find Your Journey
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Available Packages
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Choose a travel experience that fits your destination, duration,
                and budget.
              </p>
            </div>

            {!loading && !errorMessage && (
              <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                <span className="text-emerald-700">
                  {filteredPackages.length}
                </span>{" "}
                {filteredPackages.length === 1 ? "package" : "packages"} found
              </div>
            )}
          </div>

          {/* =================================================
              LOADING
          ================================================= */}
          {loading && (
            <div className="flex min-h-[360px] items-center justify-center rounded-[28px] border border-slate-200 bg-white">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                  <LoaderCircle
                    size={27}
                    className="animate-spin text-emerald-600"
                  />
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-700">
                  Loading packages...
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Finding experiences for you
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}
          {!loading && errorMessage && (
            <div className="rounded-[28px] border border-red-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                <PackageOpen size={27} />
              </div>

              <h3 className="mt-5 text-lg font-extrabold text-slate-900">
                Unable to load packages
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          {/* =================================================
              EMPTY
          ================================================= */}
          {!loading && !errorMessage && filteredPackages.length === 0 && (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <PackageOpen size={32} className="text-emerald-600" />
              </div>

              <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                No Packages Found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Try searching for a different package or destination.
              </p>

              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-6 rounded-xl bg-[#073b32] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* =================================================
              PACKAGE CARDS
          ================================================= */}
          {!loading && !errorMessage && filteredPackages.length > 0 && (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((packageData) => (
                <PackageCard key={packageData._id} packageData={packageData} />
              ))}
            </div>
          )}
        </section>

        {/* =================================================
            BOTTOM INFO
        ================================================= */}
        {!loading && !errorMessage && filteredPackages.length > 0 && (
          <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[30px] bg-[#073b32] p-7 sm:p-9">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                    <Sparkles size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Travel With SST Travels
                    </p>

                    <h3 className="mt-1 text-xl font-extrabold text-white">
                      Your journey starts here.
                    </h3>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-emerald-100/60">
                      Explore destinations, discover memorable experiences, and
                      create your next unforgettable trip.
                    </p>
                  </div>
                </div>

                <Link
                  href="/contact"
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#073b32] transition hover:bg-emerald-50"
                >
                  Plan Your Trip
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
