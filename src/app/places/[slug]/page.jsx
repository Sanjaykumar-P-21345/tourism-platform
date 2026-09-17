"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Compass,
  LoaderCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiGet } from "@/utils/api";

export default function PlaceDetailsPage() {
  const params = useParams();
  const slug = params?.slug;

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;

    async function loadPlace() {
      try {
        setLoading(true);
        setError("");

        const response = await apiGet(
          `/api/public/places/${slug}`,
        );

        setPlace(response?.data || null);
      } catch (error) {
        console.error("Load place details error:", error);

        setError(
          error.message || "Unable to load place details.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlace();
  }, [slug]);

  function getImage(image) {
    if (image) return image;

    return "/images/tourism-placeholder.jpg";
  }

  if (loading) {
    return (
      <>
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <LoaderCircle
            size={38}
            className="animate-spin text-indigo-600"
          />
        </div>

        <Footer />
      </>
    );
  }

  if (error || !place) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center">
            <AlertCircle
              size={45}
              className="mx-auto text-red-500"
            />

            <h1 className="mt-4 text-2xl font-bold text-slate-900">
              Place Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "This place is unavailable."}
            </p>

            <Link
              href="/places"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <ArrowLeft size={17} />
              Back to Places
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const destination =
    typeof place.destinationId === "object"
      ? place.destinationId
      : null;

  const gallery = Array.isArray(place.gallery)
    ? place.gallery
    : [];

  const images = [
    place.coverImage,
    ...gallery.map((image) =>
      typeof image === "string" ? image : image?.url,
    ),
  ].filter(Boolean);

  const displayImages =
    images.length > 0
      ? images
      : ["/images/tourism-placeholder.jpg"];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-50">
        {/* HERO IMAGE */}

        <section className="relative h-[360px] overflow-hidden sm:h-[450px]">
          <Image
            src={getImage(displayImages[0])}
            alt={place.name || "Tourism place"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            unoptimized
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <span className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">
              {place.category || "Attraction"}
            </span>

            <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-5xl">
              {place.name}
            </h1>

            <div className="mt-3 flex items-center gap-2 text-sm text-slate-200">
              <MapPin size={17} />

              <span>
                {place.location ||
                  destination?.name ||
                  "India"}
              </span>
            </div>
          </div>
        </section>

        {/* CONTENT */}

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/places"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={17} />
            Back to Places
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* MAIN CONTENT */}

            <div className="space-y-8">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3">
                  <Compass
                    size={23}
                    className="text-indigo-600"
                  />

                  <h2 className="text-2xl font-bold text-slate-900">
                    About This Place
                  </h2>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-8 text-slate-600">
                  {place.description ||
                    "Explore this wonderful destination and discover its unique attractions."}
                </p>
              </article>

              {/* GALLERY */}

              {displayImages.length > 1 && (
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Photo Gallery
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {displayImages.slice(1).map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="relative h-52 overflow-hidden rounded-xl bg-slate-100"
                      >
                        <Image
                          src={getImage(image)}
                          alt={`${place.name} gallery ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </div>

            {/* SIDEBAR */}

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">
                Plan Your Visit
              </h2>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {place.category || "Attraction"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {place.location ||
                      destination?.name ||
                      "India"}
                  </p>
                </div>

                {destination?.name && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Destination
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {destination.name}
                    </p>
                  </div>
                )}
              </div>

              <Link
                href={`/contact?destinationId=${destination?._id || ""}`}
                className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <MessageSquare size={17} />
                Contact Our Team
              </Link>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}