"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import { adminApi } from "@/utils/adminApi";
import { getToken } from "@/utils/api";

const emptyForm = {
  destination: "",
  type: "",
  providerName: "",
  from: "",
  to: "",
  description: "",
  estimatedCost: {
    min: "",
    max: "",
  },
  estimatedDuration: "",
  schedule: "",
  bookingUrl: "",
  contactPhone: "",
  coverImage: null,
  gallery: [],
  isActive: true,
};

const transportationTypes = [
  {
    value: "flight",
    label: "Flight",
  },
  {
    value: "train",
    label: "Train",
  },
  {
    value: "bus",
    label: "Bus",
  },
  {
    value: "taxi",
    label: "Taxi",
  },
  {
    value: "car-rental",
    label: "Car Rental",
  },
  {
    value: "bike-rental",
    label: "Bike Rental",
  },
];

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "string") {
    return {
      url: image,
      publicId: "",
    };
  }

  return {
    url: image.url || "",
    publicId: image.publicId || "",
  };
}

function normalizeInitialData(data) {
  if (!data) {
    return emptyForm;
  }

  return {
    destination:
      typeof data.destination === "object"
        ? data.destination?._id || ""
        : data.destination || "",

    type: data.type || "",
    providerName: data.providerName || "",
    from: data.from || "",
    to: data.to || "",
    description: data.description || "",

    estimatedCost: {
      min: data.estimatedCost?.min ?? "",
      max: data.estimatedCost?.max ?? "",
    },

    estimatedDuration: data.estimatedDuration || "",
    schedule: data.schedule || "",
    bookingUrl: data.bookingUrl || "",
    contactPhone: data.contactPhone || "",

    coverImage: normalizeImage(data.coverImage),

    gallery: Array.isArray(data.gallery)
      ? data.gallery.map(normalizeImage).filter((image) => image?.url)
      : [],

    isActive: data.isActive ?? true,
  };
}

