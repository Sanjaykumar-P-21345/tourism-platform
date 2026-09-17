
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  BedDouble,
  CheckCircle2,
  Globe,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Star,
  AlertCircle,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/utils/api";

/* =========================================================
   HELPERS
   ========================================================= */

function getImageUrl(image) {
  if (!image) return "/images/tourism-placeholder.jpg";

  if (typeof image === "string") return image;

  return (
    image.url ||
    image.secure_url ||
    image.secureUrl ||
    image.path ||
    "/images/tourism-placeholder.jpg"
  );
}

function formatCategory(category) {
  if (!category) return "Hotel";

  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatPrice(price) {
  if (!price) return "Price unavailable";

  const min = Number(price.min || 0);
  const max = Number(price.max || 0);

  if (min && max) {
    return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString(
      "en-IN",
    )}`;
  }

  return `From ₹${(min || max).toLocaleString("en-IN")}`;
}

/* =========================================================
   HOTEL DETAILS PAGE
   ========================================================= */

export default function HotelDetailsPage() {
  const params = useParams();
  const slug = params?.slug;

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function loadHotel() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet(
          `/api/public/hotels/${slug}`,
        );

        if (!isMounted) return;

        setHotel(response?.data || null);
      } catch (err) {
        console.error("Load Hotel Details Error:", err);

        if (isMounted) {
          setError(err.message || "Failed to load hotel details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHotel();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />

        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle
              size={34}
              className="animate-spin text-indigo-600"
            />

            <p className="text-sm text-slate-500">
              Loading hotel details...
            </p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />

        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <AlertCircle size={42} className="text-red-500" />

          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            Hotel Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The requested hotel is unavailable."}
          </p>

          <Link
            href="/hotels"
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to Hotels
          </Link>
        </div>

        <Footer />
      </div>
    );
  }

  const coverImage = getImageUrl(hotel.coverImage);

  const gallery = hotel.gallery || [];

  const destinationName =
    hotel.destination?.name || "Travel Destination";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Image */}
      <section className="relative h-[380px] overflow-hidden sm:h-[480px]">
        <Image
          src={coverImage}
          alt={hotel.name || "Hotel"}
          fill
          priority
          unoptimized
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          <Link
            href="/hotels"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to Hotels
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold capitalize text-white">
              {formatCategory(hotel.category)}
            </span>

            {hotel.isFeatured && (
              <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900">
                Featured Hotel
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
            {hotel.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-200">
            <span className="flex items-center gap-1.5">
              <MapPin size={16} />
              {destinationName}
            </span>

            <span className="flex items-center gap-1.5">
              <Star size={16} fill="currentColor" className="text-amber-400" />
              {Number(hotel.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Description */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                About This Hotel
              </h2>

              <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {hotel.description}
              </p>

              {hotel.address && (
                <div className="mt-5 flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <MapPin
                    size={19}
                    className="mt-0.5 shrink-0 text-indigo-600"
                  />

                  <span>{hotel.address}</span>
                </div>
              )}
            </section>

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Amenities
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {hotel.amenities.map((amenity, index) => (
                    <div
                      key={`${amenity}-${index}`}
                      className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
                    >
                      <CheckCircle2
                        size={18}
                        className="shrink-0 text-emerald-500"
                      />

                      {amenity}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Hotel Gallery
                </h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {gallery.map((image, index) => (
                    <div
                      key={image._id || index}
                      className="relative h-56 overflow-hidden rounded-xl bg-slate-200"
                    >
                      <Image
                        src={getImageUrl(image)}
                        alt={`${hotel.name} gallery image ${index + 1}`}
                        fill
                        unoptimized
                        className="object-cover transition duration-300 hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contact Information */}
            {(hotel.contactPhone || hotel.website) && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Contact Information
                </h2>

                <div className="mt-5 space-y-4">
                  {hotel.contactPhone && (
                    <a
                      href={`tel:${hotel.contactPhone}`}
                      className="flex items-center gap-3 text-sm text-slate-600 transition hover:text-indigo-600 dark:text-slate-300"
                    >
                      <Phone size={18} className="text-indigo-600" />
                      {hotel.contactPhone}
                    </a>
                  )}

                  {hotel.website && (
                    <a
                      href={hotel.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 break-all text-sm text-slate-600 transition hover:text-indigo-600 dark:text-slate-300"
                    >
                      <Globe size={18} className="text-indigo-600" />
                      {hotel.website}
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right Column */}
          <aside className="h-fit lg:sticky lg:top-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Price per night
              </p>

              <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {formatPrice(hotel.pricePerNight)}
              </p>

              <div className="my-6 h-px bg-slate-200 dark:bg-slate-800" />

              <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <BedDouble size={18} />
                    Category
                  </span>

                  <span className="font-semibold capitalize">
                    {hotel.category}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <Star size={18} />
                    Rating
                  </span>

                  <span className="font-semibold">
                    {Number(hotel.rating || 0).toFixed(1)} / 5
                  </span>
                </div>
              </div>

              <Link
                href={`/contact?destinationId=${
                  hotel.destination?._id || ""
                }`}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Mail size={18} />
                Send Inquiry
              </Link>

              <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                Contact our team for more information about this stay.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}