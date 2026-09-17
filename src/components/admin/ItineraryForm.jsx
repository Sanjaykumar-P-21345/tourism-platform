"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Plus,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

import { adminApi } from "@/utils/adminApi";
import { getToken } from "@/utils/api";

const emptyActivity = {
  time: "",
  title: "",
  description: "",
  place: "",
};

const emptyDay = {
  dayNumber: 1,
  title: "",
  activities: [],
};

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

export default function ItineraryForm({
  initialData = null,
  initialValues = null,
  itineraryId = null,
  mode = "create",
}) {
  const router = useRouter();

  const itineraryData = initialData || initialValues || null;

  const id = itineraryId || itineraryData?._id || itineraryData?.id || null;

  const [destinations, setDestinations] = useState([]);

  const [places, setPlaces] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);

  const [loading, setLoading] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);

  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    destination: "",
    title: "",
    slug: "",
    days: "",
    nights: "",
    description: "",
    budgetMin: "",
    budgetMax: "",
    coverImage: null,
    gallery: [],
    isFeatured: false,
    isActive: true,
  });

  const [daysData, setDaysData] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);

      try {
        const [destinationResponse, placeResponse] = await Promise.all([
          adminApi.get("/api/dashboard/destinations"),
          adminApi.get("/api/dashboard/places"),
        ]);

        if (cancelled) return;

        setDestinations(destinationResponse?.data || []);

        setPlaces(placeResponse?.data || []);
      } catch (error) {
        if (!cancelled) {
          setError(
            error?.data?.message ||
              error?.message ||
              "Failed to load destinations and places.",
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

  useEffect(() => {
    if (!itineraryData) return;

    setFormData({
      destination:
        itineraryData.destination?._id || itineraryData.destination || "",

      title: itineraryData.title || "",

      slug: itineraryData.slug || "",

      days: itineraryData.duration?.days ?? "",

      nights: itineraryData.duration?.nights ?? "",

      description: itineraryData.description || "",

      budgetMin: itineraryData.estimatedBudget?.min ?? "",

      budgetMax: itineraryData.estimatedBudget?.max ?? "",

      coverImage: normalizeImage(itineraryData.coverImage),

      gallery: Array.isArray(itineraryData.gallery)
        ? itineraryData.gallery.map(normalizeImage).filter(Boolean)
        : [],

      isFeatured: Boolean(itineraryData.isFeatured),

      isActive: itineraryData.isActive ?? true,
    });

    if (Array.isArray(itineraryData.days)) {
      setDaysData(
        itineraryData.days.map((day, index) => ({
          dayNumber: Number(day.dayNumber) || index + 1,

          title: day.title || "",

          activities: Array.isArray(day.activities)
            ? day.activities.map((activity) => ({
                time: activity.time || "",

                title: activity.title || "",

                description: activity.description || "",

                place: activity.place?._id || activity.place || "",
              }))
            : [],
        })),
      );
    }
  }, [itineraryData?._id]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function generateSlug() {
    const slug = formData.title
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
    setDaysData((previous) => [
      ...previous,
      {
        ...emptyDay,
        dayNumber: previous.length + 1,
      },
    ]);
  }

  function removeDay(dayIndex) {
    setDaysData((previous) =>
      previous
        .filter((_, index) => index !== dayIndex)
        .map((day, index) => ({
          ...day,
          dayNumber: index + 1,
        })),
    );
  }

  function updateDay(dayIndex, field, value) {
    setDaysData((previous) =>
      previous.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              [field]: value,
            }
          : day,
      ),
    );
  }

  function addActivity(dayIndex) {
    setDaysData((previous) =>
      previous.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              activities: [
                ...day.activities,
                {
                  ...emptyActivity,
                },
              ],
            }
          : day,
      ),
    );
  }

  function removeActivity(dayIndex, activityIndex) {
    setDaysData((previous) =>
      previous.map((day, index) =>
        index === dayIndex
          ? {
              ...day,
              activities: day.activities.filter(
                (_, itemIndex) => itemIndex !== activityIndex,
              ),
            }
          : day,
      ),
    );
  }

  function updateActivity(dayIndex, activityIndex, field, value) {
    setDaysData((previous) =>
      previous.map((day, index) => {
        if (index !== dayIndex) {
          return day;
        }

        return {
          ...day,
          activities: day.activities.map((activity, itemIndex) =>
            itemIndex === activityIndex
              ? {
                  ...activity,
                  [field]: value,
                }
              : activity,
          ),
        };
      }),
    );
  }

  async function uploadImage(file, folder) {
    if (!file) return null;

    const token = getToken();

    if (!token) {
      throw new Error("Admin authentication is missing.");
    }

    const form = new FormData();

    form.append("file", file);
    form.append("folder", folder);

    const response = await fetch("/api/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      throw new Error(data?.message || "Image upload failed.");
    }

    return data.image;
  }

  async function deleteCloudinaryImage(publicId) {
    if (!publicId) return;

    const response = await adminApi.post("/api/upload/delete", {
      publicId,
    });

    if (!response?.success) {
      throw new Error(response?.message || "Failed to delete image.");
    }
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setError("");
    setUploadingCover(true);

    try {
      const image = await uploadImage(file, "tourism/itineraries/cover");

      const previousImage = formData.coverImage;

      setFormData((previous) => ({
        ...previous,
        coverImage: image,
      }));

      if (
        previousImage?.publicId &&
        previousImage.publicId !== image.publicId
      ) {
        try {
          await deleteCloudinaryImage(previousImage.publicId);
        } catch (deleteError) {
          console.error("Old cover image cleanup failed:", deleteError);
        }
      }
    } catch (error) {
      setError(error?.message || "Failed to upload cover image.");
    } finally {
      setUploadingCover(false);
    }
  }

  async function removeCoverImage() {
    const image = formData.coverImage;

    setFormData((previous) => ({
      ...previous,
      coverImage: null,
    }));

    if (image?.publicId) {
      try {
        await deleteCloudinaryImage(image.publicId);
      } catch (error) {
        console.error("Cover image delete failed:", error);
      }
    }
  }

  async function handleGalleryUpload(event) {
    const files = Array.from(event.target.files || []);

    event.target.value = "";

    if (!files.length) return;

    setError("");
    setUploadingGallery(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const image = await uploadImage(file, "tourism/itineraries/gallery");

        if (image) {
          uploadedImages.push(image);
        }
      }

      setFormData((previous) => ({
        ...previous,
        gallery: [...previous.gallery, ...uploadedImages],
      }));
    } catch (error) {
      setError(error?.message || "Failed to upload gallery images.");
    } finally {
      setUploadingGallery(false);
    }
  }

  async function removeGalleryImage(index) {
    const image = formData.gallery[index];

    setFormData((previous) => ({
      ...previous,
      gallery: previous.gallery.filter((_, imageIndex) => imageIndex !== index),
    }));

    if (image?.publicId) {
      try {
        await deleteCloudinaryImage(image.publicId);
      } catch (error) {
        console.error("Gallery image delete failed:", error);
      }
    }
  }

  function buildPayload() {
    const payload = {
      destination: formData.destination,

      title: formData.title.trim(),

      slug: formData.slug.trim().toLowerCase(),

      duration: {
        days: Number(formData.days),
        nights: Number(formData.nights),
      },

      description: formData.description.trim(),

      days: daysData.map((day, index) => ({
        dayNumber: Number(day.dayNumber) || index + 1,

        title: day.title.trim(),

        activities: day.activities.map((activity) => {
          const item = {
            title: activity.title.trim(),
          };

          if (activity.time?.trim()) {
            item.time = activity.time.trim();
          }

          if (activity.description?.trim()) {
            item.description = activity.description.trim();
          }

          if (activity.place) {
            item.place = activity.place;
          }

          return item;
        }),
      })),

      isFeatured: Boolean(formData.isFeatured),

      isActive: Boolean(formData.isActive),

      coverImage: formData.coverImage || null,

      gallery: formData.gallery || [],
    };

    if (formData.budgetMin !== "" || formData.budgetMax !== "") {
      payload.estimatedBudget = {};

      if (formData.budgetMin !== "") {
        payload.estimatedBudget.min = Number(formData.budgetMin);
      }

      if (formData.budgetMax !== "") {
        payload.estimatedBudget.max = Number(formData.budgetMax);
      }
    }

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!formData.destination) {
      setError("Destination is required.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!formData.slug.trim()) {
      setError("Slug is required.");
      return;
    }

    if (formData.days === "" || Number(formData.days) < 1) {
      setError("Days must be at least 1.");
      return;
    }

    if (formData.nights === "" || Number(formData.nights) < 0) {
      setError("Nights must be 0 or greater.");
      return;
    }

    if (
      formData.budgetMin !== "" &&
      formData.budgetMax !== "" &&
      Number(formData.budgetMin) > Number(formData.budgetMax)
    ) {
      setError("Minimum budget cannot be greater than maximum budget.");
      return;
    }

    for (const day of daysData) {
      if (!day.title.trim()) {
        setError(`Day ${day.dayNumber} title is required.`);
        return;
      }

      for (const activity of day.activities) {
        if (!activity.title.trim()) {
          setError(`Activity title is required in Day ${day.dayNumber}.`);
          return;
        }
      }
    }

    if (mode === "edit" && !id) {
      setError("Itinerary ID is missing.");
      return;
    }

    setLoading(true);

    try {
      const payload = buildPayload();

      let response;

      if (mode === "create") {
        response = await adminApi.post("/api/dashboard/itineraries", payload);
      } else {
        response = await adminApi.put(
          `/api/dashboard/itineraries/${id}`,
          payload,
        );
      }

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save itinerary.");
      }

      router.push("/admin/dashboard/itineraries");
    } catch (error) {
      console.error("Itinerary save error:", error);

      setError(
        error?.data?.message || error?.message || "Failed to save itinerary.",
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500";

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-700 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* BASIC INFORMATION */}
      <section className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Itinerary Information
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Configure the basic itinerary details.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Destination
            </label>

            <select
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              disabled={loadingOptions}
              className={inputClass}
            >
              <option value="">
                {loadingOptions
                  ? "Loading destinations..."
                  : "Select destination"}
              </option>

              {destinations.map((destination) => (
                <option
                  key={destination._id || destination.id}
                  value={destination._id || destination.id}
                >
                  {destination.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Title
            </label>

            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. 5 Day Kerala Adventure"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Slug
            </label>

            <div className="flex gap-2">
              <input
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="kerala-adventure"
                className={inputClass}
              />

              <button
                type="button"
                onClick={generateSlug}
                className="shrink-0 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Generate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Days
              </label>

              <input
                type="number"
                min="1"
                name="days"
                value={formData.days}
                onChange={handleChange}
                placeholder="Days"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nights
              </label>

              <input
                type="number"
                min="0"
                name="nights"
                value={formData.nights}
                onChange={handleChange}
                placeholder="Nights"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Description
          </label>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Describe this itinerary..."
            className={inputClass}
          />
        </div>
      </section>

      {/* BUDGET */}
      <section className={cardClass}>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Estimated Budget
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Minimum Budget
            </label>

            <input
              type="number"
              min="0"
              name="budgetMin"
              value={formData.budgetMin}
              onChange={handleChange}
              placeholder="Minimum budget"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Maximum Budget
            </label>

            <input
              type="number"
              min="0"
              name="budgetMax"
              value={formData.budgetMax}
              onChange={handleChange}
              placeholder="Maximum budget"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* COVER IMAGE */}
      <section className={cardClass}>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Cover Image
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload the main image for this itinerary.
          </p>
        </div>

        {formData.coverImage?.url ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
            <img
              src={formData.coverImage.url}
              alt="Itinerary cover"
              className="h-64 w-full object-cover"
            />

            <button
              type="button"
              onClick={removeCoverImage}
              className="absolute right-3 top-3 rounded-full bg-red-600 p-2 text-white shadow-lg transition hover:bg-red-700"
              title="Remove cover image"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-6 py-12 transition hover:border-indigo-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:border-indigo-500 dark:hover:bg-slate-800/50">
            {uploadingCover ? (
              <Loader2 size={30} className="animate-spin text-indigo-500" />
            ) : (
              <Upload size={30} className="text-slate-400" />
            )}

            <span className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              {uploadingCover ? "Uploading..." : "Upload cover image"}
            </span>

            <span className="mt-1 text-xs text-slate-500">
              JPG, PNG, WEBP or GIF
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleCoverUpload}
              className="hidden"
              disabled={uploadingCover}
            />
          </label>
        )}
      </section>

      {/* GALLERY */}
      <section className={cardClass}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Gallery
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Upload additional itinerary images.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">
            {uploadingGallery ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Plus size={17} />
            )}

            {uploadingGallery ? "Uploading..." : "Add Images"}

            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleGalleryUpload}
              className="hidden"
              disabled={uploadingGallery}
            />
          </label>
        </div>

        {formData.gallery.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {formData.gallery.map((image, index) => (
              <div
                key={image.publicId || `${image.url}-${index}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
              >
                <img
                  src={image.url}
                  alt={`Gallery ${index + 1}`}
                  className="h-36 w-full object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 shadow transition group-hover:opacity-100"
                  title="Remove image"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
            <ImageIcon size={30} className="mx-auto text-slate-400" />

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No gallery images added yet.
            </p>
          </div>
        )}
      </section>

      {/* DAILY PLAN */}
      <section className={cardClass}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Daily Plan
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Build the activities for each day.
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

        {daysData.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No days added yet.
            </p>

            <button
              type="button"
              onClick={addDay}
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Add First Day
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {daysData.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/50 sm:p-5"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Day {day.dayNumber}
                    </span>

                    <h3 className="mt-1 font-bold text-slate-900 dark:text-white">
                      Daily Activities
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeDay(dayIndex)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>

                <input
                  value={day.title}
                  onChange={(event) =>
                    updateDay(dayIndex, "title", event.target.value)
                  }
                  placeholder="Day title"
                  className={inputClass}
                />

                <div className="mt-5 space-y-4">
                  {day.activities.map((activity, activityIndex) => (
                    <div
                      key={activityIndex}
                      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          value={activity.time}
                          onChange={(event) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              "time",
                              event.target.value,
                            )
                          }
                          placeholder="Time"
                          className={inputClass}
                        />

                        <input
                          value={activity.title}
                          onChange={(event) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              "title",
                              event.target.value,
                            )
                          }
                          placeholder="Activity title"
                          className={inputClass}
                        />

                        <select
                          value={activity.place}
                          onChange={(event) =>
                            updateActivity(
                              dayIndex,
                              activityIndex,
                              "place",
                              event.target.value,
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">No place</option>

                          {places.map((place) => (
                            <option
                              key={place._id || place.id}
                              value={place._id || place.id}
                            >
                              {place.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <textarea
                        value={activity.description}
                        onChange={(event) =>
                          updateActivity(
                            dayIndex,
                            activityIndex,
                            "description",
                            event.target.value,
                          )
                        }
                        rows={3}
                        placeholder="Activity description"
                        className={`mt-4 ${inputClass}`}
                      />

                      <button
                        type="button"
                        onClick={() => removeActivity(dayIndex, activityIndex)}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 dark:text-red-400"
                      >
                        <Trash2 size={15} />
                        Remove Activity
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addActivity(dayIndex)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Plus size={16} />
                  Add Activity
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* STATUS */}
      <section className={cardClass}>
        <h2 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
          Visibility
        </h2>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Featured itinerary
            </span>
          </label>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Active itinerary
            </span>
          </label>
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard/itineraries")}
          className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={17} className="animate-spin" />}

          {loading
            ? "Saving..."
            : mode === "edit"
              ? "Update Itinerary"
              : "Create Itinerary"}
        </button>
      </div>
    </form>
  );
}