export default function TransportationForm({
  initialValues = null,
  destinations = [],
  mode = "create",
  readOnly = false,
}) {
  const router = useRouter();

  const [formData, setFormData] = useState(
    normalizeInitialData(initialValues)
  );

  const [loading, setLoading] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!initialValues) return;

    setFormData(normalizeInitialData(initialValues));
  }, [initialValues?._id]);

  function updateField(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function updateCost(field, value) {
    setFormData((prev) => ({
      ...prev,
      estimatedCost: {
        ...prev.estimatedCost,
        [field]: value,
      },
    }));
  }

  async function uploadImage(file, folder) {
    const token = getToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const formDataUpload = new FormData();

    formDataUpload.append("file", file);
    formDataUpload.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formDataUpload,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Image upload failed");
    }

    return data.image;
  }

  async function deleteCloudinaryImage(image) {
    if (!image?.publicId) return;

    const token = getToken();

    if (!token) return;

    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          publicId: image.publicId,
        }),
      });
    } catch (error) {
      console.error("Failed to delete Cloudinary image:", error);
    }
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setCoverUploading(true);

    try {
      const uploadedImage = await uploadImage(
        file,
        "tourism/transportation/cover"
      );

      setFormData((prev) => ({
        ...prev,
        coverImage: uploadedImage,
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setCoverUploading(false);
      event.target.value = "";
    }
  }

  async function handleGalleryUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) return;

    setError("");
    setGalleryUploading(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const uploadedImage = await uploadImage(
          file,
          "tourism/transportation/gallery"
        );

        uploadedImages.push(uploadedImage);
      }

      setFormData((prev) => ({
        ...prev,
        gallery: [...prev.gallery, ...uploadedImages],
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setGalleryUploading(false);
      event.target.value = "";
    }
  }

  async function removeCoverImage() {
    const image = formData.coverImage;

    if (!image) return;

    await deleteCloudinaryImage(image);

    setFormData((prev) => ({
      ...prev,
      coverImage: null,
    }));
  }

  async function removeGalleryImage(index) {
    const image = formData.gallery[index];

    await deleteCloudinaryImage(image);

    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  }

  function validateForm() {
    if (!formData.destination) {
      return "Please select a destination";
    }

    if (!formData.type) {
      return "Please select a transportation type";
    }

    if (!formData.providerName.trim()) {
      return "Provider name is required";
    }

    if (!formData.from.trim()) {
      return "From location is required";
    }

    if (!formData.to.trim()) {
      return "To location is required";
    }

    const min =
      formData.estimatedCost.min === ""
        ? null
        : Number(formData.estimatedCost.min);

    const max =
      formData.estimatedCost.max === ""
        ? null
        : Number(formData.estimatedCost.max);

    if (min !== null && min < 0) {
      return "Minimum cost cannot be negative";
    }

    if (max !== null && max < 0) {
      return "Maximum cost cannot be negative";
    }

    if (min !== null && max !== null && min > max) {
      return "Minimum cost cannot be greater than maximum cost";
    }

    return "";
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (readOnly) return;

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,

        estimatedCost: {
          min:
            formData.estimatedCost.min === ""
              ? undefined
              : Number(formData.estimatedCost.min),

          max:
            formData.estimatedCost.max === ""
              ? undefined
              : Number(formData.estimatedCost.max),
        },
      };

      let response;

      if (mode === "edit" && initialValues?._id) {
        response = await adminApi.put(
          `/api/dashboard/transportation/${initialValues._id}`,
          payload
        );
      } else {
        response = await adminApi.post(
          "/api/dashboard/transportation",
          payload
        );
      }

      setSuccess(
        mode === "edit"
          ? "Transportation updated successfully."
          : "Transportation created successfully."
      );

      setTimeout(() => {
        router.push("/admin/dashboard/transportation");
      }, 800);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `
    w-full rounded-xl border
    border-slate-300 dark:border-slate-700
    bg-white dark:bg-slate-900
    px-4 py-3
    text-sm text-slate-900 dark:text-slate-100
    placeholder:text-slate-400 dark:placeholder:text-slate-500
    outline-none
    transition
    focus:border-blue-500
    focus:ring-2 focus:ring-blue-500/20
    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Basic Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
          Transportation Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Destination */}
          <div>
            <label className={labelClass}>
              Destination <span className="text-red-500">*</span>
            </label>

            <select
              className={inputClass}
              value={formData.destination}
              disabled={readOnly}
              onChange={(e) =>
                updateField("destination", e.target.value)
              }
            >
              <option value="">Select destination</option>

              {destinations.map((destination) => (
                <option
                  key={destination._id}
                  value={destination._id}
                >
                  {destination.name}
                </option>
              ))}
            </select>

            {destinations.length === 0 && !readOnly && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                No destinations available. Create a destination first.
              </p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>
              Transportation Type{" "}
              <span className="text-red-500">*</span>
            </label>

            <select
              className={inputClass}
              value={formData.type}
              disabled={readOnly}
              onChange={(e) =>
                updateField("type", e.target.value)
              }
            >
              <option value="">Select transportation type</option>

              {transportationTypes.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Provider */}
          <div>
            <label className={labelClass}>
              Provider Name <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              className={inputClass}
              placeholder="Example: Air India"
              value={formData.providerName}
              disabled={readOnly}
              onChange={(e) =>
                updateField("providerName", e.target.value)
              }
            />
          </div>

          {/* From */}
          <div>
            <label className={labelClass}>
              From <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              className={inputClass}
              placeholder="Example: Chennai"
              value={formData.from}
              disabled={readOnly}
              onChange={(e) =>
                updateField("from", e.target.value)
              }
            />
          </div>

          {/* To */}
          <div>
            <label className={labelClass}>
              To <span className="text-red-500">*</span>
            </label>

            <input
              type="text"
              className={inputClass}
              placeholder="Example: Bangalore"
              value={formData.to}
              disabled={readOnly}
              onChange={(e) =>
                updateField("to", e.target.value)
              }
            />
          </div>

          {/* Duration */}
          <div>
            <label className={labelClass}>
              Estimated Duration
            </label>

            <input
              type="text"
              className={inputClass}
              placeholder="Example: 4 hours"
              value={formData.estimatedDuration}
              disabled={readOnly}
              onChange={(e) =>
                updateField(
                  "estimatedDuration",
                  e.target.value
                )
              }
            />
          </div>

          {/* Schedule */}
          <div>
            <label className={labelClass}>Schedule</label>

            <input
              type="text"
              className={inputClass}
              placeholder="Example: Daily 08:00 AM"
              value={formData.schedule}
              disabled={readOnly}
              onChange={(e) =>
                updateField("schedule", e.target.value)
              }
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelClass}>Contact Phone</label>

            <input
              type="text"
              className={inputClass}
              placeholder="Contact number"
              value={formData.contactPhone}
              disabled={readOnly}
              onChange={(e) =>
                updateField(
                  "contactPhone",
                  e.target.value
                )
              }
            />
          </div>

          {/* Booking URL */}
          <div>
            <label className={labelClass}>Booking URL</label>

            <input
              type="url"
              className={inputClass}
              placeholder="https://example.com"
              value={formData.bookingUrl}
              disabled={readOnly}
              onChange={(e) =>
                updateField(
                  "bookingUrl",
                  e.target.value
                )
              }
            />
          </div>
        </div>

        {/* Description */}
        <div className="mt-5">
          <label className={labelClass}>Description</label>

          <textarea
            rows={5}
            className={inputClass}
            placeholder="Describe this transportation option..."
            value={formData.description}
            disabled={readOnly}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
          />
        </div>
      </section>

      {/* Cost */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
          Estimated Cost
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>Minimum Cost</label>

            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="0"
              value={formData.estimatedCost.min}
              disabled={readOnly}
              onChange={(e) =>
                updateCost("min", e.target.value)
              }
            />
          </div>

          <div>
            <label className={labelClass}>Maximum Cost</label>

            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="0"
              value={formData.estimatedCost.max}
              disabled={readOnly}
              onChange={(e) =>
                updateCost("max", e.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
          Images
        </h2>

        {/* Cover */}
        <div>
          <label className={labelClass}>Cover Image</label>

          {!formData.coverImage ? (
            !readOnly && (
              <label className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
                {coverUploading ? (
                  <>
                    <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />

                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Uploading cover image...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="mb-3 h-8 w-8 text-slate-400" />

                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      Upload Cover Image
                    </span>

                    <span className="mt-1 text-xs text-slate-500">
                      JPG, PNG, WEBP or GIF
                    </span>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  disabled={coverUploading}
                  onChange={handleCoverUpload}
                />
              </label>
            )
          ) : (
            <div className="relative max-w-xl overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <img
                src={formData.coverImage.url}
                alt="Cover"
                className="h-64 w-full object-cover"
              />

              {!readOnly && (
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute right-3 top-3 rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className="mt-8">
          <label className={labelClass}>Gallery Images</label>

          {!readOnly && (
            <label className="mb-5 flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-blue-500 dark:hover:bg-blue-950/20">
              {galleryUploading ? (
                <>
                  <Loader2 className="mb-3 h-7 w-7 animate-spin text-blue-500" />

                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    Uploading gallery images...
                  </span>
                </>
              ) : (
                <>
                  <ImageIcon className="mb-3 h-7 w-7 text-slate-400" />

                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    Upload Gallery Images
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    You can select multiple images
                  </span>
                </>
              )}

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={galleryUploading}
                onChange={handleGalleryUpload}
              />
            </label>
          )}

          {formData.gallery.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {formData.gallery.map((image, index) => (
                <div
                  key={`${image.publicId}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="h-40 w-full object-cover"
                  />

                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 shadow-lg transition group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={formData.isActive}
            disabled={readOnly}
            onChange={(e) =>
              updateField("isActive", e.target.checked)
            }
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />

          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
            Active transportation
          </span>
        </label>
      </section>

      {/* Buttons */}
      {!readOnly && (
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              router.push("/admin/dashboard/transportation")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || coverUploading || galleryUploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {mode === "edit"
              ? "Update Transportation"
              : "Create Transportation"}
          </button>
        </div>
      )}
    </form>
  );
}