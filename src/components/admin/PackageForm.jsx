"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ImagePlus,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { adminApi } from "@/utils/adminApi";
import { getToken } from "@/utils/api";

function imageObject(image) {
  if (!image || typeof image !== "object") {
    return null;
  }

  const url = String(image.url || "").trim();
  const publicId = String(image.publicId || "").trim();

  if (!url || !publicId) {
    return null;
  }

  return {
    url,
    publicId,
  };
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) {
    return [];
  }

  return gallery.map(imageObject).filter(Boolean);
}

function getId(item) {
  return item?._id || item?.id || "";
}

function getDestinationId(destination) {
  if (destination && typeof destination === "object") {
    return getId(destination);
  }

  return destination || "";
}

function getPlaceId(place) {
  if (place && typeof place === "object") {
    return getId(place);
  }

  return place || "";
}

const EMPTY_FORM = {
  destination: "",
  name: "",
  slug: "",
  shortDescription: "",
  description: "",
  days: "",
  nights: "",
  price: "",
  priceType: "per-person",
  inclusions: "",
  exclusions: "",
  coverImage: null,
  gallery: [],
  isFeatured: false,
  isActive: true,
};

function normalizeInitialForm(packageData) {
  if (!packageData) {
    return EMPTY_FORM;
  }

  return {
    destination: getDestinationId(packageData.destination),

    name: packageData.name || "",

    slug: packageData.slug || "",

    shortDescription: packageData.shortDescription || "",

    description: packageData.description || "",

    days: packageData.duration?.days ?? "",

    nights: packageData.duration?.nights ?? "",

    price: packageData.price ?? "",

    priceType: packageData.priceType || "per-person",

    inclusions: Array.isArray(packageData.inclusions)
      ? packageData.inclusions.join("\n")
      : "",

    exclusions: Array.isArray(packageData.exclusions)
      ? packageData.exclusions.join("\n")
      : "",

    coverImage: imageObject(packageData.coverImage),

    gallery: normalizeGallery(packageData.gallery),

    isFeatured: packageData.isFeatured ?? false,

    isActive: packageData.isActive ?? true,
  };
}

function normalizeInitialItinerary(packageData) {
  if (!Array.isArray(packageData?.itinerary)) {
    return [];
  }

  return packageData.itinerary
    .map((day, index) => ({
      day: index + 1,

      title: day?.title || "",

      description: day?.description || "",

      places: Array.isArray(day?.places)
        ? day.places.map(getPlaceId).filter(Boolean)
        : [],
    }))
    .sort((a, b) => a.day - b.day);
}

