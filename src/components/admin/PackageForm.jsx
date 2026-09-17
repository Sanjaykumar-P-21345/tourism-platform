"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";

import { adminApi } from "@/utils/adminApi";
import { getToken } from "@/utils/api";

function imageObject(image) {
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
  if (!Array.isArray(gallery)) return [];

  return gallery.map(imageObject).filter(Boolean);
}

export default function PackageForm({
  initialData = null,
  initialValues = null,
  packageId = null,
  destinations: initialDestinations = [],
  places: initialPlaces = [],
  mode = "create",
}) {
  const router = useRouter();

  const packageData = initialData || initialValues || null;

  const id = packageId || packageData?._id || packageData?.id || null;

  const [destinations, setDestinations] = useState(initialDestinations);

  const [places, setPlaces] = useState(initialPlaces);

  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
  });

  const [itinerary, setItinerary] = useState([]);

  useEffect(() => {
    if (!packageData) return;

    setFormData({
      destination:
        packageData.destination?._id || packageData.destination || "",

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

      isFeatured: Boolean(packageData.isFeatured),

      isActive: packageData.isActive ?? true,
    });

    if (Array.isArray(packageData.itinerary)) {
      setItinerary(
        packageData.itinerary.map((day) => ({
          day: day.day || 1,
          title: day.title || "",
          description: day.description || "",
          places: Array.isArray(day.places)
            ? day.places.map((place) =>
                typeof place === "object" ? place._id : place,
              )
            : [],
        })),
      );
    }
  }, [packageData?._id]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      if (initialDestinations.length > 0 && initialPlaces.length > 0) {
        return;
      }

      setLoadingOptions(true);

      try {
        const requests = [];

        if (initialDestinations.length === 0) {
          requests.push(adminApi.get("/api/dashboard/destinations"));
        } else {
          requests.push(
            Promise.resolve({
              data: initialDestinations,
            }),
          );
        }

        if (initialPlaces.length === 0) {
          requests.push(adminApi.get("/api/dashboard/places"));
        } else {
          requests.push(
            Promise.resolve({
              data: initialPlaces,
            }),
          );
        }

        const [destinationResponse, placeResponse] =
          await Promise.all(requests);

        if (cancelled) return;

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

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

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

  function addDay() {
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

    const formData = new FormData();

    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Image upload failed.");
    }

    return data.image;
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setUploadingCover(true);

    try {
      const uploaded = await uploadImage(file, "tourism/packages/cover");

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
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (files.length === 0) return;

    setError("");
    setUploadingGallery(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const uploaded = await uploadImage(file, "tourism/packages/gallery");

        uploadedImages.push(uploaded);
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

  async function deleteCloudinaryImage(publicId) {
    if (!publicId) return;

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
          publicId,
        }),
      });
    } catch (deleteError) {
      console.error("Cloudinary delete error:", deleteError);
    }
  }

  async function removeCoverImage() {
    const currentImage = formData.coverImage;

    setFormData((previous) => ({
      ...previous,
      coverImage: null,
    }));

    if (currentImage?.publicId) {
      await deleteCloudinaryImage(currentImage.publicId);
    }
  }

  async function removeGalleryImage(index) {
    const image = formData.gallery[index];

    setFormData((previous) => ({
      ...previous,
      gallery: previous.gallery.filter((_, itemIndex) => itemIndex !== index),
    }));

    if (image?.publicId) {
      await deleteCloudinaryImage(image.publicId);
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

  async function handleSubmit(event) {
    event.preventDefault();

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

    if (Number(formData.days) < 1 || Number(formData.nights) < 0) {
      setError("Please enter a valid duration.");
      return;
    }

    if (formData.price === "") {
      setError("Package price is required.");
      return;
    }

    if (Number(formData.price) < 0) {
      setError("Package price cannot be negative.");
      return;
    }

    if (!formData.coverImage?.url) {
      setError("Please upload a cover image.");
      return;
    }

    for (let index = 0; index < itinerary.length; index += 1) {
      if (!itinerary[index].title.trim()) {
        setError(`Please enter a title for Day ${index + 1}.`);
        return;
      }
    }

    if (mode === "edit" && !id) {
      setError("Package ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      let response;

      if (mode === "create") {
        response = await adminApi.post("/api/dashboard/packages", payload);
      } else {
        response = await adminApi.put(`/api/dashboard/packages/${id}`, payload);
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save package.");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Package Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Package Information
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Basic information about this tourism package.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Destination" required>
            <select
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              disabled={loadingOptions}
              className="input"
            >
              <option value="">Select destination</option>

              {destinations.map((destination) => {
                const destinationId = destination._id || destination.id;

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
                placeholder="kerala-highlights"
                className="input min-w-0 flex-1"
              />

              <button
                type="button"
                onClick={generateSlug}
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Generate
              </button>
            </div>
          </Field>

          <Field label="Price Type">
            <select
              name="priceType"
              value={formData.priceType}
              onChange={handleChange}
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
              placeholder="25000"
              className="input"
            />
          </Field>
        </div>
      </section>

      {/* Description */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
          Description
        </h2>

        <div className="space-y-5">
          <Field label="Short Description">
            <input
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleChange}
              placeholder="A short summary of the package"
              className="input"
            />
          </Field>

          <Field label="Full Description" required>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={7}
              placeholder="Describe the package..."
              className="input resize-y"
            />
          </Field>
        </div>
      </section>

      {/* Inclusions */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
          Inclusions & Exclusions
        </h2>

        <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
          Enter one item per line.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Inclusions">
            <textarea
              name="inclusions"
              value={formData.inclusions}
              onChange={handleChange}
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Itinerary
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Build the daily package itinerary.
            </p>
          </div>

          <button
            type="button"
            onClick={addDay}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <Plus size={17} />
            Add Day
          </button>
        </div>

        {itinerary.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No itinerary days added yet.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {itinerary.map((day, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 dark:border-slate-700 dark:bg-slate-950/40"
              >
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Itinerary
                    </span>

                    <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                      Day {index + 1}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDay(index)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>

                <div className="space-y-4">
                  <input
                    value={day.title}
                    onChange={(event) =>
                      updateDay(index, "title", event.target.value)
                    }
                    placeholder="Day title"
                    className="input"
                  />

                  <textarea
                    value={day.description}
                    onChange={(event) =>
                      updateDay(index, "description", event.target.value)
                    }
                    placeholder="Describe the activities for this day"
                    rows={4}
                    className="input resize-y"
                  />

                  <div>
                    <p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Places
                    </p>

                    {places.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No places available.
                      </p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {places.map((place) => {
                          const placeId = place._id || place.id;

                          return (
                            <label
                              key={placeId}
                              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-600"
                            >
                              <input
                                type="checkbox"
                                checked={day.places.includes(placeId)}
                                onChange={() => togglePlace(index, placeId)}
                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                              />

                              <span className="text-sm text-slate-700 dark:text-slate-300">
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
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Package Images
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload images directly to Cloudinary.
          </p>
        </div>

        {/* Cover */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Cover Image
              <span className="ml-1 text-red-500">*</span>
            </label>
          </div>

          {formData.coverImage?.url ? (
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <img
                src={formData.coverImage.url}
                alt="Package cover"
                className="h-64 w-full object-cover"
              />

              <button
                type="button"
                onClick={removeCoverImage}
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition hover:bg-red-600"
                title="Remove cover image"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-6 py-12 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-950/20">
              {uploadingCover ? (
                <>
                  <Loader2
                    className="mb-3 animate-spin text-indigo-600"
                    size={32}
                  />

                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Uploading cover image...
                  </p>
                </>
              ) : (
                <>
                  <ImagePlus className="mb-3 text-slate-400" size={34} />

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Click to upload cover image
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
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
          )}
        </div>

        {/* Gallery */}
        <div className="mt-8">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Gallery
            </label>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formData.gallery.length} image
              {formData.gallery.length === 1 ? "" : "s"}
            </span>
          </div>

          <label className="mb-5 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-600 dark:hover:bg-slate-700">
            {uploadingGallery ? (
              <>
                <Loader2 size={17} className="animate-spin" />
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

          {formData.gallery.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {formData.gallery.map((image, index) => (
                <div
                  key={`${image.url}-${index}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
                >
                  <img
                    src={image.url}
                    alt={`Gallery ${index + 1}`}
                    className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                    title="Remove image"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Status */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
          Package Status
        </h2>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Featured package
              </span>

              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Display this package as a featured package.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <span>
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                Active package
              </span>

              <span className="block text-xs text-slate-500 dark:text-slate-400">
                Active packages can be shown publicly.
              </span>
            </span>
          </label>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard/packages")}
          className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || uploadingCover || uploadingGallery}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={17} className="animate-spin" />}

          {loading
            ? "Saving..."
            : mode === "edit"
              ? "Update Package"
              : "Create Package"}
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(203 213 225);
          background: white;
          padding: 0.75rem 1rem;
          color: rgb(15 23 42);
          outline: none;
          transition: all 150ms ease;
        }

        .input:focus {
          border-color: rgb(99 102 241);
          box-shadow: 0 0 0 3px rgb(99 102 241 / 0.12);
        }

        @media (prefers-color-scheme: dark) {
          .input {
            border-color: rgb(51 65 85);
            background: rgb(15 23 42);
            color: rgb(241 245 249);
          }

          .input::placeholder {
            color: rgb(100 116 139);
          }
        }
      `}</style>
    </form>
  );
}

function Field({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}