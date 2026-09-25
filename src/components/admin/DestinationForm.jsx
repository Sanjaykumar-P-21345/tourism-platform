"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Loader2,
  X,
  MapPin,
  Image as ImageIcon,
  Settings,
  FileText,
  Info,
} from "lucide-react";

import { adminApi } from "@/utils/adminApi";
import { getToken } from "@/utils/api";
import ImageUpload from "@/components/admin/ImageUpload";

export default function DestinationForm({
  initialData = null,
  initialValues = null,
  destinationId = null,
  mode = "create",
  onSuccess = null,
}) {
  const router = useRouter();

  /*
   * =========================================================
   * DESTINATION DATA
   * =========================================================
   */

  const destination = initialData || initialValues || null;

  const id = destinationId || destination?._id || destination?.id || null;

  const galleryInputRef = useRef(null);

  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [loading, setLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const [error, setError] = useState("");
  const [galleryError, setGalleryError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "city",
    country: "",
    state: "",
    description: "",
    shortDescription: "",
    bestTimeToVisit: "",
    language: "",
    currency: "",
    coverImage: null,
    gallery: [],
    latitude: "",
    longitude: "",
    address: "",
    isFeatured: false,
    isActive: true,
  });

  /*
   * =========================================================
   * IMAGE NORMALIZATION
   * =========================================================
   */

  function normalizeImage(image) {
    /*
     * New Cloudinary object:
     *
     * {
     *   url: "...",
     *   publicId: "..."
     * }
     */

    if (image && typeof image === "object" && image.url) {
      return {
        url: image.url,
        publicId: image.publicId || "",
      };
    }

    /*
     * Legacy URL-only image.
     */

    if (typeof image === "string" && image.trim()) {
      return {
        url: image.trim(),
        publicId: "",
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

  /*
   * =========================================================
   * LOAD INITIAL DATA
   * =========================================================
   */

  useEffect(() => {
    if (!destination) {
      return;
    }

    setFormData({
      name: destination.name || "",

      slug: destination.slug || "",

      type: destination.type || "city",

      country: destination.country || "",

      state: destination.state || "",

      description: destination.description || "",

      shortDescription: destination.shortDescription || "",

      bestTimeToVisit: destination.bestTimeToVisit || "",

      language: destination.language || "",

      currency: destination.currency || "",

      coverImage: normalizeImage(destination.coverImage),

      gallery: normalizeGallery(destination.gallery),

      latitude: destination.latitude ?? "",

      longitude: destination.longitude ?? "",

      address: destination.address || "",

      isFeatured: Boolean(destination.isFeatured),

      isActive: destination.isActive ?? true,
    });
  }, [destination]);

  /*
   * =========================================================
   * INPUT CHANGE
   * =========================================================
   */

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  /*
   * =========================================================
   * GENERATE SLUG
   * =========================================================
   */

  function generateSlug() {
    const slug = formData.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    setFormData((previous) => ({
      ...previous,
      slug,
    }));
  }

  /*
   * =========================================================
   * GALLERY UPLOAD
   * =========================================================
   */

  async function handleGalleryUpload(event) {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setGalleryError("");
    setGalleryUploading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session not found. Please log in again.");
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      const maxSize = 10 * 1024 * 1024;

      const uploadedImages = [];

      for (const file of files) {
        /*
         * Validate type.
         */

        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `${file.name}: Invalid image type. Only JPG, PNG, WEBP and GIF are allowed.`,
          );
        }

        /*
         * Validate size.
         */

        if (file.size > maxSize) {
          throw new Error(`${file.name}: Image size cannot exceed 10 MB.`);
        }

        const uploadFormData = new FormData();

        uploadFormData.append("file", file);

        uploadFormData.append("folder", "tourism/destinations/gallery");

        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const data = await response.json();

        if (response.status === 401) {
          throw new Error(
            "Your admin session has expired. Please log in again.",
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(data?.message || `Failed to upload ${file.name}`);
        }

        if (!data.image?.url) {
          throw new Error(
            `Upload completed but no image URL was returned for ${file.name}.`,
          );
        }

        uploadedImages.push({
          url: data.image.url,
          publicId: data.image.publicId || "",
        });
      }

      /*
       * Add newly uploaded images.
       */

      setFormData((previous) => ({
        ...previous,
        gallery: [...previous.gallery, ...uploadedImages],
      }));
    } catch (uploadError) {
      console.error("Gallery upload error:", uploadError);

      setGalleryError(
        uploadError?.message || "Failed to upload gallery image.",
      );
    } finally {
      setGalleryUploading(false);

      /*
       * Reset input so the same file
       * can be selected again.
       */

      if (galleryInputRef.current) {
        galleryInputRef.current.value = "";
      }
    }
  }

  /*
   * =========================================================
   * REMOVE GALLERY IMAGE
   * =========================================================
   */

  async function handleRemoveGalleryImage(index) {
    const image = formData.gallery[index];

    if (!image) {
      return;
    }

    setGalleryError("");

    /*
     * If this is a Cloudinary image,
     * remove it from Cloudinary first.
     */

    if (image.publicId) {
      try {
        const token = getToken();

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
          throw new Error(data?.message || "Failed to delete image.");
        }
      } catch (deleteError) {
        console.error("Gallery image delete error:", deleteError);

        setGalleryError(
          deleteError?.message || "Failed to delete gallery image.",
        );

        return;
      }
    }

    /*
     * Remove from local form state.
     */

    setFormData((previous) => ({
      ...previous,

      gallery: previous.gallery.filter((_, imageIndex) => imageIndex !== index),
    }));
  }

  /*
   * =========================================================
   * BUILD PAYLOAD
   * =========================================================
   */

  function buildPayload() {
    const payload = {
      name: formData.name.trim(),

      slug: formData.slug.trim().toLowerCase(),

      type: formData.type,

      country: formData.country.trim(),

      description: formData.description.trim(),

      /*
       * Cover image.
       */

      coverImage: formData.coverImage
        ? {
            url: formData.coverImage.url,

            publicId: formData.coverImage.publicId || "",
          }
        : null,

      /*
       * Gallery.
       */

      gallery: formData.gallery
        .filter((image) => image && image.url)
        .map((image) => ({
          url: image.url,

          publicId: image.publicId || "",
        })),

      isFeatured: Boolean(formData.isFeatured),

      isActive: Boolean(formData.isActive),
    };

    /*
     * Optional strings.
     */

    if (formData.state.trim()) {
      payload.state = formData.state.trim();
    }

    if (formData.shortDescription.trim()) {
      payload.shortDescription = formData.shortDescription.trim();
    }

    if (formData.bestTimeToVisit.trim()) {
      payload.bestTimeToVisit = formData.bestTimeToVisit.trim();
    }

    if (formData.language.trim()) {
      payload.language = formData.language.trim();
    }

    if (formData.currency.trim()) {
      payload.currency = formData.currency.trim();
    }

    if (formData.address.trim()) {
      payload.address = formData.address.trim();
    }

    /*
     * Latitude.
     */

    if (
      formData.latitude !== "" &&
      formData.latitude !== null &&
      formData.latitude !== undefined
    ) {
      const latitude = Number(formData.latitude);

      if (Number.isNaN(latitude)) {
        throw new Error("Latitude must be a valid number.");
      }

      payload.latitude = latitude;
    }

    /*
     * Longitude.
     */

    if (
      formData.longitude !== "" &&
      formData.longitude !== null &&
      formData.longitude !== undefined
    ) {
      const longitude = Number(formData.longitude);

      if (Number.isNaN(longitude)) {
        throw new Error("Longitude must be a valid number.");
      }

      payload.longitude = longitude;
    }

    return payload;
  }

  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    /*
     * -----------------------------------------
     * VALIDATION
     * -----------------------------------------
     */

    if (!formData.name.trim()) {
      setError("Destination name is required.");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Destination slug is required.");
      return;
    }

    if (!formData.country.trim()) {
      setError("Country is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (!formData.coverImage?.url) {
      setError("Cover image is required. Please upload an image.");
      return;
    }

    /*
     * Edit mode requires an ID.
     */

    if (mode === "edit" && !id) {
      setError("Destination ID is missing. Cannot update destination.");
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      console.log("Destination payload:", payload);

      let response;

      /*
       * -----------------------------------------
       * CREATE
       * -----------------------------------------
       */

      if (mode === "create") {
        response = await adminApi.post("/api/dashboard/destinations", payload);
      }

      /*
       * -----------------------------------------
       * UPDATE
       * -----------------------------------------
       */

      if (mode === "edit") {
        response = await adminApi.put(
          `/api/dashboard/destinations/${id}`,
          payload,
        );
      }

      /*
       * -----------------------------------------
       * VALIDATE RESPONSE
       * -----------------------------------------
       */

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save destination.");
      }

      /*
       * -----------------------------------------
       * MODAL MODE
       * -----------------------------------------
       *
       * When this form is inside the
       * destination edit modal, the parent
       * handles closing and refreshing.
       */

      if (typeof onSuccess === "function") {
        await onSuccess(response);

        return;
      }

      /*
       * -----------------------------------------
       * STANDALONE PAGE MODE
       * -----------------------------------------
       */

      router.push("/admin/dashboard/destinations");

      router.refresh();
    } catch (saveError) {
      console.error("Destination save error:", saveError);

      setError(
        saveError?.data?.message ||
          saveError?.message ||
          "Failed to save destination.",
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =========================================================
   * INPUT CLASS
   * =========================================================
   */

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-50";

  /*
   * =========================================================
   * SECTION CLASS
   * =========================================================
   */

  const sectionClass =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <Info size={18} className="mt-0.5 shrink-0 text-red-600" />

          <p className="text-sm font-medium text-red-700">{error}</p>
        </div>
      )}

      {/* =====================================================
          BASIC INFORMATION
          ===================================================== */}

      <section className={sectionClass}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Basic Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the main information about this destination.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Destination Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Chennai"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* SLUG */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Slug *
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="chennai"
                disabled={loading}
                className={`${inputClass} min-w-0 flex-1`}
              />

              <button
                type="button"
                onClick={generateSlug}
                disabled={loading || !formData.name.trim()}
                className="shrink-0 rounded-xl bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>

          {/* TYPE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Type *
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
              className={inputClass}
            >
              <option value="country">Country</option>

              <option value="state">State</option>

              <option value="city">City</option>

              <option value="region">Region</option>
            </select>
          </div>

          {/* COUNTRY */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Country *
            </label>

            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="India"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* STATE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              State
            </label>

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Tamil Nadu"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* LANGUAGE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Language
            </label>

            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="Tamil, English"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* CURRENCY */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Currency
            </label>

            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="INR"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* BEST TIME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Best Time To Visit
            </label>

            <input
              type="text"
              name="bestTimeToVisit"
              value={formData.bestTimeToVisit}
              onChange={handleChange}
              placeholder="October to March"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          DESCRIPTION
          ===================================================== */}

      <section className={sectionClass}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FileText size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Description</h2>

            <p className="mt-1 text-sm text-slate-500">
              Provide useful information visitors should know about this
              destination.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* SHORT DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Short Description
            </label>

            <input
              type="text"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="A short description of the destination"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* FULL DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Description *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={7}
              placeholder="Write a detailed description..."
              disabled={loading}
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          LOCATION
          ===================================================== */}

      <section className={sectionClass}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <MapPin size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Location</h2>

            <p className="mt-1 text-sm text-slate-500">
              Add address and map coordinates.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* ADDRESS */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Address
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Destination address"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* LATITUDE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Latitude
            </label>

            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              placeholder="13.0827"
              disabled={loading}
              className={inputClass}
            />
          </div>

          {/* LONGITUDE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Longitude
            </label>

            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              placeholder="80.2707"
              disabled={loading}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          IMAGES
          ===================================================== */}

      <section className={sectionClass}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ImageIcon size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Images</h2>

            <p className="mt-1 text-sm text-slate-500">
              Add a cover image and gallery images for the destination.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* COVER IMAGE */}

          <div>
            <ImageUpload
              label="Cover Image"
              required
              value={formData.coverImage}
              onChange={(image) =>
                setFormData((previous) => ({
                  ...previous,
                  coverImage: image,
                }))
              }
              folder="tourism/destinations/covers"
            />
          </div>

          {/* GALLERY */}

          <div>
            <div className="mb-3">
              <label className="block text-sm font-semibold text-slate-700">
                Gallery Images
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Upload one or more images for this destination.
              </p>
            </div>

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={handleGalleryUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => galleryInputRef.current?.click()}
              disabled={loading || galleryUploading}
              className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {galleryUploading ? (
                <>
                  <Loader2
                    size={34}
                    className="mb-3 animate-spin text-emerald-600"
                  />

                  <span className="text-sm font-semibold text-slate-700">
                    Uploading images...
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    Please wait
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus size={36} className="mb-3 text-emerald-500" />

                  <span className="text-sm font-semibold text-slate-700">
                    Upload Gallery Images
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP or GIF • Max 10MB each
                  </span>
                </>
              )}
            </button>

            {/* GALLERY ERROR */}

            {galleryError && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">{galleryError}</p>
              </div>
            )}

            {/* GALLERY PREVIEW */}

            {formData.gallery.length > 0 && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Uploaded Images
                  </p>

                  <p className="text-xs font-medium text-slate-500">
                    {formData.gallery.length} image
                    {formData.gallery.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {formData.gallery.map((image, index) => (
                    <div
                      key={image.publicId || image.url || index}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
                    >
                      <img
                        src={image.url}
                        alt={`Destination gallery ${index + 1}`}
                        className="h-40 w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        disabled={loading || galleryUploading}
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete image"
                      >
                        <X size={18} />
                      </button>

                      <div className="absolute bottom-2 left-2 rounded-lg bg-slate-950/70 px-2 py-1 text-xs font-medium text-white">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          SETTINGS
          ===================================================== */}

      <section className={sectionClass}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Settings size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">Settings</h2>

            <p className="mt-1 text-sm text-slate-500">
              Control visibility and featured status.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* FEATURED */}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Featured destination
              </p>

              <p className="text-xs text-slate-500">
                Highlight this destination in featured sections.
              </p>
            </div>
          </label>

          {/* ACTIVE */}

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/40">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Active destination
              </p>

              <p className="text-xs text-slate-500">
                Allow this destination to remain active on the platform.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* =====================================================
          ACTIONS
          ===================================================== */}

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard/destinations")}
          disabled={loading}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || galleryUploading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}

          {loading
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update Destination"
              : "Create Destination"}
        </button>
      </div>
    </form>
  );
}