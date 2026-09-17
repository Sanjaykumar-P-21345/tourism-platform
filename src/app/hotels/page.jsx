
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BedDouble,
  MapPin,
  Search,
  Star,
  Wifi,
  Car,
  Utensils,
  LoaderCircle,
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

  if (typeof image === "string") {
    return image;
  }

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

function formatPrice(pricePerNight) {
  if (!pricePerNight) return "Price unavailable";

  const min = Number(pricePerNight.min || 0);
  const max = Number(pricePerNight.max || 0);

  if (!min && !max) return "Price unavailable";

  if (min && max) {
    return `₹${min.toLocaleString("en-IN")} - ₹${max.toLocaleString(
      "en-IN",
    )}`;
  }

  return `From ₹${(min || max).toLocaleString("en-IN")}`;
}

/* =========================================================
   HOTEL CARD
   ========================================================= */

function HotelCard({ hotel }) {
  const imageUrl = getImageUrl(hotel.coverImage);

  return (
    <Link
      href={`/hotels/${hotel.slug || hotel._id}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-slate-200">
        <Image
          src={imageUrl}
          alt={hotel.name || "Hotel"}
          fill
          unoptimized
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold capitalize text-slate-800 shadow">
          {formatCategory(hotel.category)}
        </div>

        {hotel.isFeatured && (
          <div className="absolute right-4 top-4 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow">
            Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4 p-5">
        <div>
          <h2 className="line-clamp-1 text-lg font-bold text-slate-900 dark:text-white">
            {hotel.name}
          </h2>

          {hotel.destination?.name && (
            <div className="mt-2 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
              <MapPin size={15} />
              <span>{hotel.destination.name}</span>
            </div>
          )}
        </div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {hotel.description || "Discover a comfortable stay at this hotel."}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-sm font-semibold text-amber-700">
            <Star size={15} fill="currentColor" />
            {Number(hotel.rating || 0).toFixed(1)}
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            Guest rating
          </span>
        </div>

        {/* Amenities */}
        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Price per night
          </p>

          <p className="mt-1 text-base font-bold text-indigo-600 dark:text-indigo-400">
            {formatPrice(hotel.pricePerNight)}
          </p>
        </div>
      </div>
    </Link>
  );
}

/* =========================================================
   HOTELS PAGE
   ========================================================= */

export default function HotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [destination, setDestination] = useState("all");

  useEffect(() => {
    let isMounted = true;

    async function loadHotels() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet("/api/public/hotels");

        if (!isMounted) return;

        setHotels(response?.data || []);
      } catch (err) {
        console.error("Load Hotels Error:", err);

        if (isMounted) {
          setError(err.message || "Failed to load hotels.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHotels();

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(
        hotels
          .map((hotel) => hotel.category)
          .filter(Boolean),
      ),
    ];
  }, [hotels]);

  const destinations = useMemo(() => {
    return [
      "all",
      ...new Set(
        hotels
          .map((hotel) => hotel.destination?.name)
          .filter(Boolean),
      ),
    ];
  }, [hotels]);

  const filteredHotels = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return hotels.filter((hotel) => {
      const searchableText = [
        hotel.name,
        hotel.description,
        hotel.category,
        hotel.address,
        hotel.destination?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(searchText);

      const matchesCategory =
        category === "all" || hotel.category === category;

      const matchesDestination =
        destination === "all" ||
        hotel.destination?.name === destination;

      return matchesSearch && matchesCategory && matchesDestination;
    });
  }, [hotels, search, category, destination]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 px-4 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <BedDouble size={34} />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Hotels & Stays
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-indigo-100 sm:text-lg">
            Find comfortable hotels, resorts, hostels, and homestays
            for your next journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Search */}
            <div className="relative md:col-span-1">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search hotels..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm capitalize outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All Categories" : formatCategory(item)}
                </option>
              ))}
            </select>

            {/* Destination */}
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {destinations.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "All Destinations" : item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Explore Stays
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredHotels.length} hotel
              {filteredHotels.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <LoaderCircle
              size={32}
              className="animate-spin text-indigo-600"
            />

            <p className="text-sm text-slate-500">
              Loading hotels...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center">
            <AlertCircle size={36} className="text-red-500" />

            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filteredHotels.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <BedDouble
              size={40}
              className="mx-auto text-slate-400"
            />

            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              No hotels found
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Try changing your search or filter options.
            </p>
          </div>
        )}

        {/* Hotels Grid */}
        {!loading && !error && filteredHotels.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel._id}
                hotel={hotel}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}