export default function PackageForm({
  initialData = null,
  initialValues = null,
  packageId = null,
  destinations: initialDestinations = [],
  places: initialPlaces = [],
  mode = "create",
  readOnly = false,
  onSuccess,
  onCancel,
}) {
  const router = useRouter();

  const packageData = initialData || initialValues || null;

  const id = packageId || packageData?._id || packageData?.id || null;

  const isEditMode = mode === "edit";

  const isViewMode = mode === "view" || readOnly;

  const [destinations, setDestinations] = useState(initialDestinations || []);

  const [places, setPlaces] = useState(initialPlaces || []);

  const [loadingOptions, setLoadingOptions] = useState(false);

  const [loading, setLoading] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);

  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState(() =>
    normalizeInitialForm(packageData),
  );

  const [itinerary, setItinerary] = useState(() =>
    normalizeInitialItinerary(packageData),
  );

  /*
   * Track images uploaded during this
   * form session.
   *
   * If the user removes a newly uploaded
   * image before saving, we can safely
   * remove it from Cloudinary immediately.
   *
   * Existing saved images are cleaned by
   * the PUT API after successful update.
   */
  const [sessionUploadedImages, setSessionUploadedImages] = useState([]);

  /*
   * Update form when the package changes.
   */
  useEffect(() => {
    if (!packageData) {
      return;
    }

    setFormData(normalizeInitialForm(packageData));

    setItinerary(normalizeInitialItinerary(packageData));

    setError("");
    setSessionUploadedImages([]);
  }, [packageData?._id]);

  /*
   * Load destinations and places.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      const hasDestinations = initialDestinations.length > 0;

      const hasPlaces = initialPlaces.length > 0;

      if (hasDestinations && hasPlaces) {
        return;
      }

      setLoadingOptions(true);

      try {
        const [destinationResponse, placeResponse] = await Promise.all([
          hasDestinations
            ? Promise.resolve({
                data: initialDestinations,
              })
            : adminApi.get("/api/dashboard/destinations"),

          hasPlaces
            ? Promise.resolve({
                data: initialPlaces,
              })
            : adminApi.get("/api/dashboard/places"),
        ]);

        if (cancelled) {
          return;
        }

        setDestinations(destinationResponse?.data || []);

        setPlaces(placeResponse?.data || []);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError?.message || "Failed to load destinations and places.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Only show places belonging to the
   * currently selected destination.
   */
  const availablePlaces = useMemo(() => {
    if (!formData.destination) {
      return [];
    }

    return places.filter((place) => {
      const placeDestination = place?.destination;

      const placeDestinationId = getDestinationId(placeDestination);

      return String(placeDestinationId) === String(formData.destination);
    });
  }, [places, formData.destination]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    if (isViewMode) {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleDestinationChange(event) {
    if (isViewMode) {
      return;
    }

    const destination = event.target.value;

    setFormData((previous) => ({
      ...previous,
      destination,
    }));

    /*
     * Remove places that don't belong to
     * the newly selected destination.
     */
    setItinerary((previous) =>
      previous.map((day) => ({
        ...day,
        places: day.places.filter((placeId) =>
          places.some(
            (place) =>
              String(getPlaceId(place)) === String(placeId) &&
              String(getDestinationId(place.destination)) ===
                String(destination),
          ),
        ),
      })),
    );
  }

  function generateSlug() {
    if (isViewMode) {
      return;
    }

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

  function addDay() {
    if (isViewMode) {
      return;
    }

    setItinerary((previous) => [
      ...previous,
      {
        day: previous.length + 1,
        title: "",
        description: "",
        places: [],
      },
    ]);
  }

  function removeDay(index) {
    if (isViewMode) {
      return;
    }

    setItinerary((previous) =>
      previous
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          day: itemIndex + 1,
        })),
    );
  }

  function updateDay(index, field, value) {
    if (isViewMode) {
      return;
    }

    setItinerary((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function togglePlace(dayIndex, placeId) {
    if (isViewMode) {
      return;
    }

    setItinerary((previous) =>
      previous.map((day, index) => {
        if (index !== dayIndex) {
          return day;
        }

        const exists = day.places.includes(placeId);

        return {
          ...day,
          places: exists
            ? day.places.filter((item) => item !== placeId)
            : [...day.places, placeId],
        };
      }),
    );
  }

  async function uploadImage(file, folder) {
    const token = getToken();

    if (!token) {
      throw new Error("Admin authentication token is missing.");
    }

    const body = new FormData();

    body.append("file", file);

    body.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body,
    });

    const data = await response.json();

    if (
      !response.ok ||
      !data?.success ||
      !data?.image?.url ||
      !data?.image?.publicId
    ) {
      throw new Error(data?.message || "Image upload failed.");
    }

    return data.image;
  }

  async function deleteCloudinaryImage(publicId) {
    if (!publicId) {
      return;
    }

    const token = getToken();

    if (!token) {
      return;
    }

    try {
      await fetch("/api/upload/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          publicId,
        }),
      });
    } catch (deleteError) {
      console.error("Cloudinary delete error:", deleteError);
    }
  }

  function registerSessionImage(image) {
    if (!image?.publicId) {
      return;
    }

    setSessionUploadedImages((previous) => [...previous, image.publicId]);
  }

  function unregisterSessionImage(publicId) {
    if (!publicId) {
      return;
    }

    setSessionUploadedImages((previous) =>
      previous.filter((item) => item !== publicId),
    );
  }

  async function handleCoverUpload(event) {
    if (isViewMode) {
      return;
    }

    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Cover image must be 10MB or smaller.");
      return;
    }

    setError("");
    setUploadingCover(true);

    try {
      /*
       * If the current cover was uploaded
       * during this same unsaved session,
       * remove it before replacing it.
       */
      const previousImage = formData.coverImage;

      if (
        previousImage?.publicId &&
        sessionUploadedImages.includes(previousImage.publicId)
      ) {
        await deleteCloudinaryImage(previousImage.publicId);

        unregisterSessionImage(previousImage.publicId);
      }

      const uploaded = await uploadImage(file, "tourism/packages/cover");

      registerSessionImage(uploaded);

      setFormData((previous) => ({
        ...previous,
        coverImage: uploaded,
      }));
    } catch (uploadError) {
      setError(uploadError?.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleGalleryUpload(event) {
    if (isViewMode) {
      return;
    }

    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const oversizedFile = files.find((file) => file.size > 10 * 1024 * 1024);

    if (oversizedFile) {
      setError("Each gallery image must be 10MB or smaller.");
      return;
    }

    setError("");
    setUploadingGallery(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const uploaded = await uploadImage(file, "tourism/packages/gallery");

        uploadedImages.push(uploaded);

        registerSessionImage(uploaded);
      }

      setFormData((previous) => ({
        ...previous,
        gallery: [...previous.gallery, ...uploadedImages],
      }));
    } catch (uploadError) {
      setError(uploadError?.message || "Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function removeCoverImage() {
    if (isViewMode) {
      return;
    }

    const currentImage = formData.coverImage;

    setFormData((previous) => ({
      ...previous,
      coverImage: null,
    }));

    /*
     * Only immediately delete images that
     * were uploaded during this unsaved
     * form session.
     *
     * Existing saved images are handled
     * by the PUT API after success.
     */
    if (
      currentImage?.publicId &&
      sessionUploadedImages.includes(currentImage.publicId)
    ) {
      await deleteCloudinaryImage(currentImage.publicId);

      unregisterSessionImage(currentImage.publicId);
    }
  }

  async function removeGalleryImage(index) {
    if (isViewMode) {
      return;
    }

    const image = formData.gallery[index];

    setFormData((previous) => ({
      ...previous,
      gallery: previous.gallery.filter((_, itemIndex) => itemIndex !== index),
    }));

    if (image?.publicId && sessionUploadedImages.includes(image.publicId)) {
      await deleteCloudinaryImage(image.publicId);

      unregisterSessionImage(image.publicId);
    }
  }

  function buildPayload() {
    return {
      destination: formData.destination,

      name: formData.name.trim(),

      slug: formData.slug.trim().toLowerCase(),

      shortDescription: formData.shortDescription.trim(),

      description: formData.description.trim(),

      duration: {
        days: Number(formData.days),

        nights: Number(formData.nights),
      },

      price: Number(formData.price),

      priceType: formData.priceType,

      inclusions: formData.inclusions
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      exclusions: formData.exclusions
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),

      itinerary: itinerary.map((day, index) => ({
        day: index + 1,
        title: day.title.trim(),
        description: day.description.trim(),
        places: day.places,
      })),

      coverImage: formData.coverImage,

      gallery: formData.gallery,

      isFeatured: Boolean(formData.isFeatured),

      isActive: Boolean(formData.isActive),
    };
  }

  async function cleanupUnsavedImages() {
    if (sessionUploadedImages.length === 0) {
      return;
    }

    const uniqueIds = [...new Set(sessionUploadedImages)];

    for (const publicId of uniqueIds) {
      await deleteCloudinaryImage(publicId);
    }

    setSessionUploadedImages([]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isViewMode) {
      return;
    }

    setError("");

    if (!formData.destination) {
      setError("Destination is required.");
      return;
    }

    if (!formData.name.trim()) {
      setError("Package name is required.");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Package slug is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required.");
      return;
    }

    if (formData.days === "" || formData.nights === "") {
      setError("Duration days and nights are required.");
      return;
    }

    const numericDays = Number(formData.days);

    const numericNights = Number(formData.nights);

    if (
      !Number.isInteger(numericDays) ||
      numericDays < 1 ||
      !Number.isInteger(numericNights) ||
      numericNights < 0
    ) {
      setError("Please enter valid duration values.");
      return;
    }

    if (formData.price === "") {
      setError("Package price is required.");
      return;
    }

    const numericPrice = Number(formData.price);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Package price must be a valid non-negative number.");
      return;
    }

    if (!formData.coverImage?.url || !formData.coverImage?.publicId) {
      setError("Please upload a valid cover image.");
      return;
    }

    if (
      !["per-person", "per-couple", "per-group"].includes(formData.priceType)
    ) {
      setError("Please select a valid price type.");
      return;
    }

    for (let index = 0; index < itinerary.length; index += 1) {
      if (!itinerary[index].title.trim()) {
        setError(`Please enter a title for Day ${index + 1}.`);
        return;
      }
    }

    if (isEditMode && !id) {
      setError("Package ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      let response;

      if (isEditMode) {
        response = await adminApi.put(`/api/dashboard/packages/${id}`, payload);
      } else {
        response = await adminApi.post("/api/dashboard/packages", payload);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save package.");
      }

      /*
       * Once the API succeeds, the backend
       * owns the saved images. Clear the
       * client-side session tracker so we
       * don't accidentally delete them.
       */
      setSessionUploadedImages([]);

      if (onSuccess) {
        onSuccess(response?.data || null);

        return;
      }

      router.push("/admin/dashboard/packages");

      router.refresh();
    } catch (saveError) {
      console.error("Package save error:", saveError);

      setError(
        saveError?.data?.message ||
          saveError?.message ||
          "Failed to save package.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (loading) {
      return;
    }

    /*
     * If this is a create form and the user
     * cancels after uploading images, clean
     * those unsaved images.
     */
    if (mode === "create" && sessionUploadedImages.length > 0) {
      await cleanupUnsavedImages();
    }

    if (onCancel) {
      onCancel();
      return;
    }

    router.push("/admin/dashboard/packages");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8">
      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />

          <p className="text-sm font-medium leading-5 text-red-700">{error}</p>
        </div>
      ) : null}

      {/* Package Information */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            Package Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic information about this tourism package.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Destination" required>
            <select
              name="destination"
              value={formData.destination}
              onChange={handleDestinationChange}
              disabled={isViewMode || loadingOptions}
              className="input"
            >
              <option value="">Select destination</option>

              {destinations.map((destination) => {
                const destinationId = getId(destination);

                return (
                  <option key={destinationId} value={destinationId}>
                    {destination.name}
                  </option>
                );
              })}
            </select>
          </Field>

          <Field label="Package Name" required>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="Example: Kerala Highlights"
              className="input"
            />
          </Field>

          <Field label="Slug" required>
            <div className="flex gap-2">
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                disabled={isViewMode}
                placeholder="kerala-highlights"
                className="input min-w-0 flex-1"
              />

              {!isViewMode ? (
                <button
                  type="button"
                  onClick={generateSlug}
                  className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  Generate
                </button>
              ) : null}
            </div>
          </Field>

          <Field label="Price Type">
            <select
              name="priceType"
              value={formData.priceType}
              onChange={handleChange}
              disabled={isViewMode}
              className="input"
            >
              <option value="per-person">Per Person</option>

              <option value="per-couple">Per Couple</option>

              <option value="per-group">Per Group</option>
            </select>
          </Field>

          <Field label="Days" required>
            <input
              type="number"
              min="1"
              name="days"
              value={formData.days}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="5"
              className="input"
            />
          </Field>

          <Field label="Nights" required>
            <input
              type="number"
              min="0"
              name="nights"
              value={formData.nights}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="4"
              className="input"
            />
          </Field>

          <Field label="Price" required>
            <input
              type="number"
              min="0"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="25000"
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Description */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">Description</h2>
        </div>

        <div className="space-y-5">
          <Field label="Short Description">
            <input
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              disabled={isViewMode}
              placeholder="A short summary of the package"
              className="input"
            />
          </Field>

          <Field label="Full Description" required>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={isViewMode}
              rows={7}
              placeholder="Describe the package..."
              className="input resize-y"
            />
          </Field>
        </div>
      </section>

      {/* Inclusions / Exclusions */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Inclusions & Exclusions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Enter one item per line.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Inclusions">
            <textarea
              name="inclusions"
              value={formData.inclusions}
              onChange={handleChange}
              disabled={isViewMode}
              rows={7}
              placeholder={`Hotel accommodation
Breakfast
Airport transfer
Sightseeing`}
              className="input resize-y"
            />
          </Field>

          <Field label="Exclusions">
            <textarea
              name="exclusions"
              value={formData.exclusions}
              onChange={handleChange}
              disabled={isViewMode}
              rows={7}
              placeholder={`Personal expenses
Travel insurance
Optional activities`}
              className="input resize-y"
            />
          </Field>
        </div>
      </section>

      {/* Itinerary */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Itinerary</h2>

            <p className="mt-1 text-sm text-slate-500">
              Build the daily package itinerary.
            </p>
          </div>

          {!isViewMode ? (
            <button
              type="button"
              onClick={addDay}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus size={17} />
              Add Day
            </button>
          ) : null}
        </div>

        {itinerary.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
            <p className="text-sm text-slate-500">
              No itinerary days added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {itinerary.map((day, index) => (
              <div
                key={`day-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50/60 p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Itinerary
                    </span>

                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      Day {index + 1}
                    </h3>
                  </div>

                  {!isViewMode ? (
                    <button
                      type="button"
                      onClick={() => removeDay(index)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="space-y-4">
                  <input
                    value={day.title}
                    onChange={(event) =>
                      updateDay(index, "title", event.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="Day title"
                    className="input"
                  />

                  <textarea
                    value={day.description}
                    onChange={(event) =>
                      updateDay(index, "description", event.target.value)
                    }
                    disabled={isViewMode}
                    placeholder="Describe the activities for this day"
                    rows={4}
                    className="input resize-y"
                  />

                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-800">
                      Places
                    </p>

                    {availablePlaces.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                        {formData.destination
                          ? "No places are available for this destination."
                          : "Select a destination first."}
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {availablePlaces.map((place) => {
                          const placeId = getPlaceId(place);

                          return (
                            <label
                              key={placeId}
                              className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 transition ${
                                isViewMode
                                  ? "cursor-default"
                                  : "cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/40"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={day.places.includes(placeId)}
                                onChange={() => togglePlace(index, placeId)}
                                disabled={isViewMode}
                                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />

                              <span className="text-sm text-slate-700">
                                {place.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Images */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Package Images</h2>

          <p className="mt-1 text-sm text-slate-500">
            Upload package images to Cloudinary.
          </p>
        </div>

        {/* Cover */}
        <div>
          <div className="mb-3">
            <label className="text-sm font-semibold text-slate-800">
              Cover Image
              <span className="ml-1 text-red-500">*</span>
            </label>
          </div>

          {formData.coverImage?.url ? (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              <img
                src={formData.coverImage.url}
                alt="Package cover"
                className="h-64 w-full object-cover"
              />

              {!isViewMode ? (
                <button
                  type="button"
                  onClick={removeCoverImage}
                  className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                  title="Remove cover image"
                >
                  <X size={18} />
                </button>
              ) : null}
            </div>
          ) : (
            !isViewMode && (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 px-6 py-12 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40">
                {uploadingCover ? (
                  <>
                    <LoaderCircle
                      className="mb-3 animate-spin text-emerald-600"
                      size={32}
                    />

                    <p className="text-sm font-semibold text-slate-700">
                      Uploading cover image...
                    </p>
                  </>
                ) : (
                  <>
                    <ImagePlus className="mb-3 text-slate-400" size={34} />

                    <p className="text-sm font-semibold text-slate-700">
                      Click to upload cover image
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      JPG, PNG, WEBP or GIF · Max 10MB
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleCoverUpload}
                  disabled={uploadingCover}
                  className="hidden"
                />
              </label>
            )
          )}
        </div>

        {/* Gallery */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-slate-800">
              Gallery
            </label>

            <span className="text-xs text-slate-500">
              {formData.gallery.length} image
              {formData.gallery.length === 1 ? "" : "s"}
            </span>
          </div>

          {!isViewMode ? (
            <label className="mb-5 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
              {uploadingGallery ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={17} />
                  Upload Gallery Images
                </>
              )}

              <input
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleGalleryUpload}
                disabled={uploadingGallery}
                className="hidden"
              />
            </label>
          ) : null}

          {formData.gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {formData.gallery.map((image, index) => (
                <div
                  key={`${image.publicId}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200"
                >
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {!isViewMode ? (
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                      title="Remove image"
                    >
                      <Trash2 size={15} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
              <p className="text-sm text-slate-500">No gallery images added.</p>
            </div>
          )}
        </div>
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">Package Status</h2>
        </div>

        <div className="space-y-4">
          <label
            className={`flex items-start gap-3 ${
              isViewMode ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              disabled={isViewMode}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Featured package
              </span>

              <span className="block text-xs text-slate-500">
                Display this package as a featured package.
              </span>
            </span>
          </label>

          <label
            className={`flex items-start gap-3 ${
              isViewMode ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isViewMode}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Active package
              </span>

              <span className="block text-xs text-slate-500">
                Active packages can be shown publicly.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isViewMode ? "Close" : "Cancel"}
        </button>

        {!isViewMode ? (
          <button
            type="submit"
            disabled={
              loading || loadingOptions || uploadingCover || uploadingGallery
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : null}

            {loading
              ? "Saving..."
              : isEditMode
                ? "Update Package"
                : "Create Package"}
          </button>
        ) : null}
      </div>
    </form>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800">
        {label}

        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      {children}
    </label>
  );
}