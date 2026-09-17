"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  IndianRupee,
  LoaderCircle,
  MapPin,
  MessageSquare,
  PackageOpen,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const FALLBACK_IMAGE = "/images/tourism-placeholder.jpg";

function getImageUrl(image) {
  if (!image) return FALLBACK_IMAGE;

  if (typeof image === "string") {
    return image;
  }

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

export default function PackageDetailsPage() {
  const params = useParams();
  const slug = params?.slug;

  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!slug) return;

    async function loadPackage() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `/api/public/packages/${encodeURIComponent(slug)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load package."
          );
        }

        setPackageData(result.data);
      } catch (error) {
        console.error("Load package error:", error);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadPackage();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-indigo-600">
            <LoaderCircle className="animate-spin" size={24} />
            <span>Loading package...</span>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (errorMessage || !packageData) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <PackageOpen
            size={52}
            className="mb-4 text-gray-400"
          />

          <h1 className="text-2xl font-bold text-gray-900">
            Package Not Found
          </h1>

          <p className="mt-2 text-gray-600">
            {errorMessage || "This package is unavailable."}
          </p>

          <Link
            href="/packages"
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse Packages
          </Link>
        </main>

        <Footer />
      </>
    );
  }

  const title = getPackageTitle(packageData);
  const coverImage = getImageUrl(packageData.coverImage);

  const gallery = Array.isArray(packageData.gallery)
    ? packageData.gallery
    : [];

  const destination = packageData.destination;

  return (
    <>
      <Navbar />

      <main className="bg-gray-50">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-6 pt-8">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={17} />
            Back to Package
          </Link>
        </div>

        {/* Hero Section */}
        <section className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <img
              src={coverImage}
              alt={title}
              className="h-[360px] w-full object-cover md:h-[460px]"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
              <PackageOpen size={16} />
              Travel Package
            </div>

            <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
              {title}
            </h1>

            {destination?.name && (
              <div className="mt-5 flex items-center gap-2 text-gray-600">
                <MapPin size={19} className="text-indigo-600" />
                <span>
                  {destination.name}
                  {destination.state
                    ? `, ${destination.state}`
                    : ""}
                </span>
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <IndianRupee size={18} />
                  <span className="text-sm">Estimated Price</span>
                </div>

                <p className="mt-2 text-xl font-bold text-indigo-700">
                  {getPackagePrice(packageData)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock size={18} />
                  <span className="text-sm">Duration</span>
                </div>

                <p className="mt-2 font-bold text-gray-900">
                  {getDuration(packageData.duration)}
                </p>
              </div>
            </div>

            <Link
              href={`/contact?packageId=${packageData._id}`}
              className="mt-7 inline-flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
            >
              <MessageSquare size={18} />
              Enquire About This Package
            </Link>
          </div>
        </section>

        {/* Details Section */}
        <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-16 lg:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Package Overview
            </h2>

            <div className="mt-5 whitespace-pre-line leading-8 text-gray-600">
              {packageData.description ||
                "No description is available for this package."}
            </div>

            {packageData.highlights &&
              Array.isArray(packageData.highlights) &&
              packageData.highlights.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900">
                    Highlights
                  </h3>

                  <ul className="mt-4 space-y-3">
                    {packageData.highlights.map((highlight, index) => (
                      <li
                        key={`${highlight}-${index}`}
                        className="flex items-start gap-3 text-gray-600"
                      >
                        <CheckCircle2
                          size={20}
                          className="mt-1 shrink-0 text-green-600"
                        />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {/* Quick Information */}
          <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Quick Information
            </h2>

            <div className="mt-5 space-y-5">
              <div className="flex items-start gap-3">
                <CalendarDays
                  size={20}
                  className="mt-1 text-indigo-600"
                />

                <div>
                  <p className="text-sm text-gray-500">
                    Duration
                  </p>
                  <p className="font-semibold text-gray-900">
                    {getDuration(packageData.duration)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin
                  size={20}
                  className="mt-1 text-indigo-600"
                />

                <div>
                  <p className="text-sm text-gray-500">
                    Destination
                  </p>
                  <p className="font-semibold text-gray-900">
                    {destination?.name || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IndianRupee
                  size={20}
                  className="mt-1 text-indigo-600"
                />

                <div>
                  <p className="text-sm text-gray-500">
                    Price
                  </p>
                  <p className="font-semibold text-gray-900">
                    {getPackagePrice(packageData)}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="mx-auto max-w-7xl px-6 pb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Package Gallery
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image, index) => (
                <div
                  key={image?._id || image?.url || index}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm"
                >
                  <img
                    src={getImageUrl(image)}
                    alt={`${title} gallery ${index + 1}`}
                    className="h-64 w-full object-cover transition duration-300 hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}