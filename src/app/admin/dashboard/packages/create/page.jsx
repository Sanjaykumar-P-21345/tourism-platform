"use client";

import PackageForm from "@/components/admin/PackageForm";

export default function CreatePackagePage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Packages
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          Create Package
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create a complete tourism package with itinerary, places and
          Cloudinary images.
        </p>
      </div>

      <PackageForm mode="create" />
    </div>
  );
}