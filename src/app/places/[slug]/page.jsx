"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Compass,
  Globe2,
  LoaderCircle,
  MapPin,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/utils/api";

const FALLBACK_IMAGE = "/images/tourism-placeholder.jpg";

/* =========================================================
   IMAGE HELPER
========================================================= */

function getImage(image) {
  if (!image) {
    return FALLBACK_IMAGE;
  }

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

/* =========================================================
   PLACE DETAILS PAGE
========================================================= */

export default function PlaceDetailsPage() {
  const params = useParams();
  const slug = params?.slug;

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =======================================================
     LOAD PLACE
  ======================================================= */

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    async function loadPlace() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet(`/api/public/places/${slug}`);

        if (isMounted) {
          setPlace(response?.data || null);
        }
      } catch (error) {
        console.error("Load place details error:", error);

        if (isMounted) {
          setError(error.message || "Unable to load place details.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPlace();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f8f6]">
        <Navbar />

        <main className="flex min-h-[72vh] items-center justify-center px-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <LoaderCircle
                size={30}
                className="animate-spin text-emerald-600"
              />
            </div>

            <p className="mt-5 text-sm font-bold text-slate-700">
              Loading place details...
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Preparing your destination
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error || !place) {
    return (
      <div className="min-h-screen bg-[#f5f8f6]">
        <Navbar />

        <main className="flex min-h-[72vh] items-center justify-center px-5">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle size={30} className="text-red-500" />
            </div>

            <h1 className="mt-5 text-2xl font-extrabold text-slate-900">
              Place Not Found
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error || "This place is currently unavailable."}
            </p>

            <Link
              href="/places"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#073b32] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <ArrowLeft size={17} />
              Back to Places
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  /* =======================================================
     DESTINATION
  ======================================================= */

  const destination =
    typeof place.destinationId === "object" ? place.destinationId : null;

  /* =======================================================
     GALLERY
  ======================================================= */

  const gallery = Array.isArray(place.gallery) ? place.gallery : [];

  const images = [
    place.coverImage,
    ...gallery.map((image) =>
      typeof image === "string"
        ? image
        : image?.url || image?.secure_url || image?.secureUrl,
    ),
  ].filter(Boolean);

  const displayImages = images.length > 0 ? images : [FALLBACK_IMAGE];

  const heroImage = getImage(displayImages[0]);

  const location = place.location || destination?.name || "India";

  const category = place.category || "Attraction";

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#f5f8f6] text-slate-900">
      <Navbar />

      <main>
        {/* =================================================
            HERO
        ================================================= */}
        <section className="relative overflow-hidden bg-[#073b32]">
          <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]">
            <Image
              src={heroImage}
              alt={place.name || "Tourism place"}
              fill
              priority
              sizes="100vw"
              className="object-cover"
              unoptimized
              onError={(event) => {
                event.currentTarget.src = FALLBACK_IMAGE;
              }}
            />

            {/* Main image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#031b17]/95 via-[#031b17]/40 to-[#031b17]/10" />

            {/* Extra side gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#031b17]/50 via-transparent to-transparent" />

            {/* Back button */}
            <div className="absolute left-0 right-0 top-0">
              <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-6 lg:px-8">
                <Link
                  href="/places"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <ArrowLeft size={16} />
                  Back to Places
                </Link>
              </div>
            </div>

            {/* Hero content */}
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto max-w-7xl px-5 pb-10 sm:px-6 sm:pb-12 lg:px-8 lg:pb-14">
                <div className="max-w-4xl">
                  {/* Category */}
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-900/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-200 backdrop-blur-md">
                    <Compass size={14} />
                    {category}
                  </div>

                  {/* Title */}
                  <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {place.name}
                  </h1>

                  {/* Location */}
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/80 sm:text-base">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-emerald-300" />

                      <span>{location}</span>
                    </div>

                    {destination?.name && (
                      <>
                        <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:block" />

                        <div className="flex items-center gap-2">
                          <Globe2 size={17} className="text-emerald-300" />

                          <span>{destination.name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              href="/places"
              className="group inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
            >
              <ArrowLeft
                size={17}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              Explore More Places
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* =================================================
                MAIN CONTENT
            ================================================= */}
            <div className="space-y-8">
              {/* About */}
              <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Compass size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Discover
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                      About This Place
                    </h2>
                  </div>
                </div>

                <p className="mt-7 whitespace-pre-line text-sm leading-8 text-slate-600 sm:text-base">
                  {place.description ||
                    "Explore this wonderful destination and discover its unique attractions, beautiful surroundings, and memorable experiences."}
                </p>
              </article>

              {/* Location information */}
              <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <MapPin size={22} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      Location
                    </p>

                    <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                      Explore the Area
                    </h2>
                  </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Place
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {place.name}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Category
                    </p>

                    <p className="mt-2 text-sm font-bold capitalize text-slate-800">
                      {category}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Location
                    </p>

                    <p className="mt-2 text-sm font-bold text-slate-800">
                      {location}
                    </p>
                  </div>

                  {destination?.name && (
                    <div className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Destination
                      </p>

                      <p className="mt-2 text-sm font-bold text-slate-800">
                        {destination.name}
                      </p>
                    </div>
                  )}
                </div>
              </article>

              {/* =================================================
                  GALLERY
              ================================================= */}
              {displayImages.length > 1 && (
                <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Moments
                      </p>

                      <h2 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                        Photo Gallery
                      </h2>
                    </div>

                    <p className="text-sm text-slate-400">
                      {displayImages.length}{" "}
                      {displayImages.length === 1 ? "photo" : "photos"}
                    </p>
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {displayImages.slice(1).map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="group relative h-56 overflow-hidden rounded-2xl bg-slate-100 sm:h-64"
                      >
                        <Image
                          src={getImage(image)}
                          alt={`${place.name} gallery ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover transition duration-700 group-hover:scale-110"
                          unoptimized
                          onError={(event) => {
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70" />

                        <div className="absolute bottom-4 left-4 rounded-full bg-black/30 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                          {place.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}
            <aside className="h-fit lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[28px] bg-[#073b32] shadow-[0_20px_50px_rgba(7,59,50,0.18)]">
                {/* Sidebar header */}
                <div className="relative overflow-hidden p-6 sm:p-7">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-400/10 blur-2xl" />

                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                      <Compass size={22} />
                    </div>

                    <p className="mt-5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Plan Your Visit
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold text-white">
                      Explore {place.name}
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-emerald-100/60">
                      Make your trip memorable with SST Travels.
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="border-t border-white/10 p-6 sm:p-7">
                  <div className="space-y-5">
                    {/* Category */}
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                        <Compass size={16} />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/60">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {category}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                        <MapPin size={16} />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/60">
                          Location
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          {location}
                        </p>
                      </div>
                    </div>

                    {/* Destination */}
                    {destination?.name && (
                      <div className="flex gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                          <Globe2 size={16} />
                        </div>

                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/60">
                            Destination
                          </p>

                          <p className="mt-1 text-sm font-semibold text-white">
                            {destination.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-emerald-300">
                        <Sparkles size={16} />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/60">
                          Experience
                        </p>

                        <p className="mt-1 text-sm font-semibold text-white">
                          Memorable Travel
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/contact?destinationId=${destination?._id || ""}`}
                    className="group mt-7 flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#073b32] transition hover:bg-emerald-50"
                  >
                    <MessageSquare size={17} />
                    Contact Our Team
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>

                  {/* Trust line */}
                  <div className="mt-5 flex items-center justify-center gap-2 text-xs text-emerald-100/50">
                    <CheckCircle2 size={14} />

                    <span>Plan your journey with confidence</span>
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
            <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full bg-emerald-100/70 blur-3xl" />

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
                    Ready to explore {place.name}?
                  </h3>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                    Let SST Travels help you plan a comfortable and memorable
                    journey.
                  </p>
                </div>
              </div>

              <Link
                href={`/contact?destinationId=${destination?._id || ""}`}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#073b32] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Start Planning
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