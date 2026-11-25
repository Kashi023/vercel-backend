
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// COMMON LOGIN FUNCTION
// ==========================================

const authenticateUser = async (req, res, role) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password"
      });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid login credentials"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find account using email and role
    const user = await User.findOne({
      email: normalizedEmail,
      role: role
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found. Please register first."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in environment variables");
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(`${role} login error:`, error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

// ==========================================
// PATIENT LOGIN
// POST /api/auth/login
// ==========================================

const userLogin = async (req, res) => {
  return authenticateUser(req, res, "user");
};

// ==========================================
// DOCTOR LOGIN
// POST /api/doctors/login
// ==========================================

const doctorLogin = async (req, res) => {
  return authenticateUser(req, res, "doctor");
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  userLogin,
  doctorLogin
};
