import mongoose from "mongoose";

/* =========================================================
   ADMIN SCHEMA
   ========================================================= */

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
  },
);

/* =========================================================
   INQUIRY SCHEMA
   ========================================================= */

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
  },
);

/* =========================================================
   MODELS
   ========================================================= */

export const Admin =
  mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export const Inquiry =
  mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);



  