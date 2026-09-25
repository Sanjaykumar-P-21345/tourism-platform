"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Search,
  MapPin,
  ArrowRight,
  LoaderCircle,
  Compass,
  AlertCircle,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/utils/api";

const FALLBACK_IMAGE = "/images/tourism-placeholder.jpg";

/* =========================================================
   IMAGE HELPER
========================================================= */

function getImage(place) {
  if (!place) {
    return FALLBACK_IMAGE;
  }

  if (place.coverImage) {
    return place.coverImage;
  }

  if (place.image) {
    return place.image;
  }

  if (Array.isArray(place.gallery) && place.gallery.length > 0) {
    const firstImage = place.gallery[0];

    if (typeof firstImage === "string") {
      return firstImage;
    }

    return (
      firstImage?.url ||
      firstImage?.secure_url ||
      firstImage?.secureUrl ||
      firstImage?.path ||
      FALLBACK_IMAGE
    );
  }

  return FALLBACK_IMAGE;
}

/* =========================================================
   PLACES PAGE
========================================================= */

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  /* =======================================================
     LOAD PLACES
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    async function loadPlaces() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet("/api/public/places");

        if (isMounted) {
          setPlaces(response?.data || []);
        }
      } catch (error) {
        console.error(
          "Load public places error:",
          error,
        );

        if (isMounted) {
          setError(
            error.message ||
              "Unable to load places.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPlaces();

    return () => {
      isMounted = false;
    };
  }, []);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const uniqueCategories = places
      .map((place) => place.category)
      .filter(Boolean);

    return ["all", ...new Set(uniqueCategories)];
  }, [places]);

  /* =======================================================
     FILTER PLACES
  ======================================================= */

  const filteredPlaces = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return places.filter((place) => {
      const destinationName =
        typeof place.destinationId === "object"
          ? place.destinationId?.name || ""
          : "";

      const searchableText = [
        place.name,
        place.description,
        place.location,
        place.category,
        destinationName,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        searchableText.includes(searchValue);

      const matchesCategory =
        category === "all" ||
        place.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [places, search, category]);

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  function clearFilters() {
    setSearch("");
    setCategory("all");
  }

  const hasFilters =
    search.trim() !== "" ||
    category !== "all";

  /* =======================================================
     RENDER
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
          <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              {/* Small label */}
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur-sm">
                <Compass size={14} />
                Explore India
              </div>

              {/* Heading */}
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Places Worth
                <span className="block text-emerald-300">
                  Discovering
                </span>
              </h1>

              {/* Description */}
              <p className="mt-6 max-w-2xl text-sm leading-7 text-emerald-50/65 sm:text-base sm:leading-8">
                Discover beautiful attractions,
                historical places, temples, beaches,
                cultural landmarks, and unforgettable
                destinations across India.
              </p>

              {/* Hero stats */}
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 backdrop-blur-sm">
                  <Compass
                    size={15}
                    className="text-emerald-300"
                  />
                  {places.length} Places
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 backdrop-blur-sm">
                  <MapPin
                    size={15}
                    className="text-emerald-300"
                  />
                  Incredible India
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            SEARCH / FILTER SECTION
        ================================================= */}
        <section className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="-mt-8 rounded-[26px] border border-slate-200 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.10)] sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search places, destinations..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="relative lg:w-64">
                <SlidersHorizontal
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700"
                />

                <select
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pl-11 pr-10 text-sm font-semibold capitalize text-slate-700 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item === "all"
                        ? "All Categories"
                        : item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active filters */}
            {hasFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                <span className="text-xs font-semibold text-slate-400">
                  Active filters:
                </span>

                {search && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    Search: {search}
                  </span>
                )}

                {category !== "all" && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold capitalize text-emerald-700">
                    {category}
                  </span>
                )}

                <button
                  type="button"
                  onClick={clearFilters}
                  className="ml-1 text-xs font-bold text-slate-500 transition hover:text-emerald-700"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}
        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-16 lg:px-8">
          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-bold">
                  Unable to load places
                </p>

                <p className="mt-1 text-red-600/80">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}
          {loading && (
            <div className="flex min-h-[420px] flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <LoaderCircle
                  size={30}
                  className="animate-spin text-emerald-600"
                />
              </div>

              <p className="mt-5 text-sm font-bold text-slate-700">
                Discovering places...
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Preparing amazing destinations
              </p>
            </div>
          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}
          {!loading &&
            !error &&
            filteredPlaces.length === 0 && (
              <div className="flex min-h-[420px] items-center justify-center">
                <div className="max-w-md text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                    <MapPin
                      size={30}
                      className="text-emerald-600"
                    />
                  </div>

                  <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
                    No places found
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    We couldn't find any places matching
                    your current search or category.
                  </p>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#073b32] px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      Clear Filters
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            )}

          {/* =================================================
              PLACES
          ================================================= */}
          {!loading &&
            !error &&
            filteredPlaces.length > 0 && (
              <>
                {/* Section heading */}
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Discover
                    </p>

                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                      Explore Places
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Discover destinations and
                      experiences worth remembering.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-400">
                    <Compass
                      size={16}
                      className="text-emerald-600"
                    />

                    <span>
                      {filteredPlaces.length}{" "}
                      {filteredPlaces.length === 1
                        ? "place"
                        : "places"}{" "}
                      available
                    </span>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredPlaces.map((place) => {
                    const destination =
                      typeof place.destinationId ===
                      "object"
                        ? place.destinationId
                        : null;

                    const placeSlug =
                      place.slug || place._id;

                    return (
                      <article
                        key={place._id}
                        className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]"
                      >
                        {/* Image */}
                        <div className="relative h-60 overflow-hidden bg-slate-100">
                          <Image
                            src={getImage(place)}
                            alt={
                              place.name ||
                              "Tourism place"
                            }
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition duration-700 group-hover:scale-110"
                            unoptimized
                            onError={(event) => {
                              event.currentTarget.src =
                                FALLBACK_IMAGE;
                            }}
                          />

                          {/* Image overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          {/* Category */}
                          <div className="absolute left-4 top-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-xs font-bold capitalize text-white shadow-sm backdrop-blur-md">
                              <Compass size={12} />
                              {place.category ||
                                "Attraction"}
                            </span>
                          </div>

                          {/* Bottom image location */}
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                              <MapPin
                                size={14}
                                className="text-emerald-300"
                              />

                              <span className="line-clamp-1">
                                {place.location ||
                                  destination?.name ||
                                  "India"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="p-5">
                          {/* Location */}
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <MapPin
                              size={14}
                              className="text-emerald-600"
                            />

                            <span className="line-clamp-1">
                              {place.location ||
                                destination?.name ||
                                "India"}
                            </span>
                          </div>

                          {/* Name */}
                          <h3 className="mt-3 line-clamp-1 text-xl font-extrabold text-slate-900">
                            {place.name}
                          </h3>

                          {/* Description */}
                          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                            {place.description ||
                              "Explore this wonderful place and discover its unique attractions."}
                          </p>

                          {/* Divider */}
                          <div className="my-5 h-px bg-slate-100" />

                          {/* CTA */}
                          <Link
                            href={`/places/${placeSlug}`}
                            className="group/link flex items-center justify-between"
                          >
                            <span className="text-sm font-extrabold text-[#073b32] transition group-hover/link:text-emerald-700">
                              Explore Place
                            </span>

                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition duration-300 group-hover/link:bg-[#073b32] group-hover/link:text-white">
                              <ArrowRight
                                size={17}
                                className="transition-transform duration-300 group-hover/link:translate-x-0.5"
                              />
                            </span>
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </>
            )}
        </section>

        {/* =================================================
            BOTTOM CTA
        ================================================= */}
        {!loading &&
          !error &&
          filteredPlaces.length > 0 && (
            <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8">
              <div className="relative overflow-hidden rounded-[30px] bg-[#073b32] px-7 py-10 shadow-[0_20px_50px_rgba(7,59,50,0.14)] sm:px-10">
                {/* Decorative circles */}
                <div className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />

                <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />

                <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
                      <Sparkles size={14} />
                      Your Journey
                    </div>

                    <h2 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                      Discover more. Travel
                      further.
                    </h2>

                    <p className="mt-3 text-sm leading-7 text-emerald-100/60">
                      Explore India's incredible places
                      with SST Travels and create
                      memories that last a lifetime.
                    </p>
                  </div>

                  <Link
                    href="/contact"
                    className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#073b32] transition hover:bg-emerald-50"
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