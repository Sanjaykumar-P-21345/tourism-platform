"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Globe2,
  MapPin,
  Hotel,
  Utensils,
  Car,
  BriefcaseBusiness,
  Map,
  Mail,
  ArrowRight,
  LayoutDashboard,
  Loader2,
} from "lucide-react";

import { adminApi } from "@/utils/adminApi";

const managementItems = [
  {
    title: "Destinations",
    description: "Tourism destinations",
    href: "/admin/dashboard/destinations",
    icon: Globe2,
  },
  {
    title: "Places",
    description: "Tourist attractions",
    href: "/admin/dashboard/places",
    icon: MapPin,
  },
  {
    title: "Hotels",
    description: "Hotels and stays",
    href: "/admin/dashboard/hotels",
    icon: Hotel,
  },
  {
    title: "Restaurants",
    description: "Restaurant listings",
    href: "/admin/dashboard/restaurants",
    icon: Utensils,
  },
  {
    title: "Transportation",
    description: "Travel and transport",
    href: "/admin/dashboard/transportation",
    icon: Car,
  },
  {
    title: "Packages",
    description: "Tourism packages",
    href: "/admin/dashboard/packages",
    icon: BriefcaseBusiness,
  },
  {
    title: "Itineraries",
    description: "Travel itineraries",
    href: "/admin/dashboard/itineraries",
    icon: Map,
  },
];

function getCount(data) {
  if (!data) return 0;

  if (Array.isArray(data)) {
    return data.length;
  }

  if (Array.isArray(data.data)) {
    return data.data.length;
  }

  if (Array.isArray(data.items)) {
    return data.items.length;
  }

  return 0;
}

function StatCard({ title, value, description, href, icon: Icon }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-indigo-500/50 hover:bg-slate-900/90"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>

          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">{description}</p>

        <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
      </div>
    </Link>
  );
}

function QuickLink({ href, label, icon: Icon }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 transition hover:border-indigo-500/40 hover:bg-slate-800 hover:text-white"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-400 transition group-hover:bg-indigo-600/15 group-hover:text-indigo-400">
        <Icon className="h-4 w-4" />
      </div>

      <span className="flex-1">{label}</span>

      <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    destinations: 0,
    places: 0,
    hotels: 0,
    restaurants: 0,
    transportation: 0,
    packages: 0,
    itineraries: 0,
    inquiries: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        /*
         * IMPORTANT:
         *
         * Do NOT request /api/dashboard/inquiries here yet.
         * That route does not exist, which was causing the 404.
         */

        const results = await Promise.allSettled([
          adminApi.get("/api/dashboard/destinations"),
          adminApi.get("/api/dashboard/places"),
          adminApi.get("/api/dashboard/hotels"),
          adminApi.get("/api/dashboard/restaurants"),
          adminApi.get("/api/dashboard/transportation"),
          adminApi.get("/api/dashboard/packages"),
          adminApi.get("/api/dashboard/itineraries"),
        ]);

        if (!mounted) return;

        const [
          destinations,
          places,
          hotels,
          restaurants,
          transportation,
          packages,
          itineraries,
        ] = results;

        setStats({
          destinations:
            destinations.status === "fulfilled"
              ? getCount(destinations.value)
              : 0,

          places: places.status === "fulfilled" ? getCount(places.value) : 0,

          hotels: hotels.status === "fulfilled" ? getCount(hotels.value) : 0,

          restaurants:
            restaurants.status === "fulfilled"
              ? getCount(restaurants.value)
              : 0,

          transportation:
            transportation.status === "fulfilled"
              ? getCount(transportation.value)
              : 0,

          packages:
            packages.status === "fulfilled" ? getCount(packages.value) : 0,

          itineraries:
            itineraries.status === "fulfilled"
              ? getCount(itineraries.value)
              : 0,

          inquiries: 0,
        });

        const failedRequests = results.filter(
          (result) => result.status === "rejected",
        );

        if (failedRequests.length > 0) {
          console.warn(
            "Some dashboard statistics could not be loaded.",
            failedRequests,
          );
        }
      } catch (err) {
        console.error("Dashboard loading failed:", err);

        if (mounted) {
          setError(err?.message || "Unable to load dashboard statistics.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      {/* HEADER */}
      <section className="mb-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-indigo-400">
              <LayoutDashboard className="h-5 w-5" />

              <span className="text-xs font-semibold uppercase tracking-wider">
                Dashboard
              </span>
            </div>

            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Tourism Management
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage your tourism platform from one place.
            </p>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* STATS */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Destinations"
          value={loading ? "—" : stats.destinations}
          description="Tourism destinations"
          href="/admin/dashboard/destinations"
          icon={Globe2}
        />

        <StatCard
          title="Places"
          value={loading ? "—" : stats.places}
          description="Tourist attractions"
          href="/admin/dashboard/places"
          icon={MapPin}
        />

        <StatCard
          title="Hotels"
          value={loading ? "—" : stats.hotels}
          description="Hotels and stays"
          href="/admin/dashboard/hotels"
          icon={Hotel}
        />

        <StatCard
          title="Restaurants"
          value={loading ? "—" : stats.restaurants}
          description="Restaurant listings"
          href="/admin/dashboard/restaurants"
          icon={Utensils}
        />

        <StatCard
          title="Transportation"
          value={loading ? "—" : stats.transportation}
          description="Travel and transport"
          href="/admin/dashboard/transportation"
          icon={Car}
        />

        <StatCard
          title="Packages"
          value={loading ? "—" : stats.packages}
          description="Tourism packages"
          href="/admin/dashboard/packages"
          icon={BriefcaseBusiness}
        />

        <StatCard
          title="Itineraries"
          value={loading ? "—" : stats.itineraries}
          description="Travel itineraries"
          href="/admin/dashboard/itineraries"
          icon={Map}
        />

        <StatCard
          title="New Inquiries"
          value="0"
          description="Visitor inquiries"
          href="/admin/dashboard/inquiries"
          icon={Mail}
        />
      </section>

      {/* QUICK LINKS */}
      <section className="mt-7 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-white">Quick Management</h2>

          <p className="mt-1 text-sm text-slate-400">
            Quickly access the main management sections.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            href="/admin/dashboard/destinations"
            label="Manage Destinations"
            icon={Globe2}
          />

          <QuickLink
            href="/admin/dashboard/places"
            label="Manage Places"
            icon={MapPin}
          />

          <QuickLink
            href="/admin/dashboard/hotels"
            label="Manage Hotels"
            icon={Hotel}
          />

          <QuickLink
            href="/admin/dashboard/restaurants"
            label="Manage Restaurants"
            icon={Utensils}
          />

          <QuickLink
            href="/admin/dashboard/transportation"
            label="Manage Transportation"
            icon={Car}
          />

          <QuickLink
            href="/admin/dashboard/packages"
            label="Manage Packages"
            icon={BriefcaseBusiness}
          />

          <QuickLink
            href="/admin/dashboard/itineraries"
            label="Manage Itineraries"
            icon={Map}
          />

          <QuickLink
            href="/admin/dashboard/inquiries"
            label="View Inquiries"
            icon={Mail}
          />
        </div>
      </section>

      {/* LOADING */}
      {loading && (
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading dashboard...
        </div>
      )}
    </div>
  );
}
