
const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // Link doctor profile with User login account
    userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  required: true,
  unique: true,
}
,
    name: {
      type: String,
      required: [true, "Doctor name is required"],
      trim: true,
      minlength: 2
    },

    specialization: {
      type: String,
      required: [true, "Specialization is required"],
      trim: true
    },

    experience: {
      type: Number,
      required: [true, "Experience is required"],
      min: [0, "Experience cannot be negative"]
    },

    qualification: {
      type: String,
      required: [true, "Qualification is required"],
      trim: true
    },

    hospital: {
      type: String,
      trim: true,
      default: ""
    },

    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Consultation fee cannot be negative"]
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    profileImage: {
      type: String,
      default: ""
    },

    available: {
      type: Boolean,
      default: true
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Index for faster doctor profile lookup
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ available: 1 });

// Create Doctor model
const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
