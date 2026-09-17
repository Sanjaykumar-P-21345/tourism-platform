
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, MapPin } from "lucide-react";

function getImageUrl(image) {
  if (!image) return "/images/tourism-placeholder.jpg";

  if (typeof image === "string") return image;

  if (image.url) return image.url;

  return "/images/tourism-placeholder.jpg";
}

export default function DestinationDetailPage({ params }) {
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDestination() {
      try {
        const { slug } = await params;

        const response = await fetch(
          `/api/public/destinations/${encodeURIComponent(slug)}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Destination not found."
          );
        }

        setDestination(result.data);
      } catch (error) {
        console.error("Destination detail error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadDestination();
  }, [params]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle
          size={36}
          className="animate-spin text-indigo-600"
        />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold">
          Destination Not Found
        </h1>

        <p className="mt-3 text-slate-500">
          {error || "This destination is unavailable."}
        </p>

        <Link
          href="/"
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO IMAGE */}
      <section className="relative h-[420px] overflow-hidden">
        <img
          src={getImageUrl(destination.coverImage)}
          alt={destination.name}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="absolute inset-0 mx-auto flex max-w-7xl flex-col justify-end px-6 pb-12 text-white lg:px-8">
          <Link
            href="/destinations"
            className="mb-6 flex w-fit items-center gap-2 text-sm text-white/90 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to destinations
          </Link>

          <h1 className="text-4xl font-bold sm:text-5xl">
            {destination.name}
          </h1>

          <div className="mt-4 flex items-center gap-2 text-white/90">
            <MapPin size={18} />

            <span>
              {destination.state ||
                destination.country ||
                "India"}
            </span>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-6 py-14 lg:px-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-2xl font-bold">
            About {destination.name}
          </h2>

          <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">
            {destination.description ||
              "Information about this destination will be available soon."}
          </p>

          {/* DESTINATION DETAILS */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {destination.state && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">State</p>
                <p className="mt-1 font-semibold">
                  {destination.state}
                </p>
              </div>
            )}

            {destination.country && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Country</p>
                <p className="mt-1 font-semibold">
                  {destination.country}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* GALLERY */}
        {destination.gallery?.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-6 text-2xl font-bold">
              Destination Gallery
            </h2>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {destination.gallery.map((image, index) => (
                <img
                  key={image.publicId || index}
                  src={getImageUrl(image)}
                  alt={`${destination.name} gallery ${index + 1}`}
                  className="h-64 w-full rounded-2xl object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* INQUIRY BUTTON */}
        <div className="mt-10 rounded-2xl bg-indigo-700 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">
            Interested in this destination?
          </h2>

          <p className="mt-3 text-indigo-100">
            Contact us to plan your next journey.
          </p>

          <Link
            href={`/contact?destinationId=${destination._id}`}
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
          >
            Send Inquiry
          </Link>
        </div>
      </section>
    </main>
  );
}