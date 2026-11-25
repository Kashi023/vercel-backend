const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Doctor = require("../models/Doctor");

// ==========================================
// REGISTER DOCTOR
// ==========================================

const registerDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialization,
      experience,
      qualification,
      hospital,
      consultationFee,
      bio,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !email ||
      !password ||
      !specialization ||
      experience === undefined ||
      !qualification ||
      consultationFee === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters.",
      });
    }

    if (
      !Number.isFinite(Number(experience)) ||
      Number(experience) < 0 ||
      !Number.isFinite(Number(consultationFee)) ||
      Number(consultationFee) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid experience and consultation fee.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing account
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create doctor login account
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "doctor",
    });

    try {
      // Create professional doctor profile
      const doctor = await Doctor.create({
        userId: user._id,
        name: name.trim(),
        specialization: specialization.trim(),
        experience: Number(experience),
        qualification: qualification.trim(),
        hospital: hospital || "",
        consultationFee: Number(consultationFee),
        bio: bio || "",
      });

      return res.status(201).json({
        success: true,
        message: "Doctor registered successfully.",
        doctor,
      });
    } catch (error) {
      // Avoid leaving an orphaned User if profile creation fails
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  } catch (error) {
    console.error("Doctor registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Doctor registration failed.",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL DOCTORS
// ==========================================

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate("userId", "name email role profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    console.error("Get all doctors error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch doctors.",
    });
  }
};

// ==========================================
// GET LOGGED-IN DOCTOR PROFILE
// ==========================================

const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find profile using the logged-in doctor's User ID
    let doctor = await Doctor.findOne({
      userId: userId,
    }).populate("userId", "name email role profileImage");

    // If profile is missing, check whether the User account exists
    if (!doctor) {
      const user = await User.findById(userId).select(
        "name email role profileImage"
      );

      if (!user || user.role !== "doctor") {
        return res.status(404).json({
          success: false,
          message: "Doctor account not found.",
        });
      }

      // Create a basic profile for an existing doctor account
      doctor = await Doctor.create({
        userId: user._id,
        name: user.name,
        specialization: "General Physician",
        experience: 0,
        qualification: "Not specified",
        consultationFee: 0,
      });

      doctor = await Doctor.findById(doctor._id).populate(
        "userId",
        "name email role profileImage"
      );
    }

    return res.status(200).json({
      success: true,
      doctor,
    });

  } catch (error) {
    console.error("Get doctor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch doctor profile.",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  registerDoctor,
  getAllDoctors,
  getDoctorProfile,
};