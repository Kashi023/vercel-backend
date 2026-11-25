
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// ==========================================
// REGISTER PATIENT
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, gender } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
      role: "user"
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists. Please login."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create patient account
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      age,
      gender,
      role: "user"
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        role: user.role
      }
    });

  } catch (error) {
    console.error("User registration error:", error);

    // Handle duplicate email index error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    return res.status(500).json({
      success: false,
      message: "User registration failed",
      error: error.message
    });
  }
};


// ==========================================
// GET ALL PATIENTS
// ==========================================

const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "user"
    }).select("-password");

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
      error: error.message
    });
  }
};


// ==========================================
// GET PATIENT BY ID
// ==========================================

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findOne({
      _id: id,
      role: "user"
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch user",
      error: error.message
    });
  }
};


// ==========================================
// GET LOGGED-IN PATIENT PROFILE
// ==========================================

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findOne({
      _id: userId,
      role: "user"
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
      error: error.message
    });
  }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  registerUser,
  getUsers,
  getUserById,
  getUserProfile
};
