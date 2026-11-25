const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    age: {
      type: Number,
      min: 1,
      max: 120
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },
    
    role: {
      type: String,
      enum: ["user", "doctor"],
      required: true,
    },
    
    profileImage: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);