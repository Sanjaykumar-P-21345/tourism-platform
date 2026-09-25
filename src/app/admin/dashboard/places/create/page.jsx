"use client";

import { useRouter } from "next/navigation";
import PlaceForm from "@/components/admin/PlaceForm";

export default function CreatePlacePage() {
  const router = useRouter();

  return (
    <div className="min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Place
        </h1>

        <p className="mt-1 text-sm text-slate-500">Add a new tourist place.</p>
      </div>

      <PlaceForm
        onSuccess={() => {
          router.push("/admin/dashboard/places");
          router.refresh();
        }}
        onCancel={() => router.push("/admin/dashboard/places")}
      />
    </div>
  );
}
