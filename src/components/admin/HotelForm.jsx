"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  Image as ImageIcon,
  LoaderCircle,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { adminApi } from "@/utils/adminApi";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const HOTEL_CATEGORIES = [
  {
    value: "budget",
    label: "Budget",
  },
  {
    value: "standard",
    label: "Standard",
  },
  {
    value: "premium",
    label: "Premium",
  },
  {
    value: "luxury",
    label: "Luxury",
  },
  {
    value: "resort",
    label: "Resort",
  },
  {
    value: "homestay",
    label: "Homestay",
  },
  {
    value: "hostel",
    label: "Hostel",
  },
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

function slugify(value = "") {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeImage(image) {
  if (!image) return null;

  if (typeof image === "object" && image.url) {
    return {
      url: image.url,
      publicId: image.publicId || "",
    };
  }

  if (typeof image === "string") {
    return {
      url: image,
      publicId: "",
    };
  }

  return null;
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map(normalizeImage).filter(Boolean);
}

function normalizeAmenities(amenities) {
  if (!Array.isArray(amenities)) {
    return [];
  }

  return amenities
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* INPUT CLASSES                                                              */
/* -------------------------------------------------------------------------- */

/*
 * IMPORTANT:
 *
 * Do not depend on a global ".input" class here.
 *
 * The screenshot problem was caused by inherited/global text colors.
 * Every input explicitly defines its own text, background and placeholder.
 */

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:placeholder:text-slate-400";

const selectClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const textareaClass =
  "min-h-[150px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-medium leading-6 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:placeholder:text-slate-400";

/* -------------------------------------------------------------------------- */
/* COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function HotelForm({
  initialData = null,
  initialValues = null,
  hotelId = null,
  destinations = [],
  mode = "create",
  readOnly = false,
  onSuccess,
  onCancel,
}) {
  const router = useRouter();

  const existingData = initialValues || initialData || null;

  const isEdit = mode === "edit" || Boolean(hotelId);

  const isView = mode === "view" || readOnly;

  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [form, setForm] = useState({
    destination: "",
    name: "",
    slug: "",
    description: "",
    category: "budget",

    priceMin: "",
    priceMax: "",

    amenitiesText: "",

    address: "",
    latitude: "",
    longitude: "",

    contactPhone: "",
    website: "",

    rating: "0",

    isFeatured: false,
    isActive: true,

    coverImage: null,
    gallery: [],
  });

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [saving, setSaving] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);

  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* ------------------------------------------------------------------------ */
  /* LOAD INITIAL DATA                                                        */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!existingData) {
      return;
    }

    const cover = normalizeImage(existingData.coverImage);

    const gallery = normalizeGallery(existingData.gallery);

    const amenities = normalizeAmenities(existingData.amenities);

    setForm({
      destination:
        existingData.destination?._id || existingData.destination || "",

      name: existingData.name || "",

      slug: existingData.slug || "",

      description: existingData.description || "",

      category: existingData.category || "budget",

      priceMin: existingData.pricePerNight?.min ?? "",

      priceMax: existingData.pricePerNight?.max ?? "",

      amenitiesText: amenities.join("\n"),

      address: existingData.address || "",

      latitude: existingData.latitude ?? "",

      longitude: existingData.longitude ?? "",

      contactPhone: existingData.contactPhone || "",

      website: existingData.website || "",

      rating: existingData.rating ?? "0",

      isFeatured: Boolean(existingData.isFeatured),

      isActive: existingData.isActive !== false,

      coverImage: cover,

      gallery,
    });

    setSlugManuallyEdited(Boolean(existingData.slug));
  }, [existingData]);

  /* ------------------------------------------------------------------------ */
  /* FORM HELPERS                                                             */
  /* ------------------------------------------------------------------------ */

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(value) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: slugManuallyEdited ? current.slug : slugify(value),
    }));
  }

  function handleSlugChange(value) {
    setSlugManuallyEdited(true);

    updateField("slug", slugify(value));
  }

  function generateSlug() {
    const generated = slugify(form.name);

    setSlugManuallyEdited(false);

    updateField("slug", generated);
  }

  /* ------------------------------------------------------------------------ */
  /* IMAGE UPLOAD                                                             */
  /* ------------------------------------------------------------------------ */

  async function uploadImage(file) {
    if (!file) {
      return null;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, PNG, WEBP and GIF images are allowed.");
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      throw new Error("Image size must be 10MB or less.");
    }

    const body = new FormData();

    body.append("file", file);

    const response = await adminApi.post("/api/upload", body);

    if (!response?.success) {
      throw new Error(response?.message || "Image upload failed.");
    }

    return response.image;
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    try {
      setError("");
      setSuccess("");
      setUploadingCover(true);

      const image = await uploadImage(file);

      updateField("coverImage", image);

      setSuccess("Cover image uploaded.");
    } catch (error) {
      console.error("Cover upload error:", error);

      setError(error?.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleGalleryUpload(event) {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (!files.length) return;

    try {
      setError("");
      setSuccess("");
      setUploadingGallery(true);

      const uploaded = [];

      for (const file of files) {
        const image = await uploadImage(file);

        if (image) {
          uploaded.push(image);
        }
      }

      setForm((current) => ({
        ...current,
        gallery: [...current.gallery, ...uploaded],
      }));

      setSuccess(
        `${uploaded.length} gallery image${
          uploaded.length === 1 ? "" : "s"
        } uploaded.`,
      );
    } catch (error) {
      console.error("Gallery upload error:", error);

      setError(error?.message || "Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function deleteCloudinaryImage(publicId) {
    if (!publicId) {
      return;
    }

    try {
      await adminApi.post("/api/upload/delete", {
        publicId,
      });
    } catch (error) {
      console.error("Failed to remove Cloudinary image:", error);
    }
  }

  async function removeCoverImage() {
    if (isView) return;

    const image = form.coverImage;

    updateField("coverImage", null);

    if (image?.publicId) {
      await deleteCloudinaryImage(image.publicId);
    }
  }

  async function removeGalleryImage(index) {
    if (isView) return;

    const image = form.gallery[index];

    setForm((current) => ({
      ...current,
      gallery: current.gallery.filter((_, imageIndex) => imageIndex !== index),
    }));

    if (image?.publicId) {
      await deleteCloudinaryImage(image.publicId);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* AMENITIES                                                                */
  /* ------------------------------------------------------------------------ */

  const amenities = useMemo(() => {
    return form.amenitiesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [form.amenitiesText]);

  /* ------------------------------------------------------------------------ */
  /* VALIDATION                                                               */
  /* ------------------------------------------------------------------------ */

  function validateForm() {
    if (!form.destination) {
      return "Please select a destination.";
    }

    if (!form.name.trim()) {
      return "Hotel name is required.";
    }

    if (!form.slug.trim()) {
      return "Slug is required.";
    }

    if (!form.description.trim()) {
      return "Description is required.";
    }

    if (!form.category) {
      return "Category is required.";
    }

    if (form.priceMin === "" || form.priceMin === null) {
      return "Minimum price is required.";
    }

    if (form.priceMax === "" || form.priceMax === null) {
      return "Maximum price is required.";
    }

    const minPrice = Number(form.priceMin);

    const maxPrice = Number(form.priceMax);

    if (!Number.isFinite(minPrice) || minPrice < 0) {
      return "Minimum price must be a valid positive number.";
    }

    if (!Number.isFinite(maxPrice) || maxPrice < 0) {
      return "Maximum price must be a valid positive number.";
    }

    if (maxPrice < minPrice) {
      return "Maximum price cannot be lower than minimum price.";
    }

    if (form.latitude !== "" && !Number.isFinite(Number(form.latitude))) {
      return "Latitude must be a valid number.";
    }

    if (form.longitude !== "" && !Number.isFinite(Number(form.longitude))) {
      return "Longitude must be a valid number.";
    }

    const rating = Number(form.rating);

    if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
      return "Rating must be between 0 and 5.";
    }

    if (!form.coverImage?.url) {
      return "Cover image is required.";
    }

    return "";
  }

  /* ------------------------------------------------------------------------ */
  /* SUBMIT                                                                   */
  /* ------------------------------------------------------------------------ */

  async function handleSubmit(event) {
    event.preventDefault();

    if (isView) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        destination: form.destination,

        name: form.name.trim(),

        slug: slugify(form.slug),

        description: form.description.trim(),

        category: form.category,

        pricePerNight: {
          min: Number(form.priceMin),
          max: Number(form.priceMax),
        },

        amenities,

        address: form.address.trim(),

        contactPhone: form.contactPhone.trim(),

        website: form.website.trim(),

        rating: Number(form.rating),

        isFeatured: Boolean(form.isFeatured),

        isActive: Boolean(form.isActive),

        coverImage: form.coverImage,

        gallery: form.gallery,
      };

      if (form.latitude !== "") {
        payload.latitude = Number(form.latitude);
      }

      if (form.longitude !== "") {
        payload.longitude = Number(form.longitude);
      }

      let response;

      if (isEdit && hotelId) {
        response = await adminApi.put(
          `/api/dashboard/hotels/${hotelId}`,
          payload,
        );
      } else {
        response = await adminApi.post("/api/dashboard/hotels", payload);
      }

      if (!response?.success) {
        throw new Error(
          response?.message ||
            `Failed to ${isEdit ? "update" : "create"} hotel.`,
        );
      }

      setSuccess(
        isEdit ? "Hotel updated successfully." : "Hotel created successfully.",
      );

      if (onSuccess) {
        onSuccess(response);
        return;
      }

      router.push("/admin/dashboard/hotels");
    } catch (error) {
      console.error("Hotel form submit error:", error);

      setError(
        error?.data?.message ||
          error?.message ||
          `Failed to ${isEdit ? "update" : "create"} hotel.`,
      );
    } finally {
      setSaving(false);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* CANCEL                                                                   */
  /* ------------------------------------------------------------------------ */

  function handleCancel() {
    if (saving) return;

    if (onCancel) {
      onCancel();
      return;
    }

    router.push("/admin/dashboard/hotels");
  }

  /* ------------------------------------------------------------------------ */
  /* VIEW MODE                                                                */
  /* ------------------------------------------------------------------------ */

  if (isView) {
    return (
      <div className="space-y-6 p-5 sm:p-6 lg:p-7">
        <ViewMode form={form} amenities={amenities} />
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* FORM                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6 lg:p-7">
      {/* ------------------------------------------------------------------ */}
      {/* ERROR / SUCCESS                                                     */}
      {/* ------------------------------------------------------------------ */}

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <X size={12} />
          </div>

          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      ) : null}

      {success ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Check size={12} />
          </div>

          <p className="text-sm font-medium text-emerald-700">{success}</p>
        </div>
      ) : null}

      {/* ------------------------------------------------------------------ */}
      {/* BASIC INFORMATION                                                   */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Basic Information"
        description="Hotel identity and classification."
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* DESTINATION */}
          <Field label="Destination" required>
            <select
              value={form.destination}
              onChange={(event) =>
                updateField("destination", event.target.value)
              }
              className={selectClass}
            >
              <option value="">Select destination</option>

              {destinations.map((destination) => (
                <option key={destination._id} value={destination._id}>
                  {destination.name}
                </option>
              ))}
            </select>
          </Field>

          {/* HOTEL NAME */}
          <Field label="Hotel Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="Example: Taj Hotel"
              className={inputClass}
            />
          </Field>

          {/* SLUG */}
          <Field
            label="Slug"
            required
            description="Use a unique URL-friendly slug."
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={form.slug}
                onChange={(event) => handleSlugChange(event.target.value)}
                placeholder="taj-hotel"
                className={`${inputClass} flex-1`}
              />

              <button
                type="button"
                onClick={generateSlug}
                className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
              >
                <RefreshCw size={15} className="mr-1.5 inline-block" />
                Generate
              </button>
            </div>
          </Field>

          {/* CATEGORY */}
          <Field label="Category" required>
            <select
              value={form.category}
              onChange={(event) => updateField("category", event.target.value)}
              className={selectClass}
            >
              {HOTEL_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* DESCRIPTION                                                          */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Description"
        description="Provide a clear description of the hotel."
      >
        <Field label="Hotel Description" required>
          <textarea
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Hotel description..."
            className={textareaClass}
          />
        </Field>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* PRICING                                                             */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Pricing"
        description="Set the nightly price range and rating."
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field label="Minimum Price" required>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.priceMin}
                onChange={(event) =>
                  updateField("priceMin", event.target.value)
                }
                placeholder="Minimum price"
                className={`${inputClass} pl-8`}
              />
            </div>
          </Field>

          <Field label="Maximum Price" required>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                ₹
              </span>

              <input
                type="number"
                min="0"
                step="1"
                value={form.priceMax}
                onChange={(event) =>
                  updateField("priceMax", event.target.value)
                }
                placeholder="Maximum price"
                className={`${inputClass} pl-8`}
              />
            </div>
          </Field>

          <Field label="Rating" description="0 - 5">
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={form.rating}
              onChange={(event) => updateField("rating", event.target.value)}
              placeholder="0 - 5"
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* AMENITIES                                                            */}
      {/* ------------------------------------------------------------------ */}

      <FormSection title="Amenities" description="Enter one amenity per line.">
        <Field label="Amenities">
          <textarea
            value={form.amenitiesText}
            onChange={(event) =>
              updateField("amenitiesText", event.target.value)
            }
            placeholder={"Free WiFi\nSwimming Pool\nRestaurant\nParking"}
            className={`${textareaClass} min-h-[130px]`}
          />
        </Field>

        {amenities.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        ) : null}
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* LOCATION                                                            */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Location & Contact"
        description="Add the hotel's address and contact information."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Address">
            <input
              type="text"
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              placeholder="Hotel address"
              className={inputClass}
            />
          </Field>

          <Field label="Contact Phone">
            <input
              type="text"
              value={form.contactPhone}
              onChange={(event) =>
                updateField("contactPhone", event.target.value)
              }
              placeholder="+91 98765 43210"
              className={inputClass}
            />
          </Field>

          <Field label="Website">
            <input
              type="url"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
              placeholder="https://example.com"
              className={inputClass}
            />
          </Field>

          <Field label="Latitude" description="Negative values are allowed.">
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(event) => updateField("latitude", event.target.value)}
              placeholder="13.0827"
              className={inputClass}
            />
          </Field>

          <Field label="Longitude" description="Negative values are allowed.">
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(event) => updateField("longitude", event.target.value)}
              placeholder="80.2707"
              className={inputClass}
            />
          </Field>
        </div>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* COVER IMAGE                                                         */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Cover Image"
        description="Upload the main hotel image."
      >
        {form.coverImage?.url ? (
          <div className="relative max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img
              src={form.coverImage.url}
              alt="Hotel cover"
              className="h-56 w-full object-cover"
            />

            <button
              type="button"
              onClick={removeCoverImage}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-red-500 shadow-md transition hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <ImageUploadBox
            uploading={uploadingCover}
            onChange={handleCoverUpload}
            multiple={false}
          />
        )}

        {form.coverImage?.url ? (
          <div className="mt-3">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
              <Upload size={15} />
              Replace Cover Image
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : null}
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* GALLERY                                                             */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Gallery"
        description="Upload additional hotel images."
      >
        {form.gallery.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {form.gallery.map((image, index) => (
              <div
                key={image.publicId || image.url || index}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
              >
                <img
                  src={image.url}
                  alt={`Hotel gallery ${index + 1}`}
                  className="h-32 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-red-500 opacity-100 shadow-md transition hover:bg-red-50"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
            <ImageIcon size={28} className="mx-auto text-slate-400" />

            <p className="mt-2 text-sm font-medium text-slate-600">
              No gallery images
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Add images using the button below.
            </p>
          </div>
        )}

        <div className="mt-4">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
            {uploadingGallery ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}

            {uploadingGallery ? "Uploading..." : "Add Gallery Images"}

            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleGalleryUpload}
              className="hidden"
              disabled={uploadingGallery}
            />
          </label>
        </div>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* SETTINGS                                                            */}
      {/* ------------------------------------------------------------------ */}

      <FormSection
        title="Settings"
        description="Control how this hotel appears in the dashboard."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Toggle
            label="Featured Hotel"
            description="Show this hotel as a featured accommodation."
            checked={form.isFeatured}
            onChange={(value) => updateField("isFeatured", value)}
          />

          <Toggle
            label="Active Hotel"
            description="Allow this hotel to remain active."
            checked={form.isActive}
            onChange={(value) => updateField("isActive", value)}
          />
        </div>
      </FormSection>

      {/* ------------------------------------------------------------------ */}
      {/* ACTIONS                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={16} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || uploadingCover || uploadingGallery}
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <LoaderCircle size={17} className="animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>
              <Check size={17} />
              {isEdit ? "Update Hotel" : "Create Hotel"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* -------------------------------------------------------------------------- */
/* FORM SECTION                                                               */
/* -------------------------------------------------------------------------- */

function FormSection({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <div className="border-b border-emerald-50 px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold text-slate-900">{title}</h2>

        {description ? (
          <p className="mt-1 text-xs font-medium text-slate-400">
            {description}
          </p>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FIELD                                                                      */
/* -------------------------------------------------------------------------- */

function Field({ label, required = false, description, children }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700">
          {label}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
        </label>

        {description ? (
          <span className="text-[11px] font-medium text-slate-400">
            {description}
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TOGGLE                                                                     */
/* -------------------------------------------------------------------------- */

function Toggle({ label, description, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/30"
    >
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>

        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>

      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* IMAGE UPLOAD BOX                                                           */
/* -------------------------------------------------------------------------- */

function ImageUploadBox({ uploading, onChange, multiple }) {
  return (
    <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 px-5 text-center transition hover:border-emerald-300 hover:bg-emerald-50/30">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
        {uploading ? (
          <LoaderCircle size={22} className="animate-spin" />
        ) : (
          <Upload size={22} />
        )}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {uploading ? "Uploading image..." : "Upload image"}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        JPG, PNG, WEBP or GIF · Max 10MB
      </p>

      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        multiple={multiple}
        onChange={onChange}
        className="hidden"
        disabled={uploading}
      />
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* VIEW MODE                                                                  */
/* -------------------------------------------------------------------------- */

function ViewMode({ form, amenities }) {
  return (
    <>
      {/* COVER */}
      {form.coverImage?.url ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <img
            src={form.coverImage.url}
            alt={form.name || "Hotel"}
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      ) : null}

      {/* TITLE */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">
            {form.name || "-"}
          </h2>

          {form.isFeatured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
              <Star size={12} fill="currentColor" />
              Featured
            </span>
          ) : null}

          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
              form.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {form.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {form.description || "No description provided."}
        </p>
      </div>

      {/* BASIC */}
      <ViewSection title="Basic Information">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <ViewItem label="Destination" value={form.destination} />

          <ViewItem label="Hotel Name" value={form.name} />

          <ViewItem label="Slug" value={form.slug} />

          <ViewItem label="Category" value={form.category} />

          <ViewItem
            label="Minimum Price"
            value={form.priceMin !== "" ? `₹${form.priceMin}` : "-"}
          />

          <ViewItem
            label="Maximum Price"
            value={form.priceMax !== "" ? `₹${form.priceMax}` : "-"}
          />

          <ViewItem
            label="Rating"
            value={`${Number(form.rating || 0).toFixed(1)} / 5`}
          />
        </div>
      </ViewSection>

      {/* AMENITIES */}
      <ViewSection title="Amenities">
        {amenities.length ? (
          <div className="flex flex-wrap gap-2">
            {amenities.map((amenity, index) => (
              <span
                key={`${amenity}-${index}`}
                className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
              >
                {amenity}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No amenities added.</p>
        )}
      </ViewSection>

      {/* LOCATION */}
      <ViewSection title="Location & Contact">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ViewItem label="Address" value={form.address || "-"} />

          <ViewItem label="Phone" value={form.contactPhone || "-"} />

          <ViewItem label="Website" value={form.website || "-"} />

          <ViewItem
            label="Latitude"
            value={form.latitude !== "" ? form.latitude : "-"}
          />

          <ViewItem
            label="Longitude"
            value={form.longitude !== "" ? form.longitude : "-"}
          />
        </div>
      </ViewSection>

      {/* GALLERY */}
      {form.gallery?.length ? (
        <ViewSection title="Gallery">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {form.gallery.map((image, index) => (
              <div
                key={image.publicId || image.url || index}
                className="overflow-hidden rounded-xl border border-slate-200"
              >
                <img
                  src={image.url}
                  alt={`Gallery ${index + 1}`}
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </ViewSection>
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* VIEW SECTION                                                               */
/* -------------------------------------------------------------------------- */

function ViewSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-slate-800">{title}</h3>

      {children}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* VIEW ITEM                                                                  */
/* -------------------------------------------------------------------------- */

function ViewItem({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
}