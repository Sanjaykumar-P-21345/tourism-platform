"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Headphones,
  MapPin,
  PackageOpen,
  Plane,
  Route,
  ShieldCheck,
  Snowflake,
  Users,
} from "lucide-react";

import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

/* =========================================================
   HERO BACKGROUND
   ========================================================= */

const HERO_BG = "/images/travel-hero-bg.png";

const FALLBACK_DESTINATION_IMAGE = "/images/destination-placeholder.jpg";

/* =========================================================
   IMAGE HELPERS
   ========================================================= */

function normalizeImageUrl(value) {
  if (!value) return "";

  if (typeof value === "string") {
    const url = value.trim();

    if (!url) return "";

    if (
      !url.startsWith("/") &&
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("data:")
    ) {
      return `/${url}`;
    }

    return url;
  }

  if (typeof value === "object") {
    return (
      normalizeImageUrl(value.url) ||
      normalizeImageUrl(value.src) ||
      normalizeImageUrl(value.image) ||
      normalizeImageUrl(value.imageUrl) ||
      normalizeImageUrl(value.secure_url) ||
      normalizeImageUrl(value.secureUrl) ||
      normalizeImageUrl(value.path) ||
      normalizeImageUrl(value.location) ||
      ""
    );
  }

  return "";
}

/* =========================================================
   GET IMAGE URL
   ========================================================= */

function getImageUrl(item) {
  if (!item) return "";

  const directImage =
    normalizeImageUrl(item.image) ||
    normalizeImageUrl(item.imageUrl) ||
    normalizeImageUrl(item.coverImage) ||
    normalizeImageUrl(item.coverImageUrl) ||
    normalizeImageUrl(item.thumbnail) ||
    normalizeImageUrl(item.thumbnailUrl) ||
    normalizeImageUrl(item.photo) ||
    normalizeImageUrl(item.photoUrl) ||
    normalizeImageUrl(item.bannerImage) ||
    normalizeImageUrl(item.destinationImage);

  if (directImage) {
    return directImage;
  }

  const imageArrays = [
    item.images,
    item.photos,
    item.gallery,
    item.galleryImages,
    item.media,
  ];

  for (const collection of imageArrays) {
    if (Array.isArray(collection) && collection.length > 0) {
      for (const image of collection) {
        const resolved = normalizeImageUrl(image);

        if (resolved) {
          return resolved;
        }
      }
    }
  }

  const nestedImage =
    normalizeImageUrl(item.media?.image) ||
    normalizeImageUrl(item.media?.cover) ||
    normalizeImageUrl(item.media?.thumbnail) ||
    normalizeImageUrl(item.cover?.image) ||
    normalizeImageUrl(item.cover?.url);

  if (nestedImage) {
    return nestedImage;
  }

  return "";
}

/* =========================================================
   PACKAGE HELPERS
   ========================================================= */

function getPackageTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.packageName ||
    item?.packageTitle ||
    "Travel Package"
  );
}

function getPackagePrice(item) {
  return (
    item?.price || item?.amount || item?.startingPrice || item?.cost || null
  );
}

/* =========================================================
   API RESPONSE HELPER
   ========================================================= */

function extractItems(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.destinations)) {
    return data.data.destinations;
  }

  if (Array.isArray(data?.data?.packages)) {
    return data.data.packages;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  return [];
}

/* =========================================================
   PAGE
   ========================================================= */

