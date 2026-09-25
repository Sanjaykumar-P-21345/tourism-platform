"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
} from "lucide-react";

import PackageForm from "@/components/admin/PackageForm";

export default function CreatePackagePage() {
  const router = useRouter();

  function handleBack() {
    router.push(
      "/admin/dashboard/packages",
    );
  }

  function handleSuccess() {
    router.push(
      "/admin/dashboard/packages",
    );
  }

  return (
    <div className="min-h-screen w-full bg-emerald-50/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBack}
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-emerald-600"
          >
            <ArrowLeft
              size={17}
            />
            Back to Packages
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
              <Package
                size={21}
              />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Add Package
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Create a complete
                tourism package with
                itinerary and places.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
          <PackageForm
            mode="create"
            readOnly={false}
            onSuccess={
              handleSuccess
            }
            onCancel={
              handleBack
            }
          />
        </div>
      </div>
    </div>
  );
}