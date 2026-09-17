"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";

import { adminApi } from "@/utils/adminApi";
import { getToken } from "@/utils/api";
import ImageUpload from "@/components/admin/ImageUpload";

export default function DestinationForm({
  initialData = null,
  initialValues = null,
  destinationId = null,
  mode = "create",
}) {
  const router = useRouter();

  /*
   * Support both prop names:
   *
   * initialData
   * initialValues
   */
  const destination = initialData || initialValues || null;

  /*
   * Get ID from either:
   *
   * destinationId
   * destination._id
   * destination.id
   */
  const id =
    destinationId ||
    destination?._id ||
    destination?.id ||
    null;

  const galleryInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [error, setError] = useState("");
  const [galleryError, setGalleryError] = useState("");

  /*
   * =========================================================
   * FORM DATA
   * =========================================================
   *
   * Cloudinary image structure:
   *
   * coverImage:
   * {
   *   url: "...",
   *   publicId: "..."
   * }
   *
   * gallery:
   * [
   *   {
   *     url: "...",
   *     publicId: "..."
   *   }
   * ]
   */

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

  /* =========================================================
     IMAGE NORMALIZATION
     ========================================================= */

  function normalizeImage(image) {
    /*
     * New Cloudinary format
     */
    if (
      image &&
      typeof image === "object" &&
      image.url
    ) {
      return {
        url: image.url,
        publicId: image.publicId || "",
      };
    }

    /*
     * Legacy string format.
     *
     * This allows old database records containing:
     *
     * "https://example.com/image.jpg"
     *
     * to still display in the form.
     *
     * However, newly uploaded images always use
     * the Cloudinary object format.
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

    return gallery
      .map((image) => normalizeImage(image))
      .filter(Boolean);
  }

  /* =========================================================
     LOAD INITIAL DATA
     ========================================================= */

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

      description:
        destination.description || "",

      shortDescription:
        destination.shortDescription || "",

      bestTimeToVisit:
        destination.bestTimeToVisit || "",

      language:
        destination.language || "",

      currency:
        destination.currency || "",

      /*
       * Convert old string OR new object
       * into the format used by ImageUpload.
       */
      coverImage:
        normalizeImage(
          destination.coverImage,
        ),

      /*
       * Convert gallery into:
       *
       * [
       *   { url, publicId },
       *   ...
       * ]
       */
      gallery:
        normalizeGallery(
          destination.gallery,
        ),

      latitude:
        destination.latitude ?? "",

      longitude:
        destination.longitude ?? "",

      address:
        destination.address || "",

      isFeatured:
        Boolean(destination.isFeatured),

      isActive:
        destination.isActive ?? true,
    });
  }, [destination]);

  /* =========================================================
     HANDLE INPUT CHANGE
     ========================================================= */

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /* =========================================================
     GENERATE SLUG
     ========================================================= */

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

  /* =========================================================
     UPLOAD GALLERY IMAGE
     ========================================================= */

  async function handleGalleryUpload(event) {
    const files = Array.from(
      event.target.files || [],
    );

    if (!files.length) {
      return;
    }

    setGalleryError("");
    setGalleryUploading(true);

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin session not found. Please log in again.",
        );
      }

      const uploadedImages = [];

      for (const file of files) {
        /*
         * Client-side validation
         */

        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/webp",
          "image/gif",
        ];

        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `${file.name}: Invalid image type. Only JPG, PNG, WEBP and GIF are allowed.`,
          );
        }

        const maxSize =
          10 * 1024 * 1024;

        if (file.size > maxSize) {
          throw new Error(
            `${file.name}: Image size cannot exceed 10 MB.`,
          );
        }

        const formDataUpload =
          new FormData();

        formDataUpload.append(
          "file",
          file,
        );

        formDataUpload.append(
          "folder",
          "tourism/destinations/gallery",
        );

        const response = await fetch(
          "/api/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formDataUpload,
          },
        );

        const data =
          await response.json();

        if (response.status === 401) {
          throw new Error(
            "Your admin session has expired. Please log in again.",
          );
        }

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data?.message ||
              `Failed to upload ${file.name}`,
          );
        }

        if (!data.image?.url) {
          throw new Error(
            `Upload completed but no image URL was returned for ${file.name}.`,
          );
        }

        uploadedImages.push({
          url: data.image.url,
          publicId:
            data.image.publicId || "",
        });
      }

      /*
       * Add uploaded images to existing gallery.
       */

      setFormData((previous) => ({
        ...previous,

        gallery: [
          ...previous.gallery,
          ...uploadedImages,
        ],
      }));
    } catch (uploadError) {
      console.error(
        "Gallery upload error:",
        uploadError,
      );

      setGalleryError(
        uploadError?.message ||
          "Failed to upload gallery image.",
      );
    } finally {
      setGalleryUploading(false);

      /*
       * Reset input so the same file
       * can be selected again if needed.
       */
      if (galleryInputRef.current) {
        galleryInputRef.current.value =
          "";
      }
    }
  }

  /* =========================================================
     REMOVE GALLERY IMAGE
     ========================================================= */

  async function handleRemoveGalleryImage(
    index,
  ) {
    const image =
      formData.gallery[index];

    if (!image) {
      return;
    }

    setGalleryError("");

    /*
     * Remove from Cloudinary when a
     * publicId exists.
     *
     * Legacy URL-only images do not have
     * a publicId, so only remove them from
     * the form.
     */

    if (image.publicId) {
      try {
        const token = getToken();

        if (!token) {
          throw new Error(
            "Admin session not found. Please log in again.",
          );
        }

        const response =
          await fetch(
            "/api/upload/delete",
            {
              method: "DELETE",
              headers: {
                "Content-Type":
                  "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                publicId:
                  image.publicId,
              }),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data?.message ||
              "Failed to delete image.",
          );
        }
      } catch (deleteError) {
        console.error(
          "Gallery image delete error:",
          deleteError,
        );

        setGalleryError(
          deleteError?.message ||
            "Failed to delete gallery image.",
        );

        return;
      }
    }

    /*
     * Remove image from form state.
     */

    setFormData((previous) => ({
      ...previous,

      gallery: previous.gallery.filter(
        (_, imageIndex) =>
          imageIndex !== index,
      ),
    }));
  }

  /* =========================================================
     BUILD PAYLOAD
     * ========================================================= */

  function buildPayload() {
    const payload = {
      name: formData.name.trim(),

      slug: formData.slug
        .trim()
        .toLowerCase(),

      type: formData.type,

      country:
        formData.country.trim(),

      description:
        formData.description.trim(),

      /*
       * Cloudinary cover image object
       */
      coverImage: formData.coverImage
        ? {
            url: formData.coverImage.url,
            publicId:
              formData.coverImage
                .publicId || "",
          }
        : null,

      /*
       * Cloudinary gallery objects
       */
      gallery: formData.gallery
        .filter(
          (image) =>
            image &&
            image.url,
        )
        .map((image) => ({
          url: image.url,
          publicId:
            image.publicId || "",
        })),

      isFeatured:
        Boolean(formData.isFeatured),

      isActive:
        Boolean(formData.isActive),
    };

    /* =======================================================
       OPTIONAL STRING FIELDS
       ======================================================= */

    if (formData.state.trim()) {
      payload.state =
        formData.state.trim();
    }

    if (
      formData.shortDescription.trim()
    ) {
      payload.shortDescription =
        formData.shortDescription.trim();
    }

    if (
      formData.bestTimeToVisit.trim()
    ) {
      payload.bestTimeToVisit =
        formData.bestTimeToVisit.trim();
    }

    if (formData.language.trim()) {
      payload.language =
        formData.language.trim();
    }

    if (formData.currency.trim()) {
      payload.currency =
        formData.currency.trim();
    }

    if (formData.address.trim()) {
      payload.address =
        formData.address.trim();
    }

    /* =======================================================
       LATITUDE
       ======================================================= */

    if (formData.latitude !== "") {
      const latitude = Number(
        formData.latitude,
      );

      if (!Number.isNaN(latitude)) {
        payload.latitude = latitude;
      }
    }

    /* =======================================================
       LONGITUDE
       ======================================================= */

    if (formData.longitude !== "") {
      const longitude = Number(
        formData.longitude,
      );

      if (!Number.isNaN(longitude)) {
        payload.longitude = longitude;
      }
    }

    return payload;
  }

  /* =========================================================
     SUBMIT
     ========================================================= */

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    /* -------------------------------------------------------
       VALIDATION
       ------------------------------------------------------- */

    if (!formData.name.trim()) {
      setError(
        "Destination name is required.",
      );
      return;
    }

    if (!formData.slug.trim()) {
      setError(
        "Destination slug is required.",
      );
      return;
    }

    if (!formData.country.trim()) {
      setError(
        "Country is required.",
      );
      return;
    }

    if (!formData.description.trim()) {
      setError(
        "Description is required.",
      );
      return;
    }

    /*
     * Cover image is now an object,
     * not a URL string.
     */

    if (
      !formData.coverImage?.url
    ) {
      setError(
        "Cover image is required. Please upload an image.",
      );
      return;
    }

    /*
     * Make sure edit mode has an ID.
     */

    if (mode === "edit" && !id) {
      setError(
        "Destination ID is missing. Cannot update destination.",
      );
      return;
    }

    setLoading(true);

    try {
      const payload =
        buildPayload();

      console.log(
        "Destination payload:",
        payload,
      );

      /* =====================================================
         CREATE
         ===================================================== */

      if (mode === "create") {
        const response =
          await adminApi.post(
            "/api/dashboard/destinations",
            payload,
          );

        console.log(
          "Destination created:",
          response,
        );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to create destination.",
          );
        }

        router.push(
          "/admin/dashboard/destinations",
        );

        router.refresh();

        return;
      }

      /* =====================================================
         UPDATE
         ===================================================== */

      if (mode === "edit") {
        const response =
          await adminApi.put(
            `/api/dashboard/destinations/${id}`,
            payload,
          );

        console.log(
          "Destination updated:",
          response,
        );

        if (!response?.success) {
          throw new Error(
            response?.message ||
              "Failed to update destination.",
          );
        }

        router.push(
          "/admin/dashboard/destinations",
        );

        router.refresh();

        return;
      }
    } catch (saveError) {
      console.error(
        "Destination save error:",
        saveError,
      );

      setError(
        saveError?.data?.message ||
          saveError?.message ||
          "Failed to save destination.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     UI
     ========================================================= */

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* =====================================================
          ERROR
          ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          BASIC INFORMATION
          ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Basic Information
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Destination Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Chennai"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* SLUG */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <button
                type="button"
                onClick={generateSlug}
                disabled={
                  loading ||
                  !formData.name.trim()
                }
                className="rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-50"
              >
                Generate
              </button>
            </div>
          </div>

          {/* TYPE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Type *
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="country">
                Country
              </option>

              <option value="state">
                State
              </option>

              <option value="city">
                City
              </option>

              <option value="region">
                Region
              </option>
            </select>
          </div>

          {/* COUNTRY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Country *
            </label>

            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="India"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* STATE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              State
            </label>

            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="Tamil Nadu"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* LANGUAGE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Language
            </label>

            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="Tamil, English"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* CURRENCY */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Currency
            </label>

            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="INR"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* BEST TIME */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Best Time To Visit
            </label>

            <input
              type="text"
              name="bestTimeToVisit"
              value={
                formData.bestTimeToVisit
              }
              onChange={handleChange}
              placeholder="October to March"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          DESCRIPTION
          ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Description
        </h2>

        <div className="space-y-5">
          {/* SHORT DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Short Description
            </label>

            <input
              type="text"
              name="shortDescription"
              value={
                formData.shortDescription
              }
              onChange={handleChange}
              placeholder="A short description of the destination"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* FULL DESCRIPTION */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Full Description *
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={7}
              placeholder="Write a detailed description..."
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          LOCATION
          ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Location
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* ADDRESS */}

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Address
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Destination address"
              disabled={loading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* LATITUDE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* LONGITUDE */}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
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
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          IMAGES
          ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Images
        </h2>

        <div className="space-y-8">
          {/* =================================================
              COVER IMAGE
              ================================================= */}

          <div>
            <ImageUpload
              label="Cover Image"
              required
              value={formData.coverImage}
              onChange={(image) =>
                setFormData(
                  (previous) => ({
                    ...previous,
                    coverImage:
                      image,
                  }),
                )
              }
              folder="tourism/destinations/covers"
            />
          </div>

          {/* =================================================
              GALLERY
              ================================================= */}

          <div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Gallery Images
              </label>

              <p className="mt-1 text-xs text-slate-500">
                Upload one or more images for this destination.
              </p>
            </div>

            {/* UPLOAD BUTTON */}

            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              multiple
              onChange={
                handleGalleryUpload
              }
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                galleryInputRef.current?.click()
              }
              disabled={
                loading ||
                galleryUploading
              }
              className="flex min-h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-8 transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {galleryUploading ? (
                <>
                  <Loader2
                    size={34}
                    className="mb-3 animate-spin text-indigo-600"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    Uploading images...
                  </span>

                  <span className="mt-1 text-xs text-slate-500">
                    Please wait
                  </span>
                </>
              ) : (
                <>
                  <ImagePlus
                    size={36}
                    className="mb-3 text-slate-500"
                  />

                  <span className="text-sm font-medium text-slate-700">
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
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-700">
                  {galleryError}
                </p>
              </div>
            )}

            {/* =================================================
                GALLERY PREVIEW
                ================================================= */}

            {formData.gallery.length >
              0 && (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    Uploaded Images
                  </p>

                  <p className="text-xs text-slate-500">
                    {
                      formData.gallery
                        .length
                    }{" "}
                    image
                    {formData.gallery
                      .length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {formData.gallery.map(
                    (
                      image,
                      index,
                    ) => (
                      <div
                        key={
                          image.publicId ||
                          image.url ||
                          index
                        }
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                      >
                        <img
                          src={
                            image.url
                          }
                          alt={`Destination gallery ${index + 1}`}
                          className="h-40 w-full object-cover transition group-hover:scale-105"
                        />

                        {/* DELETE BUTTON */}

                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveGalleryImage(
                              index,
                            )
                          }
                          disabled={
                            loading ||
                            galleryUploading
                          }
                          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete image"
                        >
                          <X
                            size={18}
                          />
                        </button>

                        {/* IMAGE NUMBER */}

                        <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                          {index + 1}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          SETTINGS
          ===================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Settings
        </h2>

        <div className="flex flex-col gap-4">
          {/* FEATURED */}

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={
                formData.isFeatured
              }
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded"
            />

            <span className="text-sm text-slate-700">
              Mark as featured destination
            </span>
          </label>

          {/* ACTIVE */}

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={
                formData.isActive
              }
              onChange={handleChange}
              disabled={loading}
              className="h-4 w-4 rounded"
            />

            <span className="text-sm text-slate-700">
              Active destination
            </span>
          </label>
        </div>
      </div>

      {/* =====================================================
          ACTIONS
          ===================================================== */}

      <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
        <button
          type="button"
          onClick={() =>
            router.push(
              "/admin/dashboard/destinations",
            )
          }
          disabled={loading}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            loading ||
            galleryUploading
          }
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
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