export default function HomePage() {
  const [destinations, setDestinations] = useState([]);
  const [packages, setPackages] = useState([]);

  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [loadingPackages, setLoadingPackages] = useState(true);

  const [destinationError, setDestinationError] = useState("");

  const [packageError, setPackageError] = useState("");

  /* =======================================================
     FETCH DESTINATIONS
     ======================================================= */

  useEffect(() => {
    async function loadDestinations() {
      try {
        setLoadingDestinations(true);
        setDestinationError("");

        const response = await fetch("/api/public/destinations", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load destinations");
        }

        const data = await response.json();

        console.log("DESTINATIONS API RESPONSE:", data);

        const items = extractItems(data, ["destinations", "results"]);

        console.log("DESTINATION ITEMS:", items);

        setDestinations(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Destination fetch error:", error);

        setDestinationError("Destinations are currently unavailable.");

        setDestinations([]);
      } finally {
        setLoadingDestinations(false);
      }
    }

    loadDestinations();
  }, []);

  /* =======================================================
     FETCH PACKAGES
     ======================================================= */

  useEffect(() => {
    async function loadPackages() {
      try {
        setLoadingPackages(true);
        setPackageError("");

        const response = await fetch("/api/public/packages", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load packages");
        }

        const data = await response.json();

        const items = extractItems(data, ["packages", "results"]);

        setPackages(Array.isArray(items) ? items : []);
      } catch (error) {
        console.error("Package fetch error:", error);

        setPackageError("Packages are currently unavailable.");

        setPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    }

    loadPackages();
  }, []);

  return (
    <>
      {/* ===================================================
          GLOBAL ANIMATION STYLES

          IMPORTANT:
          Do NOT use <style jsx global> here.
          That was causing the hydration mismatch.
          A normal style tag keeps the server/client markup
          identical.
          =================================================== */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes confidenceLoop {
              0% {
                transform: translateY(0px) scale(1);
              }

              8% {
                transform: translateY(-8px) scale(1.015);
              }

              18% {
                transform: translateY(0px) scale(1);
              }

              100% {
                transform: translateY(0px) scale(1);
              }
            }

            @keyframes softFloat {
              0%,
              100% {
                transform: translateY(0px);
              }

              50% {
                transform: translateY(-8px);
              }
            }

            @keyframes vehicleFloat {
              0%,
              100% {
                transform: translateY(0px);
              }

              50% {
                transform: translateY(-10px);
              }
            }

            @keyframes shineMove {
              0% {
                transform: translateX(-120%);
              }

              100% {
                transform: translateX(120%);
              }
            }

            .confidence-loop {
              animation-name: confidenceLoop;
              animation-duration: 5s;
              animation-timing-function: ease-in-out;
              animation-iteration-count: infinite;
            }

            .soft-float {
              animation: softFloat 4s ease-in-out infinite;
            }

            .vehicle-float {
              animation: vehicleFloat 5s ease-in-out infinite;
            }

            .reveal-hidden {
              opacity: 0;
              transform: translateY(45px) scale(0.97);
            }

            .reveal-visible {
              opacity: 1;
              transform: translateY(0) scale(1);
            }

            .reveal-transition {
              transition:
                opacity 0.75s ease,
                transform 0.75s cubic-bezier(0.22, 1, 0.36, 1);
            }

            @media (prefers-reduced-motion: reduce) {
              .confidence-loop,
              .soft-float,
              .vehicle-float {
                animation: none !important;
              }

              .reveal-hidden {
                opacity: 1 !important;
                transform: none !important;
              }

              .reveal-transition {
                transition: none !important;
              }
            }
          `,
        }}
      />

      <main className="min-h-screen overflow-x-hidden bg-[#f4faf7] text-[#073f35]">
        {/* ===================================================
            HERO
            =================================================== */}

        <section className="relative min-h-[900px] overflow-hidden lg:min-h-[940px]">
          {/* Background */}

          <img
            src={HERO_BG}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          {/* Left gradient */}

          <div className="absolute inset-0 bg-gradient-to-r from-[#f9fffc]/95 via-[#f9fffc]/72 via-45% to-transparent" />

          {/* Bottom atmosphere */}

          <div className="absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-[#063d34]/25 to-transparent" />

          {/* Scenic highlight */}

          <div className="pointer-events-none absolute -left-40 top-56 h-[550px] w-[550px] rounded-full bg-white/30 blur-[120px]" />

          {/* Navbar */}

          <div className="relative z-50">
            <Navbar />
          </div>

          {/* =================================================
              HERO CONTENT
              ================================================= */}

          <div className="relative z-20 mx-auto max-w-[1450px] px-6 pb-44 pt-20 sm:px-10 lg:px-16 lg:pt-24">
            <div className="grid min-h-[680px] items-center lg:grid-cols-[0.92fr_1.08fr]">
              {/* LEFT CONTENT */}

              <div className="relative z-30 max-w-[610px]">
                <Reveal delay={0}>
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0c8065]/10 bg-[#e6f7f1]/85 px-5 py-2.5 text-sm font-semibold text-[#075847] shadow-sm backdrop-blur-md">
                    <MapPin size={17} strokeWidth={2.5} />

                    <span>Comfortable Rides</span>

                    <span className="h-1 w-1 rounded-full bg-[#0d8067]" />

                    <span>Safe Journeys</span>
                  </div>
                </Reveal>

                <Reveal delay={100}>
                  <h1 className="max-w-[650px] text-[48px] font-black leading-[0.98] tracking-[-2.5px] text-[#064d3f] sm:text-[58px] md:text-[66px] lg:text-[72px] xl:text-[78px]">
                    Travel in Comfort
                    <br />
                    with <span className="text-[#08795f]">SST Travels</span>
                  </h1>
                </Reveal>

                <Reveal delay={200}>
                  <p className="mt-7 max-w-[560px] text-[17px] leading-7 text-[#164f45] sm:text-[18px]">
                    Experience the best travel with our premium{" "}
                    <strong className="font-extrabold text-[#064d3f]">
                      Force Traveller
                    </strong>{" "}
                    vehicles — spacious, comfortable and perfect for group
                    journeys.
                  </p>
                </Reveal>

                {/* MINI FEATURES */}

                <div className="mt-8 grid max-w-[590px] grid-cols-1 gap-4 sm:grid-cols-3">
                  <Reveal delay={300}>
                    <MiniFeature
                      icon={<Users size={26} />}
                      title="Spacious"
                      subtitle="Seating Capacity"
                    />
                  </Reveal>

                  <Reveal delay={400}>
                    <MiniFeature
                      icon={<ShieldCheck size={27} />}
                      title="Safe & Secure"
                      subtitle="Travel Always"
                    />
                  </Reveal>

                  <Reveal delay={500}>
                    <MiniFeature
                      icon={<CarFront size={27} />}
                      title="Experienced"
                      subtitle="Drivers"
                    />
                  </Reveal>
                </div>

                {/* BUTTONS */}

                <Reveal delay={600}>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href="#vehicles"
                      className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#07875f] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_35px_rgba(0,100,75,0.25)] transition-all duration-300 hover:-translate-y-1 hover:bg-[#056f4e]"
                    >
                      View Our Vehicles
                      <ArrowRight
                        size={19}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full border border-[#08795f] bg-white/30 px-8 py-4 text-sm font-bold text-[#075847] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/70"
                    >
                      Book Your Trip
                    </Link>
                  </div>
                </Reveal>
              </div>

              {/* =================================================
                  VEHICLE
                  ================================================= */}

              <Reveal delay={250}>
                <div
                  id="vehicles"
                  className="relative mt-12 flex min-h-[460px] items-end justify-center lg:mt-0 lg:min-h-[650px]"
                >
                  {/* Ground shadow */}

                  <div className="absolute bottom-14 left-1/2 h-16 w-[72%] -translate-x-1/2 rounded-full bg-black/30 blur-3xl" />

                  {/* Scenic glow */}

                  <div className="absolute right-[10%] top-[18%] h-[260px] w-[260px] rounded-full bg-white/20 blur-[90px]" />

                  {/* Vehicle */}

                  <img
                    src="/images/force-traveller.png"
                    alt="SST Travels Force Traveller"
                    className="vehicle-float relative z-10 w-[110%] max-w-none object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.32)] sm:w-[105%] lg:w-[118%] xl:w-[120%]"
                  />
                </div>
              </Reveal>
            </div>
          </div>

          {/* =================================================
              DESKTOP FEATURE STRIP
              ================================================= */}

          <div className="absolute bottom-0 left-0 right-0 z-40 hidden px-5 pb-0 lg:block lg:px-10">
            <div className="mx-auto max-w-[1380px]">
              <div className="grid min-h-[125px] grid-cols-[1fr_1fr_1fr_1fr_1.65fr] items-center overflow-hidden rounded-t-[38px] border border-white/70 bg-[#f4fffb]/94 px-7 shadow-[0_-15px_45px_rgba(0,65,50,0.12)] backdrop-blur-xl xl:px-10">
                <Reveal delay={0}>
                  <BottomFeature
                    icon={<Users size={27} />}
                    title="10 – 17 Seater"
                    subtitle="Multiple Options"
                  />
                </Reveal>

                <Reveal delay={100}>
                  <BottomFeature
                    icon={<Snowflake size={27} />}
                    title="AC & Comfortable"
                    subtitle="Travel Experience"
                  />
                </Reveal>

                <Reveal delay={200}>
                  <BottomFeature
                    icon={<Route size={27} />}
                    title="Well Maintained"
                    subtitle="Fleet"
                  />
                </Reveal>

                <Reveal delay={300}>
                  <BottomFeature
                    icon={<ShieldCheck size={27} />}
                    title="24/7 Support"
                    subtitle="During Your Trip"
                  />
                </Reveal>

                <div className="flex h-full items-center justify-center border-l border-[#16856b]/20 pl-8">
                  <div className="relative flex items-center gap-5">
                    <div className="text-right">
                      <div className="font-serif text-[23px] italic leading-6 text-[#086b57]">
                        Your Journey
                      </div>

                      <div className="font-serif text-[23px] italic leading-6 text-[#086b57]">
                        Our Priority
                      </div>

                      <div className="ml-auto mt-2 h-[2px] w-28 rotate-[-5deg] rounded-full bg-[#0c896c]" />
                    </div>

                    <Plane
                      size={38}
                      className="rotate-[12deg] text-[#07875f]"
                    />

                    <div className="flex items-end gap-1">
                      <div className="h-7 w-10 rotate-[-15deg] rounded-t-full border-t-2 border-[#43b795]" />

                      <div className="h-11 w-14 rotate-[8deg] rounded-t-full border-t-2 border-[#43b795]" />

                      <div className="h-8 w-12 rotate-[-8deg] rounded-t-full border-t-2 border-[#43b795]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            MOBILE FEATURE STRIP
            =================================================== */}

        <section className="bg-[#effbf6] px-5 py-7 lg:hidden">
          <div className="grid grid-cols-2 gap-3">
            <Reveal delay={0}>
              <BottomFeature
                icon={<Users size={24} />}
                title="10 – 17 Seater"
                subtitle="Multiple Options"
              />
            </Reveal>

            <Reveal delay={100}>
              <BottomFeature
                icon={<Snowflake size={24} />}
                title="AC & Comfortable"
                subtitle="Travel Experience"
              />
            </Reveal>

            <Reveal delay={200}>
              <BottomFeature
                icon={<Route size={24} />}
                title="Well Maintained"
                subtitle="Fleet"
              />
            </Reveal>

            <Reveal delay={300}>
              <BottomFeature
                icon={<ShieldCheck size={24} />}
                title="24/7 Support"
                subtitle="During Your Trip"
              />
            </Reveal>
          </div>
        </section>

        {/* ===================================================
            DESTINATIONS
            =================================================== */}

        <section className="bg-[#f4faf7] px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-[1380px]">
            <Reveal>
              <SectionHeading
                eyebrow="EXPLORE"
                title="Explore Beautiful Destinations"
                description="Discover memorable places and experience comfortable group travel with SST Travels."
              />
            </Reveal>

            {loadingDestinations ? (
              <LoadingGrid count={3} />
            ) : destinationError ? (
              <EmptyState message={destinationError} />
            ) : destinations.length === 0 ? (
              <EmptyState message="No destinations available right now." />
            ) : (
              <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {destinations.slice(0, 6).map((destination, index) => {
                  const image = getImageUrl(destination);

                  const destinationName =
                    destination?.name ||
                    destination?.title ||
                    destination?.destinationName ||
                    "Destination";

                  const destinationId =
                    destination?._id || destination?.id || destination?.slug;

                  const destinationSlug =
                    destination?.slug || destination?._id || destination?.id;

                  return (
                    <Reveal key={destinationId || index} delay={index * 130}>
                      <Link
                        href={`/destinations/${destinationSlug}`}
                        className="group block overflow-hidden rounded-[30px] bg-white shadow-[0_15px_45px_rgba(0,70,55,0.08)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(0,70,55,0.14)]"
                      >
                        {/* IMAGE */}

                        <div className="relative h-[290px] overflow-hidden bg-[#dcefe8]">
                          {image ? (
                            <img
                              src={image}
                              alt={destinationName}
                              loading="lazy"
                              decoding="async"
                              className="block h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                              onError={(event) => {
                                console.error(
                                  "Destination image failed:",
                                  image,
                                );

                                event.currentTarget.onerror = null;

                                event.currentTarget.src =
                                  FALLBACK_DESTINATION_IMAGE;
                              }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#dff4ec] to-[#c9e8dd]">
                              <div className="text-center">
                                <MapPin
                                  size={52}
                                  className="mx-auto text-[#07875f]"
                                />

                                <p className="mt-3 text-sm font-semibold text-[#4c8174]">
                                  Destination Image
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />

                          <div className="absolute bottom-5 left-5 right-5">
                            <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                              {destinationName}
                            </h3>
                          </div>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            WHY SST
            =================================================== */}

        <section className="bg-white px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-[1380px]">
            <Reveal>
              <SectionHeading
                eyebrow="WHY SST TRAVELS"
                title="Travel With Comfort & Confidence"
                description="Every journey is designed around comfort, safety and a smooth travel experience."
              />
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <ConfidenceCard
                index={0}
                icon={<ShieldCheck size={30} />}
                title="Safe & Secure"
                text="Safety-focused journeys with experienced drivers and maintained vehicles."
              />

              <ConfidenceCard
                index={1}
                icon={<Snowflake size={30} />}
                title="AC Comfort"
                text="Enjoy comfortable travel with air-conditioned Force Traveller vehicles."
              />

              <ConfidenceCard
                index={2}
                icon={<Users size={30} />}
                title="Group Friendly"
                text="Perfect seating options for families, friends and larger travel groups."
              />

              <ConfidenceCard
                index={3}
                icon={<Headphones size={30} />}
                title="24/7 Support"
                text="Our support is available to help you throughout your journey."
              />
            </div>
          </div>
        </section>

        {/* ===================================================
            DARK VEHICLE SECTION
            =================================================== */}

        <section className="relative overflow-hidden bg-[#063e35] px-6 py-24 text-white lg:px-10">
          <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#0b8b68]/20 blur-[120px]" />

          <div className="relative z-10 mx-auto grid max-w-[1380px] items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <div>
                <div className="mb-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-[#83ddc0]">
                  SST TRAVELS FLEET
                </div>

                <h2 className="max-w-[650px] text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Comfortable Vehicles.
                  <span className="text-[#65d5b3]"> Memorable Journeys.</span>
                </h2>

                <p className="mt-6 max-w-[600px] text-lg leading-8 text-white/70">
                  Our Force Traveller vehicles are designed for comfortable
                  group travel, whether you are travelling with family, friends
                  or a larger group.
                </p>

                <div className="mt-9 flex flex-wrap gap-4">
                  <DarkFeature
                    icon={<Users size={21} />}
                    text="10 – 17 Seater"
                  />

                  <DarkFeature
                    icon={<Snowflake size={21} />}
                    text="Air Conditioned"
                  />

                  <DarkFeature
                    icon={<ShieldCheck size={21} />}
                    text="Safety Focused"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal delay={250}>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#55c8a6]/10 blur-[100px]" />

                <img
                  src="/images/force-traveller.png"
                  alt="Force Traveller"
                  className="soft-float relative z-10 w-full object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.35)]"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===================================================
            PACKAGES
            =================================================== */}

        <section className="bg-[#f4faf7] px-6 py-24 lg:px-10">
          <div className="mx-auto max-w-[1380px]">
            <Reveal>
              <SectionHeading
                eyebrow="TRAVEL PACKAGES"
                title="Plan Your Next Journey"
                description="Choose a package and let SST Travels make your journey comfortable and memorable."
              />
            </Reveal>

            {loadingPackages ? (
              <LoadingGrid count={3} />
            ) : packageError ? (
              <EmptyState message={packageError} />
            ) : packages.length === 0 ? (
              <EmptyState message="No travel packages available right now." />
            ) : (
              <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
                {packages.slice(0, 6).map((item, index) => {
                  const image = getImageUrl(item);

                  const title = getPackageTitle(item);

                  const price = getPackagePrice(item);

                  return (
                    <Reveal
                      key={item._id || item.id || index}
                      delay={index * 130}
                    >
                      <Link
                        href={`/packages/${item.slug || item._id || item.id}`}
                        className="group block overflow-hidden rounded-[30px] bg-white shadow-[0_15px_45px_rgba(0,70,55,0.08)] transition-all duration-500 hover:-translate-y-2"
                      >
                        <div className="relative h-[250px] overflow-hidden bg-[#dcefe8]">
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <PackageOpen
                                size={48}
                                className="text-[#07875f]"
                              />
                            </div>
                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                          <div className="absolute bottom-5 left-5 right-5">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#b7f0dd]">
                              SST Travels
                            </div>

                            <h3 className="mt-1 text-2xl font-bold text-white">
                              {title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 p-6">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-[#79958e]">
                              Starting From
                            </p>

                            <p className="mt-1 text-xl font-extrabold text-[#075847]">
                              {price
                                ? `₹${Number(price).toLocaleString("en-IN")}`
                                : "Contact Us"}
                            </p>
                          </div>

                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e4f7f0] text-[#07875f] transition-all group-hover:bg-[#07875f] group-hover:text-white">
                            <ArrowRight size={19} />
                          </span>
                        </div>
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            FINAL CTA
            =================================================== */}

        <section className="px-6 py-20 lg:px-10">
          <Reveal>
            <div className="relative mx-auto max-w-[1380px] overflow-hidden rounded-[40px] bg-[#07805e] px-7 py-16 text-center text-white shadow-[0_25px_70px_rgba(0,90,65,0.2)] sm:px-12 lg:px-20 lg:py-20">
              <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

              <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[#003e31]/20 blur-3xl" />

              <div className="relative z-10">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
                  <Plane size={30} />
                </div>

                <h2 className="mx-auto mt-7 max-w-[800px] text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                  Your Journey Starts With SST Travels
                </h2>

                <p className="mx-auto mt-5 max-w-[650px] text-lg leading-8 text-white/80">
                  Comfortable rides, safe journeys and unforgettable travel
                  experiences are just one booking away.
                </p>

                <div className="mt-8">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 font-bold text-[#075847] transition-all hover:-translate-y-1 hover:bg-[#effff9]"
                  >
                    Plan Your Trip
                    <ArrowRight size={19} />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ===================================================
            FOOTER
            =================================================== */}

        <Footer />
      </main>
    </>
  );
}

/* =========================================================
   REVEAL COMPONENT

   FIXED:
   - No Math.random()
   - No createElement()
   - No manually attached observer property
   - Proper cleanup
   - Stable SSR/client markup
   ========================================================= */

function Reveal({ children, delay = 0, className = "" }) {
  const [visible, setVisible] = useState(false);

  const observerRef = useRef(null);

  useEffect(() => {
    const node = observerRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={observerRef}
      className={`reveal-transition ${
        visible ? "reveal-visible" : "reveal-hidden"
      } ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* =========================================================
   MINI FEATURE
   ========================================================= */

function MiniFeature({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#08795f] text-white shadow-[0_8px_20px_rgba(0,100,75,0.16)]">
        {icon}
      </div>

      <div>
        <div className="text-sm font-extrabold text-[#074d40]">{title}</div>

        <div className="mt-0.5 text-xs font-medium text-[#42776d]">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   BOTTOM FEATURE
   ========================================================= */

function BottomFeature({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#d9f4ea] text-[#07805f]">
        {icon}
      </div>

      <div>
        <div className="text-sm font-extrabold text-[#074d40]">{title}</div>

        <div className="mt-0.5 text-[11px] font-medium text-[#65a394]">
          {subtitle}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADING
   ========================================================= */

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-[760px]">
      <div className="text-xs font-black tracking-[0.22em] text-[#07805f]">
        {eyebrow}
      </div>

      <h2 className="mt-4 text-4xl font-black tracking-[-1px] text-[#074d40] sm:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-lg leading-8 text-[#587b73]">{description}</p>
    </div>
  );
}

/* =========================================================
   CONFIDENCE CARD
   ========================================================= */

function ConfidenceCard({ index, icon, title, text }) {
  return (
    <Reveal delay={index * 120}>
      <div
        className="confidence-loop group relative h-full overflow-hidden rounded-[28px] border border-[#dcefe8] bg-[#f7fcfa] p-7 transition-all duration-500 hover:-translate-y-3 hover:bg-white hover:shadow-[0_25px_60px_rgba(0,70,55,0.12)]"
        style={{
          animationDelay: `${index * 0.28}s`,
        }}
      >
        {/* Animated shine */}

        <div className="pointer-events-none absolute inset-y-0 -left-[120%] w-[70%] rotate-[15deg] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[shineMove_1s_ease-in-out]" />

        {/* Icon */}

        <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#dff5ec] text-[#07805f] transition-all duration-500 group-hover:scale-110 group-hover:bg-[#07805f] group-hover:text-white">
          {icon}
        </div>

        {/* Content */}

        <h3 className="relative z-10 mt-6 text-xl font-extrabold text-[#075847]">
          {title}
        </h3>

        <p className="relative z-10 mt-3 leading-7 text-[#68867f]">{text}</p>

        {/* Bottom line */}

        <div className="relative z-10 mt-6 h-1 w-10 rounded-full bg-[#07805f] transition-all duration-500 group-hover:w-20" />
      </div>
    </Reveal>
  );
}

/* =========================================================
   DARK FEATURE
   ========================================================= */

function DarkFeature({ icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90 transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
      <span className="text-[#71d9ba]">{icon}</span>

      {text}
    </div>
  );
}

/* =========================================================
   LOADING GRID
   ========================================================= */

function LoadingGrid({ count = 3 }) {
  return (
    <div className="mt-12 grid gap-7 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({
        length: count,
      }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-[30px] bg-white">
          <div className="h-[270px] animate-pulse bg-[#dfeee9]" />

          <div className="space-y-3 p-6">
            <div className="h-5 w-2/3 animate-pulse rounded bg-[#e1eee9]" />

            <div className="h-4 w-full animate-pulse rounded bg-[#edf5f2]" />

            <div className="h-4 w-1/2 animate-pulse rounded bg-[#edf5f2]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({ message }) {
  return (
    <div className="mt-12 rounded-[30px] border border-dashed border-[#b9ddd1] bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e2f6ee] text-[#07805f]">
        <Route size={28} />
      </div>

      <p className="mt-5 text-[#64827a]">{message}</p>
    </div>
  );
}
