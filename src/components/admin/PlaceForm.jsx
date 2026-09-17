"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ImagePlus, X } from "lucide-react";

import ImageUpload from "@/components/admin/ImageUpload";
import AdminButton from "@/components/admin/AdminButton";
import { adminApi } from "@/utils/adminApi";

const categories = [
  "historical",
  "beach",
  "temple",
  "museum",
  "waterfall",
  "hill-station",
  "wildlife",
  "adventure",
  "park",
  "lake",
  "viewpoint",
  "other",
];

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    return {
      url: image,
      publicId: "",
    };
  }

  if (typeof image === "object" && image.url) {
    return {
      url: image.url,
      publicId: image.publicId || "",
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map((image) => normalizeImage(image)).filter(Boolean);
}

function getInitialValues(initialValues) {
  if (!initialValues) {
    return {
      destination: "",
      name: "",
      slug: "",
      category: "",
      description: "",
      shortDescription: "",
      entryFee: {
        adult: "",
        child: "",
        foreigner: "",
      },
      openingTime: "",
      closingTime: "",
      closedOn: "",
      bestTimeToVisit: "",
      visitDuration: "",
      address: "",
      latitude: "",
      longitude: "",
      coverImage: null,
      gallery: [],
      isFeatured: false,
      isActive: true,
    };
  }

  return {
    destination:
      typeof initialValues.destination === "object"
        ? initialValues.destination?._id || ""
        : initialValues.destination || "",

    name: initialValues.name || "",
    slug: initialValues.slug || "",
    category: initialValues.category || "",
    description: initialValues.description || "",
    shortDescription: initialValues.shortDescription || "",

    entryFee: {
      adult: initialValues.entryFee?.adult ?? "",
      child: initialValues.entryFee?.child ?? "",
      foreigner: initialValues.entryFee?.foreigner ?? "",
    },

    openingTime: initialValues.openingTime || "",
    closingTime: initialValues.closingTime || "",
    closedOn: initialValues.closedOn || "",
    bestTimeToVisit: initialValues.bestTimeToVisit || "",
    visitDuration: initialValues.visitDuration || "",
    address: initialValues.address || "",
    latitude: initialValues.latitude ?? "",
    longitude: initialValues.longitude ?? "",

    coverImage: normalizeImage(initialValues.coverImage),

    gallery: normalizeGallery(initialValues.gallery),

    isFeatured: initialValues.isFeatured ?? false,

    isActive: initialValues.isActive ?? true,
  };
}

export default function PlaceForm({ initialValues = null }) {
  const router = useRouter();

  const isEditMode = Boolean(initialValues?._id);

  const [formData, setFormData] = useState(() =>
    getInitialValues(initialValues),
  );

  const [destinations, setDestinations] = useState([]);

  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [galleryUploading, setGalleryUploading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    loadDestinations();
  }, []);

  async function loadDestinations() {
    try {
      setLoadingDestinations(true);

      const response = await adminApi.get("/api/dashboard/destinations");

      setDestinations(response.data || []);
    } catch (error) {
      console.error("Failed to load destinations:", error);

      setError(error?.message || "Failed to load destinations");
    } finally {
      setLoadingDestinations(false);
    }
  }

  function updateField(field, value) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function updateEntryFee(field, value) {
    setFormData((previous) => ({
      ...previous,
      entryFee: {
        ...previous.entryFee,
        [field]: value,
      },
    }));
  }

  async function handleGallerySelect(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setError("");
    setGalleryUploading(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const token =
          typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null;

        if (!token) {
          throw new Error("Admin session not found. Please log in again.");
        }

        const formDataUpload = new FormData();

        formDataUpload.append("file", file);

        formDataUpload.append("folder", "tourism/places/gallery");

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataUpload,
        });

        const data = await response.json();

        if (response.status === 401) {
          throw new Error(
            "Your admin session has expired. Please log in again.",
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Gallery image upload failed");
        }

        uploadedImages.push(data.image);
      }

      setFormData((previous) => ({
        ...previous,
        gallery: [...previous.gallery, ...uploadedImages],
      }));
    } catch (error) {
      console.error("Gallery upload error:", error);

      setError(error?.message || "Gallery image upload failed");
    } finally {
      setGalleryUploading(false);

      event.target.value = "";
    }
  }

  async function removeGalleryImage(index) {
    const image = formData.gallery[index];

    try {
      setError("");

      if (image?.publicId) {
        const token =
          typeof window !== "undefined"
            ? sessionStorage.getItem("token")
            : null;

        if (!token) {
          throw new Error("Admin session not found. Please log in again.");
        }

        const response = await fetch("/api/upload/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            publicId: image.publicId,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to delete gallery image");
        }
      }

      setFormData((previous) => ({
        ...previous,
        gallery: previous.gallery.filter(
          (_, imageIndex) => imageIndex !== index,
        ),
      }));
    } catch (error) {
      console.error("Gallery delete error:", error);

      setError(error?.message || "Failed to delete gallery image");
    }
  }

  function validateForm() {
    if (!formData.destination) {
      return "Please select a destination.";
    }

    if (!formData.name.trim()) {
      return "Place name is required.";
    }

    if (!formData.slug.trim()) {
      return "Slug is required.";
    }

    if (!formData.category) {
      return "Category is required.";
    }

    if (!formData.description.trim()) {
      return "Description is required.";
    }

    if (!formData.coverImage?.url) {
      return "Cover image is required.";
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        destination: formData.destination,

        name: formData.name.trim(),

        slug: formData.slug.trim().toLowerCase(),

        category: formData.category,

        description: formData.description.trim(),

        shortDescription: formData.shortDescription.trim(),

        entryFee: {
          adult:
            formData.entryFee.adult !== ""
              ? Number(formData.entryFee.adult)
              : undefined,

          child:
            formData.entryFee.child !== ""
              ? Number(formData.entryFee.child)
              : undefined,

          foreigner:
            formData.entryFee.foreigner !== ""
              ? Number(formData.entryFee.foreigner)
              : undefined,
        },

        openingTime: formData.openingTime.trim(),

        closingTime: formData.closingTime.trim(),

        closedOn: formData.closedOn.trim(),

        bestTimeToVisit: formData.bestTimeToVisit.trim(),

        visitDuration: formData.visitDuration.trim(),

        address: formData.address.trim(),

        latitude:
          formData.latitude !== "" ? Number(formData.latitude) : undefined,

        longitude:
          formData.longitude !== "" ? Number(formData.longitude) : undefined,

        coverImage: {
          url: formData.coverImage.url,
          publicId: formData.coverImage.publicId || "",
        },

        gallery: formData.gallery
          .filter((image) => image?.url)
          .map((image) => ({
            url: image.url,
            publicId: image.publicId || "",
          })),

        isFeatured: formData.isFeatured,

        isActive: formData.isActive,
      };

      let response;

      if (isEditMode) {
        response = await adminApi.put(
          `/api/dashboard/places/${initialValues._id}`,
          payload,
        );
      } else {
        response = await adminApi.post("/api/dashboard/places", payload);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save place");
      }

      router.push("/admin/dashboard/places");

      router.refresh();
    } catch (error) {
      console.error("Save place error:", error);

      setError(error?.message || "Failed to save place");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Basic Information</h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Destination */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Destination
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              value={formData.destination}
              onChange={(event) =>
                updateField("destination", event.target.value)
              }
              disabled={loadingDestinations}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            >
              <option value="">
                {loadingDestinations
                  ? "Loading destinations..."
                  : "Select destination"}
              </option>

              {destinations
                .filter((destination) => destination.isActive !== false)
                .map((destination) => (
                  <option key={destination._id} value={destination._id}>
                    {destination.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Name */}
          <InputField
            label="Place Name"
            required
            value={formData.name}
            onChange={(value) => updateField("name", value)}
            placeholder="Example: Marina Beach"
          />

          {/* Slug */}
          <InputField
            label="Slug"
            required
            value={formData.slug}
            onChange={(value) => updateField("slug", value)}
            placeholder="marina-beach"
          />

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
              <span className="ml-1 text-red-500">*</span>
            </label>

            <select
              value={formData.category}
              onChange={(event) => updateField("category", event.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-gray-500"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Short Description */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Short Description
          </label>

          <textarea
            value={formData.shortDescription}
            onChange={(event) =>
              updateField("shortDescription", event.target.value)
            }
            rows={3}
            placeholder="Short description of the place..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Description
            <span className="ml-1 text-red-500">*</span>
          </label>

          <textarea
            value={formData.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={7}
            placeholder="Detailed description of the place..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
          />
        </div>
      </div>

      {/* Images */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Images</h2>

        {/* Cover */}
        <ImageUpload
          label="Cover Image"
          required
          value={formData.coverImage}
          onChange={(image) => updateField("coverImage", image)}
          folder="tourism/places/covers"
        />

        {/* Gallery */}
        <div className="mt-8">
          <label className="mb-3 block text-sm font-medium text-gray-700">
            Gallery Images
          </label>

          <label
            className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:bg-gray-100 ${
              galleryUploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {galleryUploading ? (
              <>
                <Loader2 size={28} className="mb-2 animate-spin" />

                <span className="text-sm text-gray-600">
                  Uploading images...
                </span>
              </>
            ) : (
              <>
                <ImagePlus size={30} className="mb-2" />

                <span className="text-sm font-medium text-gray-700">
                  Add Gallery Images
                </span>

                <span className="mt-1 text-xs text-gray-500">
                  Select multiple images
                </span>
              </>
            )}

            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleGallerySelect}
              className="hidden"
              disabled={galleryUploading}
            />
          </label>

          {formData.gallery.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {formData.gallery.map((image, index) => (
                <div
                  key={image.publicId || `${image.url}-${index}`}
                  className="group relative overflow-hidden rounded-xl border bg-gray-50"
                >
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="h-40 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white opacity-0 shadow transition group-hover:opacity-100"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entry Fee */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Entry Fee</h2>

        <div className="grid gap-5 md:grid-cols-3">
          <NumberField
            label="Adult Fee"
            value={formData.entryFee.adult}
            onChange={(value) => updateEntryFee("adult", value)}
            placeholder="0"
          />

          <NumberField
            label="Child Fee"
            value={formData.entryFee.child}
            onChange={(value) => updateEntryFee("child", value)}
            placeholder="0"
          />

          <NumberField
            label="Foreigner Fee"
            value={formData.entryFee.foreigner}
            onChange={(value) => updateEntryFee("foreigner", value)}
            placeholder="0"
          />
        </div>
      </div>

      {/* Visiting Information */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Visiting Information</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <InputField
            label="Opening Time"
            type="time"
            value={formData.openingTime}
            onChange={(value) => updateField("openingTime", value)}
          />

          <InputField
            label="Closing Time"
            type="time"
            value={formData.closingTime}
            onChange={(value) => updateField("closingTime", value)}
          />

          <InputField
            label="Closed On"
            value={formData.closedOn}
            onChange={(value) => updateField("closedOn", value)}
            placeholder="Example: Monday"
          />

          <InputField
            label="Best Time to Visit"
            value={formData.bestTimeToVisit}
            onChange={(value) => updateField("bestTimeToVisit", value)}
            placeholder="Example: October to March"
          />

          <InputField
            label="Visit Duration"
            value={formData.visitDuration}
            onChange={(value) => updateField("visitDuration", value)}
            placeholder="Example: 2-3 hours"
          />
        </div>
      </div>

      {/* Location */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Location</h2>

        <div className="space-y-5">
          <InputField
            label="Address"
            value={formData.address}
            onChange={(value) => updateField("address", value)}
            placeholder="Full address"
          />

          <div className="grid gap-5 md:grid-cols-2">
            <NumberField
              label="Latitude"
              value={formData.latitude}
              onChange={(value) => updateField("latitude", value)}
              placeholder="13.0827"
              step="any"
            />

            <NumberField
              label="Longitude"
              value={formData.longitude}
              onChange={(value) => updateField("longitude", value)}
              placeholder="80.2707"
              step="any"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-5 text-lg font-semibold">Settings</h2>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(event) =>
                updateField("isFeatured", event.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-700">
              Featured place
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(event) =>
                updateField("isActive", event.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300"
            />

            <span className="text-sm font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => router.push("/admin/dashboard/places")}
          disabled={submitting}
        >
          Cancel
        </AdminButton>

        <AdminButton type="submit" disabled={submitting}>
          {submitting && <Loader2 size={18} className="animate-spin" />}

          {submitting
            ? "Saving..."
            : isEditMode
              ? "Update Place"
              : "Create Place"}
        </AdminButton>
      </div>
    </form>
  );
}

function InputField({
  label,
  required = false,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
      />
    </div>
  );
}

function NumberField({ label, value, onChange, placeholder = "", step = "1" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type="number"
        min="0"
        step={step}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
      />
    </div>
  );
}
