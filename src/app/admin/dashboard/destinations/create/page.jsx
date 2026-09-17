"use client";

import DestinationForm from "@/components/admin/DestinationForm";

export default function CreateDestinationPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Create Destination
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new tourism destination.
        </p>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <DestinationForm mode="create" />
      </div>
    </div>
  );
}