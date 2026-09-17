
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Clock,
  IndianRupee,
  LoaderCircle,
  MapPin,
  PackageOpen,
  Search,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FALLBACK_IMAGE = "/images/tourism-placeholder.jpg";

function getImageUrl(image) {
  if (!image) return FALLBACK_IMAGE;

  if (typeof image === "string") return image;

  if (typeof image === "object" && image.url) {
    return image.url;
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
      return `₹${Number(price.min).toLocaleString(
        "en-IN"
      )} - ₹${Number(price.max).toLocaleString("en-IN")}`;
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

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadPackages() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/public/packages");

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load packages."
          );
        }

        setPackages(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Load packages error:", error);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return packages;

    return packages.filter((packageData) => {
      const title = getPackageTitle(packageData).toLowerCase();

      const description = (
        packageData.description || ""
      ).toLowerCase();

      const destination = getDestinationName(
        packageData.destination
      ).toLowerCase();

      return (
        title.includes(search) ||
        description.includes(search) ||
        destination.includes(search)
      );
    });
  }, [packages, searchTerm]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 px-6 py-20 text-white">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <PackageOpen size={34} />
            </div>

            <h1 className="text-3xl font-bold md:text-5xl">
              Explore Our Travel Packages
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-indigo-100 md:text-lg">
              Discover carefully planned travel experiences and
              create unforgettable memories.
            </p>
          </div>
        </section>

        {/* Search Section */}
        <section className="mx-auto max-w-5xl px-6">
          <div className="-mt-7 rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
              <Search
                size={20}
                className="shrink-0 text-gray-400"
              />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search packages or destinations..."
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </section>

        {/* Package Listing */}
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Find Your Journey
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
                Available Packages
              </h2>
            </div>

            {!loading && (
              <p className="text-sm text-gray-500">
                {filteredPackages.length}{" "}
                {filteredPackages.length === 1
                  ? "package"
                  : "packages"}{" "}
                found
              </p>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex min-h-60 items-center justify-center">
              <div className="flex items-center gap-3 text-indigo-600">
                <LoaderCircle
                  size={24}
                  className="animate-spin"
                />
                <span className="font-medium">
                  Loading packages...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-semibold text-red-700">
                Unable to load packages
              </p>

              <p className="mt-2 text-sm text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !errorMessage &&
            filteredPackages.length === 0 && (
              <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
                <PackageOpen
                  size={48}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  No Packages Found
                </h3>

                <p className="mt-2 text-gray-500">
                  Try searching for a different package or
                  destination.
                </p>

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}

          {/* Package Cards */}
          {!loading &&
            !errorMessage &&
            filteredPackages.length > 0 && (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPackages.map((packageData) => {
                  const title = getPackageTitle(packageData);

                  const packageSlug =
                    packageData.slug || packageData._id;

                  const destination = packageData.destination;

                  return (
                    <article
                      key={packageData._id}
                      className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Image */}
                      <Link
                        href={`/packages/${packageSlug}`}
                        className="relative block overflow-hidden"
                      >
                        <img
                          src={getImageUrl(
                            packageData.coverImage
                          )}
                          alt={title}
                          className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
                          Travel Package
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin
                            size={16}
                            className="text-indigo-600"
                          />

                          <span>
                            {getDestinationName(destination)}
                          </span>
                        </div>

                        <Link
                          href={`/packages/${packageSlug}`}
                        >
                          <h3 className="mt-3 line-clamp-2 text-xl font-bold text-gray-900 transition group-hover:text-indigo-600">
                            {title}
                          </h3>
                        </Link>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                          {packageData.description ||
                            "Explore this amazing travel package and discover memorable experiences."}
                        </p>

                        {/* Meta Information */}
                        <div className="mt-5 flex flex-wrap items-center gap-4 border-b border-gray-100 pb-5 text-sm text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Clock
                              size={16}
                              className="text-indigo-600"
                            />

                            <span>
                              {getDuration(packageData.duration)}
                            </span>
                          </div>
                        </div>

                        {/* Price and Button */}
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-400">
                              Starting from
                            </p>

                            <p className="mt-1 text-lg font-bold text-indigo-700">
                              {getPackagePrice(packageData)}
                            </p>
                          </div>

                          <Link
                            href={`/packages/${packageSlug}`}
                            aria-label={`View details for ${title}`}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700"
                          >
                            <ArrowRight size={19} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
        </section>
      </main>

      <Footer />
    </>
  );
}