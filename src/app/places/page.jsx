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
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/utils/api";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // =========================================================
  // LOAD PLACES
  // =========================================================

  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet("/api/public/places");

        setPlaces(response?.data || []);
      } catch (error) {
        console.error("Load public places error:", error);

        setError(
          error.message || "Unable to load places.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlaces();
  }, []);

  // =========================================================
  // CATEGORIES
  // =========================================================

  const categories = useMemo(() => {
    const uniqueCategories = places
      .map((place) => place.category)
      .filter(Boolean);

    return ["all", ...new Set(uniqueCategories)];
  }, [places]);

  // =========================================================
  // FILTER PLACES
  // =========================================================

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

  // =========================================================
  // IMAGE HELPER
  // =========================================================

  function getImage(place) {
    if (place.coverImage) {
      return place.coverImage;
    }

    if (place.image) {
      return place.image;
    }

    if (place.gallery?.length > 0) {
      const firstImage = place.gallery[0];

      return typeof firstImage === "string"
        ? firstImage
        : firstImage?.url || "";
    }

    return "/images/tourism-placeholder.jpg";
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        {/* HERO */}

        <section className="bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
              <Compass size={28} />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Explore India
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Places to Visit
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Discover beautiful attractions, historical places,
              temples, beaches, and unforgettable destinations.
            </p>
          </div>
        </section>

        {/* CONTENT */}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {/* SEARCH AND FILTER */}

          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search places, destinations..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500"
              />
            </div>

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All Categories" : item}
                </option>
              ))}
            </select>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="flex min-h-80 items-center justify-center">
              <LoaderCircle
                size={36}
                className="animate-spin text-indigo-600"
              />
            </div>
          )}

          {/* EMPTY STATE */}

          {!loading &&
            !error &&
            filteredPlaces.length === 0 && (
              <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <MapPin
                  size={42}
                  className="text-slate-300"
                />

                <h2 className="mt-4 text-lg font-bold text-slate-800">
                  No places found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try searching with a different keyword.
                </p>
              </div>
            )}

          {/* PLACES GRID */}

          {!loading && filteredPlaces.length > 0 && (
            <>
              <div className="mb-6 mt-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Explore Places
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredPlaces.length} places available
                  </p>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPlaces.map((place) => {
                  const destination =
                    typeof place.destinationId === "object"
                      ? place.destinationId
                      : null;

                  const placeSlug =
                    place.slug || place._id;

                  return (
                    <article
                      key={place._id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* IMAGE */}

                      <div className="relative h-56 overflow-hidden bg-slate-200">
                        <Image
                          src={getImage(place)}
                          alt={place.name || "Tourism place"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                          unoptimized
                        />

                        <div className="absolute left-4 top-4">
                          <span className="rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
                            {place.category || "Attraction"}
                          </span>
                        </div>
                      </div>

                      {/* DETAILS */}

                      <div className="p-5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <MapPin
                            size={14}
                            className="text-indigo-500"
                          />

                          <span>
                            {place.location ||
                              destination?.name ||
                              "India"}
                          </span>
                        </div>

                        <h3 className="mt-3 line-clamp-1 text-lg font-bold text-slate-900">
                          {place.name}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">
                          {place.description ||
                            "Explore this wonderful place and discover its unique attractions."}
                        </p>

                        <Link
                          href={`/places/${placeSlug}`}
                          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-800"
                        >
                          Explore Place
                          <ArrowRight
                            size={16}
                            className="transition group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}