"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Search,
  ShieldCheck,
  Wallet,
  Headphones,
  LoaderCircle,
  PackageOpen,
} from "lucide-react";

import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

function getImageUrl(image) {
  if (!image) return "/images/tourism-placeholder.jpg";

  if (typeof image === "string") {
    return image;
  }

  if (image.url) {
    return image.url;
  }

  return "/images/tourism-placeholder.jpg";
}

function getPackageTitle(item) {
  return item.name || item.title || "Tourism Package";
}

function getPackagePrice(item) {
  if (typeof item.price === "number") {
    return `₹${item.price.toLocaleString("en-IN")}`;
  }

  if (typeof item.estimatedCost === "number") {
    return `₹${item.estimatedCost.toLocaleString("en-IN")}`;
  }

  if (item.estimatedCost?.min) {
    return `₹${item.estimatedCost.min.toLocaleString("en-IN")}`;
  }

  return "Price on request";
}

export default function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loadingDestinations, setLoadingDestinations] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const [destinationError, setDestinationError] = useState("");
  const [packageError, setPackageError] = useState("");

  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("destinations");

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoadingDestinations(true);

        const response = await fetch("/api/public/destinations");

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load destinations.");
        }

        setDestinations(result.data || []);
      } catch (error) {
        console.error("Destination loading error:", error);
        setDestinationError(error.message);
      } finally {
        setLoadingDestinations(false);
      }
    }

    async function loadPackages() {
      try {
        setLoadingPackages(true);

        const response = await fetch("/api/public/packages");

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load packages.");
        }

        setPackages(result.data || []);
      } catch (error) {
        console.error("Package loading error:", error);
        setPackageError(error.message);
      } finally {
        setLoadingPackages(false);
      }
    }

    loadDestinations();
    loadPackages();
  }, []);

  function handleSearch(event) {
    event.preventDefault();

    const search = searchText.trim();

    if (!search) return;

    window.location.href = `/${searchType}?search=${encodeURIComponent(
      search,
    )}`;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da"
            alt="India tourism"
            className="h-full w-full object-cover opacity-40"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-28 lg:px-8">
          <div className="max-w-3xl text-white">
            <span className="mb-5 inline-block rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur">
              Discover India with confidence
            </span>

            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Explore beautiful destinations.
              <span className="block text-indigo-300">
                Create unforgettable journeys.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
              Find destinations, tourism packages, places to visit, hotels,
              food, and travel information in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/destinations"
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                Explore Destinations
              </Link>

              <Link
                href="/packages"
                className="rounded-xl border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH SECTION */}
      <section className="relative mx-auto -mt-8 max-w-6xl px-6">
        <form
          onSubmit={handleSearch}
          className="grid gap-4 rounded-2xl bg-white p-5 shadow-xl md:grid-cols-[180px_1fr_auto]"
        >
          <select
            value={searchType}
            onChange={(event) => setSearchType(event.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          >
            <option value="destinations">Destinations</option>
            <option value="places">Places</option>
            <option value="packages">Packages</option>
          </select>

          <div className="flex items-center rounded-xl border border-slate-200 px-4">
            <Search className="mr-3 text-slate-400" size={20} />

            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search destinations or packages..."
              className="w-full py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </section>

      {/* DESTINATIONS SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-indigo-600">Explore the country</p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Featured Destinations
            </h2>
          </div>

          <Link
            href="/destinations"
            className="flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all
            <ArrowRight size={18} />
          </Link>
        </div>

        {loadingDestinations && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="animate-spin text-indigo-600" size={32} />
          </div>
        )}

        {!loadingDestinations && destinationError && (
          <div className="rounded-xl bg-red-50 p-5 text-red-600">
            {destinationError}
          </div>
        )}

        {!loadingDestinations &&
          !destinationError &&
          destinations.length === 0 && (
            <div className="rounded-xl bg-white p-10 text-center shadow-sm">
              <MapPin className="mx-auto mb-4 text-slate-400" size={40} />

              <h3 className="text-xl font-semibold">
                No destinations available
              </h3>

              <p className="mt-2 text-slate-500">
                Admin-entered destinations will appear here.
              </p>
            </div>
          )}

        {!loadingDestinations && destinations.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((destination) => (
              <Link
                href={`/destinations/${destination.slug || destination._id}`}
                key={destination._id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={getImageUrl(destination.coverImage)}
                    alt={destination.name || "Destination"}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <MapPin size={16} />
                    <span>
                      {destination.state || destination.country || "India"}
                    </span>
                  </div>

                  <h3 className="mt-2 text-xl font-bold">{destination.name}</h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {destination.description ||
                      "Discover this beautiful destination."}
                  </p>

                  <div className="mt-4 flex items-center gap-2 font-semibold text-indigo-600">
                    Explore
                    <ArrowRight size={17} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BENEFITS SECTION */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-semibold text-indigo-600">Why choose us</p>

            <h2 className="mt-2 text-3xl font-bold">
              Everything you need for your trip
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <BenefitCard
              icon={<ShieldCheck size={28} />}
              title="Trusted Information"
              description="Access organized tourism information managed by administrators."
            />

            <BenefitCard
              icon={<Wallet size={28} />}
              title="Budget Friendly"
              description="Explore packages and estimated costs before planning your trip."
            />

            <BenefitCard
              icon={<Headphones size={28} />}
              title="Helpful Support"
              description="Send inquiries and get assistance for your travel plans."
            />

            <BenefitCard
              icon={<MapPin size={28} />}
              title="Discover More"
              description="Find destinations, places, hotels, restaurants, and activities."
            />
          </div>
        </div>
      </section>

      {/* PACKAGES SECTION */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-semibold text-indigo-600">Plan your journey</p>

            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Popular Packages
            </h2>
          </div>

          <Link
            href="/packages"
            className="flex items-center gap-2 font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all
            <ArrowRight size={18} />
          </Link>
        </div>

        {loadingPackages && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="animate-spin text-indigo-600" size={32} />
          </div>
        )}

        {!loadingPackages && packageError && (
          <div className="rounded-xl bg-red-50 p-5 text-red-600">
            {packageError}
          </div>
        )}

        {!loadingPackages && !packageError && packages.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <PackageOpen className="mx-auto mb-4 text-slate-400" size={40} />

            <h3 className="text-xl font-semibold">No packages available</h3>

            <p className="mt-2 text-slate-500">
              Admin-entered packages will appear here.
            </p>
          </div>
        )}

        {!loadingPackages && packages.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 6).map((item) => (
              <Link
                href={`/packages/${item.slug || item._id}`}
                key={item._id}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-56 overflow-hidden">
                  <img
                    src={getImageUrl(item.coverImage)}
                    alt={getPackageTitle(item)}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <p className="text-sm font-semibold text-indigo-600">
                    {item.destination?.name || "India"}
                  </p>

                  <h3 className="mt-2 text-xl font-bold">
                    {getPackageTitle(item)}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                    {item.description ||
                      "Explore this exciting tourism package."}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      {getPackagePrice(item)}
                    </span>

                    <span className="flex items-center gap-1 font-semibold text-indigo-600">
                      View
                      <ArrowRight size={17} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA SECTION */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="rounded-3xl bg-indigo-700 px-6 py-16 text-center text-white sm:px-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to plan your next journey?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
            Explore destinations and packages to create your perfect travel
            experience.
          </p>

          <Link
            href="/packages"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Explore Packages
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function BenefitCard({ icon, title, description }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}
