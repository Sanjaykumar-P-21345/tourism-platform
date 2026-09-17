
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  LoaderCircle,
  MapPin,
  Search,
  Globe,
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

function getLocation(destination) {
  return [destination.state, destination.country]
    .filter(Boolean)
    .join(", ") || "India";
}

export default function DestinationsPage() {
  const [destinations, setDestinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/public/destinations");

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to load destinations."
          );
        }

        setDestinations(
          Array.isArray(result.data) ? result.data : []
        );
      } catch (error) {
        console.error("Load destinations error:", error);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDestinations();
  }, []);

  const filteredDestinations = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return destinations;

    return destinations.filter((destination) => {
      const name = (destination.name || "").toLowerCase();

      const state = (destination.state || "").toLowerCase();

      const country = (destination.country || "").toLowerCase();

      const description = (
        destination.description || ""
      ).toLowerCase();

      return (
        name.includes(search) ||
        state.includes(search) ||
        country.includes(search) ||
        description.includes(search)
      );
    });
  }, [destinations, searchTerm]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 px-6 py-20 text-white">
          <div className="mx-auto max-w-7xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Globe size={34} />
            </div>

            <h1 className="text-3xl font-bold md:text-5xl">
              Explore Amazing Destinations
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-indigo-100 md:text-lg">
              Discover beautiful places, rich culture, and
              unforgettable travel experiences.
            </p>
          </div>
        </section>

        {/* Search */}
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
                placeholder="Search destinations, states, or countries..."
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="mx-auto max-w-7xl px-6 py-14">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                Discover New Places
              </p>

              <h2 className="mt-2 text-2xl font-bold text-gray-900 md:text-3xl">
                Popular Destinations
              </h2>
            </div>

            {!loading && (
              <p className="text-sm text-gray-500">
                {filteredDestinations.length}{" "}
                {filteredDestinations.length === 1
                  ? "destination"
                  : "destinations"}{" "}
                found
              </p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex min-h-60 items-center justify-center">
              <div className="flex items-center gap-3 text-indigo-600">
                <LoaderCircle
                  size={24}
                  className="animate-spin"
                />

                <span className="font-medium">
                  Loading destinations...
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <h3 className="font-semibold text-red-700">
                Unable to load destinations
              </h3>

              <p className="mt-2 text-sm text-red-600">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !errorMessage &&
            filteredDestinations.length === 0 && (
              <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
                <Globe
                  size={48}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  No Destinations Found
                </h3>

                <p className="mt-2 text-gray-500">
                  Try searching for another destination.
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

          {/* Cards */}
          {!loading &&
            !errorMessage &&
            filteredDestinations.length > 0 && (
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDestinations.map((destination) => {
                  const slug =
                    destination.slug || destination._id;

                  return (
                    <article
                      key={destination._id}
                      className="group overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      {/* Image */}
                      <Link
                        href={`/destinations/${slug}`}
                        className="relative block overflow-hidden"
                      >
                        <img
                          src={getImageUrl(
                            destination.coverImage
                          )}
                          alt={
                            destination.name ||
                            "Travel destination"
                          }
                          className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
                        />

                        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm">
                          Explore
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
                            {getLocation(destination)}
                          </span>
                        </div>

                        <Link
                          href={`/destinations/${slug}`}
                        >
                          <h3 className="mt-3 text-xl font-bold text-gray-900 transition group-hover:text-indigo-600">
                            {destination.name ||
                              "Unnamed Destination"}
                          </h3>
                        </Link>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-500">
                          {destination.description ||
                            "Discover this beautiful destination and its unique travel experiences."}
                        </p>

                        <Link
                          href={`/destinations/${slug}`}
                          className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-800"
                        >
                          Explore Destination
                          <ArrowRight size={17} />
                        </Link>
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