import mongoose from "mongoose";

/* ================================================================
   IMAGE SUB-SCHEMA
   Stores Cloudinary URL + public_id
================================================================ */

const ImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/* ================================================================
   ADMIN SCHEMA
================================================================ */

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
      minlength: [2, "Admin name must be at least 2 characters"],
      maxlength: [50, "Admin name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Admin email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: [true, "Admin password is required"],
      select: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================================================================
   INQUIRY SCHEMA
================================================================ */

const InquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [150, "Subject cannot exceed 150 characters"],
      default: "",
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [5, "Message must be at least 5 characters"],
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },

    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      default: null,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "resolved", "archived"],
      default: "new",
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: [2000, "Admin note cannot exceed 2000 characters"],
      default: "",
    },

    contactedAt: {
      type: Date,
      default: null,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ================================================================
   DESTINATION SCHEMA
================================================================ */

const destinationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["country", "state", "city", "region"],
      required: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    bestTimeToVisit: {
      type: String,
      trim: true,
    },

    language: {
      type: String,
      trim: true,
    },

    currency: {
      type: String,
      trim: true,
    },

    /* Cloudinary cover image */
    coverImage: {
      type: ImageSchema,
      required: true,
    },

    /* Cloudinary gallery images */
    gallery: {
      type: [ImageSchema],
      default: [],
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    address: {
      type: String,
      trim: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   PLACE SCHEMA
================================================================ */

const placeSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      enum: [
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
      ],
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    entryFee: {
      adult: {
        type: Number,
        default: 0,
      },

      child: {
        type: Number,
        default: 0,
      },

      foreigner: {
        type: Number,
        default: 0,
      },
    },

    openingTime: {
      type: String,
      trim: true,
    },

    closingTime: {
      type: String,
      trim: true,
    },

    closedOn: {
      type: String,
      trim: true,
    },

    bestTimeToVisit: {
      type: String,
      trim: true,
    },

    visitDuration: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    /* Cloudinary cover image */
    coverImage: {
      type: ImageSchema,
      required: true,
    },

    /* Cloudinary gallery */
    gallery: {
      type: [ImageSchema],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   HOTEL SCHEMA
================================================================ */

const hotelSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        "budget",
        "standard",
        "premium",
        "luxury",
        "resort",
        "homestay",
        "hostel",
      ],
      required: true,
    },

    pricePerNight: {
      min: {
        type: Number,
        required: true,
      },

      max: {
        type: Number,
        required: true,
      },
    },

    amenities: [
      {
        type: String,
        trim: true,
      },
    ],

    address: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    /* Cloudinary cover image */
    coverImage: {
      type: ImageSchema,
      required: true,
    },

    /* Cloudinary gallery */
    gallery: {
      type: [ImageSchema],
      default: [],
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   RESTAURANT SCHEMA
================================================================ */

const restaurantSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    cuisines: [
      {
        type: String,
        trim: true,
      },
    ],

    foodType: {
      type: String,
      enum: ["veg", "non-veg", "both"],
      default: "both",
    },

    priceRange: {
      type: String,
      enum: ["budget", "moderate", "expensive"],
      required: true,
    },

    popularDishes: [
      {
        type: String,
        trim: true,
      },
    ],

    openingTime: {
      type: String,
      trim: true,
    },

    closingTime: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    latitude: {
      type: Number,
    },

    longitude: {
      type: Number,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    /* Cloudinary cover image */
    coverImage: {
      type: ImageSchema,
      required: true,
    },

    /* Cloudinary gallery */
    gallery: {
      type: [ImageSchema],
      default: [],
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   TRANSPORTATION SCHEMA
================================================================ */

const transportationSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "flight",
        "train",
        "bus",
        "taxi",
        "car-rental",
        "bike-rental",
      ],
      required: true,
    },

    providerName: {
      type: String,
      required: true,
      trim: true,
    },

    from: {
      type: String,
      required: true,
      trim: true,
    },

    to: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    estimatedCost: {
      min: {
        type: Number,
      },

      max: {
        type: Number,
      },
    },

    estimatedDuration: {
      type: String,
      trim: true,
    },

    schedule: {
      type: String,
      trim: true,
    },

    bookingUrl: {
      type: String,
      trim: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    /* Added because every module should support images */
    coverImage: {
      type: ImageSchema,
      default: null,
    },

    gallery: {
      type: [ImageSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   PACKAGE SCHEMA
================================================================ */

const packageSchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      days: {
        type: Number,
        required: true,
      },

      nights: {
        type: Number,
        required: true,
      },
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    priceType: {
      type: String,
      enum: ["per-person", "per-couple", "per-group"],
      default: "per-person",
    },

    inclusions: [
      {
        type: String,
        trim: true,
      },
    ],

    exclusions: [
      {
        type: String,
        trim: true,
      },
    ],

    itinerary: [
      {
        day: {
          type: Number,
          required: true,
        },

        title: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          trim: true,
        },

        places: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
          },
        ],
      },
    ],

    /* Cloudinary cover image */
    coverImage: {
      type: ImageSchema,
      required: true,
    },

    /* Cloudinary gallery */
    gallery: {
      type: [ImageSchema],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   ITINERARY SCHEMA
================================================================ */

const itinerarySchema = new mongoose.Schema(
  {
    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    duration: {
      days: {
        type: Number,
        required: true,
      },

      nights: {
        type: Number,
        required: true,
      },
    },

    description: {
      type: String,
      trim: true,
    },

    days: [
      {
        dayNumber: {
          type: Number,
          required: true,
        },

        title: {
          type: String,
          required: true,
          trim: true,
        },

        activities: [
          {
            time: {
              type: String,
              trim: true,
            },

            title: {
              type: String,
              required: true,
              trim: true,
            },

            description: {
              type: String,
              trim: true,
            },

            place: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Place",
            },
          },
        ],
      },
    ],

    estimatedBudget: {
      min: {
        type: Number,
      },

      max: {
        type: Number,
      },
    },

    /* Cloudinary cover image */
    coverImage: {
      type: ImageSchema,
      default: null,
    },

    /* Added gallery support */
    gallery: {
      type: [ImageSchema],
      default: [],
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ================================================================
   MODELS
================================================================ */

export const Admin =
  mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export const Inquiry =
  mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);

export const Destination =
  mongoose.models.Destination ||
  mongoose.model("Destination", destinationSchema);

export const Place =
  mongoose.models.Place ||
  mongoose.model("Place", placeSchema);

export const Hotel =
  mongoose.models.Hotel ||
  mongoose.model("Hotel", hotelSchema);

export const Restaurant =
  mongoose.models.Restaurant ||
  mongoose.model("Restaurant", restaurantSchema);

export const Transportation =
  mongoose.models.Transportation ||
  mongoose.model("Transportation", transportationSchema);

export const Package =
  mongoose.models.Package ||
  mongoose.model("Package", packageSchema);

export const Itinerary =
  mongoose.models.Itinerary ||
  mongoose.model("Itinerary", itinerarySchema);